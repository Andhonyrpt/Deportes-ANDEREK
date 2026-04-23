import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import setupGlobalErrorHandlers from '../../../src/middlewares/globalerrorHandler.js';

vi.mock('fs');

describe('globalerrorHandler unit tests', () => {
    let originalUncaughtException;
    let originalUnhandledRejection;

    beforeEach(() => {
        vi.clearAllMocks();
        // Save original handlers to restore them later
        originalUncaughtException = process.listeners('uncaughtException');
        originalUnhandledRejection = process.listeners('unhandledRejection');
        // Remove all listeners to avoid interference and potential process exit during tests
        process.removeAllListeners('uncaughtException');
        process.removeAllListeners('unhandledRejection');
    });

    afterEach(() => {
        // Restore original listeners
        process.removeAllListeners('uncaughtException');
        process.removeAllListeners('unhandledRejection');
        originalUncaughtException.forEach(l => process.on('uncaughtException', l));
        originalUnhandledRejection.forEach(l => process.on('unhandledRejection', l));
    });

    it('should setup listeners and log uncaught exceptions', () => {
        fs.existsSync.mockReturnValue(true);
        setupGlobalErrorHandlers();

        const error = new Error('Global Crash');
        process.emit('uncaughtException', error);

        expect(fs.appendFileSync).toHaveBeenCalledWith(
            expect.stringContaining('error.log'),
            expect.stringContaining('UNCAUGHT EXCEPTION | Global Crash')
        );
    });

    it('should setup listeners and log unhandled rejections', () => {
        fs.existsSync.mockReturnValue(true);
        setupGlobalErrorHandlers();

        process.emit('unhandledRejection', 'Global Rejection', Promise.resolve());

        expect(fs.appendFileSync).toHaveBeenCalledWith(
            expect.stringContaining('error.log'),
            expect.stringContaining('UNHANDLED EXCEPTION | Global Rejection')
        );
    });

    it('should create logs directory if it does not exist', () => {
        fs.existsSync.mockReturnValue(false);
        setupGlobalErrorHandlers();
        
        expect(fs.mkdirSync).toHaveBeenCalled();
    });
});
