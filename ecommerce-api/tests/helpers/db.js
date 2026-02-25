import mongoose from 'mongoose';

/**
 * Utility to clear specific collections or all collections in the test database.
 * Useful for maintaining isolation between tests without dropping the entire DB every time.
 */
export async function clearCollections(collectionNames = []) {
    const collections = mongoose.connection.collections;

    if (collectionNames.length > 0) {
        for (const name of collectionNames) {
            if (collections[name]) {
                await collections[name].deleteMany();
            }
        }
    } else {
        // Clear all if none specified
        for (const key in collections) {
            await collections[key].deleteMany();
        }
    }
}
