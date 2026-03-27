import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    moveWishlistToCart,
    clearWishlist
} from '../services/wishlistService';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
    const { user } = useAuth();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?._id || user?.id) {
            fetchWishlist();
        } else {
            setWishlistItems([]);
        }
    }, [user]);

    const fetchWishlist = async () => {
        setLoading(true);
        try {
            const data = await getWishlist();
            // Mapeamos para tener solo el objeto producto en la lista
            setWishlistItems(data?.products?.map(p => p.product) || []);
        } catch (error) {
            console.error("Error cargando wishlist", error);
        } finally {
            setLoading(false);
        }
    };

    const addProduct = async (productId) => {
        if (!user) return false;
        try {
            await addToWishlist(productId);
            await fetchWishlist(); // Recargar para tener el producto populado
            return true;
        } catch (error) {
            return false;
        }
    };

    const removeProduct = async (productId) => {
        if (!user) return false;
        try {
            await removeFromWishlist(productId);
            // Filtro local después de remover en remoto
            setWishlistItems(prev => prev.filter(item => (item._id || item.id) !== productId));
            return true;
        } catch (error) {
            return false;
        }
    };

    const isInWishlist = (productId) => {
        return wishlistItems.some(item => (item._id || item.id) === productId);
    };

    const toggleWishlist = async (productId) => {
        if (!user) return false;
        if (isInWishlist(productId)) {
            return await removeProduct(productId);
        } else {
            return await addProduct(productId);
        }
    };

    const emptyWishlist = async () => {
        try {
            await clearWishlist();
            setWishlistItems([]);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <WishlistContext.Provider value={{
            wishlistItems,
            loading,
            addProduct,
            removeProduct,
            isInWishlist,
            toggleWishlist,
            emptyWishlist
        }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    return useContext(WishlistContext);
}
