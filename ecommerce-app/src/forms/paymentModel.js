export const paymentInitialValues = {
    type: "", // 'credit_card', 'debit_card', 'paypal', 'bank_transfer'
    cardNumber: "",
    cardHolderName: "",
    expiryDate: "",
    paypalEmail: "",
    bankName: "", // Para transferencia bancaria
    accountNumber: "",
    isDefault: "",
    isActive: ""
};

export function hasErrors(errors) {
    const walk = (obj) =>
        Object.values(obj).some((v) =>
            v && typeof v === "object" ? walk(v) : Boolean(v)
        );
    return walk(errors);
};