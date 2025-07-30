import Category from '../models/category.js'
import errorHandler from '../middlewares/errorHandler.js';

async function getCategories(req, res) {
    try {
        const categories = await Category.find().populate("parentCategory");
        res.status(200).json(categories);
    } catch (err) {
        errorHandler(err, req, res);
    }
}

async function getCategoryById(req, res) {
    try {
        const category = await Category.findById(req.params.id).populate(
            "parentCategory"
        );
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json(category);
    } catch (err) {
        errorHandler(err, req, res);
    }
}

async function createCategory(req, res) {
    const { name, description, modelo, parentCategory, imageUrl } = req.body;

    try {
        const newCategory = new Category({
            name,
            description,
            modelo,
            parentCategory: parentCategory || null,
            imageUrl: imageUrl || null,
        });

        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (err) {
        errorHandler(err, req, res);
    }
}

async function updateCategory(req, res) {
    const { name, description, modelo, parentCategory, imageUrl } = req.body;

    try {
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            { name, description, modelo, parentCategory, imageUrl },
            { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json(updatedCategory);
    } catch (err) {
        errorHandler(err, req, res);
    }
}

async function deleteCategory(req, res) {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(204).json({ message: "Category deleted successfully" });
    } catch (err) {
        errorHandler(err, req, res);
    }
}


export {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};