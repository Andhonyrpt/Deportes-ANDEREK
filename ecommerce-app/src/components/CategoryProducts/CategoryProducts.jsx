import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    getCategoryById,
    getProductsByCategoryAndChildren,
    getChildCategories
} from "../../services/categoryService";
import ProductCard from "../ProductCard/ProductCard";
import ErrorMessage from "../common/ErrorMessage/ErrorMessage";
import Loading from "../common/Loading/Loading";
import Navigation from "../../layout/Navigation/Navigation";
import SearchForm from "../SearchForm/SearchForm";
import './CategoryProducts.css';

export default function CategoryProducts({ categoryId }) {

    const navigate = useNavigate();

    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [childCategories, setChildCategories] = useState([]);
    const [activeSubcategoryId, setActiveSubcategoryId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        setLoading(true);
        setError(null);
        setChildCategories([]);

        const loadCategoryAndProducts = async () => {
            try {
                //Cargar categoría y sus productos
                const [categoryData, productsData] = await Promise.all([
                    getCategoryById(categoryId),
                    getProductsByCategoryAndChildren(categoryId)
                ]);

                if (!categoryData) {
                    setError("Categoría no encontrada");
                    return;
                }

                setCategory(categoryData);
                setProducts(productsData);

                // Cargar categorías hijas si la categoría actual es la padre (Liga/Selección)
                if (categoryData.parentCategory === null) {
                    const children = await getChildCategories(categoryData._id);
                    setChildCategories(children);
                }

            } catch (err) {
                setError("Error al cargar la categoría o productos");
            } finally {
                setLoading(false);
            }
        };

        loadCategoryAndProducts();
    }, [categoryId]);

    const handleSubcategoryFilter = (subcategoryId) => {
        setActiveSubcategoryId(prevId =>
            prevId === subcategoryId ? null : subcategoryId
        );
    };

    const handleSearch = (e) => {
        e.preventDefault(); // Prevenir muchos clicks
        const query = searchQuery.trim();

        if (!query) {
            navigate("/search");
            return;
        }

        navigate(`/search?q=${encodeURIComponent(query)}`);
    };

    const displayedProducts = activeSubcategoryId
        ? products.filter((product) => product.category && product.category._id.toString().trim() === activeSubcategoryId.toString().trim())
        : products; // Si no hay subcategoría activa, muestra todos

    const hasProductsToDisplay = displayedProducts.length > 0;

    if (loading) {
        return (
            <div className="category-products-root">
                <Loading>Cargando categoría y productos...</Loading>
            </div>
        );
    };

    if (error || !category) {
        return (
            <div className="category-products-root">
                <ErrorMessage message={error || "Categoría no encontrada"}>
                    <p className="category-products-muted">
                        Vuelve al <Link to="/">inicio</Link> o explora nuestras categorías
                        destacadas.
                    </p>
                </ErrorMessage>
            </div>
        );
    };

    // 1. Determina la CATEGORÍA PADRE/ACTIVA (para el botón principal)
    const activeCategoryProp = category.parentCategory || category;

    // 2. Determina la SUBCATEGORÍA FILTRADA (para el texto del botón de subcategorías)
    // Si activeSubcategoryId tiene un valor, busca el objeto correspondiente en la lista de hijos.
    let activeSubcategoryProp = null;
    if (activeSubcategoryId) {
        activeSubcategoryProp = childCategories.find((c) => c._id === activeSubcategoryId) || null;
    }

    return (
        <div>

            <SearchForm
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleSearch={handleSearch}
            />

            <Navigation
                activeCategory={activeCategoryProp}
                activeSubcategory={activeSubcategoryProp}
                availableSubcategories={childCategories}
                onSubcategoryClick={handleSubcategoryFilter}
            />

            <div className="category-products-root">
                {/* Breadcrumb */}
                <div className="category-products-container">
                    <div className="category-products-header">
                        <div className="category-products-title">
                            <h1 className="category-products-h1">
                                {activeSubcategoryProp
                                    ? `${activeCategoryProp.name}: ${activeSubcategoryProp.name}`
                                    : activeCategoryProp.name
                                }
                            </h1>
                            {category.description && (
                                <p className="category-products-muted">{category.description}</p>
                            )}
                        </div>
                    </div>

                    {hasProductsToDisplay ? (
                        <div className="category-products-grid">
                            {displayedProducts.map((product) => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    orientation="vertical"
                                    className="card"
                                />
                            ))}
                        </div>
                    ) : (
                        <ErrorMessage message="No se encontraron productos">
                            <p className="category-products-muted">
                                No hay productos en este categoría por el momento
                            </p>
                        </ErrorMessage>
                    )}
                </div>
            </div>
        </div >
    );
};