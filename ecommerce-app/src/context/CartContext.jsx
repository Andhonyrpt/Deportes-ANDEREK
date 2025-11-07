import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {

    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const savedCart = localStorage.getItem("cart");

        if (savedCart) {
            setCartItems(JSON.parse(savedCart));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const removeFromCart = (productId) => {
        setCartItems((prevItems) => prevItems.filter((item) => item._id !== productId));
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        }

        setCartItems((prevItems) =>
            prevItems.map((item) => item._id === productId ?
                { ...item, quantity: newQuantity } : item)
        );
    };

    const addToCart = (product, quantity = 1) => {

        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item._id === product._id);

            if (existingItem) {
                return prevItems.map((item) => item._id === product._id ?
                    { ...item, quantity: item.quantity + quantity } : item);

            } else {
                return [...prevItems, { ...product, quantity }];
            }
        });
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getTotalItems = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    const getTotalPrice = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    }

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>

};

export function useCart() {

    const context = useContext(CartContext);

    if (!context) throw new Error("useCart must be used within a CartProvider");

    return context;
}