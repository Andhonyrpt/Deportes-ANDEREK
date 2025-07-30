import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    modelo: {
        type: String,
        enum: ['Local', 'Visitante'],
        required: true
    },
    sizes: [{
        type: String,
        enum: ['S', 'M', 'L',]
    }],
    genre: {
        type: String,
        enum: ['Hombre', 'Mujer', 'Niño'],
        default: 'Hombre'
    },
    price: {
        type: Number,
        required: true,
        min: 1
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    },
    imagesURL: [{
        type: String,
        default: 'https://placehold.co/800x600.png',
        trim: true
    }],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    }

});


const Product = mongoose.model('Product', productSchema);

export default Product;