import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authController from '../../src/controllers/authController.js';
import * as productController from '../../src/controllers/productController.js';
import * as userController from '../../src/controllers/userController.js';
import * as reviewController from '../../src/controllers/reviewController.js';
import * as shippingAddressController from '../../src/controllers/shippingAddressController.js';
import * as paymentMethodController from '../../src/controllers/paymentMethodController.js';
import * as categoryController from '../../src/controllers/categoryController.js';
import * as wishListController from '../../src/controllers/wishListController.js';
import User from '../../src/models/user.js';
import Product from '../../src/models/product.js';
import Review from '../../src/models/review.js';
import ShippingAddress from '../../src/models/shippingAddress.js';
import PaymentMethod from '../../src/models/paymentMethod.js';
import Category from '../../src/models/category.js';
import WishList from '../../src/models/wishList.js';
import { createMockReqRes } from '../helpers/createMockReqRes.js';

describe('Expanded Controller Resilience Unit Tests', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    describe('AuthController Resilience', () => {
        it('should call next(err) when User.findOne fails in login', async () => {
            const error = new Error('Auth DB Failure');
            vi.spyOn(User, 'findOne').mockRejectedValue(error);

            const { req, res, next } = createMockReqRes({
                body: { email: 'test@test.com', password: 'password' }
            });

            await authController.login(req, res, next);
            expect(next).toHaveBeenCalledWith(error);
        });

        it('should call next(err) when User.create fails in register', async () => {
            const error = new Error('Registration Save Failure');
            vi.spyOn(User, 'create').mockRejectedValue(error);

            const { req, res, next } = createMockReqRes({
                body: {
                    email: 'new@test.com',
                    password: 'Password123',
                    displayName: 'New User',
                    phone: '1234567890'
                }
            });

            await authController.register(req, res, next);
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('ProductController Resilience', () => {
        it('should call next(err) when Product.find fails in getProducts', async () => {
            const error = new Error('Product Listing Failure');
            vi.spyOn(Product, 'find').mockReturnValue({
                skip: vi.fn().mockReturnThis(),
                limit: vi.fn().mockReturnThis(),
                populate: vi.fn().mockRejectedValue(error)
            });

            const { req, res, next } = createMockReqRes();

            await productController.getProducts(req, res, next);
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('UserController Resilience', () => {
        it('should call next(err) when User.findById fails in getUserProfile', async () => {
            const error = new Error('Profile DB Failure');
            vi.spyOn(User, 'findById').mockRejectedValue(error);

            const { req, res, next } = createMockReqRes({
                user: { userId: '507f1f72bcf86cd799439011' }
            });

            await userController.getUserProfile(req, res, next);
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('ReviewController Resilience', () => {
        it('should call next(err) when Review.save fails', async () => {
            const error = new Error('Review Save Failure');
            vi.spyOn(Product, 'findById').mockResolvedValue({ _id: 'prod123' });

            // Mocking the prototype save
            vi.spyOn(Review.prototype, 'save').mockRejectedValue(error);

            const { req, res, next } = createMockReqRes({
                user: { userId: 'user123' },
                body: { product: 'prod123', rating: 5, comment: 'test' }
            });

            await reviewController.createReview(req, res, next);
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('ShippingAddressController Resilience', () => {
        it('should call next(err) when updateMany fails in createShippingAddress', async () => {
            const error = new Error('Address Batch Update Failure');
            vi.spyOn(ShippingAddress, 'updateMany').mockRejectedValue(error);

            const { req, res, next } = createMockReqRes({
                user: { userId: 'user123' },
                body: { isDefault: true, name: 'Home', address: '123 St', city: 'City', state: 'ST', postalCode: '12345', phone: '1234567890' }
            });

            await shippingAddressController.createShippingAddress(req, res, next);
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('PaymentMethodController Resilience', () => {
        it('should call next(err) when PaymentMethod.find fails in getPaymentMethodsByUser', async () => {
            const error = new Error('Payment Method Fetch Failure');
            vi.spyOn(PaymentMethod, 'find').mockReturnThis();
            vi.spyOn(PaymentMethod, 'populate').mockRejectedValue(error);

            const { req, res, next } = createMockReqRes({
                params: { userId: 'user123' }
            });

            await paymentMethodController.getPaymentMethodsByUser(req, res, next);
            expect(next).toHaveBeenCalledWith(error);
        });

        it('should call next(err) when PaymentMethod.findById fails in updatePaymentMethod', async () => {
            const error = new Error('Payment Method Update DB Failure');
            vi.spyOn(PaymentMethod, 'findById').mockRejectedValue(error);

            const { req, res, next } = createMockReqRes({
                params: { id: 'pm123' },
                body: { isDefault: true }
            });

            await paymentMethodController.updatePaymentMethod(req, res, next);
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('CategoryController Resilience', () => {
        it('should call next(err) when Category.find fails', async () => {
            const error = new Error('Category Fetch Failure');
            vi.spyOn(Category, 'find').mockRejectedValue(error);

            const { req, res, next } = createMockReqRes();

            await categoryController.getCategories(req, res, next);
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('WishListController Resilience', () => {
        it('should call next(err) when WishList.findOne fails', async () => {
            const error = new Error('Wishlist DB Failure');
            vi.spyOn(WishList, 'findOne').mockRejectedValue(error);

            const { req, res, next } = createMockReqRes({
                user: { userId: 'user123' }
            });

            await wishListController.getWishList(req, res, next);
            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
