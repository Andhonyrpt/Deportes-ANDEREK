import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated, getCurrentUser } from "../utils/auth";

export default function ProtectedRoute({
    children,
    redirectTo = "/login",
    allowedRoles
}) {

    const location = useLocation();

    if (!isAuthenticated()) {
        return <Navigate to={redirectTo} replace state={{ from: location }} />
    }

    if (allowedRoles) {
        const user = getCurrentUser();

        if (!allowedRoles.includes(user.role)) {
            return (
                <div style={{ textAlign: "center", padding: "48px" }}>
                    <h2>Acceso denegado</h2>
                    <p>No tienes permisos para acceder a está página</p>
                </div>
            );
        };
    };

    return children;
};