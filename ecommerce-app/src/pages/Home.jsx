import { useEffect, useState } from "react";
import { fetchProducts } from '../services/productService';
import Loading from "../components/common/Loading/Loading";
import ErrorMessage from "../components/common/ErrorMessage/ErrorMessage";
import List from "../components/List/List";
import Navigation from "../layout/Navigation/Navigation";

export default function Home() {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const productsData = await fetchProducts();
                setProducts(productsData);
            } catch (error) {
                setError("No se pudieron cargar los productos. Intenta más tarde");
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();

    }, [])

    const handleMobileMenuOpen = () => {
        setIsMobileMenuOpen(true);
    };

    const handleMobileMenuClose = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <div>
            <div className="search-container">
                <form className="search-form"
                // onSubmit={handleSearch}
                >
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Buscar jerseys..."
                    // value={searchQuery}
                    // onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {/* <button
                        type="submit"
                        className="search-btn"
                        aria-label="Buscar"
                    >
                        <Icon name="search" size={18} />
                    </button> */}

                    <button>
                        Limpiar
                    </button>
                </form>
            </div>

            <Navigation/>

            {/* <nav>
                <Navigation
                    onLinkClick={handleMobileMenuClose}
                />
            </nav> */}

            {loading ? (
                <Loading>Cargando Productos...</Loading>
            ) : error ? (
                <ErrorMessage>{error}</ErrorMessage>
            ) : products.length > 0 ? (
                <List
                    products={products}
                    layout="grid"
                ></List>
            ) : (
                <ErrorMessage>No hay productos en el catálogo</ErrorMessage>
            )}
        </div>
    );
};