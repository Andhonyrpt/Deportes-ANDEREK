import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
    size: {
        type: String,
        enum: ['S', 'M', 'L', 'XL'],
        required: true
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    }
}, { _id: false }); // _id: false para que las tallas no generen un ID propio y el JSON sea más limpio

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
    variants: {
        type: [variantSchema],
        required: true
    },
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
    imagesUrl: {
        type: [String],
        default: ['https://placehold.co/800x600.png'],
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory',
        required: true
    }
}, {
    timestamps: true // <-- agrega createdAt y updatedAt
});


const Product = mongoose.model('Product', productSchema);

export default Product;