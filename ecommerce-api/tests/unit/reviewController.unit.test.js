import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createReview, updateReview, deleteReview } from '../../src/controllers/reviewController.js';
import Review from '../../src/models/review.js';
import Product from '../../src/models/product.js';
import { createMockReqRes } from '../helpers/createMockReqRes.js';

// Mock dependencias
vi.mock('../../src/models/review.js');
vi.mock('../../src/models/product.js');

describe('reviewController Unit Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createReview', () => {
        it('should create a review successfully', async () => {
            const { req, res, next } = createMockReqRes({
                body: { product: 'prod123', rating: 5, comment: 'Great!' },
                user: { userId: 'user123' }
            });

            Product.findById.mockResolvedValue({ _id: 'prod123' });
            Review.findOne.mockResolvedValue(null); // No existing review

            const saveMock = vi.fn().mockResolvedValue(true);
            const populateMock = vi.fn().mockResolvedValue(true);

            Review.prototype.save = saveMock;
            Review.prototype.populate = populateMock;

            await createReview(req, res, next);

            expect(Product.findById).toHaveBeenCalledWith('prod123');
            expect(Review.findOne).toHaveBeenCalledWith({ user: 'user123', product: 'prod123' });
            expect(saveMock).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Review created successfully'
            }));
        });

        it('should return 404 if product does not exist', async () => {
            const { req, res, next } = createMockReqRes({
                body: { product: 'invalid_id', rating: 5 },
                user: { userId: 'user123' }
            });

            Product.findById.mockResolvedValue(null);

            await createReview(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Product not found' });
        });

        it('should return 400 if user has already reviewed the product', async () => {
            const { req, res, next } = createMockReqRes({
                body: { product: 'prod123', rating: 5 },
                user: { userId: 'user123' }
            });

            Product.findById.mockResolvedValue({ _id: 'prod123' });
            Review.findOne.mockResolvedValue({ _id: 'existing_review' });

            await createReview(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'You have already reviewed this product' });
        });

        it('should call next(err) if Mongoose save fails', async () => {
            const { req, res, next } = createMockReqRes({
                body: { product: 'prod123', rating: 5 },
                user: { userId: 'user123' }
            });

            Product.findById.mockResolvedValue({ _id: 'prod123' });
            Review.findOne.mockResolvedValue(null);

            const error = new Error('DB Error');
            Review.prototype.save = vi.fn().mockRejectedValue(error);

            await createReview(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('updateReview', () => {
        it('should return 400 if no update fields are provided', async () => {
            const { req, res, next } = createMockReqRes({
                params: { reviewId: 'rev123' },
                body: {}, // Empty body
                user: { userId: 'owner_id' }
            });

            await updateReview(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "At least one field (rating or comment) must be provided" });
        });

        it('should return 403 if user is not the owner', async () => {
            const { req, res, next } = createMockReqRes({
                params: { reviewId: 'rev123' },
                body: { rating: 4 },
                user: { userId: 'hacker_id' }
            });

            const mockReview = {
                _id: 'rev123',
                user: { toString: () => 'owner_id' }, // Different owner
                save: vi.fn(),
                populate: vi.fn()
            };
            Review.findById.mockResolvedValue(mockReview);

            await updateReview(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'You can only update your own reviews' });
        });

        it('should update successfully if user is the owner', async () => {
            const { req, res, next } = createMockReqRes({
                params: { reviewId: 'rev123' },
                body: { rating: 4, comment: 'Updated' },
                user: { userId: 'owner_id' }
            });

            const mockReview = {
                _id: 'rev123',
                user: { toString: () => 'owner_id' },
                rating: 2,
                comment: 'Old',
                save: vi.fn().mockResolvedValue(true),
                populate: vi.fn().mockResolvedValue({ _id: 'rev123' })
            };
            Review.findById.mockResolvedValue(mockReview);

            await updateReview(req, res, next);

            expect(mockReview.rating).toBe(4);
            expect(mockReview.comment).toBe('Updated');
            expect(mockReview.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('deleteReview', () => {
        it('should return 403 if user is not the owner', async () => {
            const { req, res, next } = createMockReqRes({
                params: { reviewId: 'rev123' },
                user: { userId: 'hacker_id' }
            });

            const mockReview = {
                _id: 'rev123',
                user: { toString: () => 'owner_id' }
            };
            Review.findById.mockResolvedValue(mockReview);

            await deleteReview(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
        });

        it('should delete successfully if user is the owner', async () => {
            const { req, res, next } = createMockReqRes({
                params: { reviewId: 'rev123' },
                user: { userId: 'owner_id' }
            });

            const mockReview = {
                _id: 'rev123',
                user: { toString: () => 'owner_id' }
            };
            Review.findById.mockResolvedValue(mockReview);
            Review.findByIdAndDelete.mockResolvedValue(true);

            await deleteReview(req, res, next);

            expect(Review.findByIdAndDelete).toHaveBeenCalledWith('rev123');
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});
