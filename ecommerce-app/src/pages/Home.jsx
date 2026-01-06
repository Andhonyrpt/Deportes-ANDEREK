import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProducts } from '../services/productService';
import Loading from "../components/common/Loading/Loading";
import ErrorMessage from "../components/common/ErrorMessage/ErrorMessage";
import List from "../components/List/List";
import Navigation from "../layout/Navigation/Navigation";
import SearchForm from "../components/SearchForm/SearchForm";
import Button from "../components/common/Button";

export default function Home() {

    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigate = useNavigate();


    const loadProducts = async () => {
        setLoading(true);
        setError(null);
        const productsData = await fetchProducts();
        setProducts(productsData.products);
    };

    useEffect(() => {

        let ignore = false;

        (async () => {
            try {
                await loadProducts();
                console.log(products)
                setLoading(false);
            } catch (err) {
                if (!ignore) {
                    setError('No se pudieron cargar los productos');
                    console.error(err);
                    setProducts([]);
                    setLoading(false);
                }
            }
        })();

        return () => {
            ignore = true;
        };

    }, []);

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
                <ErrorMessage>
                    <span>{error}</span>
                    <Button
                        type='button'
                        variant='primary'
                        onClick={(e) => {
                            loadProducts().then(setLoading(false)).catch((err) => {
                                setError('No se pudieron cargar los productos');
                                console.error(err);
                                setProducts([]);
                                setLoading(false);
                            });
                        }}
                    >
                        Volver a cargar
                    </Button>
                </ErrorMessage>
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