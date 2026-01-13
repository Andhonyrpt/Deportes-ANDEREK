import { useLocation, useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm/LoginForm";

export default function Login() {
    const location = useLocation();
    const navigate = useNavigate();
    const from = location?.state?.from?.pathname || "/";

    return <LoginForm onSuccess={() => navigate(from, { replace: true })} />

};