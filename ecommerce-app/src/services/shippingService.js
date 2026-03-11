import { http } from './http';

export async function getShippingAddresses() {
    try {
        const response = await http.get('shipping-addresses/user-addresses');
        return response.data; // Retorna { addresses: [...] }
    } catch (error) {
        console.error("Error fetching shipping addresses:", error);
        return { addresses: [] };
    }
}

export async function getDefaultShippingAddress() {
    try {
        const response = await http.get('shipping-addresses/default');
        return response.data;
    } catch (error) {
        console.error("Error fetching default shipping address:", error);
        return null;
    }
}

export async function createShippingAddress(addressData) {
    try {
        const response = await http.post('shipping-addresses/new-address', addressData);
        return response.data;
    } catch (error) {
        console.error("Error creating shipping address:", error);
        return null;
    }
}

export async function deleteShippingAddress(addressId) {
    try {
        const response = await http.delete(`shipping-addresses/delete-address/${addressId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting shipping address:", error);
        return null;
    }
}