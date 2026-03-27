import { Outlet, NavLink } from "react-router-dom";
import "./AdminDashboard.css";

export default function AdminDashboard() {
    return (
        <div className="admin-dashboard">
            <aside className="admin-sidebar" data-testid="admin-sidebar">
                <div className="admin-sidebar-title">Admin Panel</div>
                <nav>
                    <NavLink 
                        to="/admin" 
                        end
                        className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
                    >
                        Dashboard
                    </NavLink>
                    <NavLink 
                        to="/admin/users" 
                        className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
                    >
                        Usuarios
                    </NavLink>
                    <NavLink 
                        to="/admin/products" 
                        className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
                    >
                        Productos
                    </NavLink>
                    <NavLink 
                        to="/admin/orders" 
                        className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
                    >
                        Órdenes
                    </NavLink>
                    <NavLink 
                        to="/admin/categories" 
                        className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
                    >
                        Categorías
                    </NavLink>
                    <NavLink 
                        to="/admin/subcategories" 
                        className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
                    >
                        Subcategorías
                    </NavLink>
                </nav>
            </aside>
            <main className="admin-content" data-testid="admin-content">
                <Outlet />
            </main>
        </div>
    );
}
