import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CartView from "../components/Cart/CartView";
import AddressForm from "../components/Checkout/Address/AddressForm";
import AddressList from "../components/Checkout/Address/AddressList";
import PaymentForm from "../components/Checkout/Payment/PaymentForm";
import PaymentList from "../components/Checkout/Payment/PaymentList";
import SummarySection from "../components/Checkout/shared/SummarySection.jsx";
import Button from "../components/common/Button/Button";
import ErrorMessage from "../components/common/ErrorMessage/ErrorMessage";
import Loading from "../components/common/Loading/Loading";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatPaymentMethod } from "../utils/paymentText";
import useCheckout from "../hooks/useCheckout";
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

    const [isProcessingOrder, setIsProcessingOrder] = useState(false);

    const subtotal = preview.subtotal;
    const taxAmount = preview.tax;
    const shippingCost = preview.shippingCost;
    const grandTotal = preview.total;

    const formatMoney = (v) =>
        new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN",
        }).format(v);

    const suppressRedirect = useRef(false);

    useEffect(() => {
        if (!suppressRedirect.current && (!cartItems || cartItems.length === 0)) {
            navigate("/cart");
        }

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

    const {
        addresses,
        payments,
        loadingLocal,
        localError: hookError,
        selectedAddress,
        setSelectedAddress,
        selectedPayment,
        setSelectedPayment,
        showAddressForm,
        setShowAddressForm,
        showPaymentForm,
        setShowPaymentForm,
        addressSectionOpen,
        setAddressSectionOpen,
        paymentSectionOpen,
        setPaymentSectionOpen,
        editingAddress,
        setEditingAddress,
        editingPayment,
        setEditingPayment,
        handleAddressToggle,
        handleAddressSubmit,
        handleAddressDelete,
        handleAddressEditStart,
        handleAddressSetDefault,
        handlePaymentToggle,
        handlePaymentSubmit,
        handlePaymentDelete,
        handlePaymentEditStart,
        handlePaymentSetDefault
    } = useCheckout(user);

    const [localError, setLocalError] = useState(null);

    useEffect(() => {
        if (hookError) setLocalError(hookError);
    }, [hookError]);

    const handlePlaceOrder = async () => {
        if (!selectedAddress || !selectedPayment || !cartItems.length) return;

        try {
            setIsProcessingOrder(true);
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
                const orderId = response.order?._id || response._id;
                navigate(`/order-confirmation/${orderId}`);
            }
        } catch (err) {
            setLocalError("Error al procesar la orden");
        } finally {
            setIsProcessingOrder(false);
        }
    };

    if (loadingLocal && !addresses.length && !payments.length) {
        return (
            <div className="checkout-loading">
                <Loading message="Sincronizando con el servidor..." />
            </div>
        );
    }

    const isLoading = loadingLocal || isProcessingOrder;

    return (
        <div className="checkout-container">
            {localError && (
                <div className="checkout-toast">
                    <ErrorMessage message={localError} />
                </div>
            )}

            {isLoading && (addresses.length > 0 || payments.length > 0) && (
                <div className="checkout-overlay">
                    <Loading message="Procesando tu información de manera segura..." />
                </div>
            )}

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
                            onEdit={handleAddressEditStart}
                            onDelete={handleAddressDelete}
                            onSetDefault={handleAddressSetDefault}
                            onAdd={() => setShowAddressForm(true)}
                        />
                    ) : (
                        <AddressForm
                            onSubmit={handleAddressSubmit}
                            onCancel={() => { setShowAddressForm(false); setEditingAddress(null); }}
                            isEdit={!!editingAddress}
                            initialValues={editingAddress || {}}
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
                            onEdit={handlePaymentEditStart}
                            onDelete={handlePaymentDelete}
                            onSetDefault={handlePaymentSetDefault}
                            onAdd={() => setShowPaymentForm(true)}
                        />
                    ) : (
                        <PaymentForm
                            onSubmit={handlePaymentSubmit}
                            onCancel={() => { setShowPaymentForm(false); setEditingPayment(null); }}
                            isEdit={!!editingPayment}
                            initialValues={editingPayment || {}}
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
                            <strong>Método de pago:</strong> {formatPaymentMethod(selectedPayment)}
                        </p>
                        <div className="order-costs">
                            <p><strong>Subtotal:</strong> {formatMoney(subtotal)}</p>
                            <p><strong>IVA:</strong> {formatMoney(taxAmount)}</p>
                            <p><strong>Envío:</strong> {shippingCost === 0 ? "Gratis" : formatMoney(shippingCost)}</p>
                            <hr />
                            <p><strong>Total:</strong> {formatMoney(grandTotal)}</p>
                        </div>
                    </div>
                    <Button
                        className="pay-button"
                        disabled={!selectedAddress || !selectedPayment || !cartItems.length || isLoading}
                        onClick={handlePlaceOrder}
                    >
                        {isLoading ? "Procesando..." : "Confirmar y Pagar"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
