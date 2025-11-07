import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Button from "../components/common/Button";
import { login } from "../utils/auth";
import './Login.css';

export default function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        await new Promise(resolve => setTimeout(resolve, 800));
        const result = login(email, password);

        if (result.success) {
            navigate("/")
            window.location.reload();
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Iniciar Sesión</h2>
                <div className="demo-users">
                    <h4>Usuarios de prueba</h4>
                    <div className="user-demo">
                        <strong>Cliente:</strong> cliente@gmail.com / cliente123
                    </div>
                    <div className="user-demo">
                        <strong>Admin:</strong> admin@gmail.com / admin123
                    </div>
                </div>
                <form className="login-form" onSubmit={onSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            id="email" type="email" value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Ingresa tu email" required
                        ></input>
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Contraseña:</label>
                        <input
                            id="password" type="password" value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Ingresa tu contraseña" required
                        ></input>
                    </div>

                    {error &&
                        <div className="error-message">{error}</div>
                    }

                    <Button disabled={loading} type="submit" variant="primary">
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