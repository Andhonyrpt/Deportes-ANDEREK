import shippingAddress from '../data/shipping-address.json';
// ya no funcionará
export function getShippingAddresses() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(shippingAddress || []);
        }, 600);
    });
};

export async function getDefaultShippingAddress() {
    const addresses = await getShippingAddresses();

    return addresses.find((a) => a.isDefault || a.default || addresses[0] || null);
};