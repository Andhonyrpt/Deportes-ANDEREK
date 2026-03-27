import { useState, useEffect } from "react";
import {
    getShippingAddresses,
    createShippingAddress,
    deleteShippingAddress,
    updateShippingAddress,
    setDefaultAddress
} from "../services/shippingService.js";
import {
    getPaymentMethods,
    createPaymentMethod,
    deletePaymentMethod,
    updatePaymentMethod,
    setDefaultPaymentMethod,
    deactivatePaymentMethod
} from "../services/paymentService.js";

export default function useCheckout(user) {
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
    const [editingAddress, setEditingAddress] = useState(null);
    const [editingPayment, setEditingPayment] = useState(null);
    const [addressSectionOpen, setAddressSectionOpen] = useState(true);
    const [paymentSectionOpen, setPaymentSectionOpen] = useState(true);

    // Cargar datos al montar
    useEffect(() => {
        if (!user?._id) return;

        const loadData = async () => {
            setLoadingLocal(true);
            try {
                const [addrRes, payRes] = await Promise.all([
                    getShippingAddresses(),
                    getPaymentMethods(user._id)
                ]);

                const addrList = addrRes?.addresses || (Array.isArray(addrRes) ? addrRes : []);
                const payList = Array.isArray(payRes) ? payRes : (payRes?.paymentMethods || []);

                setAddresses(addrList);
                setPayments(payList);

                const defAddr = addrList?.find(a => a.isDefault) || addrList?.[0] || null;
                const defPay = payList?.find(p => p.isDefault) || payList?.[0] || null;

                setSelectedAddress(defAddr);
                setSelectedPayment(defPay);
                setAddressSectionOpen(!defAddr);
                setPaymentSectionOpen(!defPay);
            } catch (err) {
                console.error("useCheckout loadData error:", err);
                setLocalError("Error al cargar datos del perfil");
            } finally {
                setLoadingLocal(false);
            }
        };

        loadData();
    }, [user?._id]);

    const handleAddressToggle = () => {
        setShowAddressForm(false);
        setEditingAddress(null);
        setAddressSectionOpen(prev => !prev);
    };

    const handleAddressEditStart = (addr) => {
        setEditingAddress(addr);
        setShowAddressForm(true);
    };

    const handleAddressSetDefault = async (id) => {
        try {
            setLoadingLocal(true);
            await setDefaultAddress(id);
            const updated = await getShippingAddresses();
            const addrList = updated?.addresses || (Array.isArray(updated) ? updated : []);
            setAddresses(addrList);
        } catch (err) {
            setLocalError("Error al establecer dirección por defecto");
        } finally {
            setLoadingLocal(false);
        }
    };

    const handleAddressSubmit = async (formData) => {
        try {
            setLoadingLocal(true);
            if (editingAddress) {
                await updateShippingAddress(editingAddress._id, formData);
            } else {
                await createShippingAddress({ ...formData, isDefault: addresses.length === 0 });
            }
            const updated = await getShippingAddresses();

            const addrList = updated?.addresses || (Array.isArray(updated) ? updated : null);
            if (addrList && Array.isArray(addrList) && addrList.length > 0) {
                setAddresses(addrList);
                setSelectedAddress(editingAddress ? addrList.find(a => a._id === editingAddress._id) : addrList[addrList.length - 1]);
                setAddressSectionOpen(false);
                setShowAddressForm(false);
                setEditingAddress(null);
            } else if (addrList && addrList.length === 0) {
                setAddresses([]);
            }
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

    const handlePaymentToggle = () => {
        setShowPaymentForm(false);
        setEditingPayment(null);
        setPaymentSectionOpen(prev => !prev);
    };

    const handlePaymentEditStart = (pay) => {
        setEditingPayment(pay);
        setShowPaymentForm(true);
    };

    const handlePaymentSetDefault = async (id) => {
        try {
            setLoadingLocal(true);
            await setDefaultPaymentMethod(id);
            const updated = await getPaymentMethods(user._id);
            const payList = Array.isArray(updated) ? updated : (updated?.paymentMethods || []);
            setPayments(payList);
        } catch (err) {
            setLocalError("Error al establecer pago por defecto");
        } finally {
            setLoadingLocal(false);
        }
    };

    const handlePaymentSubmit = async (formData) => {
        try {
            setLoadingLocal(true);
            if (editingPayment) {
                await updatePaymentMethod(editingPayment._id, formData);
            } else {
                await createPaymentMethod({ ...formData, user: user._id, isDefault: payments.length === 0 });
            }
            const updated = await getPaymentMethods(user._id);

            const payList = Array.isArray(updated) ? updated : (updated?.paymentMethods || null);
            if (payList && Array.isArray(payList) && payList.length > 0) {
                setPayments(payList);
                setSelectedPayment(editingPayment ? payList.find(p => p._id === editingPayment._id) : payList[payList.length - 1]);
                setPaymentSectionOpen(false);
                setShowPaymentForm(false);
                setEditingPayment(null);
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
            await deactivatePaymentMethod(id); // Use deactivate instead of hard delete
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

    return {
        addresses,
        payments,
        loadingLocal,
        localError,
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
    };
}
