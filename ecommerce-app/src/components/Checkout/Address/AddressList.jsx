import Button from "../../common/Button";
import AddressItem from "./AddressItem";
import './AddressList.css';


export default function AddressList({
    addresses,
    selectedAddress,
    onSelect,
    onEdit,
    onDelete,
    onAdd
}) {
    console.log("DEBUG [AddressList]: Rendering, addresses length:", addresses?.length);

    return (
        <div className="address-list">
            <div className="address-list-header">
                <h3>Direcciones de envío</h3>
                <Button onClick={onAdd} data-testid="add-address-button">Agregar Nueva Dirección</Button>
            </div>

            <div className="address-list-content">
                {addresses.map((address) => {
                    return (
                        <AddressItem
                            key={address._id || address.name}
                            address={address}
                            isSelected={selectedAddress?._id === address._id}
                            onSelect={onSelect}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    )

                })}
            </div>
        </div>
    );
};