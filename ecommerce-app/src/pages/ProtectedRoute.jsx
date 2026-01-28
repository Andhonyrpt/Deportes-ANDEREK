import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getUserProfile, isAuthenticated } from "../services/userService";
import Loading from "../components/common/Loading/Loading";

export default function ProtectedRoute({
    children,
    redirectTo = "/login",
    allowedRoles
}) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const userData = await getUserProfile();
                setUser(userData);
            } catch (error) {
                console.error("Error al obtener el perfil", error);
            } finally {
                setLoading(false);
            }
        }

        if (isAuthenticated()) {
            fetchUserData();
        } else {
            setLoading(false);
        }

    }, [allowedRoles])

    if (loading) {
        return <Loading>Hola</Loading>
    }


    if (!isAuthenticated()) {
        return <Navigate to={redirectTo} replace state={{ from: location }} />
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