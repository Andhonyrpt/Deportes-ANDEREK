import Category from '../models/category.js'

async function getCategories(req, res, next) {
    try {
        const categories = await Category.find().populate("parentCategory");
        res.status(200).json(categories);
    } catch (err) {
        next(err);
    }
};

async function getCategoryById(req, res, next) {
    try {
        const category = await Category.findById(req.params.id).populate(
            "parentCategory"
        );
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json(category);
    } catch (err) {
        next(err);
    }
};

async function createCategory(req, res, next) {
    const { name, description, imageUrl, parentCategory } = req.body;

    try {
        const newCategory = new Category({
            name,
            description,
            imageUrl: imageUrl || null,
            parentCategory: parentCategory || null,

        });

        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (err) {
        next(err);
    }
};

async function updateCategory(req, res, next) {
    const { name, description, imageUrl, parentCategory } = req.body;

    try {
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            { name, description, imageUrl, parentCategory },
            { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json(updatedCategory);
    } catch (err) {
        next(err);
    }
};

async function deleteCategory(req, res, next) {
    try {
        const idCategory = req.params.id;
        const deletedCategory = await Category.findByIdAndDelete(idCategory);

        if (!deletedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(204).send();
    } catch (err) {
        next(err);
    }
};


export {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};