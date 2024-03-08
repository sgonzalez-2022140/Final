import Bill from './bill.model.js'
import Purchase from '../purchase/purchase.model.js'
import User from '../user/user.model.js'
import Product from '../products/product.model.js'
import { generateJwt } from '../utils/jwt.js'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'
import PDFDocument from 'pdfkit'
 
export const finishAll = async (req, res) => {
    try {
        //encontrar usuario
        const user = await User.findOne({ username: req.body.username })
        //respuesta 
        if (!user) return res.status(404).send({ message: "Usuario no encontrado." })
        
        //Validaciones
        const secretKey = process.env.SECRET_KEY
        //autorización del token
        const token = req.headers.authorization
 
        //encontrar info de token
        const decodedToken = jwt.verify(token, secretKey)
        const tokenUserId = decodedToken.uid
 
        if (tokenUserId !== user._id.toString()) {
            return res.status(401).send({ message: "No estás autorizado para realizar esta acción." })
        }
        //usuario por ID
        const userId = user._id
        //Información de la compra
        const info = await Purchase.find({ user: userId, status: 'COMPLETED' })
        //console.log(info)
        const bills = []
        let totalAPagar = 0
        for (const cart of info) {
            const product = await Product.findById(cart.product)
            if (!product) {
                console.log(cart.product)
                return res.status(404).send({message: 'No product in the database'})
            }
            //console.log(product)
            const totalProducto = cart.amount * product.price
            //console.log(totalProducto)
            const bill = new Bill({
                date: new Date(),
                purchase: cart._id,
                subtotal: totalProducto
            })
            await bill.save()
            // Restamos la cantidad del producto del stock
            product.stock -= cart.amount
            await product.save()
            cart.status = 'COMPLETED'
            await cart.save()
            bills.push(bill)
            // Sumamos el total del producto al total a pagar
            totalAPagar += totalProducto  
        }
 
        const pdfFolder = './PDFBills'
        if(!fs.existsSync(pdfFolder)){
            fs.mkdirSync(pdfFolder)
        }
        // Generación del PDF
        const pdfPath = path.resolve(pdfFolder, `bill_${Date.now()}.pdf`)
        const doc = new PDFDocument()
        doc.pipe(fs.createWriteStream(pdfPath))
 
        doc.font('Courier-Oblique').fontSize(25).text('Empresa Gestora Pampichi´s S.A', { align: 'left' }).moveDown(2)
       
        for (const bill of bills) {
            const purchase = await Purchase.findById(bill.purchase).populate('product');
    const product = await Product.findById(purchase.product);

    doc.fontSize(25).text('Factura', { align: 'center' }).moveDown(2);
    doc.fontSize(15).text(`Fecha: ${bill.date.toLocaleDateString()}`, { align: 'right' });
    doc.fontSize(15).text('NIT: CF').moveDown();
    doc.fontSize(15).text('Productos:', { underline: true }).moveDown();

    // Producto cosas
    doc.font('Helvetica-Bold').fontSize(12).text(`${product.name} - Cantidad: ${purchase.amount}                                                                    - Precio unitario: ${product.price} Q`);
    doc.font('Helvetica-Bold').fontSize(12).text(`Subtotal: ${bill.subtotal} Q`, { align: 'right'}).moveDown();

    // Separador entre productos
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    doc.moveDown();

    if (bills.indexOf(bill) !== bills.length - 1) {
        doc.addPage();
    }
}

// Mostramos el total a pagar en el documento
doc.fontSize(16).text(`Total a pagar: ${totalAPagar} Q`, { align: 'right' }).moveDown();
        doc.end()
 
        return res.send(pdfPath)
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: `purchase failes: ${error.message} `})
    }
}