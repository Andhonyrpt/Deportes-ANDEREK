import { http } from "./http";

/**
 * Obtiene la wishlist del usuario autenticado.
 * @returns {Promise<Object>}
 */
export async function getWishlist() {
    try {
        const response = await http.get('wishlist');
        // Backend retorne algo como { wishList: { user, products: [...] } }
        return response.data?.wishList || null;
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        return null; // o lanzar error
    }
}

/**
 * Agrega un producto a la wishlist.
 * @param {string} productId - ID del producto
 * @returns {Promise<Object>}
 */
export async function addToWishlist(productId) {
    try {
        const response = await http.post('wishlist/add', { productId });
        return response.data;
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        throw error;
    }
}

/**
 * Verifica si un producto está en la wishlist.
 * @param {string} productId - ID del producto
 * @returns {Promise<boolean>}
 */
export async function checkIfInWishlist(productId) {
    try {
        const response = await http.get(`wishlist/check/${productId}`);
        // Backend devuelve { inWishList: true/false }
        return response.data?.inWishList || false;
    } catch (error) {
        console.error("Error checking wishlist status:", error);
        return false;
    }
}

/**
 * Remueve un producto de la wishlist.
 * @param {string} productId - ID del producto
 * @returns {Promise<Object>}
 */
export async function removeFromWishlist(productId) {
    try {
        const response = await http.delete(`wishlist/remove/${productId}`);
        return response.data;
    } catch (error) {
        console.error("Error removing from wishlist:", error);
        throw error;
    }
}

/**
 * Mueve un producto (o todos) de la wishlist al carrito (según implementación del backend).
 * Moveremos un ítem específico suponiendo un body { productId }.
 * @param {string} productId - ID del producto
 * @returns {Promise<Object>}
 */
export async function moveWishlistToCart(productId) {
    try {
        const response = await http.post('wishlist/move-to-cart', { productId });
        return response.data;
    } catch (error) {
        console.error("Error moving to cart:", error);
        throw error;
    }
}

/**
 * Vacía la wishlist completa.
 * @returns {Promise<Object>}
 */
export async function clearWishlist() {
    try {
        const response = await http.delete('wishlist/clear');
        return response.data;
    } catch (error) {
        console.error("Error clearing wishlist:", error);
        throw error;
    }
}
