import { http } from "./http";

export const createOrder = async (orderData) => {
    try {
        const response = await http.post("orders", orderData);

        return response.data;
    } catch (error) {
        console.error(error);
    }
};

export const getMyOrders = async (userId, page = 1, limit = 10) => {
    try {
        const response = await http.get(`orders/user/${userId}`, { params: { page, limit } });

        return response.data;
    } catch (error) {
        console.error(error);
    }
};

export const getOrderById = async (orderId) => {
    try {
        const response = await http.get(`orders/${orderId}`);

        return response.data;
    } catch (error) {
        console.error(error);
    }
};

// Agrega esto a tu archivo orderService.js
export const previewOrder = async (products) => {
    try {
        // La ruta debe coincidir con el backend: POST /orders/preview
        const response = await http.post('orders/preview', { products });
        return response.data; 
    } catch (error) {
        console.error("Error en previewOrder service:", error);
        throw error;
    }
};

/**
 * [ADMIN ONLY]
 */
export const getAllOrders = async (page = 1, limit = 10) => {
    try {
        const response = await http.get(`orders`, { params: { page, limit } });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

/**
 * [ADMIN ONLY]
 */
export const updateOrderStatusAdmin = async (orderId, status) => {
    try {
        const response = await http.patch(`orders/${orderId}/status`, { status });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};
