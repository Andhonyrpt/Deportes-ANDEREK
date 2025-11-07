import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
// import Breadcrumb from "../layout/Breadcrumb/Breadcrumb";
// import ProductCard from "../components/ProductCard/ProductCard";
// import Input from "../components/common/Input";
import categoriesData from "../data/categories.json";
import products from "../data/products.json";
import Loading from "../components/common/Loading/Loading";
import ErrorMessage from "../components/common/ErrorMessage/ErrorMessage";
import List from "../components/List/List";
import Navigation from "../layout/Navigation/Navigation";

const CategoryPage = () => {

    const { categoryId } = useParams();

    // Estados para búsqueda
    const [currentCategory, setCurrentCategory] = useState(null);
    const [categoryProducts, setCategoryProducts] = useState([]);
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        const foundItem = categoriesData.find((cat) => cat.parentcategory?._id === categoryId);

        const parentCategory = foundItem ? foundItem.parentcategory : null;

        setCurrentCategory(parentCategory);

        if (parentCategory) {
            const subcategories = categoriesData.filter((subcat) => subcat.parentcategory?._id === categoryId);

            const subCategoryIds = subcategories.map((subcat) => subcat._id)

            const filteredProducts = products.filter((product) => product.category && subCategoryIds.includes(product.category._id));

            setCategoryProducts(filteredProducts);
            setDisplayedProducts(filteredProducts);

        } else {
            setCategoryProducts([]);
            setError("No hay Categoria existente ");
        }

        setLoading(false);

    }, [categoryId]);

    const handleSubcategoryFilter = (subcategoryId) => {
        if (!subcategoryId) {
            setDisplayedProducts(categoryProducts);
            return;
        }

        const filtered = categoryProducts.filter((product) => product.category && product.category._id === subcategoryId);

        setDisplayedProducts(filtered);
    }


    return (
        <div className="category-page">
            {loading ?
                <Loading>Cargando Productos...</Loading>
                : error ? (
                    <ErrorMessage>{error}</ErrorMessage>
                ) : displayedProducts.length > 0 ? (
                    <div>
                        <Navigation
                            activeCategory={currentCategory}
                            onSubcategoryClick={handleSubcategoryFilter}
                        />
                        <List
                            title={`Jerseys de ${currentCategory.name}`}
                            products={displayedProducts}
                            layout="vertical"></List>
                    </div>
                ) : (
                    <ErrorMessage>{`No hay productos relacionados a la categoría: ${currentCategory.name}`}</ErrorMessage>
                )
            }
        </div>
    );
};

export default CategoryPage;