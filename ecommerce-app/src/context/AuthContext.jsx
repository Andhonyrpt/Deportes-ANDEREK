import { Children, createContext, use, useContext, useDebugValue, useEffect, useState } from "react";
import {
    login as loginService,
    register as registerService
} from "../services/auth";
import { getUserProfile } from "../services/userService";
import { setLogoutCallback } from '../services/http';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAuth, setIsAuth] = useState(false);
    const [loading, setLoading] = useState(true);

    const saveToken = (token) => {
        localStorage.setItem("authToken", token);
    };

    const getToken = () => {
        return localStorage.getItem("authToken");
    };

    const removeToken = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
    };

    const saveUserData = (userData) => {
        localStorage.setItem("userData", JSON.stringify(userData));
    };

    const getUserData = () => {
        const data = localStorage.getItem("userData");
        return data ? JSON.parse(data) : null;
    };

    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = getToken();

                if (token) {
                    const userData = await getUserProfile();

                    if (userData) {
                        setUser(userData);
                        setIsAuth(true);
                        saveUserData(userData);
                    } else {
                        removeToken();
                    }
                }

            } catch (error) {
                console.error("Error en autentificación", error);
                removeToken();
                setUser(null);
                setIsAuth(false);
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, []);

    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'authToken') {
                if (!e.newValue) {
                    setUser(null);
                    setIsAuth(false);
                } else if (e.newValue && !isAuth) {
                    const userData = getUserData();

                    if (userData) {
                        setUser(userData);
                        setIsAuth(true);
                    }
                }
            }
        };

        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };

    }, [isAuth]);

    useEffect(() => {
        setLogoutCallback(logout);
    }, []);

    const login = async (email, password) => {
        setLoading(true);

        try {
            const token = await loginService(email, password);

            if (token) {
                const userData = await getUserProfile();

                if (userData) {
                    setUser(userData);
                    setIsAuth(true);
                    saveUserData(userData);
                    return { success: true, user: userData };
                }
            }

            return { success: false, error: "Credenciales inválidas" }

        } catch (error) {
            console.error("Error en el login", error);
            return { success: false, error: "Error al iniciar sesión" };
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        setLoading(true);

        try {
            const result = await registerService(userData);

            if (result) {
                return {
                    success: true,
                    email: userData.email,
                    message: "Usuario registrado exitosamente"
                };
            }

            return { success: false, message: "Error al registrar el usuario" };

        } catch (error) {
            console.error("Error en el registro", error);
            return { success: false, message: "Error al registrar el usuario" };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        removeToken();
        setUser(null);
        setIsAuth(false);
    };

    const hasRole = (role) => {
        return user?.role === role;
    };

    const value = {
        user,
        isAuth,
        loading,
        login,
        register,
        logout,
        hasRole,
        getToken
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth debe de usarse dentro de AuthProvider");
    }
    return context;

};