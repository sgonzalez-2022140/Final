'use strict'

import { Schema, model } from 'mongoose'

const billSchema = Schema({
    date: {
        type: Date, 
        required: true
    },

    purchase: {
        type: Schema.ObjectId,
        ref: 'purchase',
        required: true
       
    },
    subtotal: {
        type: Number,
        required: true
    },

}, {
    versionKey: false
})


export default model('bill', billSchema)
