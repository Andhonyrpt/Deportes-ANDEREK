import ProductCard from "../ProductCard/ProductCard";
import ProductCardSkeleton from "../ProductCard/ProductCardSkeleton";
import "./List.css";

export default function List({
    products = [],
    title = "Nuestros Productos",
    layout = "grid",
    isLoading = false
}) {

    const renderSkeletons = () => {
        const skeletons = Array(6).fill(0);
        return skeletons.map((_, index) => (
            <ProductCardSkeleton key={`skeleton-${index}`} orientation={layout === "grid" ? "vertical" : "horizontal"} />
        ));
    };

    return (
        <div className="list-container">

            {/* Header */}
            <div className="list-header">
                <h1 className="list-title">{title}</h1>
            </div>

            <div className={layout === "grid" ? "list-grid" : "list-vertical"}>
                {isLoading 
                    ? renderSkeletons()
                    : products.map((product, index) => (
                        <ProductCard
                            key={product._id}
                            product={product}
                            orientation={layout === "grid" ? "vertical" : "horizontal"}
                            className="list-item"
                            priority={index < 2}
                        />
                    ))
                }
            </div>
        </div>
    );
};