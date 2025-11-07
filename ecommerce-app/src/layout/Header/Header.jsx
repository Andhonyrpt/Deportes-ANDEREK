import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import Icon from '../../components/common/Icon';
import { getCurrentUser, isAuthenticated, logout } from '../../utils/auth';
import './Header.css';

export default function Header() {

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isAuth, setIsAuth] = useState(true);
    const [user, setUser] = useState(null);

    const userMenuRef = useRef(null);

    useEffect(() => {

        const updateAuthState = () => {
            setIsAuth(isAuthenticated());
            setUser(getCurrentUser());
        };

        window.addEventListener("storage", updateAuthState);
        updateAuthState();

        return () => {
            window.addEventListener("storage", updateAuthState);
        }

    }, [])


    const handleLogin = () => {
        setIsUserMenuOpen(false);
        // setIsMobileMenuOpen(false);
    };

    const handleRegister = () => {
        console.log("Redirigiendo a registro");
        setIsUserMenuOpen(false);
        // setIsMobileMenuOpen(false);
    };

    const handleLogout = () => {
        logout();
        setIsAuth(false);
        setUser(null);
        setIsUserMenuOpen(false);
        // setIsMobileMenuOpen(false);
        window.location.reload();
    };

    const handleUserMenuToggle = () => {
        setIsUserMenuOpen(!isUserMenuOpen);
    };

    // Generar iniciales del usuario
    const getUserInitials = (userData) => {
        if (!userData || userData.name) return "U";
        return userData.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const getDisplayName = (userData) => {
        if (!userData) return "Usuario";
        return userData.name || userData.email || "Usuario";
    }

    return (
        <header className='header'>
            <div className="header-container">
                <div className="header-content">
                    <Link to="/">
                        <Icon name="jersey" size={33} />
                    </Link>
                    <Link to="/" className='logo-text'>
                        PlayerasLa10
                        <span className='logo-extensions'>.com</span>
                    </Link>
                </div>


                <div className='header-actions'>
                    <Link to="/cart"
                        className='cart-btn'
                        aria-label='Ver carrito de compras'
                    >
                        <Icon name="shoppingCart" size={24} />
                    </Link>

                    <div className='user-menu-container desktop-only'
                        ref={userMenuRef}
                    >
                        <button
                            className={`user-info ${isUserMenuOpen ? 'active' : ''}`}
                            onClick={handleUserMenuToggle}
                            aria-label='Menu de usuario'
                            aria-expanded={isUserMenuOpen}
                        >
                            <div className='user-avatar'>
                                <span className='user-initials'>
                                    {isAuth ? (
                                        getUserInitials(user)
                                    ) : (
                                        <Icon name="user" size={16} />
                                    )}
                                </span>
                            </div>
                        </button>

                        {isUserMenuOpen && (
                            <div className='user-dropdown'>
                                {!isAuth ? (
                                    <div className='auth-section'>
                                        <div className='auth-header'>
                                            <Icon name="user" size={24} />
                                            <span>Accede a tu cuenta</span>
                                        </div>
                                        <Link
                                            to="/login"
                                            className="auth-btn primary"
                                            onClick={handleLogin}
                                        >
                                            <Icon name="logIn" size={16} />
                                            Iniciar Sesión
                                        </Link>
                                        <button
                                            className="auth-btn secondary"
                                            onClick={handleRegister}
                                        >
                                            <Icon name="userPlus" size={16} />
                                            Crear Cuenta
                                        </button>
                                    </div>
                                ) : (
                                    <div className='user-section'>
                                        <div className='user-profile'>
                                            <div className='user-avatar-large'>
                                                <span className='user-initials'>
                                                    {getUserInitials(user)}
                                                </span>
                                            </div>

                                            <div className='user-details'>
                                                <span className='user-name'>
                                                    {getDisplayName(user)}
                                                </span>
                                                <span className='user-email'>
                                                    {user?.email}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="user-links">
                                            <Link to="/profile" className="user-link"
                                            >
                                                <Icon name="user" size={16} />
                                                Mi Cuenta
                                            </Link>
                                            <Link to="/mis-pedidos" className="user-link"
                                            >
                                                <Icon name="package" size={16} />
                                                Mis Pedidos
                                            </Link>
                                            <Link to="/lista-deseos"
                                                className="user-link"
                                            >
                                                <Icon name="heart" size={16} />
                                                Lista de Deseos
                                            </Link>
                                            <Link to="/configuracion"
                                                className="user-link"
                                            >
                                                <Icon name="settings" size={16} />
                                                Configuración
                                            </Link>
                                        </div>

                                        <div className="logout-section">
                                            <button
                                                className="logout-btn"
                                                onClick={handleLogout}>
                                                <Icon name="logOut" size={16} />
                                                Cerrar Sesión
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};