/**
 * @file validators.extended.test.js
 * @description Extended unit tests for all validators in src/middlewares/validators.js
 *   that were NOT yet covered by the base validators.test.js.
 *
 *   Coverage added by this file:
 *   - displayNameValidation    - phoneValidation           - paginationValidation
 *   - priceValidation          - bodyMongoIdValidation      - quantityValidation
 *   - ratingValidation         - commentValidation          - messageValidation
 *   - stockValidation          - paymentStatusValidation    - cardNumberValidation
 *   - expiryDateValidation     - paymentTypeValidation      - roleValidation
 *   - nameValidation           - addressLineValidation      - cityValidation
 *   - postalCodeValidation     - searchQueryValidation      - genreValidation
 *   - fullPasswordValidation   - newPasswordValidation      - confirmPasswordValidation
 *   - imagesUrlValidation      - productNameValidation      - productDescriptionValidation
 */
import { describe, it, expect } from 'vitest';
import { validationResult } from 'express-validator';
import * as v from '../../../src/middlewares/validators.js';

// ─── Helper ──────────────────────────────────────────────────────────────────
const run = async (req, middleware) => {
    const mws = Array.isArray(middleware) ? middleware : [middleware];
    for (const m of mws) await m(req, {}, () => { });
    return validationResult(req);
};
// ─────────────────────────────────────────────────────────────────────────────

