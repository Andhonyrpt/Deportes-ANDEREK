export const validateAddress = (values) => {
    const errors = {};

    if (
        !values.name?.trim() ||
        values.name?.trim().length < 4
    ) errors.name = "Escribe un nombre de al menos 4 caracteres";

    if (!values.address?.trim()) errors.address = "La dirección es obligatoria";

    if (!values.city?.trim()) errors.city = "La ciudad es obligatoria";

    if (!values.state?.trim()) errors.state = "El estado es obligatorio";

    if (
        !values.postalCode?.trim() ||
        values.postalCode?.trim().length < 4 ||
        values.postalCode?.trim().length > 6
    ) errors.postalCode = "Escribe un código postal válido (4-6 dígitos)";

    if (!values.country?.trim()) errors.country = "El país es obligatorio";

    if (
        !values.phone?.trim() ||
        values.phone?.trim().length !== 10
    ) errors.phone = "Escribe un número de teléfono válido de 10 dígitos";

    if (!values.addressType?.trim() || 
    !['home', 'work', 'other'].includes(values.addressType)) {
        errors.addressType = "Selecciona un tipo de dirección válido";
    }

    return errors;

};