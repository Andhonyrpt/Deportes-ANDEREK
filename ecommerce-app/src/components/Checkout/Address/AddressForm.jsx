import Button from "../../common/Button";
import Input from "../../common/Input";
import { useFormReducer } from "../../../hooks/useFormReducer";
import { addressInitialValues, hasErrors } from "../../../forms/addressModel";
import { validateAddress } from "../../../forms/addressValidate";
import "./AddressForm.css";

export default function AddressForm({ onSubmitAddress }) {
    const form = useFormReducer({
        initialValues: addressInitialValues,
        validate: validateAddress,
    });

    const addressFields = [
        {
            id: "name",
            label: "Nombre completo:",
            name: "name",
            type: "text",
            autoComplete: "name",
        },
        {
            id: "address",
            label: "Dirección:",
            name: "address",
            type: "text",
            autoComplete: "address1",
        },
        {
            id: "city",
            label: "Ciudad:",
            name: "city",
            type: "text",
            autoComplete: "city",
        },
        {
            id: "state",
            label: "Estado:",
            name: "state",
            type: "text",
            autoComplete: "state",
        },
        {
            id: "postalCode",
            label: "Código postal:",
            name: "postalCode",
            type: "text",
            autoComplete: "zipCode",
        },
        {
            id: "country",
            label: "País:",
            name: "country",
            type: "text",
            autoComplete: "country",
        },
        {
            id: "phone",
            label: "Teléfono:",
            name: "phone",
            type: "text",
            autoComplete: "tel",
        },
    ];

    const handleSubmit = () => { };

    return (
        <div>
            <form noValidate onSubmit={handleSubmit}>
                <h2>Dirección</h2>
                {addressFields.map((field) => (
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

                {form.submitError ? (
                    <p className="submitError">{form.submitError}</p>
                ) : null}

                <button
                    className="submitBtn"
                    type="submit"
                    disabled={form.isSubmitting}
                >
                    {form.isSubmitting ? "Procesando..." : "Guardar dirección"}
                </button>
            </form>
        </div>
    );

    function getValue(obj, path) {
        return path.split(".").reduce((acc, k) => (acc ? acc[k] : ""), obj) ?? "";
    }
}

//     const [formData, setFormData] = useState(
//         {
//             name: "",
//             address1: "",
//             address2: "",
//             postalCode: "",
//             city: "",
//             country: "",
//             reference: "",
//             default: false,
//             ...initialValues
//         }
//     );

//     // Actualizar formulario cuando initialValues cambia (modo edición)
//     useEffect(() => {
//         if (initialValues && Object.keys(initialValues).length > 0) {
//             setFormData({
//                 name: "",
//                 address1: "",
//                 address2: "",
//                 postalCode: "",
//                 city: "",
//                 country: "",
//                 reference: "",
//                 default: false,
//                 ...initialValues,
//             });
//         }
//     }, [initialValues]);

//     const handleSubmit = (e) => {
//         e.preventDefault(); //Prevenir muchos clicks
//         onSubmit(formData);

//         // Resetear formulario solo si es nuevo (no edición)
//         if (!isEdit) {
//             setFormData({
//                 name: "",
//                 address1: "",
//                 address2: "",
//                 postalCode: "",
//                 city: "",
//                 country: "",
//                 reference: "",
//                 default: false,
//             });
//         };
//     };

//     const handleChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setFormData((prev) => ({
//             ...prev,
//             [name]: type === "checkbox" ? checked : value,
//         }));
//     };

//     return (
//         <form className="address-form" onSubmit={handleSubmit}>
//             <h3>{isEdit ? "Editar dirección" : "Nueva dirección"}</h3>
//             <Input
//                 label="Nombre de la dirección"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 required
//             />
//             <Input
//                 label="Dirección Línea 1"
//                 name="address1"
//                 value={formData.address1}
//                 onChange={handleChange}
//                 required
//             />
//             <Input
//                 label="Dirección Línea 2"
//                 name="address2"
//                 value={formData.address2}
//                 onChange={handleChange}
//             />
//             <Input
//                 label="Código Postal"
//                 name="postalCode"
//                 value={formData.postalCode}
//                 onChange={handleChange}
//                 placeholder="20400"
//                 required
//             />
//             <Input
//                 label="Ciudad:"
//                 name="city"
//                 value={formData.city}
//                 onChange={handleChange}
//                 placeholder="Ej.Aguascalientes"
//                 required
//             />
//             <Input
//                 label="País"
//                 name="country"
//                 value={formData.country}
//                 onChange={handleChange}
//                 placeholder="Ej.Mexico"
//                 required
//             />
//             <Input
//                 label="Referencia"
//                 name="reference"
//                 value={formData.reference}
//                 onChange={handleChange}
//             />

//             <div className="form-checkbox">
//                 <input type="checkbox"
//                     name="default"
//                     checked={formData.default}
//                     onChange={handleChange}
//                     id="defaultAddress"
//                 />
//                 <label htmlFor="defaultAddress">
//                     Establecer como dirección predeterminada:
//                 </label>
//             </div>

//             <div className="form-actions">
//                 <Button type="submit">
//                     {isEdit ? "Guardar Cambios" : "Agregar Dirección"}
//                 </Button>
//                 {onCancel && (
//                     <Button type="button" variant="secondary"
//                     className="button-delete"
//                     onClick={onCancel}>
//                         Cancelar
//                     </Button>
//                 )}
//             </div>
//         </form>
//     );
// };