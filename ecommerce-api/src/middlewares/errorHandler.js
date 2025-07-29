import fs from 'fs';
import path from 'path';

const errorHandler = (err, req, res, next) => {
    const logFilePath = path.join(__dirname, "../../logs/error.log");
    const logMessage = `${new Date().toISOString()}
    -${req.method}
    -${req.url}
    -${err.message}
    -${err.stack}\n`;

    fs.appendFile(logFilePath, logMessage, (fsError) => {
        if (fsError) {
            console.error('Failed to write into log file');
        }
    });

    res.status(500).json({
        status: 'error',
        message: 'Internal Server Error'
    });

    next();
};

export default errorHandler;