import Product from '../models/product.js';

async function getProducts(req, res, next) {

    try {
        //req.params
        //req.query
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const products = await Product.find()
            .populate('category')
            .populate(skip)
            .limit(limit)
            .sort({ name: 1 });

        const totalResults = await Product.countDocuments(); // Conocer cuantos productos hay en la base de datos
        const totalPages = Math.ceil(totalResults / limit);

        res.json({
            products,
            pagination: {
                totalPages,
                totalResults,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });

    } catch (err) {
        next(err);
    }
};

async function getProductById(req, res, next) {

    try {

        const id = req.params.id;
        const product = await Product.findById(id).populate('category');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);

    } catch (err) {
        next(err);
    }
};

async function getProductByCategory(req, res, next) {

    try {

        const id = req.params.idCategory;
        const products = await Product.find({ category: id }).populate('category').sort({ name: 1 });

        if (products.length === 0) {
            return res.status(404).json({ message: 'No products found for this category' });
        }

        res.json(products);

    } catch (err) {
        next(err);
    }
};

async function createProduct(req, res, next) {

    try {

        const { name, description, modelo, sizes, genre, price, stock, imagesUrl, category } = req.body;

        if (!name || !description || !price || !stock || !imagesUrl || !sizeOptions || !category) {
            return res.status(400).json({ error: 'All files are required' });
        }

        const newProduct = await Product.create({ name, description, modelo, sizes, genre, price, stock, imagesUrl, category });
        res.status(201).json(newProduct);

    } catch (err) {
        next(err);
    }
};

async function updateProduct(req, res, next) {

    try {

        const { id } = req.params;
        const { name, description, modelo, sizes, genre, price, stock, imagesUrl, category } = req.body;


        if (!name || !description || !price || !stock || !imagesUrl || !category || !sizeOptions) {
            return res.status(400).json({ error: 'All files are required' });
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, { name, description, modelo, sizes, genre, price, stock, imagesUrl, category }, { new: true });

        if (updatedProduct) {
            return res.status(200).json(updatedProduct);
        } else {
            return res.status(404).json({ message: 'Product not found' })
        }

    } catch (err) {
        next(err);
    }
};

async function deleteProduct(req, res, next) {

    try {

        const { id } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(id);

        if (deletedProduct) {
            return res.status(204).send();
        } else {
            return res.status(404).json({ message: 'Product not found' })
        }

    } catch (err) {
        next(err);
    }
};


export {
    getProducts,
    getProductById,
    getProductByCategory,
    createProduct,
    updateProduct,
    deleteProduct
};