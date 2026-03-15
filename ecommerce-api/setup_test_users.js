import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './src/models/user.js';

dotenv.config();

const dbUri = `${process.env.MONGODB_URI}/${process.env.MONGODB_DB}`;

async function setupUsers() {
    try {
        await mongoose.connect(dbUri);
        console.log("Connected to DB");
        const password = await bcrypt.hash('Password123!', 10);
        
        const users = [
            { displayName: 'Customer User', email: 'customer@test.com', phone: '1234567890', role: 'customer', hashPassword: password },
            { displayName: 'Admin User', email: 'admin@test.com', phone: '1234567890', role: 'admin', hashPassword: password }
        ];
        
        for (const u of users) {
            await User.findOneAndUpdate({ email: u.email }, u, { upsert: true });
            console.log(`User ${u.email} set up.`);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
setupUsers();
