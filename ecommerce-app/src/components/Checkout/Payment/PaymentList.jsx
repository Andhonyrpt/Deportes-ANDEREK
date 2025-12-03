import Button from "../../common/Button";
import PaymentItem from "./PaymentItem";
import './PaymentList.css';


export default function PaymentList({
    paymentMethods,
    selectedPayment,
    onSelect,
    onEdit,
    onDelete,
    onAdd
}) {
    return (
        <div className="payment-list">
            <div className="payment-list-header">
                <h3>Métodos de Pago</h3>
                <Button onClick={onAdd}>Agregar Nueva Tarjeta</Button>
            </div>

            <div className="payment-list-content">
                {paymentMethods.map((paymentMethod) => (
                    <PaymentItem
                        key={paymentMethod._id || paymentMethod.alias}
                        paymentMethod={paymentMethod}
                        isSelected={selectedPayment?._id === paymentMethod._id}
                        onSelect={onSelect}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        </div>
    );
};