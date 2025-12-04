import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import Button from "../common/Button";
import Badge from "../common/Badge";
import './ProductCard.css';

export default function ProductCard({ product, orientation }) {

    const { addToCart } = useCart();
    const { name, price, variants, imagesUrl, description } = product;


    // Inicializar y Determinar si hay alguna variante disponible (stock > 0)
    const availableVariants = variants?.filter(v => v.stock > 0) || [];
    const totalStockAvailable = availableVariants.length > 0;

    // Estado para almacenar la talla seleccionada
    const [selectedVariant, setSelectedVariant] = useState(
        availableVariants.length > 0 ? availableVariants[0] : null
    );

    // Establecer la primera talla disponible como valor inicial al cargar
    useEffect(() => {
        if (availableVariants.length > 0 && !selectedVariant) {
            setSelectedVariant(availableVariants[0]);
        }
    }, [availableVariants, selectedVariant]);

    // Validación de props básica
    if (!product) {
        return (
            <div className="product-card"
                style={{ padding: "24px", textAlign: "center" }}
            >
                <p className="muted">Producto no disponible</p>
            </div>
        );
    };

    // Determinar el estado del stock
    const stockBadge =
        totalStockAvailable > 0
            ? { text: "En stock", variant: "success" }
            : { text: "Agotado", variant: "error" };

    // Si hay descuento, agregar badge de descuento (ejemplo)
    const hasDiscount = product.discount && product.discount > 0;

    // Manejar el cambio de selección en el <select>
    const handleSizeChange = (e) => {

        // Encontrar el objeto de variante completo (talla y stock)
        const variantFound = variants.find((v) => v.size === e.target.value);
        setSelectedVariant(variantFound);
    }

    const handleAddToCart = () => {
        if (selectedVariant && selectedVariant.stock > 0) {
            addToCart(product, 1, selectedVariant.size);
        }
    };

    const productLink = `/product/${product._id}`;
    const cardClass = `product-card product-card--${orientation}`;

    return (
        <div className={cardClass}>
            <Link to={productLink} className="product-card-image-link">
                <img src={imagesUrl ? imagesUrl[0] : "/img/products/placeholder.svg"}
                    alt={name}
                    className="product-card-image"
                    onError={(e) => {
                        e.target.src = "/img/products/placeholder.svg";
                    }}
                />
            </Link>

            <div className="product-card-content">
                <h3 className="product-card-title">
                    <Link to={productLink}
                        style={{ color: "inherit", textDecoration: "none" }}
                    >
                        {name}
                    </Link>
                </h3>

                {description && (
                    <p className="muted"
                        style={{ fontSize: "13px", marginBottom: "8px" }}
                    >
                        {description.length > 60
                            ? `${description.substring(0, 60)}...`
                            : description}
                    </p>
                )}

                <div className="card-footer-details">
                    <div className="product-card-price">${price}</div>

                    {variants && variants.length > 0 && (

                        <div className="size-select">
                            <label htmlFor="">Selecciona talla</label>
                            <select
                                value={selectedVariant?.size || ""}
                                onChange={handleSizeChange}
                                className="size-selector"
                                aria-label="Seleccionar talla"
                            >
                                {variants.map((variant) => (
                                    <option
                                        key={variant.size}
                                        value={variant.size}
                                        disabled={variant.stock === 0}
                                    >
                                        {variant.size} {variant.stock === 0 ? "Agotada" : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

            </div>

            <div className="product-card-actions">

                <div style={{ display: "flex", gap: "8px" }}>
                    <Badge text={stockBadge.text} variant={stockBadge.variant} />

                    {hasDiscount && (
                        <Badge text={`-${product.discount}%`} variant="warning" />
                    )}
                </div>

                <Button variant="primary" size="sm"
                    disabled={!selectedVariant || selectedVariant.stock === 0}
                    onClick={handleAddToCart}
                >
                    Agregar al Carrito
                </Button>
            </div>
        </div>
    );
};