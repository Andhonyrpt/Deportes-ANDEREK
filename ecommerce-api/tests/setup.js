import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { afterAll, beforeAll } from 'vitest';

dotenv.config({ path: '.env.test' });

beforeAll(async () => {
    // Ensuring we are connected to the test database
    if (mongoose.connection.readyState === 0) {
        const dbUri = process.env.MONGODB_URI;
        const dbName = process.env.MONGODB_DB;
        await mongoose.connect(`${dbUri}/${dbName}`);
    }
});

afterAll(async () => {
    // Final cleanup
    if (mongoose.connection.readyState !== 0) {
        // Drop database to ensure a clean state for the next run
        await mongoose.connection.db.dropDatabase();
        await mongoose.disconnect();
    }
});
