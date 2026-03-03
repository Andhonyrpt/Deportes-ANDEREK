import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { afterAll, beforeAll } from 'vitest';

dotenv.config({ path: '.env.test', override: true });

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
        // Disconnect safely. Individual tests handle their own cleanup in beforeEach.
        await mongoose.disconnect();
    }
});
