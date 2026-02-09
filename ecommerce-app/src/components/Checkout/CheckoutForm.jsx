import FormField from "../common/FormField/FormField";
import { useFormReducer } from "../../hooks/useFormReducer";
import { checkoutInitialValues, hasErrors } from "../../forms/checkoutModel";
import { validateCheckout } from "../../forms/checkoutValidate";
// import 'CheckoutForm.css';

export default function CheckoutForm({ onSubmitOrder }) {

    const form = useFormReducer({
        initialValues: checkoutInitialValues,
        validate: validateCheckout
    });

    const fields = [
        {
            id: "fullName",
            label: "Nombre completo",
            name: "contact.fullName",
            autoComplete: "name"
        },
        {
            id: "email",
            label: "Correo",
            name: "contact.email",
            type: "email",
            autoComplete: "email"
        },
        {
            id: "phone",
            label: "Teléfono",
            name: "contact.phone",
            autoComplete: "tel"
        },

        {
            id: "address1",
            label: "Dirección",
            name: "shipping.address1",
            autoComplete: "street-address"
        },
        {
            id: "address2",
            label: "Dirección 2 (opcional)",
            name: "shipping.address2"
        },
        {
            id: "city",
            label: "Ciudad",
            name: "shipping.city",
            autoComplete: "address-level2"
        },
        {
            id: "state",
            label: "Estado",
            name: "shipping.state",
            autoComplete: "address-level1"
        },
        {
            id: "zip",
            label: "Código postal",
            name: "shipping.zip",
            autoComplete: "postal-code"
        }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = form.runValidation();

        if (hasErrors(errors)) {
            form.markAllTouched();
            return
        }

        try {
            form.setSubmitting(true);
            await onSubmitOrder(form.values);
            form.reset();
        } catch (err) {
            form.setSubmittingError("No se pudo completar la compra. Intenta de nuevo")
        } finally {
            form.setSubmitting(false);
        }
    };

    return (
        <form className="checkoutForm" onSubmit={handleSubmit} noValidate>
            <h2>Datos del contacto</h2>
            {fields.slice(0, 3).map((f) => (
                <FormField
                    key={f.id}{...f}
                    value={getValue(form.values, f.name)}
                    onChange={form.onChange}
                    onBlur={form.onBlur}
                    error={form.getFieldError(f.name)}
                    showError={form.isTouched(f.name)} />
            ))}

            <h2>Envío</h2>
            {fields.slice(3).map((f) => (
                <FormField
                    key={f.id}{...f}
                    value={getValue(form.values, f.name)}
                    onChange={form.onChange}
                    onBlur={form.onBlur}
                    error={form.getFieldError(f.name)}
                    showError={form.isTouched(f.name)} />
            ))}

            {form.submitError ? <p className="submitError">{form.submitError}</p> : null}

            <button className="submitBtn" type="submit" disabled={form.isSubmitting}>
                {form.isSubmitting ? "Procesando..." : "Confirmar compra"}
            </button>

        </form>
    );

    function getValue(obj, path) {
        return path.split(".").reduce((acc, k) => (acc ? acc[k] : ""), obj) ?? "";
    };
}