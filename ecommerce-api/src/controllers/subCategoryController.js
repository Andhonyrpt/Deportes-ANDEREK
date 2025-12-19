import SubCategory from "../models/subCategory.js";
import Category from "../models/category.js";
import Product from "../models/product.js";

async function getSubCategories(req, res, next) {

    try {
        const { parentCategory } = req.query;

        let filters = {};
        if (parentCategory) {
            filters.parentCategory = parentCategory;
        }

        const subCategories = await SubCategory.find(filters).populate("parentCategory");

        res.status(200).json(subCategories);
    } catch (err) {
        next(err);
    }
};

async function getSubCategoryById(req, res, next) {
    try {
        const subCategory = await SubCategory.findById(req.params.id)
            .populate('parentCategory');

        if (!subCategory) {
            return res.status(404).json({ message: 'SubCategory not found' });
        }

        res.status(200).json(subCategory);
    } catch (err) {
        next(err);
    }
}

async function createSubCategory(req, res, next) {

    try {
        const { name, description, imageURL, parentCategory } = req.body;

        if (!name || !description || !parentCategory) {
            return res.status(400).json({ message: 'All files are required' });
        }

        // validar que exista la categoría padre
        const categoryExists = await Category.exists({ _id: parentCategory });
        if (!categoryExists) {
            return res.status(400).json({ message: 'Parent category does not exist' });
        }

        const newSubCategory = new SubCategory({
            name,
            description,
            imageURL,
            parentCategory
        });

        await newSubCategory.save();
        res.status(201).json(newSubCategory);
    } catch (err) {
        next(err);
    }
}

async function updateSubCategory(req, res, next) {

    try {
        const { name, description, imageURL, parentCategory } = req.body;

        if (!name || !description || !parentCategory) {
            return res.status(400).json({ message: 'All files are required' });
        }

        if (parentCategory) {
            const categoryExists = await Category.exists({ _id: parentCategory });
            if (!categoryExists) {
                return res.status(400).json({ message: 'Parent category does not exist' });
            }
        }

        const updatedSubCategory = await SubCategory.findByIdAndUpdate(
            req.params.id,
            { name, description, imageURL, parentCategory },
            { new: true }
        ).populate('parentCategory');

        if (!updatedSubCategory) {
            return res.status(404).json({ message: 'SubCategory not found' });
        }

        res.status(200).json(updatedSubCategory);
    } catch (err) {
        next(err);
    }
}

async function deleteSubCategory(req, res, next) {

    try {
        const subCategoryId = req.params.id;

        const hasProducts = await Product.exists({ category: subCategoryId });
        if (hasProducts) {
            return res.status(400).json({ message: 'Cannot delete subcategory with products' });
        }

        const deletedSubCategory = await SubCategory.findByIdAndDelete(subCategoryId);

        if (!deletedSubCategory) {
            return res.status(404).json({ message: 'SubCategory not found' });
        }

        res.status(204).send();
    } catch (err) {
        next(err);
    }
}

export {
    getSubCategories,
    getSubCategoryById,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory
};