import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.production' });

const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB || 'ecommerce-db';

async function updateProducts() {
    try {
        await mongoose.connect(`${dbUri}/${dbName}`);
        console.log('Connected to DB');
        
        const ProductSchema = new mongoose.Schema({
            name: String,
            imagesUrl: [String],
        }, { strict: false }); 
        
        const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

        const products = await Product.find({});
        let updatedCount = 0;

        for (const product of products) {
            let modified = false;
            if (product.imagesUrl && product.imagesUrl.length > 0) {
                const newUrls = product.imagesUrl.map(url => {
                    const newUrl = url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
                    if (newUrl !== url) modified = true;
                    return newUrl;
                });

                if (modified) {
                    product.imagesUrl = newUrls;
                    await product.save();
                    updatedCount++;
                    console.log(`Updated images for product: ${product.name}`);
                }
            }
        }
        
        console.log(`Successfully updated ${updatedCount} products to use .webp extensions.`);
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

updateProducts();
