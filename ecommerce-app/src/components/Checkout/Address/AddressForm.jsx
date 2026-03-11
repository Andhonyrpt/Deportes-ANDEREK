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
        id: "address",
        label: "Dirección:",
        name: "address",
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
    }
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
console.log("Hice clic en el botón"); // Paso 1
        form.handleSubmit((values) => {
            console.log("¡Validación exitosa! Enviando:", values); // Paso 2
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

                <div className="address-form-group">
                    <label htmlFor="addressType">Tipo de dirección:</label>
                    <select
                        id="addressType"
                        name="addressType"
                        value={form.values.addressType || "home"}
                        onChange={form.onChange}
                        className="address-form-select"
                    >
                        <option value="home">Casa / Hogar</option>
                        <option value="work">Trabajo / Oficina</option>
                        <option value="other">Otro</option>
                    </select>
                </div>

                <div className="address-form-checkbox">
                    <input
                        type="checkbox"
                        name="isDefault"
                        checked={form.values.isDefault || false}
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