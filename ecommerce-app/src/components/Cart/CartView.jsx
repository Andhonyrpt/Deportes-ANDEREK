import { useCart } from "../../context/CartContext";
import Button from "../common/Button";
import Icon from "../common/Icon";

export default function CartView() {
    
    const {
        cartItems,
        removeFromCart,
        updateQuantity,
        changeItemSize,
        getTotalItems
    } = useCart();

    return (

        <div className="cart-view" data-testid="cart-container">

            <div className="cart-view-header">
                <h2>
                    {getTotalItems()} {getTotalItems() === 1 ? "artículo" : "artículos"}
                </h2>
            </div>

            {cartItems && cartItems.map((item, index) => {
                const p = item.product || item;
                const currentSize = item.size || item.selectedSize;
                const currentItemId = `${p._id}-${currentSize}`;
                
                // ... rest of the component ...
                const currentVariant = p.variants?.find((v) => v.size === currentSize);
                const availableStock = currentVariant ? currentVariant.stock : 0;

                const itemPrice = p?.price || 0;
                const itemQuantity = item?.quantity || 0;
                const totalItem = itemPrice * itemQuantity;

                return (
                    <div className="cart-item" key={currentItemId} data-testid={`cart-item-${currentItemId}`}>

                        <div className="cart-item-image">
                            <img src={p?.imagesUrl?.[0] || 'https://via.placeholder.com/150'} alt={p?.name || 'Producto'} loading="lazy" />
                        </div>

                        <div className="cart-item-info">
                            <h3>{p?.name || 'Producto'}</h3>
                            {p.variants && p.variants.length > 0 && (
                                <div className="cart-item-size-selector">
                                    <label htmlFor={`size-select-${currentItemId}`}
                                    >
                                        Talla
                                    </label>
                                    <select
                                        id={`size-select-${currentItemId}`}
                                        value={currentSize}
                                        onChange={(e) => {
                                            const newSize = e.target.value;
                                            changeItemSize(p._id, item.quantity, currentSize, newSize);
                                        }}
                                    >
                                        {p.variants.map(variant => (
                                            <option
                                                key={variant.size}
                                                value={variant.size}
                                                disabled={variant.stock === 0 && variant.size !== currentSize}
                                            >
                                                {variant.size} {variant.stock === 0 ? "(Agotada)" : ""}
                                            </option>
                                        ))}
                                        {!p.variants.some(v => v.size === currentSize) && currentSize === 'UNICA' && (
                                            <option value="UNICA">Única</option>
                                        )}
                                    </select>
                                </div>
                            )}
                            <p className="cart-item-price">{`$${(p?.price || 0).toFixed(2)}`}</p>
                        </div>

                        <div className="cart-item-quantity">
                            <Button variant="secondary"
                                size="sm"
                                onClick={() => updateQuantity(p._id, currentSize, item.quantity - 1)}
                                data-testid="quantity-decrement"
                            >
                                <Icon name="minus" size={15}></Icon>
                            </Button>
                            <span data-testid="quantity-value">{item.quantity}</span>
                            <Button variant="secondary"
                                size="sm"
                                onClick={() => {
                                    if (item.quantity < availableStock) {
                                        updateQuantity(p._id, currentSize, item.quantity + 1)
                                    }
                                }}
                                disabled={item.quantity >= availableStock}// Se bloquea si llega al límite
                                data-testid="quantity-increment"
                            >
                                <Icon name="plus" size={15}></Icon>
                            </Button>
                        </div>

                        <div className="cart-item-total" data-testid="item-total">
                            ${totalItem.toFixed(2)}
                        </div>

                        <Button variant="ghost" className="danger" size="sm"
                            onClick={() => removeFromCart(p._id, currentSize,)}
                            title="Eliminar articulo"
                            data-testid="remove-item"
                        >
                            <Icon name="trash" size={15}></Icon>
                        </Button>
                    </div>
                )
            })}
        </div>
    );
};