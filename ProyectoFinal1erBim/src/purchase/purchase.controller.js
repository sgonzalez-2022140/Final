'use strict'

//nuestro modelo
import Purchase from '../purchase/purchase.model.js'

import { checkPurchase } from '../utils/validator.js'

import Product from '../products/product.model.js'


//Generar pdf con invoice
import easyinvoice from "easyinvoice"
import fs from 'fs';
import path from 'path'

export const purchaseAdd = async(req, res)=>{
    try {
        //capturar la data
        let data = req.body;
        data.user = req.user._id //aqui necesitamos el token cuando se logea
        //Verificar que exista el producto
        
        console.log("Product ID:", typeof(data.product));
        console.log("User ID:", typeof(data.user));
        //tengo un error aqui ya que se pone como String
        let product = await Product.findOne({ _id: data.product });
        //Crear variable de stock 
        let stock = product.stock;


        if(!product) return res.status(404).send({message: 'Product not found'})
        //Validar que tengamos productos en stock               
        if (stock === 0) return res.status(404).send({ message: 'We dont have this product right now' });               
        //Guardar
        let purchase = new Purchase(data)
        let amount = purchase.amount;        
        //validacion para restar productos que se quieran comprar
        if(stock < amount) return res.send({ message: 'No existe la cantidad requerida'})
        //guardar
        await purchase.save()
        return res.send({message: `Purchase successfully, for the date ${purchase.date}`})
    }catch (err) {
     console.error(err)  
     return res.status(500).send({message: 'Error creating a purchase', err}) 
    }
}

// ///////////////////////////////////////////////////////////////////////////////////
// //////////////// Funcion para cuando confirme y cambie datos //////////////////////
export const purchaseConfirmed = async (req, res) => {
    try {
      let data = req.body
      const { id } = req.params
      // Encontrar la compra por ID
      const purchase = await Purchase.findOne({_id: id}).populate('product',['name','stock'])
     
      //Ahora necesitamos jalar la info de productos para restar la cantidad solicitada
      console.log('Purchase ID:', purchase)
  
      if (!purchase) {
        return res.status(404).send({ message: 'Purchase not found' });
      }
     
      //variables para restar el amount con stock
      const purchasedQuantity = purchase.amount
      const product = purchase.product
      product.stock -= purchasedQuantity;
      //guardar en productos el cambio
      await product.save();
  
      // Cambiar el estado de 'CREATED' a 'COMPLETED'
      purchase.status = 'COMPLETED';

      let update = checkPurchase(data, false)
        if (!update) return res.status(400).send({ message: 'Have submitted some data that cannot be updated or missing data' })

  
      //actualizar los nuevos datos 
      let updatePurchase = await Purchase.findOneAndUpdate(
        {_id: id},
        data,
        {new: true}
    )


    const pdfData = {
      apiKey: "free", // Please register to receive a production apiKey: https://app.budgetinvoice.com/register
      mode: "development", // Production or development, defaults to production   
      images: {
          // The logo on top of your invoice
          logo: "https://public.budgetinvoice.com/img/logo_en_original.png",
          // The invoice background
          background: "https://public.budgetinvoice.com/img/watermark-draft.jpg"
      },
      // Your own data
      sender: {
          company: "Sample Corp",
          address: "Sample Street 123",
          zip: "1234 AB",
          city: "Sampletown",
          country: "Samplecountry"
          // custom1: "custom value 1",
          // custom2: "custom value 2",
          // custom3: "custom value 3"
      },
      // Your recipient
      client: {
          company: "Client Corp",
          address: "Clientstreet 456",
          zip: "4567 CD",
          city: "Clientcity",
          country: "Clientcountry"
          // custom1: "custom value 1",
          // custom2: "custom value 2",
          // custom3: "custom value 3"
      },
      information: {
          // Invoice number
          number: "2021.0001",
          // Invoice data
          date: "12-12-2021",
          // Invoice due date
          dueDate: "31-12-2021"
      },
      // The products you would like to see on your invoice
      // Total values are being calculated automatically
      products: [
          {
              quantity: 2,
              description: "Product 1",
              taxRate: 6,
              price: 33.87
          },
          {
              quantity: 4.1,
              description: "Product 2",
              taxRate: 6,
              price: 12.34
          },
          {
              quantity: 4.5678,
              description: "Product 3",
              taxRate: 21,
              price: 6324.453456
          }
      ],
      // The message you would like to display on the bottom of your invoice
      bottomNotice: "Kindly pay your invoice within 15 days.",
      // Settings to customize your invoice
      settings: {
          currency: "USD", // See documentation 'Locales and Currency' for more info. Leave empty for no currency.
          // locale: "nl-NL", // Defaults to en-US, used for number formatting (See documentation 'Locales and Currency')        
          // marginTop: 25, // Defaults to '25'
          // marginRight: 25, // Defaults to '25'
          // marginLeft: 25, // Defaults to '25'
          // marginBottom: 25, // Defaults to '25'
          // format: "A4", // Defaults to A4, options: A3, A4, A5, Legal, Letter, Tabloid
          // height: "1000px", // allowed units: mm, cm, in, px
          // width: "500px", // allowed units: mm, cm, in, px
          // orientation: "landscape" // portrait or landscape, defaults to portrait
      },
      // Translate your invoice to your preferred language
      translate: {
          // invoice: "FACTUUR",  // Default to 'INVOICE'
          // number: "Nummer", // Defaults to 'Number'
          // date: "Datum", // Default to 'Date'
          // dueDate: "Verloopdatum", // Defaults to 'Due Date'
          // subtotal: "Subtotaal", // Defaults to 'Subtotal'
          // products: "Producten", // Defaults to 'Products'
          // quantity: "Aantal", // Default to 'Quantity'
          // price: "Prijs", // Defaults to 'Price'
          // productTotal: "Totaal", // Defaults to 'Total'
          // total: "Totaal", // Defaults to 'Total'
          // taxNotation: "btw" // Defaults to 'vat'
      },
  
      // Customize enables you to provide your own templates
      // Please review the documentation for instructions and examples
      // "customize": {
      //      "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html 
      // }
  };

  const invoicePDF = async ()=>{
    let result = await easyinvoice.createInvoice(data)
    //escribir el doc en pdf
    fs.writeFileSync(`./invoice/invoice${Date.now()}.pdf`, result.pdf, 'base64')
}
//llamar la función
invoicePDF()

    return res.send({message: 'We have a new order :3', updatePurchase})
  
    
      
    } catch (err) {
      console.error(err);
      return res.status(500).send({ message: 'Error confirming purchase', err });
    }
  };



export const getPurchases = async(req, res)=>{
    try {
        //Encontrar la info 
        let purchases = await Purchase.find({ status: 'COMPLETED'})
        //retornar todos los valores
        return res.send({ purchases })
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'No Purchases or error Getting purchases'})
    }
}



