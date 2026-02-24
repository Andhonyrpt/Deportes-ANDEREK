import { http } from "./http";


export const getCart = async (userId) => {
    try {
        const response = await http.get(`cart/user/${userId}`);

        return response.data
    } catch (error) {
        console.error("Error fetching a cart", error);
    }
};

export const addToCart = async (userId, productId, quantity, size) => {
    try {
        console.log("DATOS ENVIADOS:", { userId, productId, quantity, size });
        const response = await http.post("cart/add", { userId, productId, quantity, size });

        return response.data;
    } catch (error) {
        console.error("Error adding to cart", error);
    }
};

export const updateCartItem = async (userId, productId, quantity, size, oldSize) => {
    try {

        const response = await http.put("cart/update-item", {
            userId,
            productId,
            quantity,
            size,
            oldSize
        });

        return response.data;
    } catch (error) {
        console.error("Error updating cart", error);
    }
};

export const removeFromCart = async (userId, productId, size) => {
    try {
        const response = await http.delete(`cart/remove-item/${productId}`, {
            data: {
                userId,
                size
            }
        });

        return response.data;
    } catch (error) {
        console.error("Error removing from cart", error);
    }
};

export const clearCart = async (userId) => {
    try {
        const response = await http.post("cart/clear", { userId });

        return response.data;
    } catch (error) {
        console.error("Error deleting cart", error);
    }
};