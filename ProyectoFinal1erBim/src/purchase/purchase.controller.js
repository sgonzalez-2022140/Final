'use strict'

//nuestro modelo
import Purchase from '../purchase/purchase.model.js'

import { checkPurchase } from '../utils/validator.js'

import Product from '../products/product.model.js'


//Generar pdf con invoice


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

      if(purchasedQuantity > product ) return res.send({ message: 'No existe la cantidad requerida'})
      //actualizar los nuevos datos 
      let updatePurchase = await Purchase.findOneAndUpdate(
        {_id: id},
        data,
        {new: true}
    )



    return res.send({message: 'We have a new order :3', updatePurchase})
  
    
      
    } catch (err) {
      console.error(err);
      return res.status(500).send({ message: 'Error confirming purchase', err });
    }
  };



export const getPurchases = async(req, res)=>{
    try {
        //Encontrar la info 
        let purchases = await Purchase.find({ status: 'COMPLETED'}).populate('product')
        //retornar todos los valores
        return res.send({ purchases })
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'No Purchases or error Getting purchases'})
    }
}

export const topProductos = async(req, res)=>{
  try {
    const topProducts = await Purchase.aggregate([
      // Filtro para obtener solo las compras completadas
      { $match: { status: 'COMPLETED' } },
      // Agrupar las compras por el producto
      { $group: { _id: '$product', totalAmount: { $sum: '$amount' } } },
      // Ordenar los productos según la cantidad vendida
      { $sort: { totalAmount: -1 } }
    ]);

    // Mapear los resultados para obtener solo los IDs de los productos
    const productIds = topProducts.map(product => product._id);

    // Buscar los detalles de los productos según los IDs obtenidos
    const products = await Product.find({ _id: { $in: productIds } });

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los productos principales.' });
  }
}



