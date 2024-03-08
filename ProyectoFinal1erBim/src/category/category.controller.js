'use strict'

import Category from "./category.model.js"
import {checkUpdateCategory} from "../utils/validator.js"

export const test = (req, res) =>{
    console.log('test is running')
    return res.send({message: 'Test is running'})
}

export const saveCategory = async(req, res)=>{
    try{
        //capturar info
        let data = req.body
        //Guardar en la BD
        let category = new Category(data)
        await category.save()
        console.log("Category ID:", typeof(category.id))
        //Mensaje para confirmar
        return res.send({message: `You save successfully a category and the name is ${category.name}`})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error to add category'})
    }
}

export const getAllCategories = async(req, res) =>{
    try{
        //aqui decimos que queremos encontrar todos los productos
        let categories = await Category.find()
        //retornamos la info
        return res.send({ categories })
    }catch(err){
        console.error(err)
        return res.status(500).send({ message: 'Error getting Products' })
    }
}



export const deleteCategory = async(req, res)=>{
    try{
        //le diremos que eliminemos por id
        let { id } = req.params
        //Eliminar el producto
        let deleteCategory = await Category.deleteOne({ _id: id})
        //Validar
        if(deleteCategory.deletedCount === 0)  return res.status(404).send({message: 'Category not found and not deleted'})
        //decir si esta bien
        return res.send({message: `Deleted Category successfully`})
    }catch(err){
        console.error(err)
        return res.status(404).send({message: 'Error deleting category'})
    }
}

export const updateCategory = async(req, res)=>{
    try{
        //necesitamos todo el valor a actualizar
        let data = req.body
        //Lo haremos por id
        let { id } = req.params
        //validar 
        let update = data
        if (!update) return res.status(400).send({ message: 'Have submitted some data that cannot be updated or missing data' })
        //Actualizar
        let updateCategory = await Category.findOneAndUpdate(
            {_id: id},
            data,
            {new: true}
        )
        //validar la actualización
        if(!updateCategory) return res.status(404).send({message: 'Category not found and not updated'})
        //Responder si se pudo hacer
        return res.send({message: 'Category updated successfully', updateCategory})

    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error to update a category'})
    }
}
