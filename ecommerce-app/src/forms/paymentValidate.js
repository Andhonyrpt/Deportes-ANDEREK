export const validatePayment = (values) => {
    const errors = {};

    //     bankName: "", 
    //     cardNumber: "",
    //     cardHolderName: "",
    //     expiryDate: "",
    //     cvv: ""

    if (
        !values?.bankName?.trim() ||
        values?.bankName?.trim().length < 4
    ) errors.bankName = "Escribe un nombre de banco válido";

    if (
        !values?.cardNumber?.trim() ||
        values?.cardNumber?.trim().length !== 16
    ) errors.cardNumber = "Escribe un número de tarjeta válido";

    if (
        !values?.cardHolderName?.trim() ||
        values?.cardHolderName?.trim().length < 10
    ) errors.cardHolderName = "Escribe un nombre de titular válido";

    if (
        !values?.expiryDate?.trim() ||
        values?.expiryDate?.trim().length !== 5
    ) {
        errors.expiryDate = "La fecha de expiración parece no ser valida (MM/YY)";
    } else {
        const date = values.expiryDate.split("/"); // [12,26]
        const currentYear = new Date().getFullYear().toString().slice(-2);

        if (Number(date[0]) > 12 || Number(date[0]) < 1)
            errors.expiryDate = "El mes en la fecha de expiración no es válido";

        if (Number(date[1]) < Number(currentYear))
            errors.expiryDate = "El año en la fecha de expiración no es válido"
    }

    if (
        !values?.cvv?.trim() ||
        values?.cvv?.trim().length !== 3
    ) {
        errors.cvv = "Escribe un cvv válido";
    } else {
        if (isNaN(values.cvv)) {
            errors.cvv = "El cvv debe contener solo números válidos"
        }
    }

    return errors;

};