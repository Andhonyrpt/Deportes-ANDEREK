import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { checkEmail, register } from "../../services/auth";
import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage/ErrorMessage";
import Input from '../common/Input';
import "./RegisterForm.css";

export default function RegisterForm({ onSuccess }) {
    // Estados del formulario
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [verifyPassword, setVerifyPassword] = useState("");
    const [phone, setPhone] = useState("");

    // Estados para el UX
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [emailCheck, setEmailCheck] = useState({ status: "idle", message: "" })

    // Navegación
    const navigate = useNavigate();

    // Helpers de validación
    const isValidEmail = (value) => {
        const v = value.trim();

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    };

    const isValidPhoneNumber = (value) => {
        return value.match(
            /^\+?[1-9]\d{1,14}$/
        );
    };

    const validateForm = () => {
        // limpiar el error
        setError("");

        if (!displayName.trim()) {
            setError("Tu nombre es obligatorio");
            return false;
        }

        if (!isValidEmail(email)) {
            setError("Parece que el email que capturaste no es correcto");
            return false;
        }

        if (password.length < 8) {
            setError("La contraseña debe tener al menos 8 caracteres.")
            return false;
        }

        if (password !== verifyPassword) {
            setError("Tus contraseñas no coinciden.");
            return false;
        }

        if (!isValidPhoneNumber(phone)) {
            setError("El número de telefono debe contener solo números");
            return false;
        }

        if (emailCheck.status === "taken") {
            setError("Ese email ya esta registrado.");
            return false;
        }

        return true;
    };

    const setCustomMessage = (e, messages) => {
        const input = e.target;
        const { validity } = input;

        if (validity.valueMissing && messages.valueMissing) {
            input.setCustomValidity(messages.valueMissing);
            return;
        }

        if (validity.typeMismatch && messages.typeMismatch) {
            input.setCustomValidity(messages.typeMismatch);
            return;
        }

        if (validity.tooShort && messages.tooShort) {
            input.setCustomValidity(messages.tooShort);
            return;
        }

        if (validity.patternMismatch && messages.patternMismatch) {
            input.setCustomValidity(messages.patternMismatch);
            return;
        }

        input.setCustomValidity(messages.default ?? "Campo inválido")
    };

    const clearCustomMessage = (e) => {
        e.target.setCustomValidity("");
    }

    const runEmailAvailabilityCheck = async (emailValue, inputEl) => {
        console.log(emailValue, inputEl);
        console.log(emailCheck);
        const value = emailValue.trim();

        if (!isValidEmail(value)) {
            setEmailCheck({ status: "idle", message: "" });
            inputEl?.setCustomValidity("Invalid email");
            return;
        }

        setEmailCheck({ status: "checking", message: "Validando email..." })
        console.log(emailCheck);
        const taken = await checkEmail(value);

        if (taken === null) {
            setEmailCheck({ status: "idle", message: "" });
            inputEl?.setCustomValidity("");
            return;
        } else if (taken) {
            setEmailCheck({ status: "taken", message: "Ese email ya está registrado." });
            inputEl?.setCustomValidity("Ese email ya está registrado.");
            console.log(emailCheck);
        } else {
            setEmailCheck({ status: "available", message: "Email disponible" });
            inputEl?.setCustomValidity("");
            console.log(emailCheck);
        }
    }

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!e.currentTarget.checkValidity()) {
            e.currentTarget.reportValidity();
            return;
        }

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const result = await register({ displayName, email, password, phone });
            console.log(result);
            onSuccess();
            window.location.reload();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <h2>Registrar usuario</h2>

                <form className="register-form" onSubmit={onSubmit} >
                    {/* Display name */}
                    <div className="form-group">
                        <Input
                            id="displayName"
                            label="Display Name: "
                            type="text"
                            value={displayName}
                            onChange={(e) => {
                                clearCustomMessage(e);
                                setDisplayName(e.target.value);
                            }}
                            placeholder="Ingresa tu nombre completo"
                            required
                            onInvalid={(e) => setCustomMessage(e, {
                                valueMissing: "El nombre es obligatorio",
                                default: "Captura un nombre válido"
                            })
                            }
                            onInput={clearCustomMessage}
                        />
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <Input
                            id="email"
                            label="Email: "
                            type="email"
                            value={email}
                            onChange={(e) => {
                                clearCustomMessage(e);
                                setEmail(e.target.value)
                            }}
                            placeholder="Ingresa tu email"
                            required
                            onBlur={(e) => {
                                //Aqui se valida con la API
                                runEmailAvailabilityCheck(e.target.value, e.target);
                            }}
                            onFocus={() => {
                                //Solo UX: limpiamos estado y mensajes anteriores
                                setEmailCheck({ status: "idle", message: "" });
                            }}
                            onInvalid={(e) => setCustomMessage(e, {
                                valueMissing: "El email es obligatorio",
                                typeMismatch: "Ese email no parece válido. Ej: nombre@dominio.com",
                                default: "Captura un email válido"
                            })
                            }
                            onInput={clearCustomMessage}
                        />
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <Input
                            id="password"
                            label="Contraseña: "
                            type="password"
                            value={password}
                            onChange={(e) => {
                                clearCustomMessage(e);
                                setPassword(e.target.value)
                            }}
                            placeholder="Ingresa tu contraseña"
                            required
                            minLength={8}
                            onInvalid={(e) => setCustomMessage(e, {
                                valueMissing: "La contraseña es obligatoria",
                                tooShort: "La contraseña debe tener al menos 8 caracteres.",
                                default: "Captura una contraseña válida"
                            })
                            }
                            onInput={clearCustomMessage}
                        />
                    </div>

                    {/* Verify Password*/}
                    <div className="form-group">
                        <Input
                            id="verifyPassword"
                            label="Repite tu contraseña: "
                            type="password"
                            value={verifyPassword}
                            onChange={(e) => {
                                clearCustomMessage(e);
                                setVerifyPassword(e.target.value)
                            }}
                            placeholder="Ingresa nuevamente tu contraseña"
                            required
                            minLength={8}
                            onInvalid={(e) => {
                                setCustomMessage(e, {
                                    valueMissing: "Repite tu contraseña",
                                    tooShort: "La contraseña debe tener al menos 8 caracteres.",
                                    default: "Confirma tu contraseña correctamente."
                                })
                            }}
                            onInput={clearCustomMessage}
                        />
                    </div>

                    <div className="form-group">
                        <Input
                            id="phone"
                            label="Número de teléfono: "
                            type="tel"
                            value={phone}
                            onChange={(e) => {
                                clearCustomMessage(e);
                                const onlyNums = e.target.value.replace(/\D/g, '');
                                setPhone(onlyNums);
                            }}
                            placeholder="Ingresa tu número de teléfono"
                            required
                            pattern="[0-9]{10,15}"
                            onInvalid={(e) => setCustomMessage(e, {
                                valueMissing: "El teléfono es obligatorio",
                                patternMismatch: "El teléfono debe contener entre 10 y 15 dígitos numéricos",
                                default: "Número no válido"
                            })
                            }
                            onInput={clearCustomMessage}
                        />
                    </div>

                    {error && <ErrorMessage>{error}</ErrorMessage>}

                    <Button disabled={loading} type="submit" variant="primary">
                        {loading ? "Registrando..." : "Registrar"}
                    </Button>
                </form>

                <div className="register-footer">
                    <Link to="/">Volver al inicio</Link>
                </div>
            </div>
        </div>
    );
};