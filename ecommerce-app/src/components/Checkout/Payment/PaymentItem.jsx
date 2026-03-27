import Button from "../../common/Button";
import './PaymentItem.css';

export default function PaymentItem({ paymentMethod, isSelected, onSelect, onEdit, onDelete, onSetDefault }) {

    const maskCardNumber = (number) => {
        if (!number) return "**** **** **** ****";

        return `**** **** **** ${number.slice(-4)}`;
    };

    return (
        <div className={`payment-item ${isSelected ? "selected" : ""} 
        ${paymentMethod.isDefault ? "isDefault" : ""}`}
        >
            <div className="payment-content">
                <h4>{paymentMethod.bankName || paymentMethod.type}</h4>
                <p>{maskCardNumber(paymentMethod.cardNumber)}</p>
                <p>Vence: {paymentMethod.expiryDate}</p>
                <p>Titular: {paymentMethod.cardHolderName}</p>
                {paymentMethod.isDefault && (
                    <span className="isDefault-badge">Predeterminada</span>
                )}
            </div>

            <div className="payment-actions">
                <Button onClick={() => onSelect(paymentMethod)}
                    disabled={isSelected}
                    data-testid="select-payment"
                >
                    {isSelected ? "Seleccionada" : "Seleccionar"}
                </Button>
                <Button variant="third" onClick={() => onEdit(paymentMethod)}>
                    Editar
                </Button>
                {!paymentMethod.isDefault && onSetDefault && (
                    <Button variant="secondary" onClick={() => onSetDefault(paymentMethod._id)}>
                        Hacer Default
                    </Button>
                )}
                <Button variant="danger" onClick={() => onDelete(paymentMethod._id)}>
                    Eliminar
                </Button>
            </div>
        </div>
    );
};