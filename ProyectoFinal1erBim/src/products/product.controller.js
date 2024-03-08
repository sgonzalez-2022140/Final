'use strict'

import Category from '../category/category.model.js'
import { checkUpdateProduct } from '../utils/validator.js'
import Product from './product.model.js'



export const addProduct = async(req, res) => {
    try{
        //capturar la info
        let data = req.body
        //Validar que existe una categoria
        let category = await Category.findOne({ _id: data.categories})
        if(!category) return res.status(404).send({message: 'category not found'})
        //crear la instancia de producto
        let product = new Product(data)
        //guardar la info de producto
        await product.save()
        console.log("Product ID:", typeof(data.product))
        console.log("Category ID:", typeof(data.category))
        //Responder si sale bien
        return res.send({message: 'Product saved successfully'})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error adding products'})
        
    }
}

// ------------------------- Funciones para ver los productos -------------------------
// Todos los productos en colectivo
export const getAllProducts = async(req, res) =>{
    try{
        //aqui decimos que queremos encontrar todos los productos
        let products = await Product.find()
        //retornamos la info
        return res.send({ products })
    }catch(err){
        console.error(err)
        return res.status(500).send({ message: 'Error getting Products' })
    }
}
//Ver productos con valor a 0
export const getNoProducts = async(req, res)=>{
    try{
        //ver todos los productos con 0 de stock
        let outStock = await Product.findOne({stock: 0});
        if(!outStock) return res.status(404).send({message: 'Sin datos'})
        //retornamos todos los productos sin existencia
        return res.send({ outStock })
    }catch(err){
        console.error(err)
        return res.status(500).send({ message: 'Error getting Products' })
       
    }
}

//Buscar producto por nombre para los CLIENTES
export const search = async(req, res)=>{
    try{
        let { name } = req.body
        console.log(name)
        let product = await Product.find({name: name})
        if(!product) return res.status(404).send({message: 'Product not found'})
        return res.send({message: 'Product found !!!', product})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error searching products'})
    }
}

export const getInventary = async(req, res)=>{        
    try{
        let products = await Product.find().populate('categories'); 
        return res.send({ products })
    }catch(err){
        console.error(err)
        return res.status(500).send({ message: 'Error getting Products' })
    }
}


// Productos individuales por ID
export const getAProduct = async(req, res) => {
    // Necesitamos la info de un producto individual por el parametro id
    let { id } = req.params;
    try {
        // Buscar por el id
        let product = await Product.find({_id: id})
        console.log("Product ID:", typeof(product.id))
        console.log("Category ID:", typeof(product.category))
        // Validar
        if (!product) {
            res.status(404).send({ message: 'Product not found' });
        } else {
            return res.send({ message: 'Product found', product });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
};
/*
export const topProductos = async(req, res)=>{
    try {
        let product = await Product.find().sort({})
    } catch (error) {
        
    }
}*/

// //////////////////////////////////////////////////////////////////////////////////////////
// ---------------------------- Actualizar información del producto -------------------------
export const updateProduct = async(req, res)=>{
    try{
        //necesitamos todo el valor a actualizar
        let data = req.body
        
        //Lo haremos por id
        let { id } = req.params
        //iniciarlizar productos 
        
        let {stock} = await Product.findOne({_id: id})
        console.log(stock)
        console.log()
        console.log(data.stock);
        //validar 
        let update = checkUpdateProduct(data, false)
        if (!update) return res.status(400).send({ message: 'Have submitted some data that cannot be updated or missing data' })
        //crear validación para que cuando el admin agregue se sume con el stock original       
        data.stock = parseInt(stock) + parseInt(data.stock)
        //Actualizar
        let updateProduct = await Product.findOneAndUpdate(
            {_id: id},
            data,
            {new: true}
        )
        //validar la actualización
       if(!updateProduct) return res.status(404).send({message: 'Product not found and not updated'})
        //Responder si se pudo hacer
        return res.send({message: 'Product updated successfully', updateProduct})

    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error to update a product'})
    }
}

// --------------------------------------- Eliminar Productos ----------------------------------------------
export const deleteProducts = async(req, res)=>{
    try{
        //le diremos que eliminemos por id
        let { id } = req.params
        //Eliminar el producto
        let deleteProduct = await Product.deleteOne({ _id: id})
        //Validar
        if(deleteProduct.deletedCount === 0)  return res.status(404).send({message: 'Product not found and not deleted'})
        //decir si esta bien
        return res.send({message: `Deleted product successfully`})
    }catch(err){
        console.error(err)
        return res.status(404).send({message: 'Error deleting product'})
    }
}

// ---------------------------------- Ver Productos por Cátalogo ------------------------------------------
export const viewProductbyCategory = async (req, res) => {
    // Necesitamos la info de un producto individual por el parametro id
    let { category } = req.params;
    console.log(category)
    try {
        // Buscar por el id de categoría
        let products = await Product.find({ category: category });

        // Validar
        if (!products || products.length === 0) {
            res.status(404).send({ message: 'Products not found in the category' });
        } else {
            return res.send({ message: 'Products found', products });
        }
    } catch (error) {
        console.error(error);
        res.status(404).send({ message: 'No info' });
    }
};
    