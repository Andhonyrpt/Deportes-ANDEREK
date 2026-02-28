import Category from '../models/category.js';
import SubCategory from '../models/subCategory.js';

async function getCategories(req, res, next) {
    try {
        const categories = await Category.find().populate("parentCategory").sort({ name: 1 });
        res.status(200).json(categories);
    } catch (err) {
        next(err);
    }
};

async function getCategoryById(req, res, next) {
    try {
        const category = await Category.findById(req.params.id).populate("parentCategory");

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json(category);
    } catch (err) {
        next(err);
    }
};

async function createCategory(req, res, next) {

    try {
        console.log("Cuerpo recibido:", req.body);

        const { name, description, imageUrl, parentCategory } = req.body;

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

    try {
        const { name, description, imageUrl, parentCategory } = req.body;
        const idCategory = req.params.id;

        // Validar que al menos un campo sea proporcionado
        if (
            name === undefined &&
            description === undefined &&
            parentCategory === undefined &&
            imageUrl === undefined
        ) {
            return res.status(400).json({
                message: "At least one field must be provided for update",
            });
        }

        // 1. Prevenir que sea su propio padre
        if (parentCategory === idCategory) {
            return res.status(400).json({ message: "A category cannot be its own parent" });
        }

        // 2. Prevenir ciclos
        if (parentCategory) {
            let currentParent = await Category.findById(parentCategory);
            while (currentParent) {
                if (currentParent._id.toString() === idCategory) {
                    return res.status(400).json({ message: "Circular reference detected: this would create a loop in the category hierarchy" });
                }
                if (currentParent.parentCategory) {
                    currentParent = await Category.findById(currentParent.parentCategory);
                } else {
                    break;
                }
            }
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (parentCategory !== undefined) updateData.parentCategory = parentCategory;
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

        const updatedCategory = await Category.findByIdAndUpdate(
            idCategory,
            updateData,
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

        const hasSubcategories = await SubCategory.exists({ parentCategory: idCategory });

        if (hasSubcategories) {
            return res.status(400).json({
                message: 'Cannot delete category with subcategories'
            });
        }

        const deletedCategory = await Category.findByIdAndDelete(idCategory);

        if (!deletedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(204).send();
    } catch (err) {
        next(err);
    }
};

async function searchCategories(req, res, next) {

    try {
        const {
            q,
            parentCategory,
            sort,
            order,
            limit = 10,
            page = 1
        } = req.query;

        let filters = {};

        if (q) {
            filters.$or = [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } }
            ];
        }

        if (parentCategory) {
            filters.parentCategory = parentCategory;
        }

        let sortOptions = {};

        if (sort) {
            const sortOrder = order === 'desc' ? -1 : 1;
            sortOptions[sort] = sortOrder;
        }
        else {
            sortOptions.name = -1;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const categories = await Category.find(filters)
            .populate('parentCategory')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        const totalResults = await Category.countDocuments(filters);
        const totalPages = Math.ceil(totalResults / parseInt(limit));

        res.status(200).json({
            categories,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalResults,
                hasNext: parseInt(page) < totalPages,
                hasPrev: parseInt(page) > 1
            },
            filters: {
                searchTerm: q || null,
                parentCategory: parentCategory || null,
                sort: sort || 'name',
                order: order || 'desc'
            }
        });
    } catch (err) {
        next(err);
    }
};


export {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    searchCategories
};