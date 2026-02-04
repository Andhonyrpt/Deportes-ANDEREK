import axios from 'axios';

const APP_BASE_URL = process.env.REACT_APP_API_BASE_URL;

let logoutCallback = null;

export const setLogoutCallback = (callback) => {
    // Es una función para guardar una acción que se ejecutará más tarde
    logoutCallback = callback;
}

export const http = axios.create({
    baseURL: APP_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 8000
});

http.interceptors.request.use(
    (config) => {
        // Siempre intenta agregar el token si existe
        const token = localStorage.getItem('authToken');

        if (token) {
            // config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (err) => {
        const message = err.response?.data?.message || err.message || 'Error de red';
        return Promise.reject(new Error(message));
    }
);

http.interceptors.response.use(
    (res) => { return res },
    async (err) => {
        const originalRequest = err.config;

        // Manejar errores de autentificación
        if (err.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const { refresh } = await import("./auth");
                const newToken = await refresh();

                if (newToken) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return http(originalRequest);
                }

            } catch (error) {
                console.error("Error en refresh token", error);
            }

            logoutCallback();
        }

        const message = err.response?.data?.message || err.message || 'Error de red';
        return Promise.reject(new Error(message));
    }
);