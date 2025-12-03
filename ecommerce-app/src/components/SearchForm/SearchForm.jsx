import Icon from "../common/Icon";
import './SearchForm.css';


export default function SearchForm({ searchQuery, setSearchQuery, handleSearch }) {
    return (
        <form className="search-form container" onSubmit={handleSearch}
        >
            <div className="search-input-wrapper">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Buscar jerseys..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                {searchQuery && (
                    <button type="button"
                        onClick={() => setSearchQuery('')}
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
            >
                <Icon name="search" size={18} />
            </button>
        </form>
    );
};