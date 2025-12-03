import paymentMethods from '../data/paymentMethods.json';

export function getPaymentMethod() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(paymentMethods || []);
        }, 600);
    });
};

export async function getDefaultPaymentMethods() {
    const methods = await getPaymentMethod();

    return methods.find((m) => m.isDefault || m.default || methods[0] || null);
};