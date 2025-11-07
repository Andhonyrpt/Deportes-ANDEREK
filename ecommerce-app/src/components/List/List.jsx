import ProductCard from "../ProductCard/ProductCard";
import "./List.css";

export default function List({
    products = [],
    layout = "grid"
}) {

    let classList = "";
    let orientationProduct = "";

    if (layout === "grid") {
        classList = "list-grid";
        orientationProduct = "vertical"
    } else {
        classList = "list-vertical"
        orientationProduct = "horizontal"
    }

    return (
        <div className="list-container">
            <div className={classList}>
                {products.map((product) => {
                    return (
                        <ProductCard
                            key={product._id}
                            product={product}
                            orientationProduct={orientationProduct}
                        />
                    );
                })}
            </div>
        </div>
    );
};