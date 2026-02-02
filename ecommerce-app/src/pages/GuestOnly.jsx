import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function GuestOnly({ children }) {
    const location = useLocation();
    const { isAuth } = useAuth();

    if (isAuth) {
        const to = location.state?.from?.pathname || "/";
        return <Navigate to={to} replace />
    }
    return children;
}