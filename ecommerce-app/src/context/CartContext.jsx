import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {

    // Inicializamos el estado con los datos del localStorage directamente
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem("cart");
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // Calcular el total basado en los items del carrito
    const calculateTotal = (items) => {
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

    // Mantener el total actualizado
    const [total, setTotal] = useState(() => {
        const savedCart = localStorage.getItem("cart");
        const items = savedCart ? JSON.parse(savedCart) : [];
        return calculateTotal(items);
    });

    // Actualizar localStorage cuando cambie el carrito
    useEffect(() => {

        localStorage.setItem("cart", JSON.stringify(cartItems));
        setTotal(calculateTotal(cartItems));

    }, [cartItems]);

    const removeFromCart = (itemId) => {
        setCartItems((prevItems) =>
            prevItems.filter((item) => item.itemId !== itemId)
        );
    };

    const updateQuantity = (itemId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(itemId);
            return;
        }

        setCartItems((prevItems) =>
            prevItems.map((item) => item.itemId === itemId ?
                { ...item, quantity: newQuantity } : item)
        );
    };

    const addToCart = (product, quantity = 1, size = 'UNICA') => {

        const itemId = `${product._id}-${size}`;

        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => `${item._id}-${item.selectedSize}` === itemId);

            if (existingItem) {
                return prevItems.map((item) => `${item._id}-${item.selectedSize}` === itemId ?
                    { ...item, quantity: item.quantity + quantity } : item);

            } else {
                return [...prevItems, { ...product, quantity, selectedSize: size }];
            }
        });
    };

    const changeItemSize = (productId, oldSize, newSize) => {

        const oldItemId = `${productId}-${oldSize}`;
        const newItemId = `${productId}-${newSize}`;

        setCartItems((prevItems) => {
            const itemToChange = prevItems.find((item) => `${item._id}-${item.selectedSize}` === oldItemId);
            const existingItemWithNewSize = prevItems.find((item) => `${item._id}-${item.selectedSize}` === newItemId);

            if (!itemToChange) return prevItems;

            const quantityToMove = itemToChange.quantity;

            let updatedItems = prevItems.filter((item) => `${item._id}-${item.selectedSize}` !== oldItemId);

            if (existingItemWithNewSize) {
                return updatedItems.map((item) =>
                    `${item._id}-${item.selectedSize}` === newItemId
                        ? { ...item, quantity: item.quantity + quantityToMove }
                        : item
                );
            } else {
                const updatedItem = {
                    ...itemToChange,
                    itemId: newItemId,
                    selectedSize: newSize,
                };

                return [...updatedItems, updatedItem];
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
        total: getTotalPrice(),
        addToCart,
        removeFromCart,
        updateQuantity,
        changeItemSize,
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