import { createContext, useContext, useEffect, useMemo, useReducer, useState, useRef } from "react";
import { useAuth } from "./AuthContext";
import * as cartService from "../services/cartService";
import { CART_ACTIONS, cartInitialState, cartReducer } from "./cartReducer";
import storageService from "../services/storageService";

const CartContext = createContext();

const STORAGE_KEYS = {
    CART: "cart",
};

export function CartProvider({ children }) {

    const [state, dispatch] = useReducer(cartReducer, cartInitialState);

    const [syncState, setSyncState] = useState({
        syncing: false,
        lastSyncError: null
    });

    const { user, isAuth } = useAuth();
    const [cartId, setCartId] = useState(null);
    const initializedRef = useRef(false);

    const getTotalItems = () => state.items.reduce((sum, i) => sum + (i.quantity || 0), 0);
    const getTotalPrice = () => state.items.reduce((sum, i) => {
        const price = i.product?.price || i.price || 0;
        const qty = i.quantity || 0;
        return sum + (price * qty);
    }, 0);

    // Actualizar storage SOLO para invitados (Guest Mode)
    useEffect(() => {
        if (!isAuth) {
            storageService.set(STORAGE_KEYS.CART, state.items);
        }
    }, [state.items, isAuth]);

    useEffect(() => {
        const initializeCart = async () => {
            if (isAuth && user?._id && !initializedRef.current) {
                try {
                    initializedRef.current = true;

                    // 1. Leer carrito de invitado del storage sado el servicio unificado
                    const guestItems = storageService.get(STORAGE_KEYS.CART) || [];

                    // 2. Si hay items de invitado, hacer merge en el backend primero
                    if (guestItems.length > 0) {
                        const mergeProducts = guestItems.map(item => ({
                            productId: item._id,
                            quantity: item.quantity || 1,
                            size: item.selectedSize || 'M',
                        }));
                        try {
                            await cartService.mergeCart(mergeProducts);
                        } catch (mergeError) {
                            console.warn('[CartContext]: merge falló', mergeError);
                        }
                        // Limpiar el carrito de invitado tras el merge
                        storageService.remove(STORAGE_KEYS.CART);
                    }

                    // 3. Obtener el carrito actualizado desde el backend
                    const backendCart = await cartService.getCart(user._id);

                    if (backendCart?.products) {
                        setCartId(backendCart._id);
                        const normalizedItemsMap = new Map();
                        backendCart.products.forEach(p => {
                            const key = `${p.product._id}-${p.size}`;
                            if (!normalizedItemsMap.has(key)) {
                                normalizedItemsMap.set(key, {
                                    ...p.product,
                                    _id: p.product._id,
                                    quantity: p.quantity,
                                    selectedSize: p.size
                                });
                            } else {
                                const existing = normalizedItemsMap.get(key);
                                existing.quantity += p.quantity;
                                normalizedItemsMap.set(key, existing);
                            }
                        });
                        const normalizedItems = Array.from(normalizedItemsMap.values());
                        dispatch({ type: CART_ACTIONS.INIT, payload: normalizedItems });
                    }
                } catch (error) {
                    console.error('[CartContext]: Error al inicializar carrito', error);
                    initializedRef.current = false;
                }
            } else if (!isAuth) {
                setCartId(null);
                initializedRef.current = false;
            }
        }
        initializeCart();
    }, [isAuth, user?._id]);

    const syncToBackend = async (syncFn) => {
        if (!isAuth) return;
        setSyncState(prev => ({ ...prev, syncing: true, lastSyncError: null }));
        try {
            await syncFn();
        } catch (error) {
            console.error('[CartContext]: Error syncing to backend:', error);
            setSyncState(prev => ({ ...prev, lastSyncError: error.message }));
        } finally {
            setSyncState(prev => ({ ...prev, syncing: false }));
        }
    };

    const addToCart = async (product, quantity = 1, selectedSize = 'M') => {
        const item = { ...product, quantity, selectedSize };
        dispatch({ type: CART_ACTIONS.ADD, payload: item });

        if (isAuth && user?._id) {
            await syncToBackend(() => cartService.addToCart(user._id, product._id, quantity, selectedSize));
        }
    };

    const removeFromCart = async (productId, selectedSize) => {
        dispatch({ type: CART_ACTIONS.REMOVE, payload: { _id: productId, selectedSize } });

        if (isAuth && user?._id) {
            await syncToBackend(() => cartService.removeFromCart(user._id, productId, selectedSize));
        }
    };

    const updateQuantity = async (productId, selectedSize, quantity) => {
        dispatch({ type: CART_ACTIONS.SET_QTY, payload: { _id: productId, selectedSize, quantity } });

        if (isAuth && user?._id) {
            await syncToBackend(() => cartService.updateQuantity(user._id, productId, quantity, selectedSize, selectedSize));
        }
    };

    const changeItemSize = async (productId, quantity, oldSize, newSize) => {
        dispatch({ type: CART_ACTIONS.CHANGE_SIZE, payload: { _id: productId, oldSize, newSize } });

        if (isAuth && user?._id) {
            await syncToBackend(() => cartService.updateQuantity(user._id, productId, quantity, newSize, oldSize));
        }
    };

    const clearCart = async () => {
        dispatch({ type: CART_ACTIONS.CLEAR });
        if (isAuth && user?._id) {
            await syncToBackend(() => cartService.clearCart(user._id));
        }
    };

    const value = {
        items: state.items,
        cartItems: state.items,
        totalItems: getTotalItems(),
        getTotalItems,
        totalPrice: getTotalPrice(),
        getTotalPrice,
        syncing: syncState.syncing,
        lastSyncError: syncState.lastSyncError,
        addToCart,
        removeFromCart,
        updateQuantity,
        changeItemSize,
        clearCart,
        cartId
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart debe usarse dentro de un CartProvider");
    }
    return context;
}
