'use strict'

import { Router } from 'express'
import {
    purchaseAdd, getPurchases, purchaseConfirmed
} from './purchase.controller.js'
import { isAdmin, isClient, validateJwt } from '../middlewares/validate-jwt.js'

const api = Router()

//Rutas privadas para cliente
api.post('/purchaseAdd', [validateJwt, isClient], purchaseAdd)
api.put('/purchaseConfirmed/:id', [validateJwt, isClient], purchaseConfirmed)


api.get('/getPurchases', [validateJwt, isAdmin], getPurchases)

export default api