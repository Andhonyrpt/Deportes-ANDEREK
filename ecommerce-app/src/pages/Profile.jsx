import { getCurrentUser } from '../utils/auth';
import Button from '../components/common/Button';
import './Profile.css';

export default function Profile() {

    const user = getCurrentUser();

    return (
        <div className='profile-container'>
            <div className='profile-card'>
                <h2>Mi perfil</h2>
                <div className='profile-info'>
                    <div className='info-item'>
                        <label>Email:</label>
                        <span>{user.email}</span>
                    </div>
                    <div className='info-item'>
                        <label>Nombre:</label>
                        <span>{user.name}</span>
                    </div>
                    <div className='info-item'>
                        <label>Rol:</label>
                        <span className={`rol-badge ${user.role}`}>{user.role}</span>
                    </div>
                    <div className='info-item'>
                        <label>Última conexión:</label>
                        <span>{new Date(user.loginDate).toLocaleString()}</span>
                    </div>
                </div>

                <div className="profile-actions">
                    <h3>Acciones de la cuenta</h3>
                    <Button type="button">Editar Perfil</Button>
                    <Button type="button">Cambiar contraseña</Button>
                    <Button type="button">Ver mis pedidos</Button>
                </div>
            </div>
        </div>
    );
}