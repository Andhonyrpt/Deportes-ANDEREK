import { useState, useEffect } from "react";
import {
    getAllUsers,
    updateUserAsAdmin
} from "../../../services/userService";
import Button from "../../../components/common/Button/Button";
import Loading from "../../../components/common/Loading/Loading";
import ErrorMessage from "../../../components/common/ErrorMessage/ErrorMessage";
import "./UsersView.css";

export default function UsersView() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadUsers();
    }, [page]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await getAllUsers({ page, limit: 10 });
            setUsers(data?.users || []);
            setTotalPages(data?.pagination?.totalPages || 1);
        } catch (err) {
            setError("Error al cargar usuarios");
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (userId, newRole) => {
        try {
            await updateUserAsAdmin(userId, { role: newRole });
            loadUsers();
        } catch (err) {
            setError("Error al actualizar rol");
        }
    };

    const handleToggleStatus = async (user) => {
        const action = user.isActive ? "desactivar" : "activar";
        if (window.confirm(`¿Seguro que quieres ${action} esta cuenta?`)) {
            try {
                await updateUserAsAdmin(user._id, { isActive: !user.isActive });
                loadUsers();
            } catch (err) {
                setError(`Error al ${action} usuario`);
            }
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="users-view">
            <div className="users-header">
                <h2>Control de Usuarios</h2>
                <Button onClick={loadUsers}>Refrescar</Button>
            </div>

            {error && <ErrorMessage message={error} />}

            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td>{user.displayName}</td>
                                <td>{user.email}</td>
                                <td>
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleUpdate(user._id, e.target.value)}
                                    >
                                        <option value="customer">Customer</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td>
                                    <span className={`status-badge ${user.isActive ? "active" : "inactive"}`}>
                                        {user.isActive ? "Activo" : "Inactivo"}
                                    </span>
                                </td>
                                <td>
                                    <Button
                                        onClick={() => handleToggleStatus(user)}
                                        variant={user.isActive ? "danger" : "primary"}
                                        size="small"
                                    >
                                        {user.isActive ? "Desactivar" : "Activar"}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pagination-controls">
                <Button 
                    variant="secondary" 
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                >
                    Anterior
                </Button>
                <span>Página {page} de {totalPages}</span>
                <Button 
                    variant="secondary" 
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                >
                    Siguiente
                </Button>
            </div>
        </div>
    );
}
