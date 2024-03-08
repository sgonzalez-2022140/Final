import express from 'express'
import { test, saveCategory, getAllCategories, deleteCategory, updateCategory} from "./category.controller.js"
import {
    validateJwt,
    isAdmin,
    isClient
} from '../middlewares/validate-jwt.js'

const api = express.Router();

//Rutas de declaraciones
api.get('/test', test)
api.post('/saveCategory', [validateJwt, isAdmin], saveCategory)
api.get('/getAllCategories', [validateJwt, isAdmin], getAllCategories)


api.delete('/deleteCategory/:id', [validateJwt, isAdmin], deleteCategory)

api.put('/updateCategory/:id', [validateJwt, isAdmin], updateCategory)

export default api