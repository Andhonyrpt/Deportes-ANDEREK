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
        const response = await http.post(`orders/user/${userId}`, { params: { page, limit } });

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