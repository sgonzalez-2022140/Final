import { Schema, model } from "mongoose"


const productSchema = Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    stock: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    categories: {
        type: Schema.Types.ObjectId,
        ref: 'category',
        required: true
        
    }
}, {
    versionKey: false //Desahabilitar el __v (version del documento)
})

export default model('product', productSchema) 