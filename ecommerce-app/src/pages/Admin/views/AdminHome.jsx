import "./AdminHome.css";

export default function AdminHome() {
    return (
        <div className="admin-home">
            <div className="admin-home-header">
                <h2>Resumen General</h2>
            </div>
            <div className="admin-home-card">
                <p>Bienvenido al Panel de Administración de ANDEREK.</p>
                <p>Selecciona un módulo de la izquierda para comenzar a gestionar el catálogo, los usuarios o las ventas.</p>
            </div>
        </div>
    );
}
