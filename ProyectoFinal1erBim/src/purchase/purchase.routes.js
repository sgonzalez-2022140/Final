'use strict'

import { Router } from 'express'
import {
    purchaseAdd, getPurchases, purchaseConfirmed, topProductos, deletePurchase
} from './purchase.controller.js'
import { isAdmin, isClient, validateJwt } from '../middlewares/validate-jwt.js'

const api = Router()

//Rutas privadas para cliente
api.post('/purchaseAdd', [validateJwt, isClient], purchaseAdd)

//Hacerlo en caso de emergencia :V
api.delete('/deletePurchase/:id', [validateJwt, isAdmin], deletePurchase)

api.put('/purchaseConfirmed/:id', [validateJwt, isClient], purchaseConfirmed)

api.get('/topProductos', [validateJwt, isClient], topProductos)
api.get('/getPurchases', [validateJwt, isClient], getPurchases)

export default api