import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/common/Button";
import Icon from "../components/common/Icon";
import Loading from "../components/common/Loading/Loading";
import { getMyOrders } from "../services/orderService";
import { useAuth } from "../context/AuthContext";
import "./Orders.css";

const formatMoney = (value = 0) =>
    new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
    }).format(value);

const formDate = (isoString) => {
    if (!isoString) return "Fecha desconocida";

    try {
        return (
            new Date(isoString).toLocaleDateString("es-MX", {
                day: "2-digit", // <--- ¡Solo le quitamos la 's' aquí!
                month: "short",
                year: "numeric"
            })
        );
    } catch (error) {
        return "Fecha inválida";
    }
};

export default function Orders() {
    const { user } = useAuth(); // Obtenemos el usuario autenticado
    const [orders, setOrders] = useState([]);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrders = async () => {
            if (!user?._id) {
                setLoading(false);
                return;
            }

            try {
                const data = await getMyOrders(user._id);
                const fetchedOrders = data?.orders || data || [];

                console.log("ESTO ES LO QUE LLEGA DE MONGO:", fetchedOrders);

                const sortedOrders = [...fetchedOrders].sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );

                setOrders(sortedOrders);
                setSelectedOrderId((current) => current ?? sortedOrders[0]?._id ?? null);
            } catch (error) {
                console.error("Error al cargar pedidos del servidor:", error);
            } finally {
                setLoading(false);
            }

        };

        loadOrders();

    }, [user]);

    const selectedOrder = useMemo(() => orders.find((order) => order._id === selectedOrderId) || null, [orders, selectedOrderId]
    );

    const detailsStatusToken = selectedOrder ? (selectedOrder.status || "confirmed").toLowerCase() : "confirmed";
    const detailsStatusLabel = selectedOrder?.status || "Confirmado";

    if (loading) {
        return (
            <div className="orders-page">
                <Loading>Cargando pedidos guardados...</Loading>
            </div>
        );
    }

    if (!orders.length) {
        return (
            <div className="orders-page orders-empty">
                <Icon name="package" size={48} />
                <h1>No tienes pedidos guardados</h1>
                <p>
                    Cada vez que confirmes una compra en el checkout, la orden se guarda en tu navegador para consultarlo más tarde.
                </p>
                <Link to="/" className="order-link">
                    <Button>Descubrir productos</Button>
                </Link>
            </div>
        );
    }

    const selectedPayment = selectedOrder?.paymentMethod || null;

    const paymentText = () => {
        if (!selectedPayment) return "No seleccionado";

        const lastFour = selectedPayment.cardNumber?.slice(-4);
        const type = selectedPayment.type;

        if (type === 'credit_card') return `Tarjeta de Crédito **** ${lastFour}`;
        if (type === 'debit_card') return `Tarjeta de Débito **** ${lastFour}`;
        if (type === 'paypal') return `PayPal (${selectedPayment.paypalEmail})`;
        if (type === 'bank_transfer') return `Transferencia Bancaria (${selectedPayment.bankName})`;

        return type; // Por si es 'paypal' o 'efectivo'
    };

    const totalOrderPrice = selectedOrder?.totalPrice || 0;
    const shippingPrice = selectedOrder?.shippingCost || 0;
    const calculatedSubtotal = useMemo(() => {
        return selectedOrder?.subtotal || ((totalOrderPrice - shippingPrice) / 1.16);
    }, [selectedOrder, totalOrderPrice, shippingPrice]);

    const calculatedTax = useMemo(() => {
        return selectedOrder?.tax || ((totalOrderPrice - shippingPrice) - calculatedSubtotal);
    }, [selectedOrder, totalOrderPrice, shippingPrice, calculatedSubtotal]);

    return (
        <div className="orders-page">
            <div className="orders-header">
                <div>
                    <p className="eyebrow">Historial de compras</p>
                    <h1>Mis pedidos</h1>
                    <p className="muted">
                        {orders.length === 1 ? "Tienes 1 pedido registrado" : `Tienes ${orders.length} pedidos registrados `
                        }
                    </p>
                </div>
                <Button
                    variant="secondary"
                    onClick={() => setSelectedOrderId(orders[0]?._id ?? null)}
                >
                    Ver más reciente
                </Button>
            </div>

            <div className="orders-content">
                <div className="orders-list card">
                    <div className="orders-list-header">
                        <h2>Pedidos</h2>
                        <span>{orders.length}</span>
                    </div>

                    <div className="orders-list-body">
                        {orders.map((order) => {
                            const itemCount = order.products?.length || 0;
                            const statusToken = (order.status || "confirmed").toLowerCase();
                            const isActive = selectedOrderId === order._id;
                            return (
                                <button
                                    key={order._id}
                                    className={`order-card${isActive ? "-active" : ""}`}
                                    onClick={() => setSelectedOrderId(order._id)}
                                    data-testid={`order-card-${order._id}`}
                                >
                                    <div className="order-card-head">
                                        <span className="order-id">#{order._id}</span>
                                        <span className={`order-status order-status-${statusToken}`}
                                        >
                                            {order.status || "Confirmado"}
                                        </span>
                                    </div>

                                    <p className="order-date">
                                        {formDate(order.createdAt || order.date)}
                                    </p>

                                    <div className="order-card-meta">
                                        <span>{itemCount} artículos</span>
                                        <strong>{formatMoney(order.totalPrice || 0)}</strong>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="orders-detail-card">
                    {selectedOrder ? (
                        <div data-testid="order-detail-container">
                            <div className="order-detail-header">
                                <div>
                                    <p className="eyebrow"><strong>Pedido: </strong> #{selectedOrder._id}</p>
                                    <h2>{formatMoney(selectedOrder.totalPrice || 0)}</h2>
                                    <p className="muted">{formDate(selectedOrder?.createdAt || selectedOrder.date)}</p>
                                </div>
                                <span className={`order-status order-status-${detailsStatusToken}`}
                                >
                                    {detailsStatusLabel}
                                </span>
                            </div>

                            <div className="order-section">
                                <h3>Resumen del pago</h3>
                                <ul className="order-summary-list">
                                    <li>
                                        <span>Subtotal</span>
                                        <strong>{formatMoney(calculatedSubtotal)}</strong>
                                    </li>
                                    <li>
                                        <span>IVA</span>
                                        <strong>{formatMoney(calculatedTax)}</strong>
                                    </li>
                                    <li>
                                        <span>Envío</span>
                                        <strong>
                                            {selectedOrder.shippingCost === 0 || selectedOrder.shipping === 0
                                                ? "Gratis"
                                                : formatMoney(shippingPrice)}
                                        </strong>
                                    </li>
                                    <li className="order-summary-total" data-testid="order-summary-total">
                                        <span>Total</span>
                                        <strong>{formatMoney(totalOrderPrice)}</strong>
                                    </li>
                                </ul>
                            </div>

                            <div className="order-section">
                                <h3>Dirección de envío</h3>
                                {selectedOrder?.shippingAddress ? (
                                    <address className="order-address">
                                        <strong>{selectedOrder.shippingAddress.address}</strong>
                                        <p>
                                            {selectedOrder.shippingAddress.city},{" "}
                                            {selectedOrder.shippingAddress.postalCode}
                                        </p>
                                        <p>
                                            {selectedOrder.shippingAddress.state},{" "}
                                            {selectedOrder.shippingAddress.country}
                                        </p>
                                    </address>
                                ) : (
                                    <p className="muted">Sin dirección registrada.</p>
                                )}
                            </div>

                            <div className="order-section">
                                <h3>Método de pago</h3>
                                {selectedOrder?.paymentMethod ? (
                                    <div>
                                        <p>{paymentText()}</p>
                                    </div>
                                ) : (
                                    <p className="muted">Sin método de pago registrado.</p>
                                )}
                            </div>

                            <div className="order-section">
                                <h3>Productos</h3>
                                <ul className="order-items">
                                    {selectedOrder.products?.map((item, index) => (
                                        <li key={`${selectedOrder.id}-${item.id || index}`}>
                                            <div>
                                                <p>{item.name || item.title || "Producto"}</p>
                                                <span>
                                                    Cantidad: {item.quantity || 1} · Precio:{" "}
                                                    {formatMoney(item.price || 0)}
                                                </span>
                                            </div>
                                            <strong>
                                                {formatMoney(
                                                    item.subtotal ||
                                                    (item.price || 0) * (item.quantity || 1)
                                                )}
                                            </strong>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                        </div>
                    ) : (
                        <div className="orders-empty">
                            <h3>Selecciona un pedido de la lista</h3>
                            <p className="muted">
                                Aquí verás el detalle completo: productos, dirección y método de
                                pago utilizados.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};