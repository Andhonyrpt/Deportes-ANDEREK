import Product from '../models/product.js';

async function getProducts(req, res) {

    try {

        const products = await Product.find().sort({ name: 1 });

        res.json(products);

    } catch (error) {
        res.status(500).json({ error });
    }
};

async function getProductById(req, res) {

    try {

        const id = req.params.id;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);

    } catch (error) {
        res.status(500).json({ error });
    }
};

async function getProductByCategory(req, res) {

    try {

        const id = req.params.idCategory;
        const products = await Product.findById({ category: id }).sort({ name: 1 });

        if (products === 0) {
            return res.status(404).json({ message: 'No products found for this category' });
        }

        res.json(products);

    } catch (error) {
        res.status(500).json({ error });
    }
};

async function createProduct(req, res) {

    try {

        const { name, description, price, stock, imagesUrl, soccerTeam, genre, sizeOptions, category } = req.body;

        if (!name || !description || !price || !stock || !imagesUrl || !category || !soccerTeam || !genre || !sizeOptions) {
            return res.status(400).json({ error: 'All files are required' });
        }

        const newProduct = await Product.create({ name, description, price, stock, imagesUrl, category });
        res.status(201).json(newProduct);

    } catch (error) {
        res.status(500).json({ error });
    }
};

async function updateProduct(req, res) {

    try {

        const { id } = req.params;
        const { name, description, price, stock, imagesUrl, soccerTeam, genre, sizeOptions, category } = req.body;


        if (!name || !description || !price || !stock || !imagesUrl || !category || !soccerTeam || !genre || !sizeOptions) {
            return res.status(400).json({ error: 'All files are required' });
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, { name, description, price, stock, imagesUrl, category }, { new: true });

        if (updatedProduct) {
            return res.status(200).json(updatedProduct);
        } else {
            return res.status(404).json({ message: 'Product not found' })
        }

    } catch (error) {
        res.status(500).json({ error });
    }
};

async function deleteProduct(req, res) {

    try {

        const { id } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(id);

        if (deletedProduct) {
            return res.status(204);
        } else {
            return res.status(404).json({ message: 'Product not found' })
        }

    } catch (error) {
        res.status(500).json({ error });
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