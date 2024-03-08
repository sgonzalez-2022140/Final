'use strict'

import { Router } from 'express'
import {
    addProduct, getAllProducts, getAProduct, updateProduct, getNoProducts, 
    deleteProducts, search, viewProductbyCategory, getInventary
} from './product.controller.js'

import { validateJwt, isAdmin, isClient } from '../middlewares/validate-jwt.js'

const api = Router()

//GET
//ver productos sin unidades
api.get('/getNoProducts',[validateJwt, isAdmin], getNoProducts)
//Ver todo el catalogo de productos
api.get('/getAllProducts',[validateJwt, isAdmin], getAllProducts)
//Encontrar 1 producto
api.get('/getAProduct/:id',[validateJwt, isAdmin], getAProduct)
//Inventario
api.get('/getInventary',[validateJwt, isAdmin], getInventary)

api.get('/viewProductbyCategory/:id', viewProductbyCategory)

//POST
//Buscar por nombre
api.post('/search',[validateJwt, isClient], search)
//Agregar productos
api.post('/addProduct',[validateJwt, isAdmin], addProduct)


//actualizar producto
api.put('/updateProduct/:id',[validateJwt, isAdmin], updateProduct)

//Eliminar
api.delete('/deleteProducts/:id',[validateJwt, isAdmin], deleteProducts)





export default api