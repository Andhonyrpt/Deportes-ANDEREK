import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB || 'ecommerce-db';

async function listUsers() {
    try {
        await mongoose.connect(`${dbUri}/${dbName}`);
        console.log('Connected to DB');
        const User = mongoose.model('User', new mongoose.Schema({
            email: String,
            displayName: String,
            role: String
        }));

        const users = await User.find({ email: 'usuario@anderek.com' }, 'email displayName role');
        console.log('USERS_START');
        console.log(JSON.stringify(users, null, 2));
        console.log('USERS_END');
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listUsers();
