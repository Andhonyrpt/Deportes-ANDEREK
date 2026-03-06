export const addressInitialValues = {
    name: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
    reference: "",
    default: false,
};

export function hasErrors(errors) {
    const walk = (obj) =>
        Object.values(obj).some((v) =>
            v && typeof v === "object" ? walk(v) : Boolean(v)
        );
    return walk(errors);
};