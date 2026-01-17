import { http } from "./http";

export const register = async (userData) => {

    try {
        const response = await http.post("auth/register", userData);
        const { displayName, email } = response.data;

        if (displayName && email) {
            return email;
        } else {
            return null;
        }

    } catch (error) {
        console.error("Error al registrar un usuario", error.message, userData);
        return null;
    }
};

export const login = async (email, password) => {
    try {
        const response = await http.post("auth/login", { email, password });
        const { token } = response.data;

        if (token) {
            localStorage.setItem("authToken", token);
            return token;
        } else {
            return null;
        }

    } catch (error) {
        console.error("Error al iniciar sesión del usuario", error.message);
        return null;
    }
}