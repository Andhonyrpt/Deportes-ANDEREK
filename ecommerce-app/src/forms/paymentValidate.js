export const validatePayment = (values) => {
    const errors = {};

    if (!values?.type?.trim()) errors.type = "Selecciona un método de pago";

    // 2. Validaciones específicas para Tarjetas (Crédito o Débito)
    if (values.type === 'credit_card' || values.type === 'debit_card') {

        if (!values?.bankName?.trim() ||
            values?.bankName?.trim().length < 4) {
            errors.bankName = "Escribe un nombre de banco válido";
        }

        if (!values?.cardNumber?.trim() ||
            values?.cardNumber?.trim().length !== 16) {
            errors.cardNumber = "Escribe los 16 dígitos de tu tarjeta";
        }

        if (!values?.cardHolderName?.trim() ||
            values?.cardHolderName?.trim().length < 10) {
            errors.cardHolderName = "Escribe el nombre tal cual aparece en la tarjeta";
        }

        // Validación de Fecha (MM/YY)
        if (!values?.expiryDate?.trim() ||
            values?.expiryDate?.trim().length !== 5) {
            errors.expiryDate = "Usa el formato MM/YY";
        } else {
            const [month, year] = values.expiryDate.split("/");
            const currentYear = new Date().getFullYear().toString().slice(-2);
            const currentMonth = new Date().getMonth() + 1;

            if (Number(month) > 12 || Number(month) < 1) {
                errors.expiryDate = "Mes inválido (01-12)";
            }
            if (Number(year) < Number(currentYear) ||
                (Number(year) === Number(currentYear) &&
                    Number(month) < currentMonth)) {
                errors.expiryDate = "La tarjeta ha expirado";
            }
        }

        // Validación de CVV
        if (!values?.cvv?.trim() ||
            values?.cvv?.trim().length !== 3 ||
            isNaN(values.cvv)) {
            errors.cvv = "Escribe un CVV válido (3 dígitos)";
        }
    }

    // 3. Validaciones para PayPal (para agregarlo luego)
    if (values.type === 'paypal') {
        if (!values?.paypalEmail?.trim() ||
            !values.paypalEmail.includes('@')) {
            errors.paypalEmail = "Escribe un correo de PayPal válido";
        }
    }

    return errors;

};