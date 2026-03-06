import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB || 'ecommerce-db';

async function listProducts() {
    try {
        await mongoose.connect(`${dbUri}/${dbName}`);
        console.log('Connected to DB');
        const Product = mongoose.model('Product', new mongoose.Schema({
            name: String,
            price: Number,
            category: mongoose.Schema.Types.ObjectId
        }));

        const products = await Product.find({}).limit(10);
        console.log('PRODUCTS_START');
        console.log(JSON.stringify(products, null, 2));
        console.log('PRODUCTS_END');
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listProducts();
