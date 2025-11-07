import { Navigate } from "react-router-dom";
import { isAuthenticated, getCurrentUser } from "../utils/auth";
import ErrorMessage from "../components/common/ErrorMessage/ErrorMessage";

export default function ProtectedRoute({ children, redirectTo = "/login", allowedRoles }) {

    if (!isAuthenticated()) {
        return <Navigate to={redirectTo} />
    }

    if (allowedRoles) {
        const user = getCurrentUser();

        if (allowedRoles.includes(user.role)) {
            return <ErrorMessage>Acceso denegado</ErrorMessage>
        }
    }

    return children;
};