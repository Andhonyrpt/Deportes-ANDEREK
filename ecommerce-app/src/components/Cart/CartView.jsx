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

        <div className="cart-view">

            <div className="cart-view-header">
                <h2>
                    {getTotalItems()} {getTotalItems() === 1 ? "artículo" : "artículos"}
                </h2>
            </div>

            {cartItems && cartItems.map((item) => {
                const p = item.product || item;
                const currentSize = item.size || item.selectedSize;
                const currentItemId = `${p._id}-${currentSize}`;
                const currentVariant = p.variants?.find((v) => v.size === currentSize);
                const availableStock = currentVariant ? currentVariant.stock : 0;

                const itemPrice = p?.price || 0;
                const itemQuantity = item?.quantity || 0;
                const totalItem = itemPrice * itemQuantity;

                return (
                    <div className="cart-item" key={currentItemId}>

                        <div className="cart-item-image">
                            <img src={p.imagesUrl[0]} alt={p.name} loading="lazy" />
                        </div>

                        <div className="cart-item-info">
                            <h3>{p.name}</h3>
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
                            <p className="cart-item-price">{`$${(p.price).toFixed(2)}`}</p>
                        </div>

                        <div className="cart-item-quantity">
                            <Button variant="secondary"
                                size="sm"
                                onClick={() => updateQuantity(p._id, currentSize, item.quantity - 1)}
                            >
                                <Icon name="minus" size={15}></Icon>
                            </Button>
                            <span>{item.quantity}</span>
                            <Button variant="secondary"
                                size="sm"
                                onClick={() => {
                                    if (item.quantity < availableStock) {
                                        updateQuantity(p._id, currentSize, item.quantity + 1)
                                    }
                                }}
                                disabled={item.quantity >= availableStock}// Se bloquea si llega al límite
                            >
                                <Icon name="plus" size={15}></Icon>
                            </Button>
                        </div>

                        <div className="cart-item-total">
                            ${totalItem.toFixed(2)}
                        </div>

                        <Button variant="ghost" className="danger" size="sm"
                            onClick={() => removeFromCart(p._id, currentSize,)}
                            title="Eliminar articulo"
                        >
                            <Icon name="trash" size={15}></Icon>
                        </Button>
                    </div>
                )
            })}
        </div>
    );
};