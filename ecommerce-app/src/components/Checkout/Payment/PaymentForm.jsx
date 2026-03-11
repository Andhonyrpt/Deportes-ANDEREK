import { useMemo } from "react";
import Button from "../../common/Button";
import Input from "../../common/Input";
import { useFormReducer } from "../../../hooks/useFormReducer";
import { paymentInitialValues } from "../../../forms/paymentModel";
import { validatePayment } from "../../../forms/paymentValidate";
import './PaymentForm.css';

const paymentFields = [
    // Campos para Tarjetas
    {
        id: "bankName",
        label: "Alias de la tarjeta:",
        name: "bankName",
        placeHolder: "Escribe el nombre del banco / alias de la tarjeta",
        autoComplete: "",
        belongsTo: ["credit_card", "debit_card"]
    },
    {
        id: "cardNumber",
        label: "Número de la tarjeta:",
        name: "cardNumber",
        placeHolder: "5444-0000-0000-0000",
        autoComplete: "cc-number",
        belongsTo: ["credit_card", "debit_card"]
    },
    {
        id: "cardHolderName",
        label: "Nombre del titular de la tarjeta:",
        name: "cardHolderName",
        placeHolder: "Andhony Rodolfo Palacios Tellez",
        autoComplete: "cc-name",
        belongsTo: ["credit_card", "debit_card"]
    },
    {
        id: "expiryDate",
        label: "Fecha de expiración:",
        name: "expiryDate",
        placeHolder: "12/31",
        autoComplete: "cc-exp",
        belongsTo: ["credit_card", "debit_card"]
    },
    {
        id: "cvv",
        label: "CVV:",
        name: "cvv",
        type: "password",
        maxLength: 4,
        autoComplete: "cc-csc",
        belongsTo: ["credit_card", "debit_card"]
    },

    // Campo para PayPal
    {
        id: "paypalEmail",
        label: "Correo de PayPal:",
        name: "paypalEmail",
        belongsTo: ["paypal"]
    },

    // Campos para Transferencia
    {
        id: "accountNumber",
        label: "Número de Cuenta:",
        name: "accountNumber",
        belongsTo: ["bank_transfer"]
    }
];

export default function PaymentForm({
    onSubmit,
    onCancel,
    initialValues = {},
    isEdit = false,
}) {

    const mergedInitial = useMemo(() => ({
        ...paymentInitialValues,
        ...initialValues
    }), [initialValues])

    const form = useFormReducer({
        initialValues: mergedInitial,
        validate: validatePayment
    });

    const onFormSubmit = (e) => {
        e.preventDefault();

        form.handleSubmit((values) => {
            onSubmit(values);
        });
    };

    return (
        <div>
            <form className="payment-form" noValidate onSubmit={onFormSubmit}>
                <h3>{isEdit ? "Editar Método de Pago" : "Nuevo Método de Pago"}</h3>

                <div className="payment-form-group">
                    <label htmlFor="type">Método de Pago:</label>
                    <select
                        id="type"
                        name="type"
                        value={form.values.type || "credit_card"}
                        onChange={form.onChange}
                        className="payment-form-select"
                    >
                        <option value="credit_card">Tarjeta de Crédito</option>
                        <option value="debit_card">Tarjeta de Débito</option>
                        <option value="paypal">PayPal</option>
                        <option value="bank_transfer">Transferencia Bancaria</option>
                    </select>
                </div>

                {paymentFields.filter((field) => field.belongsTo.includes(form.values.type))
                .map((field) => (
                    <Input
                        key={field.id}
                        id={field.id}
                        label={field.label}
                        name={field.name}
                        type={field.type || "text"}
                        placeholder={field.placeHolder}
                        autoComplete={field.autoComplete}
                        maxLength={field.maxLength}
                        value={form.values[field.name] ?? ""}
                        onChange={form.onChange}
                        onBlur={form.onBlur}
                        error={form.getFieldError(field.name)}
                        showError={form.isTouched(field.name)}
                        data-testid={`payment-${field.id}`}
                    />
                ))}

                <div className="payment-form-checkbox">
                    <input
                        type="checkbox"
                        name="isDefault"
                        checked={form.values.isDefault || false}
                        onChange={form.onChange}
                        id="defaultPayment"
                    />

                    <label htmlFor="defaultPayment">
                        Establecer como método de pago predeterminado
                    </label>
                </div>

                {form.submitError && (<p className="payment-submitError">{form.submitError}</p>)}

                <div className="payment-form-actions" >
                    <Button type="submit" disabled={form.isSubmitting} data-testid="payment-submit">
                        {form.isSubmitting ? "Guardando..." : isEdit ? "Guardar Cambios" : "Agregar Método de Pago"}
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