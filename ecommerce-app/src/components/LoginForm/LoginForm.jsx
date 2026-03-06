import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage/ErrorMessage";
import Input from '../common/Input';
// import { getUserProfile } from "../../services/userService";
import "./LoginForm.css";

export default function LoginForm({ onSuccess }) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const { login, loading } = useAuth();

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const result = await login(email, password);

        if (result.success) {
            if (onSuccess) onSuccess();
            navigate("/");
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Iniciar Sesión</h2>

                <form className="login-form" onSubmit={onSubmit} data-testid="login-form">
                    <div className="form-group">
                        <Input
                            id="email"
                            data-testid="input-email"
                            label="Email: "
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Ingresa tu email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <Input
                            id="password"
                            data-testid="input-password"
                            label="Contraseña: "
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Ingresa tu contraseña"
                            required
                        />
                    </div>

                    {error && <ErrorMessage data-testid="error-message">{error}</ErrorMessage>}

                    <Button disabled={loading} type="submit" variant="primary" data-testid="login-submit">
                        {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                    </Button>
                </form>

                <div className="login-footer">
                    <Link to="/">Volver al inicio</Link>
                </div>
            </div>
        </div>
    );
};