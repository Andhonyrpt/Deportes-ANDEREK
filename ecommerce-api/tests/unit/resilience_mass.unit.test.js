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
            ctrl.methods.forEach(method => {
                it(`should call next(err) when DB fails in ${method}`, async () => {
                    const error = new Error(`${ctrl.name} DB Error in ${method}`);
                    // Mock findById or findOne or whatever comes first
                    vi.spyOn(ctrl.model, 'findById').mockRejectedValue(error);
                    vi.spyOn(ctrl.model, 'findOne').mockRejectedValue(error);
                    vi.spyOn(ctrl.model, 'findByIdAndUpdate').mockRejectedValue(error);
                    vi.spyOn(ctrl.model, 'findByIdAndDelete').mockRejectedValue(error);

                    const { req, res, next } = createMockReqRes({
                        params: { id: '507f1f72bcf86cd799439011' },
                        user: { userId: '507f1f72bcf86cd799439011', role: 'admin' }
                    });

                    if (ctrl.service[method]) {
                        await ctrl.service[method](req, res, next);
                        expect(next).toHaveBeenCalledWith(expect.any(Error));
                    }
                });
            });
        });
    });
});