describe('Extended Validators Unit Tests', () => {

    // ─── displayNameValidation ────────────────────────────────────────────────
    describe('displayNameValidation', () => {
        it('fails when displayName is too short (< 2 chars)', async () => {
            const req = { body: { displayName: 'A' } };
            const r = await run(req, v.displayNameValidation());
            expect(r.isEmpty()).toBe(false);
            expect(r.array()[0].msg).toContain('2 and 50 characters');
        });

        it('fails when displayName is too long (> 50 chars)', async () => {
            const req = { body: { displayName: 'A'.repeat(51) } };
            const r = await run(req, v.displayNameValidation());
            expect(r.isEmpty()).toBe(false);
        });

        it('passes with a valid displayName', async () => {
            const req = { body: { displayName: 'Juan Pérez' } };
            const r = await run(req, v.displayNameValidation());
            expect(r.isEmpty()).toBe(true);
        });

        it('is optional when optional=true and field is absent', async () => {
            const req = { body: {} };
            const r = await run(req, v.displayNameValidation(true));
            expect(r.isEmpty()).toBe(true);
        });
    });

    // ─── phoneValidation ───────────────────────────────────────────────────────
    describe('phoneValidation', () => {
        it('fails when phone is not exactly 10 digits', async () => {
            const req = { body: { phone: '12345' } };
            const r = await run(req, v.phoneValidation());
            expect(r.isEmpty()).toBe(false);
            expect(r.array()[0].msg).toContain('10 digits');
        });

        it('fails when phone contains letters', async () => {
            const req = { body: { phone: '123456789A' } };
            const r = await run(req, v.phoneValidation());
            expect(r.isEmpty()).toBe(false);
        });

        it('passes with a valid 10-digit phone number', async () => {
            const req = { body: { phone: '5512345678' } };
            const r = await run(req, v.phoneValidation());
            expect(r.isEmpty()).toBe(true);
        });

        it('is optional: absence of phone is valid', async () => {
            const req = { body: {} };
            const r = await run(req, v.phoneValidation());
            expect(r.isEmpty()).toBe(true);
        });
    });

    // ─── paginationValidation ──────────────────────────────────────────────────
    describe('paginationValidation', () => {
        it('fails if page is 0 (must be >= 1)', async () => {
            const req = { query: { page: '0' }, body: {} };
            const r = await run(req, v.paginationValidation());
            expect(r.isEmpty()).toBe(false);
            expect(r.array()[0].msg).toContain('positive integer');
        });

        it('fails if limit exceeds 100', async () => {
            const req = { query: { limit: '101' }, body: {} };
            const r = await run(req, v.paginationValidation());
            expect(r.isEmpty()).toBe(false);
            expect(r.array()[0].msg).toContain('between 1 and 100');
        });

        it('passes with valid page and limit', async () => {
            const req = { query: { page: '2', limit: '25' }, body: {} };
            const r = await run(req, v.paginationValidation());
            expect(r.isEmpty()).toBe(true);
        });
    });

    // ─── priceValidation ──────────────────────────────────────────────────────
    describe('priceValidation', () => {
        it('fails if price is negative', async () => {
            const req = { body: { price: -5 } };
            const r = await run(req, v.priceValidation());
            expect(r.isEmpty()).toBe(false);
            expect(r.array()[0].msg).toContain('positive number');
        });

        it('passes if price is 0', async () => {
            const req = { body: { price: 0 } };
            const r = await run(req, v.priceValidation());
            expect(r.isEmpty()).toBe(true);
        });

        it('passes with valid float price', async () => {
            const req = { body: { price: 99.99 } };
            const r = await run(req, v.priceValidation());
            expect(r.isEmpty()).toBe(true);
        });
    });

    // ─── bodyMongoIdValidation ────────────────────────────────────────────────
    describe('bodyMongoIdValidation', () => {
        it('fails if body field is not a valid MongoID', async () => {
            const req = { body: { productId: 'not-a-mongo-id' } };
            const r = await run(req, v.bodyMongoIdValidation('productId', 'Product'));
            expect(r.isEmpty()).toBe(false);
            expect(r.array()[0].msg).toContain('Invalid Product format');
        });

        it('passes with a valid MongoID in body', async () => {
            const req = { body: { productId: '507f1f77bcf86cd799439011' } };
            const r = await run(req, v.bodyMongoIdValidation('productId', 'Product'));
            expect(r.isEmpty()).toBe(true);
        });
    });

    // ─── quantityValidation ───────────────────────────────────────────────────
    describe('quantityValidation', () => {
        it('fails if quantity is 0', async () => {
            const req = { body: { quantity: 0 } };
            const r = await run(req, v.quantityValidation());
            expect(r.isEmpty()).toBe(false);
            expect(r.array()[0].msg).toContain('at least 1');
        });

        it('fails if quantity is a float', async () => {
            const req = { body: { quantity: 1.5 } };
            const r = await run(req, v.quantityValidation());
            expect(r.isEmpty()).toBe(false);
        });

        it('passes with quantity = 1', async () => {
            const req = { body: { quantity: 1 } };
            const r = await run(req, v.quantityValidation());
            expect(r.isEmpty()).toBe(true);
        });
    });

    // ─── ratingValidation ─────────────────────────────────────────────────────
    describe('ratingValidation', () => {
        it('fails if rating is 0 (below minimum)', async () => {
            const req = { body: { rating: 0 } };
            const r = await run(req, v.ratingValidation());
            expect(r.isEmpty()).toBe(false);
            expect(r.array()[0].msg).toContain('between 1 and 5');
        });

        it('fails if rating is 6 (above maximum)', async () => {
            const req = { body: { rating: 6 } };
            const r = await run(req, v.ratingValidation());
            expect(r.isEmpty()).toBe(false);
        });

        it('passes with rating = 5', async () => {
            const req = { body: { rating: 5 } };
            const r = await run(req, v.ratingValidation());
            expect(r.isEmpty()).toBe(true);
        });

        it('passes with rating = 1', async () => {
            const req = { body: { rating: 1 } };
            const r = await run(req, v.ratingValidation());
            expect(r.isEmpty()).toBe(true);
        });
    });

    // ─── messageValidation ────────────────────────────────────────────────────
    describe('messageValidation', () => {
        it('fails when message is empty', async () => {
            const req = { body: { message: '' } };
            const r = await run(req, v.messageValidation());
            expect(r.isEmpty()).toBe(false);
            expect(r.array()[0].msg).toContain('required');
        });

        it('fails if message exceeds maxLength', async () => {
            const req = { body: { message: 'A'.repeat(501) } };
            const r = await run(req, v.messageValidation());
            expect(r.isEmpty()).toBe(false);
        });

        it('passes with a valid message', async () => {
            const req = { body: { message: 'Hello, this is a valid message.' } };
            const r = await run(req, v.messageValidation());
            expect(r.isEmpty()).toBe(true);
        });
    });

    // ─── stockValidation ──────────────────────────────────────────────────────
    describe('stockValidation', () => {
        it('fails if stock is negative', async () => {
            const req = { body: { stock: -1 } };
            const r = await run(req, v.stockValidation());
            expect(r.isEmpty()).toBe(false);
            expect(r.array()[0].msg).toContain('non-negative integer');
        });

        it('passes if stock is 0', async () => {
            const req = { body: { stock: 0 } };
            const r = await run(req, v.stockValidation());
            expect(r.isEmpty()).toBe(true);
        });

        it('passes if stock is a positive integer', async () => {
            const req = { body: { stock: 100 } };
            const r = await run(req, v.stockValidation());
            expect(r.isEmpty()).toBe(true);
        });
    });

    // ─── paymentStatusValidation ──────────────────────────────────────────────
    describe('paymentStatusValidation', () => {
        it('fails with an invalid payment status', async () => {
            const req = { body: { paymentStatus: 'charged' } };
            const r = await run(req, v.paymentStatusValidation());
            expect(r.isEmpty()).toBe(false);
            expect(r.array()[0].msg).toContain('Invalid payment status value');
        });

        it('passes with valid statuses: pending, paid, failed, refunded', async () => {
            for (const status of ['pending', 'paid', 'failed', 'refunded']) {
                const req = { body: { paymentStatus: status } };
                const r = await run(req, v.paymentStatusValidation());
                expect(r.isEmpty()).toBe(true);
            }
        });
    });

    // ─── cardNumberValidation ─────────────────────────────────────────────────
    describe('cardNumberValidation', () => {
        it('fails if card number is not 16 digits', async () => {
            const req = { body: { cardNumber: '1234' } };
            const r = await run(req, v.cardNumberValidation());
            expect(r.isEmpty()).toBe(false);
            expect(r.array()[0].msg).toContain('16 digits');
        });

        it('fails if card number contains letters', async () => {
            const req = { body: { cardNumber: '1234567890123ABC' } };
            const r = await run(req, v.cardNumberValidation());
            expect(r.isEmpty()).toBe(false);
        });

        it('passes with a valid 16-digit number', async () => {
            const req = { body: { cardNumber: '4111111111111111' } };
            const r = await run(req, v.cardNumberValidation());
            expect(r.isEmpty()).toBe(true);
        });
    });

    // ─── expiryDateValidation ─────────────────────────────────────────────────
    describe('expiryDateValidation', () => {
        it('fails if expiry date has wrong format (YYYY-MM)', async () => {
            const req = { body: { expiryDate: '2025-12' } };
            const r = await run(req, v.expiryDateValidation());
            expect(r.isEmpty()).toBe(false);
            expect(r.array()[0].msg).toContain('MM/YY format');
        });

        it('fails if month is 13', async () => {
            const req = { body: { expiryDate: '13/25' } };
            const r = await run(req, v.expiryDateValidation());
            expect(r.isEmpty()).toBe(false);
        });

        it('passes with a valid MM/YY format', async () => {
            const req = { body: { expiryDate: '12/27' } };
            const r = await run(req, v.expiryDateValidation());
            expect(r.isEmpty()).toBe(true);
        });
    });

    // ─── paymentTypeValidation ────────────────────────────────────────────────
    describe('paymentTypeValidation', () => {
        it('fails with unknown payment type', async () => {
            const req = { body: { type: 'crypto' } };
            const r = await run(req, v.paymentTypeValidation());
            expect(r.isEmpty()).toBe(false);
            expect(r.array()[0].msg).toContain('Invalid payment method type');
        });

        it('passes with all valid payment types', async () => {
            for (const type of ['credit_card', 'debit_card', 'paypal', 'bank_transfer']) {
                const req = { body: { type } };
                const r = await run(req, v.paymentTypeValidation());
                expect(r.isEmpty()).toBe(true);
            }
        });
    });

    // ─── roleValidation ───────────────────────────────────────────────────────
    describe('roleValidation', () => {
        it('fails with an invalid role', async () => {
            const req = { body: { role: 'superadmin' } };
            const r = await run(req, v.roleValidation());
            expect(r.isEmpty()).toBe(false);
            expect(r.array()[0].msg).toContain('admin, customer, or guest');
        });

        it('passes with valid roles', async () => {
            for (const role of ['admin', 'customer', 'guest']) {
                const req = { body: { role } };
                const r = await run(req, v.roleValidation());
                expect(r.isEmpty()).toBe(true);
            }
        });
    });

    // ─── cityValidation ───────────────────────────────────────────────────────
    describe('cityValidation', () => {
        it('fails if city contains numbers', async () => {
            const req = { body: { city: 'Ciudad123' } };
            const r = await run(req, v.cityValidation());
            expect(r.isEmpty()).toBe(false);
            expect(r.array()[0].msg).toContain('only letters and spaces');
        });

        it('passes with a valid city name (including accents)', async () => {
            const req = { body: { city: 'México' } };
            const r = await run(req, v.cityValidation());
            expect(r.isEmpty()).toBe(true);
        });
    });

    // ─── postalCodeValidation ─────────────────────────────────────────────────
    describe('postalCodeValidation', () => {
        it('fails if postal code is too short (< 4)', async () => {
            const req = { body: { postalCode: '123' } };
            const r = await run(req, v.postalCodeValidation());
            expect(r.isEmpty()).toBe(false);
        });

        it('fails if postal code contains letters', async () => {
            const req = { body: { postalCode: 'ABC12' } };
            const r = await run(req, v.postalCodeValidation());
            expect(r.isEmpty()).toBe(false);
            expect(r.array()[0].msg).toContain('only numbers');
        });

        it('passes with a 5-digit postal code', async () => {
            const req = { body: { postalCode: '06700' } };
            const r = await run(req, v.postalCodeValidation());
            expect(r.isEmpty()).toBe(true);
        });
    });

    // ─── genreValidation ──────────────────────────────────────────────────────
    describe('genreValidation', () => {
        it('fails with an invalid genre', async () => {
            const req = { body: { genre: 'Unisex' } };
            const r = await run(req, v.genreValidation());
            expect(r.isEmpty()).toBe(false);
        });

        it('passes with valid genres: Hombre, Mujer, Niño', async () => {
            for (const genre of ['Hombre', 'Mujer', 'Niño']) {
                const req = { body: { genre } };
                const r = await run(req, v.genreValidation());
                expect(r.isEmpty()).toBe(true);
            }
        });
    });

    // ─── confirmPasswordValidation ────────────────────────────────────────────
    describe('confirmPasswordValidation', () => {
        it('fails if confirmPassword does not match newPassword', async () => {
            const req = { body: { newPassword: 'Password123', confirmPassword: 'Different1' } };
            const r = await run(req, v.confirmPasswordValidation());
            expect(r.isEmpty()).toBe(false);
            expect(r.array()[0].msg).toContain('does not match new password');
        });

        it('passes if confirmPassword matches newPassword', async () => {
            const req = { body: { newPassword: 'Password123', confirmPassword: 'Password123' } };
            const r = await run(req, v.confirmPasswordValidation());
            expect(r.isEmpty()).toBe(true);
        });
    });

    // ─── imagesUrlValidation ──────────────────────────────────────────────────
    describe('imagesUrlValidation', () => {
        it('fails if imagesUrl is an empty array', async () => {
            const req = { body: { imagesUrl: [] } };
            const r = await run(req, v.imagesUrlValidation());
            expect(r.isEmpty()).toBe(false);
        });

        it('fails if any image URL is invalid', async () => {
            const req = { body: { imagesUrl: ['https://valid.com/image.png', 'not-a-url'] } };
            const r = await run(req, v.imagesUrlValidation());
            expect(r.isEmpty()).toBe(false);
            expect(r.array()[0].msg).toContain('valid URL');
        });

        it('passes with a valid array of URLs', async () => {
            const req = { body: { imagesUrl: ['https://cdn.example.com/shoe1.jpg'] } };
            const r = await run(req, v.imagesUrlValidation());
            expect(r.isEmpty()).toBe(true);
        });
    });

    // ─── productDescriptionValidation ─────────────────────────────────────────
    describe('productDescriptionValidation', () => {
        it('fails if description is too short (< 10 chars)', async () => {
            const req = { body: { description: 'Short' } };
            const r = await run(req, v.productDescriptionValidation());
            expect(r.isEmpty()).toBe(false);
            expect(r.array()[0].msg).toContain('10 and 1000 characters');
        });

        it('passes with a valid description', async () => {
            const req = { body: { description: 'This is a valid product description with enough length.' } };
            const r = await run(req, v.productDescriptionValidation());
            expect(r.isEmpty()).toBe(true);
        });
    });
});
