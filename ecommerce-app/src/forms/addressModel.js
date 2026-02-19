export const addressInitialValues = {
    address: {
        name: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        phone: "",
        isDefault: "",
        addressType: "" // "home", "work", "other"
    }
};

export function hasErrors(errors) {
    const walk = (obj) =>
        Object.values(obj).some((v) =>
            v && typeof v === "object" ? walk(v) : Boolean(v)
        );
    return walk(errors);
};