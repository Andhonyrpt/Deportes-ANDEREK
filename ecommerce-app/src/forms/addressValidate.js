export const validateAddress = (values) => {
    const errors = {};

    // name: "",
    // address: "",
    // city: "",
    // state: "",
    // postalCode: "",
    // country: "",
    // phone: "",
    // isDefault: "",
    // addressType: "" // "home", "work", "other"

    if (
        !values.name?.trim() ||
        values.name?.trim().length < 4
    ) errors.name = "Escribe un nombre de al menos 4 caracteres";

    if (!values.address1?.trim()) errors.address1 = "La dirección es obligatoria";

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
        values.phone?.trim() !== 10
    ) errors.phone = "Escribe un número de teléfono válido de 10 dígitos";
    
    // if (
    //     !values.addressType.trim() ||
    //     values.addressType.trim() !== "home" ||
    //     values.addressType.trim() !== "work" ||
    //     values.addressType.trim() !== "other"
    // ) errors.addressType = "Escribe un nombre para la dirección";

    return errors;

};