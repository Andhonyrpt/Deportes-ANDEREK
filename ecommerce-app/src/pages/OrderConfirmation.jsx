import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Icon from "../components/common/Icon";
import "./OrderConfirmation.css";
import { getOrderById } from "../services/orderService";


export default function OrderConfirmation() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    // AGREGA ESTA LÍNEA:
    console.log("Datos de la orden recibida:", order);

    useEffect(() => {
        const fetchOrderDetails = async () => {

            if (!id) {
                navigate("/");
                return;
            }
            try {
                const data = await getOrderById(id);
                setOrder(data.order || data); // Ajusta según la estructura de tu respuesta
            } catch (error) {
                console.error("Error al cargar la orden:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [id, navigate]);

    // Utilidad para formatear moneda (MXN)
    const formatMoney = (v) =>
        new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN",
        }).format(v);

    // Pantalla de carga mientras trae los datos
    if (loading) {
        return (
            <div className="order-confirmation">
                <h2>Cargando los detalles de tu compra...</h2>
            </div>
        );
    }

    // Pantalla de error si no encuentra la orden
    if (!order) {
        return (
            <div className="order-confirmation">
                <h2>No pudimos encontrar tu orden.</h2>
                <Link to="/" className="button primary">Volver al inicio</Link>
            </div>
        );
    }

    const address = order.shippingAddress || {};
    const total = order.totalPrice || 0;
    const shipping = order.shippingCost || 0;
    const subtotal = total - shipping; // Total de los productos sin envío
    const tax = subtotal - (subtotal / 1.16); // Cálculo inverso para sacar el IVA aproximado
    const subtotalSinIva = subtotal - tax;
    const orderDate = order.createdAt || order.date ? new Date(order.createdAt || order.date).toLocaleDateString() : "No disponible";
    const itemsList = order.products || order.items || []; // Busca como products o items

    return (
        <div className="order-confirmation">
            <div className="confirmation-content">
                <div className="confirmation-icon">
                    <Icon name="checkCircle" size={64} className="success" />
                </div>
                <h1>¡Gracias por tu compra!</h1>
                <p className="confirmation-message">
                    Tu pedido <strong>#{order._id || "N/A"}</strong> ha sido confirmado y está siendo procesado
                </p>

                <div className="confirmation-details">
                    <h2>Detalles de tu pedido</h2>
                    <div className="order-info">
                        <p><strong>Fecha: </strong>{orderDate}</p>

                        <h3>Productos</h3>
                        <ul className="order-items">
                            {(itemsList).map((item) => {
                                const productDetails = item.productId || item.product || item;
                                const itemName = productDetails.name;
                                const itemPrice = item.price || 0;
                                const itemQuantity = item.quantity || 1;
                                const itemSubtotal = itemPrice * itemQuantity;

                                return (
                                    <li key={item._id}>
                                        {itemName}*{itemQuantity}-{formatMoney(itemPrice)}
                                        <span>{formatMoney(itemSubtotal)}</span>
                                    </li>
                                )
                            })}
                        </ul>

                        <div className="order-totals">
                            <p><strong>Subtotal:</strong>{formatMoney(subtotalSinIva)}</p>
                            <p><strong>IVA:</strong>{formatMoney(tax)}</p>
                            <p><strong>Envio:</strong>{formatMoney(shipping)}</p>
                            <p><strong>Total:</strong>{formatMoney(total)}</p>

                            <p><strong>Dirección de envío:</strong></p>
                            <address>
                                {address.address || "No disponible"}
                                <br />
                                {address.city && address.postalCode ? `${address.city}, ${address.postalCode}` : "Ciudad y código postal no disponibles"}
                                <br />
                                {address.state}, {address.country || "País no especificado"}
                            </address>
                        </div>
                    </div>

                    <p>
                        Hemos enviado un correo electrónico con los detalles de tu compra. También puedes ver el estado de tu pedido ne cualquier momento  desde tu perfil
                    </p>
                </div>

                <div className="confirmation-actions">
                    <Link to="/" className="button primary">
                        <Icon name="home" size={20} />
                        <span>Volver al inicio</span>
                    </Link>
                    <Link to="/orders" className="button secondary">
                        <Icon name="package" size={20} />
                        <span>Ver mis pedidos</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};