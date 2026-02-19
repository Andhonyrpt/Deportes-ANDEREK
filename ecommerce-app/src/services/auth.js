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
        const { token, refreshToken } = response.data;

        if (token) {
            localStorage.setItem("authToken", token);
            localStorage.setItem("refreshToken", refreshToken);

            return token;
        } else {
            return null;
        }

    } catch (error) {
        console.error("Error al iniciar sesión del usuario", error.message);
        return null;
    }
};

export const refresh = async () => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) return null;

        const response = await http.post("auth/refresh", { refreshToken });

        const { token, refreshToken: newRefreshToken } = response.data;

        if (token) {
            localStorage.setItem("authToken", token);
            localStorage.setItem("refreshToken", newRefreshToken);
            return token;
        }

        return null;

    } catch (error) {
        console.error("Error al refrescar el token", error);
        return null;
    }
}

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