import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import Icon from '../../components/common/Icon';
import { getCurrentUser, isAuthenticated, logout } from '../../utils/auth';
import { useCart } from '../../context/CartContext';
import './Header.css';

export default function Header() {

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { getTotalItems } = useCart();
    const totalItems = getTotalItems();

    // Simular estado de autenticación - reemplazar con tu lógica real
    const [isAuth, setIsAuth] = useState(true);
    const [user, setUser] = useState(null);

    // Referencias para manejo de clicks fuera
    const userMenuRef = useRef(null);
    const mobileMenuRef = useRef(null);

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

    // Cerrar menús con Escape y clicks fuera
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsUserMenuOpen(false);
                setIsMobileMenuOpen(false);
            }
        };

        const handleClickOutside = (e) => {
            if (userMenuRef && !userMenuRef.current.contains(e.target)) {
                setIsUserMenuOpen(false);
            }

            if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.addEventListener("keydown", handleKeyDown);
            document.addEventListener("mousedown", handleClickOutside);

        };

    }, []);

    const handleLogin = () => {
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
    };

    const handleRegister = () => {
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
    };

    const handleLogout = () => {
        logout();
        setIsAuth(false);
        setUser(null);
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
        window.location.reload();
    };

    const handleUserMenuToggle = () => {
        setIsUserMenuOpen(!isUserMenuOpen);
    };

    const handleMobileMenuOpen = () => {
        setIsMobileMenuOpen(true);
    };

    const handleMobileMenuClose = () => {
        setIsMobileMenuOpen(false);
    };

    // Generar iniciales del usuario
    const getUserInitials = (userData) => {

        if (!userData || userData.name) return "U";

        const name = userData.displayName || userData.name || userData.email || "Usuario";

        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const getDisplayName = (userData) => {
        if (!userData) return "Usuario";
        return userData.displayName || userData.name || userData.email || "Usuario";
    }

    return (
        <header className='header'>

            {/* Main Header */}
            <div className='header-main'>
                <div className='container'>
                    <div className="header-content">
                        {/* Mobile Menu Button */}
                        <div className='header-left'>
                            <button className='mobile-menu-btn mobile-only'
                                aria-label='Abrir menú'
                                onClick={handleMobileMenuOpen}
                            >
                                <Icon name="menu" size={20} />
                            </button>

                            <Link to="/">
                                <Icon name="jersey" size={33} />
                            </Link>

                            <Link to="/" className='logo'>
                                PlayerasLa10
                                <span className='logo-extensions'>.com</span>
                            </Link>
                        </div>


                        {/* Right Actions */}
                        <div className='header-actions'>

                            {/* Cart Button */}
                            <Link to="/cart"
                                className='cart-btn'
                                aria-label='Ver carrito de compras'
                            >
                                <Icon name="shoppingCart" size={24} />
                                {totalItems > 0 && (
                                    <span className="cart-badge">{totalItems}</span>
                                )}
                            </Link>

                            {/* Desktop User Menu */}
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

                                    <div className="user-text">
                                        <span className="greeting">
                                            {isAuth ? `Hola ${getDisplayName(user)}` : "Hola, Inicia sesión"}
                                        </span>
                                        <span className="account-text">
                                            {isAuth ? "Mi cuenta" : "Cuenta y Listas"}
                                        </span>
                                    </div>
                                    <Icon
                                        name="chevronDown"
                                        size={14}
                                        className={`dropdown-arrow ${isUserMenuOpen ? "rotated" : ""}`}
                                    />
                                </button>

                                {/* Desktop User Dropdown */}
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
                                                <Link
                                                    to="/register"
                                                    className="auth-btn secondary"
                                                    onClick={handleRegister}
                                                >
                                                    <Icon name="userPlus" size={16} />
                                                    Crear Cuenta
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className='user-section'>
                                                <div className='user-profile'>
                                                    <div className='user-avatar-large'>
                                                        <span
                                                            className='user-initials'
                                                        >
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
                                                    <Link to="/profile"
                                                        className="user-link"
                                                    >
                                                        <Icon name="user" size={16} />
                                                        Mi Cuenta
                                                    </Link>

                                                    <Link to="/orders"
                                                        className="user-link"
                                                    >
                                                        <Icon name="package" size={16} />
                                                        Mis Pedidos
                                                    </Link>
                                                    <Link to="/wishlist"
                                                        className="user-link"
                                                    >
                                                        <Icon name="heart" size={16} />
                                                        Lista de Deseos
                                                    </Link>
                                                    <Link to="/settings"
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
                </div>
            </div>

            {/* Enhanced Mobile Menu */}
            {isMobileMenuOpen && (
                <div className='mobile-menu-overlay'
                    onClick={handleMobileMenuClose}>
                    <div className='mobile-menu-content'
                        ref={mobileMenuRef}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Mobile Menu Header*/}
                        <div className='mobile-menu-header'>
                            <div className='mobile-menu-logo'>
                                {/* <Icon name="jersey" size={33} /> */}
                                <span className='logo'> PlayerasLa10.com</span>
                            </div>

                            <button
                                className='mobile-menu-close'
                                aria-label='Cerrar menú'
                                onClick={handleMobileMenuClose}
                            >
                                <Icon name="x" size={24} />
                            </button>
                        </div>

                        {/* Mobile Menu Content */}
                        <div className='mobile-menu-body'>
                            {/* User Section */}
                            <div className='mobile-user-section'>
                                {!isAuth ? (
                                    <div className='mobile-auth-section'>
                                        <div className='mobile-auth-header'>
                                            <Icon name="user" size={32} />
                                            <div>
                                                <h3>¡Hola!</h3>
                                                <p>
                                                    Inicia sesión para mejorar tu experiencia
                                                </p>
                                            </div>
                                        </div>

                                        <div className='mobile-auth-buttons'>
                                            <Link
                                                to="/login"
                                                className='mobile-auth-btn primary'
                                                onClick={handleLogin}
                                            >
                                                <Icon name="logIn" size={20} />
                                                Iniciar Sesión
                                            </Link>

                                            <button
                                                className='mobile-auth-btn secondary'
                                                onClick={handleRegister}
                                            >
                                                <Icon name="userPlus" size={20} />
                                                Crear Cuenta
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className='mobile-user-info'>
                                        <div className='mobile-user-avatar'>
                                            {
                                                <span className='user-initials'>
                                                    {getUserInitials(user)}
                                                </span>
                                            }
                                        </div>

                                        <div className='mobile-user-details'>
                                            <span className='mobile-user-name'>
                                                {getUserInitials(user)}
                                            </span>

                                            <span className='mobile-user-email'>
                                                {user?.email}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* User Account Links - Solo si está autenticado */}
                            {isAuth && (
                                <nav className='mobile-main-nav'>
                                    <h4>Mi cuenta</h4>
                                    <Link
                                        to="/profile"
                                        className="mobile-nav-link"
                                        onClick={handleMobileMenuClose}
                                    >
                                        <Icon name="user" size={20} />
                                        Mi Perfil
                                    </Link>
                                    <Link
                                        to="/orders"
                                        className="mobile-nav-link"
                                        onClick={handleMobileMenuClose}
                                    >
                                        <Icon name="package" size={20} />
                                        Mis Pedidos
                                    </Link>
                                    <Link
                                        to="/wishlist"
                                        className="mobile-nav-link"
                                        onClick={handleMobileMenuClose}
                                    >
                                        <Icon name="heart" size={20} />
                                        Lista de Deseos
                                    </Link>
                                    <Link
                                        to="/settings"
                                        className="mobile-nav-link"
                                        onClick={handleMobileMenuClose}
                                    >
                                        <Icon name="settings" size={20} />
                                        Configuración
                                    </Link>
                                </nav>
                            )}

                            {/* Settings and Support */}
                            <nav className="mobile-support-nav">
                                <h4>Configuración y Ayuda</h4>
                                <Link
                                    to="/help"
                                    className="mobile-nav-link"
                                    onClick={handleMobileMenuClose}
                                >
                                    <Icon name="helpCircle" size={20} />
                                    Centro de Ayuda
                                </Link>
                                <Link
                                    to="/contact"
                                    className="mobile-nav-link"
                                    onClick={handleMobileMenuClose}
                                >
                                    <Icon name="messageCircle" size={20} />
                                    Contactar Soporte
                                </Link>
                            </nav>

                            {/* Logout */}
                            {isAuth && (
                                <div className="mobile-logout-section">
                                    <button className="mobile-logout-btn" onClick={handleLogout}>
                                        <Icon name="logOut" size={20} />
                                        Cerrar Sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};