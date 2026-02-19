export const CART_ACTIONS = {
    INIT: "CART_INIT",
    ADD: "CART_ADD",
    REMOVE: "CART_REMOVE",
    SET_QTY: "CART_SET_QTY",
    CHANGE_SIZE: "CART_CHANGE_SIZE",
    CLEAR: "CART_CLEAR",
};

export const cartInitialState = {
    items: (() => {
        try {
            return JSON.parse(localStorage.getItem("cart")) || [];
        } catch {
            return [];
        }
    })(),
};

export function cartReducer(state, action) {
    switch (action.type) {
        case CART_ACTIONS.INIT: {
            const items = action.payload || [];
            return { ...state, items }
        }
        case CART_ACTIONS.ADD: {
            const p = action.payload; //{id,name,price,image,}
            const exists = state.items.find((i) => i._id === p._id && i.selectedSize === p.selectedSize);
            const items = exists
                ? state.items.map((i) => i._id === p._id && i.selectedSize === p.selectedSize ?
                    { ...i, quantity: i.quantity + (p.quantity || 1) }
                    : i)
                : [...state.items, { ...p, quantity: p.quantity || 1 }];
            return { ...state, items };
        }
        case CART_ACTIONS.REMOVE: {
            const { _id, selectedSize } = action.payload;
            return { ...state, items: state.items.filter((i) => !(i._id === _id && i.selectedSize === selectedSize)) };
        }
        case CART_ACTIONS.CHANGE_SIZE: {
            const { _id, oldSize, newSize } = action.payload;

            const itemToChange = state.items.find((i) => i._id === _id && i.selectedSize === oldSize);
            if (!itemToChange) return state;

            // Filtrar el carrito (quitamos el viejo)
            let remainingItems = state.items.filter((i) => !(i._id === _id && i.selectedSize === oldSize));

            // Ver si ya hay uno con la NUEVA talla para sumar cantidades
            const existingWithNewSize = remainingItems.find((i) => i._id === _id && i.selectedSize === newSize);

            if (existingWithNewSize) {
                return {
                    ...state,
                    items: remainingItems.map((i) => i._id === _id && i.selectedSize === newSize
                        ? { ...i, quantity: i.quantity + itemToChange.quantity }
                        : i)
                };
            }

            // Si no existe la nueva talla, solo actualizamos el que quitamos y lo reinsertamos
            return {
                ...state,
                items: [...remainingItems, { ...itemToChange, selectedSize: newSize }]
            };
        }
        case CART_ACTIONS.SET_QTY: {
            const { _id, selectedSize, quantity } = action.payload;
            const q = Math.max(1, quantity);
            return {
                ...state,
                items: state.items.map((i) => (i._id === _id && i.selectedSize === selectedSize
                    ? { ...i, quantity: q }
                    : i))
            }
        }
        case CART_ACTIONS.CLEAR: {
            return { ...state, items: [] };
        }
        default:
            return state;
    }
};