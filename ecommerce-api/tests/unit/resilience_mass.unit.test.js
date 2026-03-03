import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as cartController from '../../src/controllers/cartController.js';
import * as categoryController from '../../src/controllers/categoryController.js';
import * as subCategoryController from '../../src/controllers/subCategoryController.js';
import * as orderController from '../../src/controllers/orderController.js';
import * as productController from '../../src/controllers/productController.js';
import * as userController from '../../src/controllers/userController.js';
import * as reviewController from '../../src/controllers/reviewController.js';
import * as notificationController from '../../src/controllers/notificationController.js';
import * as shippingAddressController from '../../src/controllers/shippingAddressController.js';
import * as paymentMethodController from '../../src/controllers/paymentMethodController.js';
import * as wishListController from '../../src/controllers/wishListController.js';
import Cart from '../../src/models/cart.js';
import Category from '../../src/models/category.js';
import SubCategory from '../../src/models/subCategory.js';
import Order from '../../src/models/order.js';
import Product from '../../src/models/product.js';
import User from '../../src/models/user.js';
import Review from '../../src/models/review.js';
import Notification from '../../src/models/notification.js';
import ShippingAddress from '../../src/models/shippingAddress.js';
import PaymentMethod from '../../src/models/paymentMethod.js';
import WishList from '../../src/models/wishList.js';
import { createMockReqRes } from '../helpers/createMockReqRes.js';

describe('Mass Resilience Unit Tests (DB Failure Simulations)', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        // Global mocks for dependencies to ensure we reach the target model calls
        vi.spyOn(Category, 'exists').mockResolvedValue(true);
        vi.spyOn(Category, 'findById').mockResolvedValue({ _id: '507f1f72bcf86cd799439012', parentCategory: null });
        vi.spyOn(SubCategory, 'findById').mockResolvedValue({ _id: '507f1f72bcf86cd799439011' });
        vi.spyOn(Product, 'findById').mockResolvedValue({ _id: '507f1f72bcf86cd799439011', price: 10, name: 'Prod' });
    });

    const controllers = [
        { name: 'Cart', service: cartController, model: Cart, methods: ['updateCart', 'removeCartItem', 'clearCart'] },
        { name: 'Category', service: categoryController, model: Category, methods: ['createCategory', 'updateCategory', 'deleteCategory'] },
        { name: 'SubCategory', service: subCategoryController, model: SubCategory, methods: ['createSubCategory', 'updateSubCategory', 'deleteSubCategory'] },
        { name: 'Order', service: orderController, model: Order, methods: ['updateOrder', 'cancelOrder', 'deleteOrder'] },
        { name: 'Product', service: productController, model: Product, methods: ['createProduct', 'updateProduct', 'deleteProduct'] },
        { name: 'User', service: userController, model: User, methods: ['updateUserProfile', 'updateUserRole', 'deleteUser'] },
        { name: 'Review', service: reviewController, model: Review, methods: ['updateReview', 'deleteReview'] },
        { name: 'Notification', service: notificationController, model: Notification, methods: ['deleteNotification', 'clearNotifications'] },
        { name: 'ShippingAddress', service: shippingAddressController, model: ShippingAddress, methods: ['createShippingAddress', 'updateShippingAddress', 'deleteShippingAddress'] },
        { name: 'PaymentMethod', service: paymentMethodController, model: PaymentMethod, methods: ['createPaymentMethod', 'updatePaymentMethod', 'deletePaymentMethod'] },
        { name: 'WishList', service: wishListController, model: WishList, methods: ['addToWishList', 'removeFromWishList'] }
    ];

    controllers.forEach(ctrl => {
        describe(`${ctrl.name} Controller Resilience`, () => {
            const methodsToTest = ctrl.methods;

            methodsToTest.forEach(method => {
                it(`should call next(err) when DB fails in ${method}`, async () => {
                    const error = new Error(`${ctrl.name} DB Error in ${method}`);

                    // Mock static methods of the TARGET model to reject
                    const statics = ['findById', 'findOne', 'findOneAndUpdate', 'findByIdAndUpdate', 'findByIdAndDelete', 'create', 'updateMany', 'deleteMany', 'find', 'updateOne', 'exists'];
                    statics.forEach(s => {
                        if (ctrl.model[s]) {
                            vi.spyOn(ctrl.model, s).mockRejectedValue(error);
                        }
                    });

                    // Mock prototype save
                    if (ctrl.model.prototype && ctrl.model.prototype.save) {
                        vi.spyOn(ctrl.model.prototype, 'save').mockRejectedValue(error);
                    }

                    const { req, res, next } = createMockReqRes({
                        params: {
                            id: '507f1f72bcf86cd799439011',
                            productId: '507f1f72bcf86cd799439011',
                            addressId: '507f1f72bcf86cd799439011',
                            userId: '507f1f72bcf86cd799439011'
                        },
                        body: {
                            name: 'Updated Name',
                            description: 'Updated Desc',
                            price: 99.99,
                            productId: '507f1f72bcf86cd799439011',
                            parentCategory: '507f1f72bcf86cd799439012', // Different from id
                            category: '507f1f72bcf86cd799439011',
                            type: 'credit_card',
                            cardNumber: '1234123412341234',
                            cardHolderName: 'Tester',
                            expiryDate: '12/25',
                            quantity: 1,
                            isDefault: true,
                            displayName: 'New Name',
                            role: 'customer',
                            user: '507f1f72bcf86cd799439011',
                            products: [],
                            status: 'processing',
                            shippingAddress: '507f1f72bcf86cd799439011',
                            paymentMethod: '507f1f72bcf86cd799439011',
                            rating: 5,
                            comment: 'test'
                        },
                        user: { userId: '507f1f72bcf86cd799439011', role: 'admin' }
                    });

                    const targetService = ctrl.service;
                    const action = targetService[method];

                    if (typeof action === 'function') {
                        await action(req, res, next);
                        expect(next).toHaveBeenCalledWith(expect.any(Error));
                    }
                });
            });
        });
    });
});
