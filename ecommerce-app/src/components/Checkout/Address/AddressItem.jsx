import Button from "../../common/Button";
import './AddressItem.css';


export default function AddressItem({ address, isSelected, onSelect, onEdit, onDelete, onSetDefault }) {

    console.log(address);


    return (
        <div className={`address-item ${isSelected ? "selected" : ""} ${address.default ? "default" : ""
            }`}
        >
            <div className="address-content">
                <h4>{address.name}</h4>
                <p>{address.address1}</p>
                {address.address2 && <p>{address.address2}</p>}
                <p>
                    {address.city}, {address.postalCode}
                </p>
                {address.reference && <p>{address.reference}</p>}
                {address.default && (
                    <span className="default-badge">Predeterminada</span>
                )}
            </div>

            <div className="address-actions">
                <Button onClick={() => onSelect(address)}
                    disabled={isSelected}
                    data-testid="select-address"
                >
                    {isSelected ? "Seleccionada" : "Seleccionar"}
                </Button>
                <Button variant="third" onClick={() => onEdit(address)}>
                    Editar
                </Button>
                {!address.default && onSetDefault && (
                    <Button variant="secondary" onClick={() => onSetDefault(address._id)}>
                        Hacer Default
                    </Button>
                )}
                <Button variant="danger" onClick={() => onDelete(address._id)}>
                    Eliminar
                </Button>
            </div>
        </div>
    );
};