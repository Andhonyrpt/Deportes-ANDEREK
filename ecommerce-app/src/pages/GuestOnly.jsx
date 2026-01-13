import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

export default function GuestOnly({ children }) {
    const location = useLocation();

    if (isAuthenticated) {
        const to = location.state?.from?.pathname || "/";
        return <Navigate to={to} replace />
    }
    return children;
}