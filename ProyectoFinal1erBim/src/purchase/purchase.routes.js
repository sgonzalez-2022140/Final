'use strict'

import { Router } from 'express'
import {
    purchaseAdd, getPurchases, purchaseConfirmed, topProductos
} from './purchase.controller.js'
import { isAdmin, isClient, validateJwt } from '../middlewares/validate-jwt.js'

const api = Router()

//Rutas privadas para cliente
api.post('/purchaseAdd', [validateJwt, isClient], purchaseAdd)


api.put('/purchaseConfirmed/:id', [validateJwt, isClient], purchaseConfirmed)

api.get('/topProductos', [validateJwt, isAdmin], topProductos)
api.get('/getPurchases', [validateJwt, isClient], getPurchases)

export default api