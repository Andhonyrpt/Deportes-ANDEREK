// import products from "../data/products.json";
import { http } from "./http";

export const fetchProducts = async (page = 1, limit = 10) => {
    const data = await http.get(`products?page=${page}&limit=${limit}`);
    return data.data || { products: [], pagination: {} };
};

export const searchProducts = async (
    q = '',
    category = '',
    minPrice,
    maxPrice,
    inStock,
    sort,
    order,
    page = 1,
    limit = 10,
) => {
    const params = new URLSearchParams({
        ...(q && { q }),
        ...(category && { category }),
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice }),
        ...(inStock !== undefined && { inStock }),
        ...(sort && { sort }),
        ...(order && { order }),
        page,
        limit
    });
    const data = await http.get(`products/search?${params}`);
    return data || [];
};

export const getProductsByCategory = async (categoryId, page = 1, limit = 10) => {
    const data = await http.get(`products/category/${categoryId}`);
    return data || [];
};

export async function getProductById(id) {
    const data = await http.get(`products/${id}`);
    return data || [];
}