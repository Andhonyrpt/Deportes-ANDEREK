import Category from '../models/category.js'

async function getCategories(req, res) {
    try {
        const categories = await Category.find().populate("parentCategory");
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).send({ error });
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
    } catch (error) {
        res.status(500).send({ error });
    }
}

async function createCategory(req, res) {
    const { name, description, parentCategory, imageUrl } = req.body;

    try {
        const newCategory = new Category({
            name,
            description,
            parentCategory: parentCategory || null,
            imageUrl: imageUrl || null,
        });

        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(500).send({ error });
    }
}

async function updateCategory(req, res) {
    const { name, description, parentCategory, imageUrl } = req.body;

    try {
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            { name, description, parentCategory, imageUrl },
            { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json(updatedCategory);
    } catch (error) {
        res.status(500).send({ error });
    }
}

async function deleteCategory(req, res) {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(204).json({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).send({ error });
    }
}


export {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};