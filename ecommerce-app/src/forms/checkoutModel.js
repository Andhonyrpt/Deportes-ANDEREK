export const checkoutInitialValues = {
    contact: {
        fullname: "",
        email: "",
        phone: "",
    },
    shipping: {
        address1: "",
        address2: "",
        city: "",
        state: "",
        zip: "",
    },
    payment: {
        method: "", // "card"||"cash"||"transfer"
    },
    notes: ""
};

export function hasErrors(errors) {
    const walk = (obj) =>
        Object.values(obj).some((v) =>
            v && typeof v === "object" ? walk(v) : Boolean(v)
        );

    return walk(errors);
}