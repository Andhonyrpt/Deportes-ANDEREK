import { useState, useEffect } from "react";
import Icon from "../common/Icon";
import './SearchForm.css';

export default function SearchForm({ searchQuery, setSearchQuery, handleSearch }) {
    // Estado local para evitar re-renderizaciones del componente padre por cada tecla
    const [localQuery, setLocalQuery] = useState(searchQuery || "");

    // Sincronizar si el padre cambia el valor externamente (ej. al navegar)
    useEffect(() => {
        setLocalQuery(searchQuery || "");
    }, [searchQuery]);

    const handleChange = (e) => {
        setLocalQuery(e.target.value);
    };

    const handleClear = (e) => {
        e.preventDefault();
        setLocalQuery("");
        setSearchQuery(""); // Notificar al padre que se limpió
    };

    const onSubmit = (e) => {
        e.preventDefault();
        // Cuando se hace submit, actualizamos el estado del padre 
        // y ejecutamos la lógica de búsqueda original pasando el evento y la query
        setSearchQuery(localQuery);
        handleSearch(e, localQuery);
    };

    return (
        <form className="search-form container" onSubmit={onSubmit}>
            <div className="search-input-wrapper">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Buscar jerseys..."
                    value={localQuery}
                    onChange={handleChange}
                    data-testid="search-input"
                />

                {localQuery && (
                    <button type="button"
                        onClick={handleClear}
                        className="clear-btn"
                    >
                        X
                    </button>
                )}
            </div>

            <button
                type="submit"
                className="search-btn"
                aria-label="Buscar"
                data-testid="search-submit"
            >
                <Icon name="search" size={18} />
            </button>
        </form>
    );
};