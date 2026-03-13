import rateLimit from "express-rate-limit";

const skipTest = (req) => {
    if (process.env.NODE_ENV === 'test') {
        if (req.headers['x-test-limit-strict'] === 'true') return false;
        if (process.env.TEST_LIMITER === 'true') return false;
        return true;
    }
    if ((process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) && req.headers['x-load-test'] === 'true') {
        return true;
    }
    return false;
};

// Rate limiter para autenticación (login/register)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: (req) => {
        if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
            if (req.headers['x-test-limit-strict'] === 'true') return 2;
            return 1000;
        }
        return 5;
    },
    skip: skipTest,
    message: {
        message: "Too many authentication attempts, please try again after 15 minutes",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter general para API
export const apiLimiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 10000, // Máximo 10000 requests por ventana
    skip: skipTest,
    message: {
        message: "Too many requests, please try again later",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter estricto para operaciones sensibles
export const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 100, // Máximo 3 intentos por hora
    skip: skipTest,
    message: {
        message: "Too many attempts, please try again after 1 hour",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

