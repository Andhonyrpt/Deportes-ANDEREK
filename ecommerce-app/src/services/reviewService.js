import { http } from "./http";

/**
 * Obtener reseñas de un producto
 * @param {string} productId
 * @returns {Promise<Array>}
 */
export async function getProductReviews(productId) {
    try {
        const response = await http.get(`review-product/${productId}`);
        return response.data?.reviews || [];
    } catch (error) {
        console.error("Error fetching product reviews:", error);
        return [];
    }
}

/**
 * Crear una nueva reseña
 * @param {Object} reviewData - { productId, rating, comment }
 * @returns {Promise<Object>}
 */
export async function createReview(reviewData) {
    try {
        const response = await http.post(`review`, reviewData);
        return response.data;
    } catch (error) {
        console.error("Error creating review:", error);
        throw error;
    }
}

/**
 * Obtener reseñas del usuario autenticado
 * @returns {Promise<Array>}
 */
export async function getMyReviews() {
    try {
        const response = await http.get(`my-reviews`);
        return response.data?.reviews || [];
    } catch (error) {
        console.error("Error fetching user reviews:", error);
        return [];
    }
}

/**
 * Actualizar una reseña
 * @param {string} reviewId
 * @param {Object} reviewData - { rating, comment }
 * @returns {Promise<Object>}
 */
export async function updateReview(reviewId, reviewData) {
    try {
        const response = await http.put(`my-reviews/${reviewId}`, reviewData);
        return response.data;
    } catch (error) {
        console.error("Error updating review:", error);
        throw error;
    }
}

/**
 * Eliminar una reseña
 * @param {string} reviewId
 * @returns {Promise<Object>}
 */
export async function deleteReview(reviewId) {
    try {
        const response = await http.delete(`my-reviews/${reviewId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting review:", error);
        throw error;
    }
}
