export const validatePayment = (values) => {
    const errors = {
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
    const validTypes = ['credit_card', 'debit_card', 'paypal', 'bank_transfer'];

    if (
        !values.type?.trim() ||
        !validTypes.includes(values.type.trim())
    ) errors.type = "Selecciona un método de pago.";

    if (values.type?.trim() === "credit_card" || values.type?.trim() === "debit_card") {
        if (!values.cardNumber.trim()) errors.cardNumber = "Escribe tu número de tarjeta";
        if (
            !values.cardHolderName.trim() ||
            values.cardHolderName.trim().length < 3
        ) errors.cardHolderName = "Escribe el nombre del titular";
        if (!values.expiryDate.trim()) errors.expiryDate = "La fecha de vencimiento parece no ser valida (MM/YY)";
    };

    if (values.type1?.trim() === "paypal") {
        if (
            !values.paypalEmail.trim() ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.paypalEmail)
        ) errors.paypalEmail = "Escibe tu correo de paypal";
    };


    if (values.type?.trim() === "bank_transfer") {
        if (!values.bankName.trim()) errors.bankName = "Escribe el nombre del banco";
        if (
            !values.accountNumber.trim() ||
            values.accountNumber.trim().length < 6
        ) errors.accountNumber = "Escribe tu número de cuenta";
    };

    return errors;

};