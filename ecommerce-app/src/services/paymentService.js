import { http } from './http';

export async function getPaymentMethods(userId) {
    try {
        const response = await http.get(`payment-methods/user/${userId}`);
        return response.data; // Retorna { paymentMethods: [...] }
    } catch (error) {
        console.error("Error fetching payment methods:", error);
        return { paymentMethods: [] };
    }
}

export async function getDefaultPaymentMethod(userId) {
    try {
        const response = await http.get(`payment-methods/default/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching default payment method:", error);
        return null;
    }
}

export async function createPaymentMethod(paymentData) {
    try {
        const response = await http.post('payment-methods', paymentData);
        return response.data;
    } catch (error) {
        console.error("Error creating payment method:", error);
        return null;
    }
}

export async function deletePaymentMethod(paymentId) {
    try {
        const response = await http.delete(`payment-methods/${paymentId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting payment method:", error);
        return null;
    }
}