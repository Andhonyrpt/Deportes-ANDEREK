export const paymentInitialValues = {
    bankName: "", 
    cardNumber: "",
    cardHolderName: "",
    expiryDate: "",
    cvv: ""
};

export function hasErrors(errors) {
    const walk = (obj) =>
        Object.values(obj).some((v) =>
            v && typeof v === "object" ? walk(v) : Boolean(v)
        );
    return walk(errors);
};