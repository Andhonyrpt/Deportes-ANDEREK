import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/user.js';

dotenv.config();

const dbUri = `${process.env.MONGODB_URI}/${process.env.MONGODB_DB}`;

mongoose.connect(dbUri)
  .then(async () => {
    console.log("Connected to DB:", mongoose.connection.db.databaseName);
    
    const result = await User.deleteMany({ 
        $or: [
            { email: { $regex: /@example.com$/i } },
            { displayName: { $regex: /^TestUser_/i } },
            { displayName: { $regex: /^V3/i } }
        ]
    });
    console.log(`Deleted ${result.deletedCount} dynamic users`);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
