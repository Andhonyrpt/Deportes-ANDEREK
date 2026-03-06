import { useMemo } from "react";
import Button from "../../common/Button";
import Input from "../../common/Input";
import { useFormReducer } from "../../../hooks/useFormReducer";
import { addressInitialValues } from "../../../forms/addressModel";
import { validateAddress } from "../../../forms/addressValidate";
import "./AddressForm.css";

const addressFields = [
    {
        id: "name",
        label: "Nombre completo:",
        name: "name",
        autoComplete: "name",
    },
    {
        id: "address1",
        label: "Dirección:",
        name: "address1",
        autoComplete: "street-address",
    },
    {
        id: "city",
        label: "Ciudad:",
        name: "city",
        autoComplete: "address-level2",
    },
    {
        id: "state",
        label: "Estado:",
        name: "state",
        autoComplete: "address-level1",
    },
    {
        id: "postalCode",
        label: "Código postal:",
        name: "postalCode",
        autoComplete: "postal-code",
    },
    {
        id: "country",
        label: "País:",
        name: "country",
        autoComplete: "country-name",
    },
    {
        id: "phone",
        label: "Teléfono:",
        name: "phone",
        type: "tel",
        autoComplete: "tel",
    },
    {
        id: "reference",
        label: "Referencia:",
        name: "reference"
    },
];

export default function AddressForm({
    onSubmit,
    onCancel,
    initialValues = {},
    isEdit = false,
}) {

    const mergedInitial = useMemo(() => ({
        ...addressInitialValues,
        ...initialValues
    }),
        [initialValues]);

    const form = useFormReducer({
        initialValues: mergedInitial,
        validate: validateAddress,
    });

    const onFormSubmit = (e) => {
        e.preventDefault();

        form.handleSubmit((values) => {
            onSubmit(values);
        });
    };

    return (
        <div>
            <form className="address-form" noValidate onSubmit={onFormSubmit}>

                <h3>{isEdit ? "Editar Dirección" : "Nueva Dirección"}</h3>

                {addressFields.map((field) => (
                    <Input
                        key={field.id}
                        id={field.id}
                        label={field.label}
                        name={field.name}
                        type={field.type || "text"}
                        autoComplete={field.autoComplete}
                        value={form.values[field.name] ?? ""}
                        onChange={form.onChange}
                        onBlur={form.onBlur}
                        error={form.getFieldError(field.name)}
                        showError={form.isTouched(field.name)}
                        data-testid={`address-${field.id}`}
                    />
                ))}

                <div className="address-form-checkbox">
                    <input
                        type="checkbox"
                        name="default"
                        checked={form.values.default || false}
                        onChange={form.onChange}
                        id="defaultAddress"
                    />
                    <label htmlFor="defaultAddress">
                        Establecer como dirección predeterminada
                    </label>
                </div>

                {form.submitError && <p className="address-submitError">{form.submitError}</p>}


                <div className="address-form-actions">
                    <Button type="submit" disabled={form.isSubmitting} data-testid="address-submit">
                        {form.isSubmitting ? "Guardando..." : isEdit ? "Guardar Cambios" : "Agregar Dirección"}
                    </Button>

                    {onCancel && (
                        <Button type="button" variant="danger" onClick={onCancel}>
                            Cancelar
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
};