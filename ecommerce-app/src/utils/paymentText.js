/**
 * Formatea el método de pago en texto legible para el usuario.
 * @param {Object|null} paymentMethod - Objeto de método de pago del backend
 * @returns {string}
 */
export function formatPaymentMethod(paymentMethod) {
    if (!paymentMethod) return "No seleccionado";

    const lastFour = paymentMethod.cardNumber?.slice(-4);
    const type = paymentMethod.type;

    if (type === 'credit_card') return `Tarjeta de Crédito **** ${lastFour}`;
    if (type === 'debit_card') return `Tarjeta de Débito **** ${lastFour}`;
    if (type === 'paypal') return `PayPal (${paymentMethod.paypalEmail})`;
    if (type === 'bank_transfer') return `Transferencia Bancaria (${paymentMethod.bankName})`;

    return type;
}
