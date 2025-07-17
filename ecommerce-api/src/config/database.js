import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

const dbUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

/*
    try {
        await mongoose.connect(`${dbUri}/${dbName}`, {});

        console.log('MongoDB is connected');
    } catch (error) {

        console.log(error);
        process.exit(1); // Salir del servidor

    };
*/

async function dbConnection() {
    try {
        await mongoose.connect(`${dbUri}/${dbName}`, {});

        console.log('MongoDB is connected');
    } catch (error) {

        console.log(error);
        process.exit(1); // Salir del servidor

    }
};


export default dbConnection;