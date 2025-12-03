import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProducts } from '../services/productService';
import Loading from "../components/common/Loading/Loading";
import ErrorMessage from "../components/common/ErrorMessage/ErrorMessage";
import List from "../components/List/List";
import Navigation from "../layout/Navigation/Navigation";
import SearchForm from "../components/SearchForm/SearchForm";

export default function Home() {

    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigate = useNavigate();

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

    const handleSearch = (e) => {
        e.preventDefault(); // Prevenir muchos clicks
        const query = searchQuery.trim();

        if (query === 0) {
            navigate("/search");
            return;
        }

        navigate(`/search?q=${encodeURIComponent(query)}`);
    };

    const handleMobileMenuOpen = () => {
        setIsMobileMenuOpen(true);
    };

    const handleMobileMenuClose = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="home-container">

            <SearchForm
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleSearch={handleSearch}
            />


            <Navigation />

            {loading ? (
                <Loading>Cargando Productos...</Loading>
            ) : error ? (
                <ErrorMessage>{error}</ErrorMessage>
            ) : products.length > 0 ? (
                <List
                    title="Catálogo de jerseys"
                    products={products}
                    layout="grid"
                ></List>
            ) : (
                <ErrorMessage>No hay productos en el catálogo</ErrorMessage>
            )}
        </div>
    );
};