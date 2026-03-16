import { createContext, useContext, useEffect, useMemo, useReducer, useState, useRef } from "react";
import { useAuth } from "./AuthContext";
import * as cartService from "../services/cartService";
import { CART_ACTIONS, cartInitialState, cartReducer } from "./cartReducer";

const CartContext = createContext();

export function CartProvider({ children }) {

    const [state, dispatch] = useReducer(cartReducer, cartInitialState);

    const [syncState, setSyncState] = useState({
        syncing: false,
        lastSyncError: null
    });

    const { user, isAuth } = useAuth();
    const [cartId, setCartId] = useState(null);
    const initializedRef = useRef(false); // Flag para evitar re-fetch usando ref

    // Funciones auxiliares
    const getTotalItems = () => state.items.reduce((sum, i) => sum + (i.quantity || 0), 0);
    const getTotalPrice = () => state.items.reduce((sum, i) => {
        const price = i.product?.price || i.price || 0;
        const qty = i.quantity || 0;
        return sum + (price * qty);
    }, 0);

    // Actualizar localStorage SOLO para invitados (Guest Mode)
    useEffect(() => {
        if (!isAuth) {
            localStorage.setItem("cart", JSON.stringify(state.items));
        }
    }, [state.items, isAuth]);

    useEffect(() => {
        const initializeCart = async () => {
            // Solo inicializar si está autenticado, tenemos ID, y no ha sido inicializado aún
            if (isAuth && user?._id && !initializedRef.current) {
                try {
                    console.log("DEBUG [CartContext]: Initializing cart for user", user._id);
                    initializedRef.current = true; // Bloquear re-inicialización
                    
                    // 1. Obtener el carrito desde el backend
                    const backendCart = await cartService.getCart(user._id);
                    console.log("DEBUG [CartContext]: Backend response", backendCart);

                    if (backendCart?.products) {
                        setCartId(backendCart._id);
                        // Normalizar y sumar duplicados
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
                    console.error("DEBUG [CartContext]: Error", error);
                    initializedRef.current = false; // Permitir reintento si falló
                }
            } else if (!isAuth) {
                setCartId(null);
                initializedRef.current = false;
            }
        }
        initializeCart();
    }, [isAuth, user?._id]); // Ya no depende de 'initialized' porque es un ref mutable

    const syncToBackend = async (syncFn) => {
        if (!isAuth) return;

        setSyncState({
            syncing: true,
            lastSyncError: null
        });

        try {
            await syncFn();
            setSyncState({
                syncing: false,
                lastSyncError: null
            });
        } catch (error) {
            console.error(error)
            setSyncState({
                syncing: false,
                lastSyncError: error
            });
        }
    };

    const removeFromCart = (productId, size) => {
        dispatch({ type: CART_ACTIONS.REMOVE, payload: { _id: productId, selectedSize: size } });

        syncToBackend(async () => {
            await cartService.removeFromCart(user._id, productId, size)
        });
    };

    const updateQuantity = (productId, size, newQuantity) => {
        console.log("DEBUG [CartContext]: Updating quantity", { productId, size, newQuantity });
        dispatch({ type: CART_ACTIONS.SET_QTY, payload: { _id: productId, selectedSize: size, quantity: newQuantity } });

        syncToBackend(async () => {
            await cartService.updateCartItem(user._id, productId, newQuantity, size, null);
        })
    };

    const addToCart = (product, quantity = 1, size = 'M') => {
        dispatch({ type: CART_ACTIONS.ADD, payload: { ...product, quantity, selectedSize: size } });

        syncToBackend(async () => {
            await cartService.addToCart(user._id, product._id, quantity, size);
        });
    };

    const changeItemSize = (productId, quantity, oldSize, newSize,) => {
        dispatch({ type: CART_ACTIONS.CHANGE_SIZE, payload: { _id: productId, oldSize, newSize } });

        syncToBackend(async () => {
            await cartService.updateCartItem(user._id, productId, quantity, newSize, oldSize)
        });
    };

    const clearCart = () => {
        dispatch({ type: CART_ACTIONS.CLEAR })

        syncToBackend(async () => {
            await cartService.clearCart(user._id)
        });
    };

    const value = useMemo(() => ({
        cartItems: state.items,
        total: getTotalPrice(),
        addToCart,
        removeFromCart,
        updateQuantity,
        changeItemSize,
        clearCart,
        getTotalItems,
        getTotalPrice
    }), [state.items]);

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>

};

export function useCart() {

    const context = useContext(CartContext);

    if (!context) throw new Error("useCart must be used within a CartProvider");

    return context;
};
