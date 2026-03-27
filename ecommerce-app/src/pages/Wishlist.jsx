import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard/ProductCard';
import Icon from '../components/common/Icon';
import Button from '../components/common/Button';
import './Wishlist.css'; // Mismo estilo que Orders/Cart si se puede reutilizar

export default function Wishlist() {
    const { user } = useAuth();
    const { wishlistItems, loading, emptyWishlist } = useWishlist();

    if (!user) {
        return (
            <div className="wishlist-page empty-state">
                <Icon name="heart" size={48} />
                <h1>Inicia sesión para ver tu Wishlist</h1>
                <p>Guarda tus productos favoritos para comprarlos después.</p>
                <Link to="/login" className="order-link">
                    <Button>Iniciar Sesión</Button>
                </Link>
            </div>
        );
    }

    if (loading && wishlistItems.length === 0) {
        return (
            <div className="wishlist-page">
                <p>Cargando favoritos...</p>
            </div>
        );
    }

    if (wishlistItems.length === 0) {
        return (
            <div className="wishlist-page empty-state">
                <Icon name="heartOutline" size={48} />
                <h1>Tu lista de deseos está vacía</h1>
                <p>¡Explora nuestro catálogo y guarda tus equipos favoritos!</p>
                <Link to="/" className="order-link">
                    <Button>Descubrir productos</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="wishlist-page">
            <div className="wishlist-header">
                <div>
                    <p className="eyebrow">Tus favoritos</p>
                    <h1>Mi Wishlist</h1>
                    <p className="muted">{wishlistItems.length} {wishlistItems.length === 1 ? 'producto' : 'productos'} guardados</p>
                </div>
                <Button variant="secondary" onClick={emptyWishlist}>
                    Vaciar Lista
                </Button>
            </div>

            <div className="wishlist-grid">
                {wishlistItems.map(product => (
                    <ProductCard key={product._id} product={product} orientation="vertical" />
                ))}
            </div>
        </div>
    );
}
