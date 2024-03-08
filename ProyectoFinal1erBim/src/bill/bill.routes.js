'use strict'

import { Router } from 'express'
import {
    finishAll
} from './bill.controller.js'

import { isAdmin, isClient, validateJwt } from '../middlewares/validate-jwt.js'

const api = Router()

//rutas
api.post('/finishAll', [validateJwt, isClient], finishAll)

export default api