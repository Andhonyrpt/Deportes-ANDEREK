import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import categoriesData from '../../data/categories.json';
import { getProductById } from '../../services/productService';
import Badge from "../common/Badge";
import Button from "../common/Button";
import Loading from '../common/Loading/Loading';
import ErrorMessage from "../common/ErrorMessage/ErrorMessage";
import './ProductDetails.css';


export default function ProductDetails({ productId }) {

    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);

    useEffect(() => {

        setLoading(true);
        setError(null);

        getProductById(productId).then((foundProduct) => {

            if (!foundProduct) {
                setError("Producto no encontrado");
            } else {
                setProduct(foundProduct)

                if (foundProduct.variants && foundProduct.variants.length > 0) {
                    const initialVariant = foundProduct.variants.find((v) =>
                        v.stock > 0) || foundProduct.variants[0];
                    setSelectedVariant(initialVariant);
                }
            }
        })
            .catch(() => setError("Ocurrió un error al cargar el producto"))
            .finally(() => setLoading(false));

    }, [productId]);

    const resolvedCategory = useMemo(() => {

        if (!product?.category) return null;

        return (
            categoriesData.find((cat) => cat._id === product.category._id) ||
            categoriesData.find((cat) => cat.name.toLocaleLowerCase() === product.category.name?.toLocaleLowerCase()) ||
            null
        );
    }, [product]);

    const handleSizeChange = (e) => {
        const variantFound = product.variants.find((v) => v.size === e.target.value);
        setSelectedVariant(variantFound);
    };

    const handleAddToCart = () => {
        if (product && selectedVariant && selectedVariant.stock > 0) {
            addToCart(product, 1, selectedVariant.size);
        }
    };

    if (loading) {
        return (
            <div className="product-details-container">
                <Loading >Cargando producto...</Loading>
            </div>
        );
    }

    if (error) {
        return (
            <div className="product-details-container">
                <ErrorMessage message={error}>
                    <p className="muted">
                        Revisa nuestra <Link to="/">página principal</Link>
                    </p>
                </ErrorMessage>
            </div>
        );
    }

    if (!product) return null;

    const { name, description, price, variants, imagesUrl, category } = product;

    const currentStock = selectedVariant ? selectedVariant.stock : 0;
    const stockBadge = currentStock > 0 ? "success" : "error";
    const stockLabel = currentStock > 0 ? "En stock" : "Agotado";
    const hasAvailableVariants = variants?.some(v => v.stock > 0);

    return (
        <div className="product-details-container">

            <div className="product-details-main">
                <div className="product-details-image">
                    <img
                        src={imagesUrl?.[0] || "/img/products/placeholder.svg"}
                        alt={name}
                        onError={(e) => {
                            e.target.src = "/img/products/placeholder.svg";
                        }}
                    />
                </div>

                <div className="product-details-info">
                    <div className="product-details-title">
                        <h1 className="h1">{name}</h1>
                        {(resolvedCategory?.name || category?.name) && (
                            <span className="product-details-category">
                                {resolvedCategory?.name || category?.name}
                            </span>
                        )}
                    </div>

                    <p className="product-details-description">{description}</p>

                    <div className="product-details-stock">
                        <Badge text={stockLabel} variant={stockBadge} />
                        {currentStock > 0 && (
                            <span className="muted">{currentStock} unidades disponibles</span>
                        )}
                    </div>

                    <div className="product-details-price">${price}</div>

                    {variants && variants.length > 0 && (
                        <div className="product-details-variant-selector">
                            <label htmlFor="size-select" className="muted" >
                                Selecciona Talla:
                            </label>
                            <select
                                className="product-details-select"
                                id="size-select"
                                value={selectedVariant?.size || ''}
                                onChange={handleSizeChange}
                                disabled={!hasAvailableVariants}
                            >
                                {variants.map((variant) => (
                                    <option
                                        key={variant.size}
                                        value={variant.size}
                                        disabled={variant.stock === 0}
                                    >
                                        {variant.size} {variant.stock === 0 ? "(Agotada)" : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="product-details-actions">
                        <Button variant="primary" size="lg"
                            disabled={!selectedVariant || selectedVariant.stock === 0}
                            onClick={handleAddToCart}
                        >
                            Agregar al carrito
                        </Button>

                        <Link to="/cart" className="btn btn-outline btn-lg">
                            Ver carrito
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};