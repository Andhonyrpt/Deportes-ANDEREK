import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import routes from './src/routes/index.js';
import dbConnection from './src/config/database.js';
import logger from './src/middlewares/logger.js';
import { apiLimiter } from "./src/middlewares/rateLimiter.js";
import errorHandler from './src/middlewares/errorHandler.js';
import setupGlobalErrorHandlers from "./src/middlewares/globalerrorHandler.js";

dotenv.config(); // Poder utilizar el archivo ".env" e instalar su dependencia con "npm install dotenv"

setupGlobalErrorHandlers();

export const app = express();
dbConnection();


app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(','), credentials: true
}));

// Middlewares en el orden correcto
app.use(express.json());
app.use(logger);

// Rate limiting global para toda la API
app.use("/api", apiLimiter);

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

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server running on http:localhost:${PORT}`);
});