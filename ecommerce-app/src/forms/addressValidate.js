export const validateAddress = (values) => {
    const errors = {
        name: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        phone: "",
        isDefault: "",
        addressType: "" // "home", "work", "other"
    };

    if (
        !values.name.trim() ||
        values.name.trim().length < 4
    ) errors.name = "Escribe un nombre para la dirección";
    if (!values.address.trim()) errors.address = "La dirección parece no ser valida";
    if (!values.city.trim()) errors.city = "Escribe un nombre para la ciudad";
    if (!values.state.trim()) errors.state = "Escribe un estado válido";
    if (
        !values.postalCode.trim() ||
        values.postalCode.trim().length < 4 ||
        values.postalCode.trim().length > 6
    ) errors.postalCode = "Escribe un código postal válido";
    if (!values.country.trim()) errors.country = "Escribe un nombre para la dirección";
    if (
        !values.phone.trim() ||
        values.phone.trim() !== 10
    ) errors.phone = "Escribe un número de teléfono válido";
    if (
        !values.addressType.trim() ||
        values.addressType.trim() !== "home" ||
        values.addressType.trim() !== "work" ||
        values.addressType.trim() !== "other"
    ) errors.addressType = "Escribe un nombre para la dirección";

    return errors;

};