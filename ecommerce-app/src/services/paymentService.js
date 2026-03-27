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

/**
 * @param {string} paymentId
 * @param {Object} paymentData - campos a actualizar (cardHolderName, expiryDate, etc.)
 */
export async function updatePaymentMethod(paymentId, paymentData) {
    try {
        const response = await http.put(`payment-methods/${paymentId}`, paymentData);
        return response.data;
    } catch (error) {
        console.error("Error updating payment method:", error);
        return null;
    }
}

/**
 * @param {string} paymentId
 */
export async function setDefaultPaymentMethod(paymentId) {
    try {
        const response = await http.patch(`payment-methods/${paymentId}/set-default`);
        return response.data;
    } catch (error) {
        console.error("Error setting default payment method:", error);
        return null;
    }
}

/**
 * @param {string} paymentId
 */
export async function deactivatePaymentMethod(paymentId) {
    try {
        const response = await http.patch(`payment-methods/${paymentId}/deactivate`);
        return response.data;
    } catch (error) {
        console.error("Error deactivating payment method:", error);
        return null;
    }
}