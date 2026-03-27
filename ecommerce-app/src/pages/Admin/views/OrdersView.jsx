import { useState, useEffect } from "react";
import {
    getAllOrders,
    updateOrderStatusAdmin
} from "../../../services/orderService";
import Button from "../../../components/common/Button/Button";
import Loading from "../../../components/common/Loading/Loading";
import ErrorMessage from "../../../components/common/ErrorMessage/ErrorMessage";
import "./OrdersView.css";

export default function OrdersView() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await getAllOrders();
            setOrders(data?.orders || data || []);
        } catch (err) {
            setError("Error al cargar órdenes");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, status) => {
        try {
            await updateOrderStatusAdmin(orderId, status);
            loadOrders();
        } catch (err) {
            setError("Error al actualizar estado");
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="orders-view">
            <div className="orders-header">
                <h2>Monitor de Órdenes</h2>
                <Button onClick={loadOrders}>Refrescar</Button>
            </div>

            {error && <ErrorMessage message={error} />}

            <div className="orders-table-container">
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Usuario</th>
                            <th>Fecha</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order._id}>
                                <td>{order._id.slice(-6)}</td>
                                <td>{order.user?.displayName || "N/A"}</td>
                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td style={{ fontWeight: '700' }}>${order.totalPrice}</td>
                                <td>
                                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td>
                                    <select
                                        value={order.status}
                                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                        disabled={order.status === 'delivered' || order.status === 'cancelled'}
                                    >
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
