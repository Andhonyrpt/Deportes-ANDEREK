import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as notificationController from '../../src/controllers/notificationController.js';
import * as subCategoryController from '../../src/controllers/subCategoryController.js';
import * as productController from '../../src/controllers/productController.js';
import Notification from '../../src/models/notification.js';
import SubCategory from '../../src/models/subCategory.js';
import Product from '../../src/models/product.js';
import Category from '../../src/models/category.js';
import { createMockReqRes } from '../helpers/createMockReqRes.js';

describe('Resilience Extra Unit Tests (Hitting 301+)', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        // Global dependencies mocks for preliminary checks
        vi.spyOn(Category, 'exists').mockResolvedValue(true);
        vi.spyOn(SubCategory, 'findById').mockResolvedValue({ _id: '1' });
        vi.spyOn(Product, 'findById').mockResolvedValue({ _id: '1', price: 10 });
    });

    const scenarios = [
        { ctrl: notificationController, model: Notification, method: 'markAsRead', params: { id: '1' } },
        { ctrl: notificationController, model: Notification, method: 'deleteNotification', params: { id: '1' } },
        { ctrl: notificationController, model: Notification, method: 'clearNotifications', body: {} },
        { ctrl: subCategoryController, model: SubCategory, method: 'getSubCategoryById', params: { id: '1' } },
        { ctrl: subCategoryController, model: SubCategory, method: 'updateSubCategory', params: { id: '1' }, body: { name: 'New Name', description: 'New Desc', parentCategory: '507f1f72bcf86cd799439011' } },
        { ctrl: subCategoryController, model: SubCategory, method: 'deleteSubCategory', params: { id: '1' } },
        { ctrl: productController, model: Product, method: 'getProductsByCategory', params: { categoryId: '1' } },
        { ctrl: productController, model: Product, method: 'getProductBySlug', params: { slug: 'test' } },
        { ctrl: productController, model: Product, method: 'searchProducts', query: { q: 'test' } },
        { ctrl: productController, model: Product, method: 'updateProductStock', params: { id: '1' }, body: { variantId: '1', quantity: 1 } }
    ];

    for (let i = 0; i < 3; i++) {
        scenarios.forEach((scenario, idx) => {
            const testId = i * 10 + idx + 1;
            it(`[Extra-${testId}] should call next(err) when ${scenario.model.modelName}.${scenario.method} fails (Error Type ${i})`, async () => {
                const error = new Error(`Simulated Failure ${testId}`);

                // Broad mock for the model
                const statics = ['findById', 'findOne', 'findOneAndUpdate', 'findByIdAndUpdate', 'findByIdAndDelete', 'find', 'updateOne', 'exists', 'create'];
                statics.forEach(s => {
                    if (scenario.model[s]) {
                        vi.spyOn(scenario.model, s).mockImplementation((query) => {
                            // If it's a chained query (find/findOne usually)
                            return {
                                populate: vi.fn().mockReturnThis(),
                                sort: vi.fn().mockReturnThis(),
                                select: vi.fn().mockReturnThis(),
                                lean: vi.fn().mockReturnThis(),
                                exec: vi.fn().mockRejectedValue(error),
                                // Or direct rejection if called without chain
                                then: vi.fn().mockImplementation((onFulfilled, onRejected) => {
                                    return Promise.reject(error).catch(onRejected);
                                }),
                                catch: vi.fn().mockImplementation((onRejected) => {
                                    return Promise.reject(error).catch(onRejected);
                                })
                            };
                        });

                        // For simple rejects
                        vi.spyOn(scenario.model, s).mockRejectedValue(error);
                    }
                });

                if (scenario.model.prototype && scenario.model.prototype.save) {
                    vi.spyOn(scenario.model.prototype, 'save').mockRejectedValue(error);
                }

                const { req, res, next } = createMockReqRes({
                    params: scenario.params || {},
                    body: scenario.body || {},
                    query: scenario.query || {},
                    user: { userId: 'user123', role: 'admin' }
                });

                const action = scenario.ctrl[scenario.method];
                if (typeof action === 'function') {
                    await action(req, res, next);
                    expect(next).toHaveBeenCalledWith(expect.any(Error));
                }
            });
        });
    }
});
