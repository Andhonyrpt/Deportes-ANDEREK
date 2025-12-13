import express from "express";
import dotenv from "dotenv";
import routes from './src/routes/index.js';
import dbConnection from './src/config/database.js';
import logger from './src/middlewares/logger.js';
import errorHandler from './src/middlewares/errorHandler.js';
import setupGlobalErrorHandlers from "./src/middlewares/globalerrorHandler.js";

dotenv.config(); // Poder utilizar el archivo ".env" e instalar su dependencia con "npm install dotenv"

setupGlobalErrorHandlers();

const app = express();
dbConnection();
app.use(express.json());
app.use(logger);


app.get('/', (req, res) => {
    res.send('Welcome!!!')
});

app.use('/api', routes);

app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        method: req.method,
        url: req.originalUrl
    });
});

app.use(errorHandler);

app.listen(process.env.PORT, () => {
    console.log(`Server running on http:localhost:${process.env.PORT}`);
});