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
// import { getPaymentMethods } from "../services/paymentMethodService.js";
// import { getShippingAddresses } from "../services/shippingAddressService.js";
import {
    STORAGE_KEYS,
    normalizeAddress,
    normalizePayment,
    readLocalJSON,
    writeLocalJSON,
} from "../utils/storageHelpers.js";
import "./Checkout.css";

export default function Checkout() {
    const navigate = useNavigate();
    const { cartItems, total, clearCart } = useCart();

    // Cálculos financieros simples
    const subtotal = typeof total === "number" ? total : 0;
    const TAX_RATE = 0.16; // IVA 16%
    const SHIPPING_RATE = 350; // nuevo costo de envío si subtotal < threshold
    const FREE_SHIPPING_THRESHOLD = 1000; // envío gratis sobre este subtotal

    const taxAmount = parseFloat((subtotal * TAX_RATE).toFixed(2));
    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_RATE;
    const grandTotal = parseFloat(
        (subtotal + taxAmount + shippingCost).toFixed(2)
    );
    const formatMoney = (v) =>
        new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN",
        }).format(v);

    // Efecto para redirigir si no hay productos
    useEffect(() => {
        // Si estamos suprimiendo la redirección (p.ej. porque estamos confirmando)
        // no navegamos al carrito aunque esté vacío.
        if (!cartItems || cartItems.length === 0) {
            if (!suppressRedirect.current) {
                navigate("/cart");
            }
        }
    }, [cartItems, navigate]);

    // Flag para evitar redirecciones automáticas cuando estamos confirmando la compra
    const suppressRedirect = useRef(false);

    // Estados para direcciones y métodos de pago (se cargarán desde servicios)
    const [addresses, setAddresses] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loadingLocal, setLoadingLocal] = useState(true);
    const [localError, setLocalError] = useState(null);

    // Estado para controlar la visualización de formularios
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [editingPayment, setEditingPayment] = useState(null);
    const [addressSectionOpen, setAddressSectionOpen] = useState(true);
    const [paymentSectionOpen, setPaymentSectionOpen] = useState(true);

    // Estado para la selección actual
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(null);

    useEffect(() => {
        if (!selectedAddress) {
            setAddressSectionOpen(true);
        }
    }, [selectedAddress]);

    useEffect(() => {
        if (!selectedPayment) {
            setPaymentSectionOpen(true);
        }
    }, [selectedPayment]);

    // Cargar direcciones y métodos desde servicios al montar el componente
    useEffect(() => {
        let isMounted = true;

        async function loadData() {
            setLoadingLocal(true);
            setLocalError(null);
            try {
                const savedAddresses = readLocalJSON(STORAGE_KEYS.addresses);
                const savedPayments = readLocalJSON(STORAGE_KEYS.payments);

                let addressesWithIds = [];
                let normalizedPayments = [];

                if (savedAddresses && savedAddresses.length > 0) {
                    addressesWithIds = savedAddresses
                        .map((addr, idx) => normalizeAddress(addr, idx))
                        .filter(Boolean);
                } else {
                    // const addrList = await getShippingAddresses();
                    // addressesWithIds = (addrList || [])
                    //   .map((addr, idx) => normalizeAddress(addr, idx))
                    //   .filter(Boolean);
                }

                if (savedPayments && savedPayments.length > 0) {
                    normalizedPayments = savedPayments
                        .map((pay, idx) => normalizePayment(pay, idx))
                        .filter(Boolean);
                } else {
                    // const payList = await getPaymentMethods();
                    // normalizedPayments = (payList || [])
                    //   .map((pay, idx) => normalizePayment(pay, idx))
                    //   .filter(Boolean);
                }

                if (!isMounted) return;

                setAddresses(addressesWithIds);
                setPayments(normalizedPayments);

                writeLocalJSON(STORAGE_KEYS.addresses, addressesWithIds);
                writeLocalJSON(STORAGE_KEYS.payments, normalizedPayments);

                // Seleccionar valores por defecto si existen
                const defaultAddr =
                    addressesWithIds.find((a) => a.default || a.isDefault) ||
                    addressesWithIds[0] ||
                    null;
                const defaultPay =
                    normalizedPayments.find((p) => p.isDefault || p.default) ||
                    normalizedPayments[0] ||
                    null;

                setSelectedAddress(defaultAddr);
                setSelectedPayment(defaultPay);
                setAddressSectionOpen(!defaultAddr);
                setPaymentSectionOpen(!defaultPay);
            } catch (err) {
                if (isMounted) {
                    setLocalError("No se pudo cargar direcciones o métodos de pago.");
                }
            } finally {
                if (isMounted) {
                    setLoadingLocal(false);
                }
            }
        }

        loadData();
        return () => {
            isMounted = false;
        };
    }, []);

    const handleRetry = () => {
        window.location.reload();
    };

    const persistAddresses = (next) => {
        setAddresses(next);
        writeLocalJSON(STORAGE_KEYS.addresses, next);
    };

    const persistPayments = (next) => {
        setPayments(next);
        writeLocalJSON(STORAGE_KEYS.payments, next);
    };

    const handleAddressToggle = () => {
        setShowAddressForm(false);
        setEditingAddress(null);
        setAddressSectionOpen((prev) => !prev);
    };

    const handlePaymentToggle = () => {
        setShowPaymentForm(false);
        setEditingPayment(null);
        setPaymentSectionOpen((prev) => !prev);
    };

    // Manejadores para direcciones
    const handleAddressSubmit = (formData) => {
        let normalizedRecord = normalizeAddress(
            { ...formData, id: editingAddress?.id },
            addresses.length
        );

        let updatedAddresses = editingAddress
            ? addresses.map((addr) =>
                addr.id === editingAddress.id ? normalizedRecord : addr
            )
            : [...addresses, normalizedRecord];

        if (normalizedRecord?.default) {
            updatedAddresses = updatedAddresses.map((addr) =>
                addr.id === normalizedRecord.id
                    ? { ...addr, default: true, isDefault: true }
                    : { ...addr, default: false, isDefault: false }
            );
            normalizedRecord =
                updatedAddresses.find((addr) => addr.id === normalizedRecord.id) ||
                normalizedRecord;
        }

        persistAddresses(updatedAddresses);

        const nextSelection =
            normalizedRecord &&
                (normalizedRecord.default ||
                    !selectedAddress ||
                    selectedAddress.id === normalizedRecord.id)
                ? normalizedRecord
                : selectedAddress;

        setSelectedAddress(nextSelection);
        setShowAddressForm(false);
        setEditingAddress(null);
        setAddressSectionOpen(false);
    };

    const handleAddressEdit = (address) => {
        setEditingAddress(address);
        setShowAddressForm(true);
        setAddressSectionOpen(true);
    };

    const handleAddressDelete = (addressId) => {
        let updatedAddresses = addresses.filter((addr) => addr.id !== addressId);
        let nextSelection = selectedAddress;

        if (selectedAddress?.id === addressId) {
            nextSelection = null;
        }

        if (updatedAddresses.length > 0) {
            if (!nextSelection) {
                nextSelection =
                    updatedAddresses.find((addr) => addr.default || addr.isDefault) ||
                    updatedAddresses[0];
            }

            if (nextSelection) {
                updatedAddresses = updatedAddresses.map((addr) =>
                    addr.id === nextSelection.id
                        ? { ...addr, default: true, isDefault: true }
                        : { ...addr, default: false, isDefault: false }
                );
                nextSelection =
                    updatedAddresses.find((addr) => addr.id === nextSelection.id) ||
                    nextSelection;
            }
        } else {
            nextSelection = null;
        }

        persistAddresses(updatedAddresses);
        setSelectedAddress(nextSelection);
    };

    // Manejadores para métodos de pago
    const handlePaymentSubmit = (formData) => {
        let normalizedRecord = normalizePayment(
            { ...formData, id: editingPayment?.id },
            payments.length
        );

        let updatedPayments = editingPayment
            ? payments.map((pay) =>
                pay.id === editingPayment.id ? normalizedRecord : pay
            )
            : [...payments, normalizedRecord];

        if (normalizedRecord?.isDefault || normalizedRecord?.default) {
            updatedPayments = updatedPayments.map((pay) =>
                pay.id === normalizedRecord.id
                    ? { ...pay, default: true, isDefault: true }
                    : { ...pay, default: false, isDefault: false }
            );
            normalizedRecord =
                updatedPayments.find((pay) => pay.id === normalizedRecord.id) ||
                normalizedRecord;
        }

        persistPayments(updatedPayments);

        const nextSelection =
            normalizedRecord &&
                (normalizedRecord.isDefault ||
                    normalizedRecord.default ||
                    !selectedPayment ||
                    selectedPayment.id === normalizedRecord.id)
                ? normalizedRecord
                : selectedPayment;

        setSelectedPayment(nextSelection);
        setShowPaymentForm(false);
        setEditingPayment(null);
        setPaymentSectionOpen(false);
    };

    const handlePaymentEdit = (payment) => {
        setEditingPayment(payment);
        setShowPaymentForm(true);
        setPaymentSectionOpen(true);
    };

    const handlePaymentDelete = (paymentId) => {
        let updatedPayments = payments.filter((pay) => pay.id !== paymentId);
        let nextSelection = selectedPayment;

        if (selectedPayment?.id === paymentId) {
            nextSelection = null;
        }

        if (updatedPayments.length > 0) {
            if (!nextSelection) {
                nextSelection =
                    updatedPayments.find((pay) => pay.isDefault || pay.default) ||
                    updatedPayments[0];
            }

            if (nextSelection) {
                updatedPayments = updatedPayments.map((pay) =>
                    pay.id === nextSelection.id
                        ? { ...pay, default: true, isDefault: true }
                        : { ...pay, default: false, isDefault: false }
                );
                nextSelection =
                    updatedPayments.find((pay) => pay.id === nextSelection.id) ||
                    nextSelection;
            }
        } else {
            nextSelection = null;
        }

        persistPayments(updatedPayments);
        setSelectedPayment(nextSelection);
    };

    return (
        // Mostrar loading o error antes del contenido principal
        loadingLocal ? (
            <div className="checkout-loading">
                <Loading message="Cargando direcciones y métodos de pago..." />
            </div>
        ) : localError ? (
            <div className="checkout-error">
                <ErrorMessage message={localError}>
                    <div style={{ textAlign: "center", marginTop: 12 }}>
                        <Button onClick={handleRetry} variant="primary">
                            Reintentar
                        </Button>
                    </div>
                </ErrorMessage>
            </div>
        ) : (
            <div className="checkout-container">
                <div className="checkout-left">
                    <SummarySection
                        title="1. Dirección de envío"
                        selected={selectedAddress}
                        summaryContent={
                            <div className="selected-address">
                                <p>{selectedAddress?.name}</p>
                                <p>{selectedAddress?.address1}</p>
                                <p>
                                    {selectedAddress?.city}, {selectedAddress?.postalCode}
                                </p>
                            </div>
                        }
                        isExpanded={
                            showAddressForm || addressSectionOpen || !selectedAddress
                        }
                        onToggle={handleAddressToggle}
                    >
                        {!showAddressForm && !editingAddress ? (
                            <AddressList
                                addresses={addresses}
                                selectedAddress={selectedAddress}
                                onSelect={(address) => {
                                    setSelectedAddress(address);
                                    setShowAddressForm(false);
                                    setEditingAddress(null);
                                    setAddressSectionOpen(false);
                                }}
                                onEdit={handleAddressEdit}
                                onDelete={handleAddressDelete}
                                onAdd={() => {
                                    setEditingAddress(null);
                                    setShowAddressForm(true);
                                    setAddressSectionOpen(true);
                                }}
                            />
                        ) : (
                            <AddressForm
                                key={editingAddress?.id || "new"}
                                onSubmit={handleAddressSubmit}
                                onCancel={() => {
                                    setShowAddressForm(false);
                                    setEditingAddress(null);
                                    setAddressSectionOpen(true);
                                }}
                                initialValues={editingAddress || {}}
                                isEdit={!!editingAddress}
                            />
                        )}
                    </SummarySection>

                    <SummarySection
                        title="2. Método de pago"
                        selected={selectedPayment}
                        summaryContent={
                            <div className="selected-payment">
                                <p>{selectedPayment?.alias}</p>
                                <p>**** {selectedPayment?.cardNumber?.slice(-4) || "----"}</p>
                            </div>
                        }
                        isExpanded={
                            showPaymentForm || paymentSectionOpen || !selectedPayment
                        }
                        onToggle={handlePaymentToggle}
                    >
                        {!showPaymentForm && !editingPayment ? (
                            <PaymentList
                                paymentMethods={payments}
                                selectedPayment={selectedPayment}
                                onSelect={(payment) => {
                                    setSelectedPayment(payment);
                                    setShowPaymentForm(false);
                                    setEditingPayment(null);
                                    setPaymentSectionOpen(false);
                                }}
                                onEdit={handlePaymentEdit}
                                onDelete={handlePaymentDelete}
                                onAdd={() => {
                                    setEditingPayment(null);
                                    setShowPaymentForm(true);
                                    setPaymentSectionOpen(true);
                                }}
                            />
                        ) : (
                            <PaymentForm
                                key={editingPayment?.id || "new"}
                                onSubmit={handlePaymentSubmit}
                                onCancel={() => {
                                    setShowPaymentForm(false);
                                    setEditingPayment(null);
                                    setPaymentSectionOpen(true);
                                }}
                                initialValues={editingPayment || {}}
                                isEdit={!!editingPayment}
                            />
                        )}
                    </SummarySection>

                    <SummarySection
                        title="3. Revisa tu pedido"
                        selected={true}
                        isExpanded={true}
                    >
                        <CartView />
                    </SummarySection>
                </div>

                <div className="checkout-right">
                    <div className="checkout-summary">
                        <h3>Resumen de la Orden</h3>
                        <div className="summary-details">
                            <p>
                                <strong>Dirección de envío:</strong> {selectedAddress?.name}
                            </p>
                            <p>
                                <strong>Método de pago:</strong> {selectedPayment?.alias}
                            </p>
                            <div className="order-costs">
                                <p>
                                    <strong>Subtotal:</strong> {formatMoney(subtotal)}
                                </p>
                                <p>
                                    <strong>IVA (16%):</strong> {formatMoney(taxAmount)}
                                </p>
                                <p>
                                    <strong>Envío:</strong>{" "}
                                    {shippingCost === 0 ? "Gratis" : formatMoney(shippingCost)}
                                </p>
                                <hr />
                                <p>
                                    <strong>Total:</strong> {formatMoney(grandTotal)}
                                </p>
                            </div>
                            <p>
                                <strong>Fecha estimada de entrega:</strong>{" "}
                                {new Date(
                                    Date.now() + 7 * 24 * 60 * 60 * 1000
                                ).toLocaleDateString()}
                            </p>
                        </div>
                        <Button
                            className="pay-button"
                            disabled={
                                !selectedAddress ||
                                !selectedPayment ||
                                !cartItems ||
                                cartItems.length === 0
                            }
                            title={
                                !cartItems || cartItems.length === 0
                                    ? "No hay productos en el carrito"
                                    : !selectedAddress
                                        ? "Selecciona una dirección de envío"
                                        : !selectedPayment
                                            ? "Selecciona un método de pago"
                                            : "Confirmar y realizar el pago"
                            }
                            onClick={() => {
                                // Crear el objeto de la orden
                                const order = {
                                    id: Date.now().toString(),
                                    date: new Date().toISOString(),
                                    items: cartItems.map((item) => ({
                                        ...item,
                                        subtotal: item.price * item.quantity,
                                    })),
                                    subtotal: subtotal,
                                    tax: taxAmount,
                                    shipping: shippingCost,
                                    total: grandTotal,
                                    shippingAddress: selectedAddress,
                                    paymentMethod: selectedPayment,
                                    status: "confirmed",
                                };

                                // Guardar la orden en localStorage
                                const orders = JSON.parse(
                                    localStorage.getItem("orders") || "[]"
                                );
                                orders.push(order);
                                localStorage.setItem("orders", JSON.stringify(orders));

                                // Suprimir redirección automática al carrito vacío
                                suppressRedirect.current = true;

                                // Limpiar carrito
                                clearCart();

                                // Navegar a confirmación
                                navigate("/order-confirmation", {
                                    state: { order },
                                });
                            }}
                        >
                            Confirmar y Pagar
                        </Button>
                    </div>
                </div>
            </div>
        )
    );
}
