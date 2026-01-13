import axios from 'axios';

const API_BASE = 'http://localhost:4000/api/';

export const http = axios.create({
    baseURL: API_BASE,
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
            config.headers = config.headers || {};
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
    (res) => res,
    (err) => {
        // Manejar errores de autentificación
        if (err.response?.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData')
        }
        const message = err.response?.data?.message || err.message || 'Error de red';
        return Promise.reject(new Error(message));
    }
);