export function validateCheckout(values) {

    const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

    const errors = {
        contact: {},
        shipping: {},
        payment: {}
    };

    // Contact
    if (!values.contact.fullName.trim()) {
        errors.contact.fullName = "Escribe tu nombre";
    }

    if (!values.contact.email.trim()) {
        errors.contact.email = "Escribe tu correo";
    } else if (!isEmail(values.contact.email)) {
        errors.contact.email = "Correo inválido";
    }

    if (!values.contact.phone.trim()) {
        errors.contact.phone = "Escribe tu teléfono";
    }

    // Shipping
    if (!values.shipping.address1.trim()) {
        errors.shipping.address1 = "Escribe tu dirección";
    }

    if (!values.shipping.city.trim()) {
        errors.shipping.city = "Escribe tu ciudad";
    }

    if (!values.shipping.state.trim()) {
        errors.shipping.state = "Escribe tu estado";
    }

    if (!values.shipping.zip.trim()) {
        errors.shipping.zip = "Escribe tu código postal";
    }

    // Payment
    if (!values.payment.method) {
        errors.payment.method = "Elige un método de pago";
    }

    return errors;
};