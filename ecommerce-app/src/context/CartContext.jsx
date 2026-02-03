import { createContext, useContext, useState, useEffect, useMemo, useReducer } from "react";
import { CART_ACTIONS, cartInitialState, cartReducer } from "./cartReducer";

const CartContext = createContext();

export function CartProvider({ children }) {

    const [state, dispatch] = useReducer(cartReducer, cartInitialState);

    // Funciones auxiliares
    const getTotalItems = () => state.items.reduce((sum, i) => sum + i.quantity, 0);
    const getTotalPrice = () => state.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

    // Actualizar localStorage cuando cambie el carrito
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(state.items));

    }, [state.items]);

    const removeFromCart = (productId, size) => {
        dispatch({ type: CART_ACTIONS.REMOVE, payload: { _id: productId, selectedSize: size } });

    };

    const updateQuantity = (productId, size, newQuantity) => {
        dispatch({ type: CART_ACTIONS.SET_QTY, payload: { _id: productId, selectedSize: size, quantity: newQuantity } });

    };

    const addToCart = (product, quantity = 1, size = 'UNICA') => {
        dispatch({ type: CART_ACTIONS.ADD, payload: { ...product, quantity, selectedSize: size } });

    };

    const changeItemSize = (productId, oldSize, newSize) => {
        dispatch({ type: CART_ACTIONS.CHANGE_SIZE, payload: { _id: productId, oldSize, newSize } });

    };

    const clearCart = () => {
        dispatch({ type: CART_ACTIONS.CLEAR })
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