/**
 * Criterios de negocio centralizados para el cálculo de pedidos.
 * Este helper asegura que tanto la previsualización como la creación real
 * de órdenes utilicen las mismas reglas.
 */

export const TAX_RATE = 0.16; // IVA 16%
export const SHIPPING_RATE = 350; // Costo fijo de envío 
export const FREE_SHIPPING_THRESHOLD = 1000;

/**
 * Calcula el desglose financiero de un pedido.
 * 
 * @param {Array} products - Lista de productos normalizados con {price, quantity}
 * @returns {Object} { subtotal, tax, shippingCost, total }
 */
export function calculateOrderFinancials(products) {
    const subtotal = products.reduce(
        (acc, item) => acc + (item.price * item.quantity),
        0
    );

    const tax = Number((subtotal * TAX_RATE).toFixed(2));
    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_RATE;
    const total = Number((subtotal + tax + shippingCost).toFixed(2));

    return {
        subtotal,
        tax,
        shippingCost,
        total
    };
}
