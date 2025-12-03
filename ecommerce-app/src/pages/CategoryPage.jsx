import { useParams } from "react-router-dom";
import CategoryProducts from "../components/CategoryProducts/CategoryProducts";


const CategoryPage = () => {

    const { categoryId } = useParams();

    return <CategoryProducts categoryId={categoryId} />

};

export default CategoryPage;