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
};

export const checkEmail = async (email) => {
    try {
        const response = await http.get(`auth/check-email?email=${email}`);
        const { taken } = response.data;
        console.log(response.data);

        if (response.status === 200) {
            return taken;
        } else {
            return null;
        }

    } catch (error) {
        console.error("Error al consultar la disponibilidad del email", error.message, email);
        return false;
    }
};