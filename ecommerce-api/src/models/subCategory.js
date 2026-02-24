import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    imageURL: { //pendiente de revisar uso de imageURL, caso igual para category
        type: String,
        trim: true,
        default: 'https://placehold.co/800x600.png'
    },
    parentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    }
});


const SubCategory = mongoose.model('SubCategory', subCategorySchema);

export default SubCategory;