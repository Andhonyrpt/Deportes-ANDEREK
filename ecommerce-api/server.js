import cors from 'cors';
import helmet from 'helmet';
import express from "express";
import mongoose from 'mongoose';
import dbConnection from './src/config/database.js';
import errorHandler from './src/middlewares/errorHandler.js';
import setupGlobalErrorHandlers from "./src/middlewares/globalerrorHandler.js";
import logger from './src/middlewares/logger.js';
import { apiLimiter } from "./src/middlewares/rateLimiter.js";
import routes from './src/routes/index.js';

dotenv.config(); // Poder utilizar el archivo ".env" e instalar su dependencia con "npm install dotenv"

// Configurar manejadores globales ANTES de crear la app
setupGlobalErrorHandlers();

export const app = express();

app.set('trust proxy', 1);

dbConnection();


app.use(helmet());

app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(','),
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-load-test']
}));

// Middlewares en el orden correcto
app.use(express.json());
app.use(logger);

// Rate limiting global para toda la API
app.use("/api", apiLimiter);

// Health check endpoint
app.get("/health", async (req, res) => {
    const healthcheck = {
        uptime: process.uptime(),
        status: "OK",
        timestamp: Date.now(),
        database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    };
    try {
        res.status(200).json(healthcheck);
    } catch (error) {
        healthcheck.status = "ERROR";
        res.status(503).json(healthcheck);
    }
});

// Ruta raíz
app.get('/', (req, res) => {
    res.json({
        message: "E-commerce API",
        version: "1.0.0",
        endpoints: {
            health: "/health",
            api: "/api"
        }
    });
});

app.use('/api', routes);

app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        method: req.method,
        url: req.originalUrl
    });
});

// El errorHandler debe ir AL FINAL, después de todas las rutas
app.use(errorHandler);

app.listen(process.env.PORT, () => {
    console.log(`Server running on http:localhost:${process.env.PORT}`);
});
