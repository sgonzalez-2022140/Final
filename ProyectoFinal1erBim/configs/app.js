'use strict'

//importamos express y sus confs
import express from 'express'
import { config } from "dotenv"
import cors from 'cors'

//exportamos métodos
import categoryRoutes from "../src/category/category.routes.js"
import productRotes from "../src/products/product.routes.js"
import userRoutes from '../src/user/user.routes.js'
import purchaseRoutes from '../src/purchase/purchase.routes.js'
import billRoutes from '../src/bill/bill.routes.js'

//express confs
const app = express()
config();
const port = process.env.PORT || 3056

//cors confs
app.use(cors())

app.use(express.urlencoded({extended: false}))
app.use(express.json())

//declarar las rutas
app.use(categoryRoutes)
app.use('/product', productRotes)
app.use(userRoutes)
app.use(purchaseRoutes)
app.use('/asd',billRoutes)

export const initServer = ()=>{
    app.listen(port)
    console.log(`Server HTTP running in port ${port}`)
}

