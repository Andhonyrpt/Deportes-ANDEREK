import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    imageUrl: { //pendiente de revisar uso de imageUrl
        type: String,
        trim: true,
        default: 'https://placehold.co/800x600.png'
    },
    parentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    }
});
//, {
//    timestamps: true // <-- agrega createdAt y updatedAt

//});


const Category = mongoose.model('Category', categorySchema);

export default Category;