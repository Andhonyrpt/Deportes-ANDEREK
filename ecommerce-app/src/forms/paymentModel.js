export const paymentInitialValues = {
    type: "credit_card", // "credit_card", "paypal", "bank_transfer"
    bankName: "",
    cardNumber: "",
    cardHolderName: "",
    expiryDate: "",
    cvv: "",
    paypalEmail: "",
    accountNumber: "",
    isDefault: false
};

export function hasErrors(errors) {
    const walk = (obj) =>
        Object.values(obj).some((v) =>
            v && typeof v === "object" ? walk(v) : Boolean(v)
        );
    return walk(errors);
};