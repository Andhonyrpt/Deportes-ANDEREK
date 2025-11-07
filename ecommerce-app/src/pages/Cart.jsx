import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import Button from '../components/common/Button';
import Icon from "../components/common/Icon";
import CartView from "../components/Cart/CartView";
import './Cart.css';

export default function Cart() {

    const {
        cartItems,
        clearCart,
        getTotalItems,
        getTotalPrice
    } = useCart();

    const navigate = useNavigate();

    if (cartItems.length === 0) {
        return (
            <div className="cart-empty">
                <Icon name="shopping-cart" size="small"></Icon>
                <h2>Tu carrito está vacío</h2>
                <p>Agrega algunos productos para empezar a comprar</p>
                <Button to="/" variant="primary">Continuar comprando</Button>
            </div>
        );
    }

    return (
        <div className="cart">
            <div className="cart-header">
                <Icon name="cart" size={50}></Icon>
                <h2>Carrito de Compras</h2>
                <span>{`Tu carrito tiene ${getTotalItems()} articulo(s)`}</span>{""}
                <Button variant="primary" size="sm"
                    onClick={clearCart}
                >
                    Limpiar carrito
                </Button>
            </div>

            <div className="cart-items">
                <CartView />

                <div className="cart-summary">
                    <div className="cart-total">
                    <h2>Total: ${getTotalPrice().toFixed(2)}</h2>
                </div>

                <Button variant="primary"
                    onClick={() => navigate("/orders")}
                    size="md"
                >
                    Proceder al pago
                </Button>
                </div>
            </div>
        </div>
    );
}