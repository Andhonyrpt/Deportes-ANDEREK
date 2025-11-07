import { useCart } from "../../context/CartContext";
import Button from "../common/Button";
import Icon from "../common/Icon";

export default function CartView() {

    const {
        cartItems,
        removeFromCart,
        updateQuantity
    } = useCart();

    return (
        <>
            {cartItems && cartItems.map((item) => (
                <div className="cart-item" key={item._id}>

                    <div className="cart-item-image">
                        <img src={item.imagesUrl[0]} alt={item.name} />
                    </div>

                    <div className="cart-item-info">
                        <h3>{item.name}</h3>
                        <p className="cart-item-price">{`$${(item.price).toFixed(2)}`}</p>
                    </div>

                    <div className="cart-item-quantity">
                        <Button variant="secondary"
                            size="sm"
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        >
                            <Icon name="minus" size={15}></Icon>
                        </Button>
                        <span>{item.quantity}</span>
                        <Button variant="secondary"
                            size="sm"
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        >
                            <Icon name="plus" size={15}></Icon>
                        </Button>
                    </div>

                    <div className="cart-item-total">
                        ${(item.price * item.quantity).toFixed(2)}
                    </div>

                    <Button size="sm"
                        onClick={() => removeFromCart(item._id)}
                    >
                        <Icon name="trash" size={15}></Icon>
                        Eliminar del carrito
                    </Button>
                </div>
            ))}
        </>
    );
};