import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CartView from "../components/Cart/CartView";
import AddressForm from "../components/Checkout/Address/AddressForm";
import AddressList from "../components/Checkout/Address/AddressList";
import PaymentForm from "../components/Checkout/Payment/PaymentForm";
import PaymentList from "../components/Checkout/Payment/PaymentList";
import SummarySection from "../components/Checkout/shared/SummarySection.jsx";
import Button from "../components/common/Button";
import ErrorMessage from "../components/common/ErrorMessage/ErrorMessage";
import Loading from "../components/common/Loading/Loading";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import {
    getShippingAddresses,
    createShippingAddress,
    deleteShippingAddress
} from "../services/shippingService.js";
import {
    getPaymentMethods,
    createPaymentMethod,
    deletePaymentMethod
} from "../services/paymentService.js";
import { createOrder, previewOrder } from "../services/orderService.js";
import "./Checkout.css";

export default function Checkout() {
    const navigate = useNavigate();
    const { cartItems, total, clearCart } = useCart();
    const { user } = useAuth();

    // Estado para cálculos del servidor
    const [preview, setPreview] = useState({
        subtotal: 0,
        tax: 0,
        shippingCost: 0,
        total: 0
    });

    const subtotal = preview.subtotal;
    const taxAmount = preview.tax;
    const shippingCost = preview.shippingCost;
    const grandTotal = preview.total;

    const formatMoney = (v) =>
        new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN",
        }).format(v);

    // Flag para evitar redirecciones automáticas cuando estamos confirmando la compra
    const suppressRedirect = useRef(false);

    // Efecto para redirigir si no hay productos
    useEffect(() => {
        // Log para debug de redirección
        console.log("Checkout Check: cartItems", cartItems?.length, "suppress", suppressRedirect.current);

        if (!suppressRedirect.current && (!cartItems || cartItems.length === 0)) {
            // navigate("/cart"); // Comentado temporalmente para dump de estado en test
        }

        // Cargar previsualización desde el servidor
        if (cartItems?.length > 0) {
            const getPreview = async () => {
                try {
                    const products = cartItems.map(item => {
                        const p = item.product || item;
                        return {
                            productId: p._id,
                            quantity: item.quantity,
                            size: item.selectedSize || "M"
                        };
                    });
                    const data = await previewOrder(products);
                    if (data) setPreview(data);
                } catch (err) {
                    console.error("Checkout: Error loading preview", err);
                }
            };
            getPreview();
        }
    }, [cartItems, navigate]);

    // Estados para direcciones y métodos de pago
    const [addresses, setAddresses] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loadingLocal, setLoadingLocal] = useState(true);
    const [localError, setLocalError] = useState(null);

    // Estados para selección y formularios
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [addressSectionOpen, setAddressSectionOpen] = useState(true);
    const [paymentSectionOpen, setPaymentSectionOpen] = useState(true);

    // Cargar datos al montar
    useEffect(() => {
        // Solo cargar si estamos autenticados y no estamos cargando el perfil globalmente
        if (!user?._id) return;

        const loadData = async () => {
            console.log("Checkout: Iniciando carga de datos para usuario", user._id);
            setLoadingLocal(true);
            try {
                const [addrRes, payRes] = await Promise.all([
                    getShippingAddresses(),
                    getPaymentMethods(user._id)
                ]);

                // getShippingAddresses devuelve { message, addresses: [...] }
                const addrList = addrRes?.addresses || (Array.isArray(addrRes) ? addrRes : []);
                // getPaymentMethods devuelve un array directo (no envuelto)
                const payList = Array.isArray(payRes) ? payRes : (payRes?.paymentMethods || []);

                console.log("Checkout: Direcciones recibidas", addrList);
                console.log("Checkout: Pagos recibidos", payList);
                
                // DEBUG: log variables de estado
                console.log("DEBUG [Checkout]: addresses.length:", addrList.length);

                setAddresses(addrList);
                setPayments(payList);

                // Seleccionar defaults
                const defAddr = addrList?.find(a => a.isDefault) || addrList?.[0] || null;
                const defPay = payList?.find(p => p.isDefault) || payList?.[0] || null;

                setSelectedAddress(defAddr);
                setSelectedPayment(defPay);
                setAddressSectionOpen(!defAddr);
                setPaymentSectionOpen(!defPay);
            } catch (err) {
                console.error("Checkout loadData error:", err);
                setLocalError("Error al cargar datos del perfil");
            } finally {
                setLoadingLocal(false);
            }
        };

        loadData();
    }, [user?._id]);

    const handleRetry = () => window.location.reload();

    // Manejadores de Dirección
    const handleAddressToggle = () => {
        setShowAddressForm(false);
        setAddressSectionOpen(prev => !prev);
    };

    const handleAddressSubmit = async (formData) => {
        try {
            setLoadingLocal(true);
            await createShippingAddress({ ...formData, isDefault: addresses.length === 0 });
            const updated = await getShippingAddresses();
            console.log("Checkout: Actualización tras dirección", updated);

            const addrList = updated?.addresses || (Array.isArray(updated) ? updated : null);
            if (addrList && Array.isArray(addrList) && addrList.length > 0) {
                setAddresses(addrList);
                setSelectedAddress(addrList[addrList.length - 1]);
                setAddressSectionOpen(false);
                setShowAddressForm(false);
            } else if (addrList && addrList.length === 0) {
                // Si explícitamente es 0, lo dejamos así 
                setAddresses([]);
            }
            // Si addrList es null (ej: 304 fallido), NO limpiamos el estado previo
        } catch (err) {
            setLocalError("Error al guardar la dirección");
        } finally {
            setLoadingLocal(false);
        }
    };

    const handleAddressDelete = async (id) => {
        try {
            await deleteShippingAddress(id);
            const updated = await getShippingAddresses();
            const addrList = updated?.addresses || updated || [];
            if (Array.isArray(addrList)) {
                setAddresses(addrList);
                if (selectedAddress?._id === id) setSelectedAddress(addrList[0] || null);
            }
        } catch (err) {
            setLocalError("Error al eliminar la dirección");
        }
    };

    // Manejadores de Pago
    const handlePaymentToggle = () => {
        setShowPaymentForm(false);
        setPaymentSectionOpen(prev => !prev);
    };

    const handlePaymentSubmit = async (formData) => {
        try {
            setLoadingLocal(true);
            await createPaymentMethod({ ...formData, user: user._id, isDefault: payments.length === 0 });
            const updated = await getPaymentMethods(user._id);
            console.log("Checkout: Actualización tras pago", updated);

            const payList = Array.isArray(updated) ? updated : (updated?.paymentMethods || null);
            if (payList && Array.isArray(payList) && payList.length > 0) {
                setPayments(payList);
                setSelectedPayment(payList[payList.length - 1]);
                setPaymentSectionOpen(false);
                setShowPaymentForm(false);
            } else if (payList && payList.length === 0) {
                setPayments([]);
            }
        } catch (err) {
            setLocalError("Error al guardar el método de pago");
        } finally {
            setLoadingLocal(false);
        }
    };

    const handlePaymentDelete = async (id) => {
        try {
            await deletePaymentMethod(id);
            const updated = await getPaymentMethods(user._id);
            const payList = updated?.paymentMethods || updated || [];
            if (Array.isArray(payList)) {
                setPayments(payList);
                if (selectedPayment?._id === id) setSelectedPayment(payList[0] || null);
            }
        } catch (err) {
            setLocalError("Error al eliminar el pago");
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddress || !selectedPayment || !cartItems.length) return;

        try {
            setLoadingLocal(true);
            const orderData = {
                user: user._id,
                products: cartItems.map(item => {
                    const p = item.product || item;
                    return {
                        productId: p._id,
                        quantity: item.quantity,
                        price: p.price,
                        size: item.selectedSize || "M"
                    };
                }),
                shippingAddress: selectedAddress._id,
                paymentMethod: selectedPayment._id,
                shippingCost: shippingCost,
                total: grandTotal
            };

            const response = await createOrder(orderData);

            if (response) {
                suppressRedirect.current = true;
                await clearCart();

                // 1. Obtenemos el ID exacto que nos devolvió el servidor
                const orderId = response.order?._id || response._id;

                // 2. Navegamos enviando el ID por la URL (Ej: /order-confirmation/65abcd1234...)
                navigate(`/order-confirmation/${orderId}`);
            }
        } catch (err) {
            setLocalError("Error al procesar la orden");
        } finally {
            setLoadingLocal(false);
        }
    };

    if (loadingLocal && !addresses.length && !payments.length) {
        return (
            <div className="checkout-loading">
                <Loading message="Sincronizando con el servidor..." />
            </div>
        );
    }

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

    return (
        <div className="checkout-container">
            {localError && <ErrorMessage message={localError} />}
            <div data-testid="debug-checkout" style={{ display: 'none' }}>
                Addresses Length: {addresses?.length},
                Selected Address ID: {selectedAddress?._id || 'none'},
                Address Name: {selectedAddress?.name || 'none'}
            </div>

            <div className="checkout-left">
                <SummarySection
                    title="1. Dirección de envío"
                    selected={selectedAddress}
                    summaryContent={
                        <div className="selected-address">
                            <p>{selectedAddress?.name}</p>
                            <p>{selectedAddress?.address}</p>
                            <p>{selectedAddress?.city}, {selectedAddress?.postalCode}</p>
                        </div>
                    }
                    isExpanded={showAddressForm || addressSectionOpen || !selectedAddress}
                    onToggle={handleAddressToggle}
                >
                    {!showAddressForm ? (
                        <AddressList
                            addresses={addresses}
                            selectedAddress={selectedAddress}
                            onSelect={(addr) => { setSelectedAddress(addr); setAddressSectionOpen(false); }}
                            onDelete={handleAddressDelete}
                            onAdd={() => setShowAddressForm(true)}
                        />
                    ) : (
                        <AddressForm
                            onSubmit={handleAddressSubmit}
                            onCancel={() => setShowAddressForm(false)}
                        />
                    )}
                </SummarySection>

                <SummarySection
                    title="2. Método de pago"
                    selected={selectedPayment}
                    summaryContent={
                        <div className="selected-payment">
                            <p><strong>{selectedPayment?.bankName}</strong></p>
                            <p>**** {selectedPayment?.cardNumber?.slice(-4)}</p>
                        </div>
                    }
                    isExpanded={showPaymentForm || paymentSectionOpen || !selectedPayment}
                    onToggle={handlePaymentToggle}
                >
                    {!showPaymentForm ? (
                        <PaymentList
                            paymentMethods={payments}
                            selectedPayment={selectedPayment}
                            onSelect={(pay) => { setSelectedPayment(pay); setPaymentSectionOpen(false); }}
                            onDelete={handlePaymentDelete}
                            onAdd={() => setShowPaymentForm(true)}
                        />
                    ) : (
                        <PaymentForm
                            onSubmit={handlePaymentSubmit}
                            onCancel={() => setShowPaymentForm(false)}
                        />
                    )}
                </SummarySection>

                <SummarySection title="3. Revisa tu pedido" selected={true} isExpanded={true}>
                    <CartView />
                </SummarySection>
            </div>

            <div className="checkout-right">
                <div className="checkout-summary">
                    <h3>Resumen de la Orden</h3>
                    <div className="summary-details">
                        <p>
                            <strong>Dirección de envío:</strong> {selectedAddress?.address}
                        </p>
                        <p>
                            <strong>Método de pago:</strong> {paymentText()}
                        </p>
                        <div className="order-costs">
                            <p><strong data-testid="summary-subtotal">Subtotal:</strong> {formatMoney(subtotal)}</p>
                            <p><strong data-testid="summary-tax">IVA:</strong> {formatMoney(taxAmount)}</p>
                            <p><strong data-testid="summary-shipping">Envío:</strong> {shippingCost === 0 ? "Gratis" : formatMoney(shippingCost)}</p>
                            <hr />
                            <p><strong data-testid="summary-total">Total:</strong> {formatMoney(grandTotal)}</p>
                        </div>
                    </div>
                    <Button
                        className="pay-button"
                        data-testid="pay-button"
                        disabled={!selectedAddress || !selectedPayment || !cartItems.length || loadingLocal}
                        onClick={handlePlaceOrder}
                    >
                        {loadingLocal ? "Procesando..." : "Confirmar y Pagar"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
