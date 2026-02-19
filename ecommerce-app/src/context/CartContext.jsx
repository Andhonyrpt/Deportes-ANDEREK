import { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";
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

    // Funciones auxiliares
    const getTotalItems = () => state.items.reduce((sum, i) => sum + i.quantity, 0);
    const getTotalPrice = () => state.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

    // Actualizar localStorage cuando cambie el carrito
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(state.items));

    }, [state.items]);

    useEffect(() => {
        const initializeCart = async () => {
            if (isAuth && user?._id) {
                try {
                    const backendCart = await cartService.getCart(user._id);

                    if (backendCart?.products) {
                        setCartId(backendCart._id);
                        dispatch({ type: CART_ACTIONS.INIT, payload: backendCart.products });
                    }
                } catch (error) {
                    console.error(error);
                }
            } else if (!isAuth) {
                // Si no hay sesión, "reseteamos" todo para el siguiente usuario
                setCartId(null);
                dispatch({ type: CART_ACTIONS.INIT, payload: [] });
            }
        }
        initializeCart();
    }, [isAuth, user?._id]);

    const syncToBackend = async (syncFn) => {
        if (!isAuth) return;
        // Revision aqui porque esto me esta dando false 
        // y no me deja hacer la sincronizacion


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