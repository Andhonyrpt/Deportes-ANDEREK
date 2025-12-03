import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import List from "../List/List";
import { fetchProducts } from "../../services/productService";
import SearchForm from "../SearchForm/SearchForm";
import './SearchResultsList.css';
import Loading from "../common/Loading/Loading";

const normalizeText = (text) => {
    if (!text) return '';
    /*
    "NFD" (Normalization Form D) indica que la función debe descomponer 
    los caracteres acentuados o especiales en sus partes base.
    Ejemplo:  Con "NFD", el carácter acentuado é se descompone en su carácter base 
    (e) más su marca diacrítica (el acento agudo: ́). 
    Resultado (invisible): M e ´ x i c o
    */
    // .replace(/[\u0300-\u036f]/g, "") elimina esos acentos separados.
    // Resultado: M e x i c o.
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

export default function SearchResultsList() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [sortBy, setSortBy] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");
    const [products, setProducts] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const query = (searchParams.get("q") || "").trim();
    const hasQuery = query.length > 0;

    useEffect(() => {
        let isMounted = true;

        const loadProducts = async () => {
            try {
                setLoading(true);
                const data = await fetchProducts();

                if (isMounted) {
                    setProducts(data);
                }

            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadProducts();
        return () => {
            isMounted = false;
        };

    }, []);

    const filteredProducts = useMemo(() => {
        if (!query) {
            return [];
        }

        const normalizedQuery = normalizeText(query);

        let result = products.filter((product) => {

            // Normalizar el nombre del producto
            const normalizedProductName = normalizeText(product.name);
            // Normalizar la descripción (si existe)
            const normalizedProductDescription = normalizeText(product.description);
            // Normalizar la categoría padre
            const normalizedParentCategory = normalizeText(product.category?.parentCategory?.name);

            const matchesName = normalizedProductName.includes(normalizedQuery);
            const matchesDescription = normalizedProductDescription?.includes(normalizedQuery);
            const matchesParentCategory = normalizedParentCategory.includes(normalizedQuery);


            return matchesName || matchesDescription || matchesParentCategory;
        });

        result = result.sort((a, b) => {
            let valA = sortBy === "price" ? a.price : a.name.toLowerCase();
            let valB = sortBy === "price" ? b.price : b.name.toLowerCase();

            if (valA < valB) return sortOrder === "asc" ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [query, products, sortBy, sortOrder]);

    const showNoResults = hasQuery && !loading && filteredProducts.length === 0;

    const handleQueryChange = (event) => {
        const value = event.target.value;

        if (!value.trim()) {
            setSearchParams({});
            return;
        }
        setSearchParams({ q: value });
    };

    const handleSearch = (e) => {
        e.preventDefault();

        if (query.length === 0) {
            setSearchParams({});
        }
    };

    return (

        <div>

            <SearchForm
                searchQuery={searchParams.get("q" || "")}
                setSearchQuery={(value) => handleQueryChange({ target: { value } })}
                handleSearch={handleSearch}
            />

            <div className="search-results-fullwidth">
                <header className="search-results-header">
                    <div>
                        <h1 className="search-results-title">
                            {hasQuery ? `Resultados para ${query}` : 'Explora nuestro catálogo'}
                        </h1>
                        <p className="search-results-description">
                            {hasQuery ? 'Estos son los productos que encontramos basados en tu búsqueda' : 'Usa la barra de búsqueda para encontrar rapidamente lo que necesitas'}
                        </p>
                    </div>

                    {hasQuery && (
                        <div className="search-results-controls">
                            <label >Ordenar por:</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="name">Nombre</option>
                                <option value="price">Precio</option>
                            </select>

                            <button type="button"
                                className="sort-btn"
                                onClick={() => setSortBy(sortOrder === "asc" ? "des" : "asc")}
                            >
                                {sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
                            </button>
                        </div>
                    )}
                </header>

                {loading && (
                    <div className="search-results-message">
                        <h3>Buscando productos...</h3>
                        <p>Esto puede tomar unos segundos</p>
                    </div>
                )}

                {!loading && showNoResults && (
                    <div className="search-results-message">
                        <h3>No encontramos coincidencias</h3>
                        <p>
                            Prueba con otros términos o vuelve al {" "}
                            <Link to='/home'>inicio</Link>
                        </p>
                    </div>
                )}

                {!loading && hasQuery && !showNoResults && (
                    <List
                        products={filteredProducts}
                        layout="vertical"
                        title={`Resultados para ${query}`}
                    />
                )}

                {!loading && !hasQuery && (
                    <div className="search-results-message">
                        <h3>Buscas algo en especial?</h3>
                        <p>
                            Comienza a escribir en la barra de búsqueda y te mostraremos los resultados aquí mismo
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}