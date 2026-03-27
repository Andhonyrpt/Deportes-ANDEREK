import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile, changePassword } from '../../services/userService';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage/ErrorMessage';
import './ProfileCard.css';

const ROLE_COLORS = {
    admin: "#8f4e9f",
    customer: "#d4b293",
};

export default function ProfileCard() {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const role = user?.role || "guest";

    // View state: 'info' | 'edit' | 'password'
    const [view, setView] = useState('info');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Edit profile form state
    const [editForm, setEditForm] = useState({
        displayName: user?.displayName || '',
        phone: user?.phone || '',
        avatar: user?.avatar || '',
    });

    // Change password form state
    const [pwForm, setPwForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await updateUserProfile(editForm);
            setSuccessMsg('Perfil actualizado correctamente.');
            setView('info');
        } catch (err) {
            setError('No se pudo actualizar el perfil. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (pwForm.newPassword !== pwForm.confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await changePassword(user._id, pwForm);
            setSuccessMsg('Contraseña cambiada exitosamente.');
            setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setView('info');
        } catch (err) {
            setError('No se pudo cambiar la contraseña. Verifica tu contraseña actual.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='profile-container'>
            <div className='profile-card'>
                {/* Header — siempre visible */}
                <div className='profile-header'>
                    <img
                        src={user?.avatar || "/img/user-placeholder.png"}
                        alt={user?.displayName || user?.email}
                        className='profile-avatar'
                    />
                    <div className='profile-names'>
                        <h2 data-testid="profile-display-name">
                            {user?.displayName || user?.email}
                        </h2>
                        <span className='profile-role-badge' style={{ background: ROLE_COLORS[role] }}>
                            {role}
                        </span>
                    </div>
                </div>

                {/* Feedback */}
                {error && <ErrorMessage message={error} />}
                {successMsg && <p className="profile-success">{successMsg}</p>}

                {/* Vista: Información */}
                {view === 'info' && (
                    <>
                        <div className='profile-info'>
                            <div className='info-item'>
                                <label>Email:</label>
                                <span data-testid="profile-email">{user?.email || "No disponible"}</span>
                            </div>
                            <div className='info-item'>
                                <label>Nombre:</label>
                                <span>{user?.displayName || "No disponible"}</span>
                            </div>
                            <div className='info-item'>
                                <label>Teléfono:</label>
                                <span>{user?.phone || "No registrado"}</span>
                            </div>
                            <div className='info-item'>
                                <label>Estado:</label>
                                <span>{user?.isActive ? "Activo" : "Inactivo"}</span>
                            </div>
                        </div>

                        <div className='profile-actions'>
                            <h3>Acciones de la cuenta</h3>
                            <Button
                                type='button'
                                onClick={() => { setError(null); setSuccessMsg(null); setView('edit'); }}
                                data-testid="profile-action-editar-perfil"
                            >
                                Editar Perfil
                            </Button>
                            <Button
                                type='button'
                                onClick={() => { setError(null); setSuccessMsg(null); setView('password'); }}
                                data-testid="profile-action-cambiar-contrasena"
                            >
                                Cambiar contraseña
                            </Button>
                            <Button
                                type='button'
                                variant='secondary'
                                onClick={() => navigate('/orders')}
                                data-testid="profile-action-ver-mis-pedidos"
                            >
                                Ver mis pedidos
                            </Button>
                            {role === 'admin' && (
                                <Button
                                    type='button'
                                    variant='secondary'
                                    onClick={() => navigate('/admin')}
                                    data-testid="profile-action-panel-de-administracion"
                                >
                                    Panel de administración
                                </Button>
                            )}
                        </div>
                    </>
                )}

                {/* Vista: Editar Perfil */}
                {view === 'edit' && (
                    <form className='profile-form' onSubmit={handleEditSubmit}>
                        <h3>Editar Perfil</h3>
                        <div className='info-item'>
                            <label htmlFor="edit-displayName">Nombre:</label>
                            <input
                                id="edit-displayName"
                                type="text"
                                value={editForm.displayName}
                                onChange={(e) => setEditForm(f => ({ ...f, displayName: e.target.value }))}
                                placeholder="Tu nombre"
                            />
                        </div>
                        <div className='info-item'>
                            <label htmlFor="edit-phone">Teléfono:</label>
                            <input
                                id="edit-phone"
                                type="text"
                                value={editForm.phone}
                                onChange={(e) => setEditForm(f => ({ ...f, phone: e.target.value }))}
                                placeholder="Tu teléfono"
                            />
                        </div>
                        <div className='info-item'>
                            <label htmlFor="edit-avatar">URL de Avatar:</label>
                            <input
                                id="edit-avatar"
                                type="url"
                                value={editForm.avatar}
                                onChange={(e) => setEditForm(f => ({ ...f, avatar: e.target.value }))}
                                placeholder="https://..."
                            />
                        </div>
                        <div className='profile-form-actions'>
                            <Button type='submit' disabled={loading}>
                                {loading ? 'Guardando...' : 'Guardar cambios'}
                            </Button>
                            <Button type='button' variant='secondary' onClick={() => setView('info')}>
                                Cancelar
                            </Button>
                        </div>
                    </form>
                )}

                {/* Vista: Cambiar Contraseña */}
                {view === 'password' && (
                    <form className='profile-form' onSubmit={handlePasswordSubmit}>
                        <h3>Cambiar Contraseña</h3>
                        <div className='info-item'>
                            <label htmlFor="pw-current">Contraseña actual:</label>
                            <input
                                id="pw-current"
                                type="password"
                                value={pwForm.currentPassword}
                                onChange={(e) => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                                required
                            />
                        </div>
                        <div className='info-item'>
                            <label htmlFor="pw-new">Nueva contraseña:</label>
                            <input
                                id="pw-new"
                                type="password"
                                value={pwForm.newPassword}
                                onChange={(e) => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                                required
                            />
                        </div>
                        <div className='info-item'>
                            <label htmlFor="pw-confirm">Confirmar contraseña:</label>
                            <input
                                id="pw-confirm"
                                type="password"
                                value={pwForm.confirmPassword}
                                onChange={(e) => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                                required
                            />
                        </div>
                        <div className='profile-form-actions'>
                            <Button type='submit' disabled={loading}>
                                {loading ? 'Cambiando...' : 'Cambiar contraseña'}
                            </Button>
                            <Button type='button' variant='secondary' onClick={() => setView('info')}>
                                Cancelar
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};