import { useLocation, useNavigate } from "react-router-dom";
import RegisterForm from "../components/RegisterForm/RegisterForm";

export default function Login() {
    const location = useLocation();
    const navigate = useNavigate();
    const from = location?.state?.from?.pathname || "/login";

    return <RegisterForm onSuccess={() => navigate(from, { replace: true })} />

};