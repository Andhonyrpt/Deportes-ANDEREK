import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../../services/auth";
import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage/ErrorMessage";
import Input from '../common/Input';
// import { getProfile } from "../../services/userService";
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

    // Navegación
    const navigate = useNavigate();

    // Helpers de validación

    const isValidEmail = (value) => {
        return value.match(
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
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

        if (password !== verifyPassword) {
            setError("Parece que tus contraseñas no coinciden o están vacías");
            return false;
        }

        if (!isValidPhoneNumber(phone)) {
            setError("El número de telefono debe contener solo números");
            return false;
        }
        return true;
    };

    const setCustomMessage = (e, messages) => {
        const input = e.target;
        const { validity } = input;

        if (validity.valueMissing && messages.valueMissing) {
            input.setCustomValidity(messages.valueMissing);
        }

        if (validity.typeMismatch && messages.typeMismatch) {
            input.setCustomValidity(messages.typeMismatch);
        }

        if (validity.patternMismatch && messages.patternMismatch) {
            input.setCustomValidity(messages.patternMismatch);
        }

        input.setCustomValidity(messages.default ?? "Campo inválido")
    };

    const clearCustomMessage = (e) => {
        e.target.setCustomValidity("");
    }

    const onSubmit = async (e) => {
        console.log(e)
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
            await register({ displayName, email, password });
            // onSuccess();
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
                            onInvalid={(e) => setCustomMessage(e, {
                                valueMissing: "El email es obligatorio",
                                typeMismatch: "Ese email no parece válido. Ej: nombre@dominio.com",
                                default: "Captura un email válido"
                            })
                            }
                            onInput={clearCustomMessage}
                        />
                    </div>

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
                            onInvalid={(e) => setCustomMessage(e, {
                                valueMissing: "La contraseña es obligatoria",
                                default: "Ingresa una contraseña"
                            })}
                            onInput={clearCustomMessage}
                        />
                    </div>

                    <div className="form-group">
                        <Input
                            id="password"
                            label="Repite contraseña: "
                            type="password"
                            value={verifyPassword}
                            onChange={(e) => {
                                clearCustomMessage(e);
                                setVerifyPassword(e.target.value)
                            }}
                            placeholder="Ingresa nuevamente tu contraseña"
                            required
                            onInvalid={(e) => setCustomMessage(e, {
                                valueMissing: "Repite tu contraseña",
                                default: "Ingresa nuevamente tu contraseña"
                            })}
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
                        {loading ? "Creando cuenta..." : "Crear cuenta"}
                    </Button>
                </form>

                <div className="register-footer">
                    <Link to="/">Volver al inicio</Link>
                </div>
            </div>
        </div>
    );
};