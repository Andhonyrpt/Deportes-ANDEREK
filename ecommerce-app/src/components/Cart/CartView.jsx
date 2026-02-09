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
                const currentItemId = `${item._id}-${item.selectedSize}`;
                const currentVariant = item.variants?.find((v) => v.size === item.selectedSize);
                const availableStock = currentVariant ? currentVariant.stock : 0;

                return (
                    <div className="cart-item" key={currentItemId}>

                        <div className="cart-item-image">
                            <img src={item.imagesUrl[0]} alt={item.name} loading="lazy" />
                        </div>

                        <div className="cart-item-info">
                            <h3>{item.name}</h3>
                            {item.variants && item.variants.length > 0 && (
                                <div className="cart-item-size-selector">
                                    <label htmlFor={`size-select-${currentItemId}`}
                                    >
                                        Talla
                                    </label>
                                    <select
                                        id={`size-select-${currentItemId}`}
                                        value={item.selectedSize}
                                        onChange={(e) => {
                                            const newSize = e.target.value;
                                            changeItemSize(item._id, item.selectedSize, newSize);
                                        }}
                                    >
                                        {item.variants.map(variant => (
                                            <option
                                                key={variant.size}
                                                value={variant.size}
                                                disabled={variant.stock === 0 && variant.size !== item.selectedSize}
                                            >
                                                {variant.size} {variant.stock === 0 ? "(Agotada)" : ""}
                                            </option>
                                        ))}
                                        {!item.variants.some(v => v.size === item.selectedSize) && item.selectedSize === 'UNICA' && (
                                            <option value="UNICA">Única</option>
                                        )}
                                    </select>
                                </div>
                            )}
                            <p className="cart-item-price">{`$${(item.price).toFixed(2)}`}</p>
                        </div>

                        <div className="cart-item-quantity">
                            <Button variant="secondary"
                                size="sm"
                                onClick={() => updateQuantity(item._id, item.selectedSize, item.quantity - 1)}
                            >
                                <Icon name="minus" size={15}></Icon>
                            </Button>
                            <span>{item.quantity}</span>
                            <Button variant="secondary"
                                size="sm"
                                onClick={() => {
                                    if (item.quantity < availableStock) {
                                        updateQuantity(item._id, item.selectedSize, item.quantity + 1)
                                    }
                                }}
                                disabled={item.quantity >= availableStock}// Se bloquea si llega al límite
                            >
                                <Icon name="plus" size={15}></Icon>
                            </Button>
                        </div>

                        <div className="cart-item-total">
                            ${(item.price * item.quantity).toFixed(2)}
                        </div>

                        <Button variant="ghost" className="danger" size="sm"
                            onClick={() => removeFromCart(item._id, item.selectedSize,)}
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