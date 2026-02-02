import { Navigate, useLocation } from "react-router-dom";
import Loading from "../components/common/Loading/Loading";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({
    children,
    redirectTo = "/login",
    allowedRoles
}) {
    const location = useLocation();
    const { user, isAuth, loading } = useAuth();

    if (loading) {
        return <Loading></Loading>
    }


    if (!isAuth) {
        return <Navigate to={redirectTo} replace state={{ from: location }} />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return (
            <div style={{ textAlign: "center", padding: "48px" }}>
                <h2>Acceso denegado</h2>
                <p>No tienes permisos para acceder a está página</p>
            </div>
        );
    };

    return children;
};