import Button from "../../common/Button";
import Input from "../../common/Input";
import { useFormReducer } from "../../../hooks/useFormReducer";
import { paymentInitialValues, hasErrors } from "../../../forms/paymentModel";
import { validatePayment } from "../../../forms/paymentValidate";
import './PaymentForm.css';


export default function PaymentForm({ onSubmitPayment }) {
    const form = useFormReducer({
        initialValues: paymentInitialValues,
        validate: validatePayment
    });

    const paymentFields = [
        {
            id: "type",
            label: "Método de pago",
            name: "type",
            type: "select",
            options: ['credit_card', 'debit_card', 'paypal', 'bank_transfer']
        },
        {
            id: "cardNumber",
            label: "Número de tarjeta:",
            name: "cardNumber",
            type: "text",
            autoComplete: "cc-number"
        },
        {
            id: "cardHolderName",
            label: "Nombre del titular:",
            name: "cardHolderName",
            type: "text",
            autoComplete: "cc-name"
        },
        {
            id: "expiryDate",
            label: "Fecha de vencimiento:",
            name: "expiryDate",
            type: "text",
            autoComplete: "cc-exp"
        },
        {
            id: "paypalEmail",
            label: "Dirección de correo de paypal",
            name: "paypalEmail",
            type: "email",
            autoComplete: "email"
        },
        {
            id: "bankName",
            label: "Nombre del banco:",
            name: "bankName",
            type: "text",
            autoComplete: "off"
        },
        {
            id: "accountNumber",
            label: "Número de la cuenta:",
            name: "accountNumber",
            type: "text",
            autoComplete: "off"
        }
    ];

    const handleSubmit = () => { };

    return (
        <div>
            <form noValidate onSubmit={handleSubmit}>
                <h2>Método de pago</h2>
                {paymentFields.map((field) => (
                    <Input
                        key={field.id}
                        {...field}
                        value={getValue(form.values, field.name)}
                        onChange={form.onChange}
                        onBlur={form.onBlur}
                        error={form.getFieldError(field)}
                        showError={form.isTouched(field)}
                    />
                ))}

                {form.submitError ? (<p className="submitError">{form.submitError}</p>) : null}

                <button className="submitBtn" type="submit" disabled={form.isSubmitting}>
                    {form.isSubmitting ? "Procesando..." : "Guardar método de pago"}
                </button>
            </form>
        </div>
    );

    function getValue(obj, path) {
        return path.split(".").reduce((acc, k) => (acc ? acc[k] : ""), obj) ?? "";
    };
};

// Filter para solo mostrar los campos requeridos segun el metodo de pago seleccionado

// Filtramos los campos dinámicamente
// const fieldsToShow = paymentFields.filter(field => {
//     // 1. El selector de tipo siempre se muestra
//     if (field.id === "type") return true;

//     // 2. Si es tarjeta, mostramos campos de tarjeta
//     if (form.values.type === 'credit_card' || form.values.type === 'debit_card') {
//         return ["cardNumber", "cardHolderName", "expiryDate"].includes(field.id);
//     }

//     // 3. Si es PayPal, solo mostramos el email
//     if (form.values.type === 'paypal') {
//         return field.id === "paypalEmail";
//     }

//     // 4. Si es transferencia, nombre del banco y cuenta
//     if (form.values.type === 'bank_transfer') {
//         return ["bankName", "accountNumber"].includes(field.id);
//     }

//     // Por defecto (si no hay nada seleccionado), ocultamos el resto
//     return false;
// });



// ###############################################################################





// import { useState, useEffect } from "react";


// export default function PaymentForm({
//     onSubmit,
//     onCancel,
//     initialValues = {},
//     isEdit = false
// }) {
//     const [formData, setFormData] = useState({
//         alias: "",
//         cardNumber: "",
//         placeHolder: "",
//         expireDate: "",
//         cvv: "",
//         isDefault: false,
//         ...initialValues
//     });

//     // Actualizar formulario cuando initialValues cambia (modo edición)
//     useEffect(() => {
//         if (initialValues && Object.keys(initialValues).length > 0) {
//             setFormData({
//                 alias: "",
//                 cardNumber: "",
//                 placeHolder: "",
//                 expiryDate: "",
//                 cvv: "",
//                 isDefault: false,
//                 ...initialValues,
//             });
//         }
//     }, [initialValues]);

//     const handleChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setFormData((prev) => ({
//             ...prev,
//             [name]: type === "checkbox" ? checked : value,
//         }));
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         onSubmit(formData);

//         // Resetear formulario solo si es nuevo (no edición)
//         if (!isEdit) {
//             setFormData({
//                 alias: "",
//                 cardNumber: "",
//                 placeHolder: "",
//                 expiryDate: "",
//                 cvv: "",
//                 isDefault: false,
//             });
//         }
//     };

//     return (
//         <form className="payment-form">
//             <h3>{isEdit ? "Editar Método de Pago" : "Nuevo Método de Pago"}</h3>

//             <Input
//                 label="Alias de la tarjeta"
//                 name="alias"
//                 value={formData.alias}
//                 onChange={handleChange}
//                 placeholder="Ej. Bancomer"
//                 required
//             />
//             <Input
//                 label="Número de tarjeta"
//                 name="cardNumber"
//                 value={formData.cardNumber}
//                 onChange={handleChange}
//                 pattern="[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}"
//                 placeholder="1234-5678-9012-3456"
//                 required
//             />
//             <Input
//                 label="Nombre del titular"
//                 name="placeHolder"
//                 value={formData.placeHolder}
//                 onChange={handleChange}
//                 placeholder="Ej. Andhony Palacios"
//                 required
//             />
//             <div className="form-row">
//                 <Input
//                     label="Fecha de expiración"
//                     name="expireDate"
//                     value={formData.expireDate}
//                     onChange={handleChange}
//                     placeholder="MM/YY"
//                     pattern="[0-9]{2}/[0-9]{2}"
//                     required
//                 />

//                 <Input
//                     label="CVV"
//                     name="cvv"
//                     value={formData.cvv}
//                     onChange={handleChange}
//                     type="password"
//                     maxLength="4"
//                     pattern="[0-9]{3,4}"
//                     placeholder="123"
//                     required
//                 />
//             </div>

//             <div className="form-checkbox">
//                 <input type="checkbox"
//                     name="isDefault"
//                     checked={formData.isDefault}
//                     onChange={handleChange}
//                     id="IsDefaultPayment"
//                 />
//                 <label htmlFor="isDefaultPayment">
//                     Establecer como método de pago predeterminado:
//                 </label>
//             </div>

//             <div className="form-actions">
//                 <Button type="submit">
//                     {isEdit ? "Guardar Cambios" : "Agregar Nuevo Método de Pago"}
//                 </Button>
//                 {onCancel && (
//                     <Button
//                     className="button-delete"
//                         type="button"
//                         variant="secondary"
//                         onClick={onCancel}
//                     >
//                         Cancelar
//                     </Button>
//                 )}
//             </div>
//         </form>
//     );
// }

