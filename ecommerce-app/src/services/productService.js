import { http } from "./http";

const clearProductsCache = () => {
    Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('products_page_')) {
            sessionStorage.removeItem(key);
        }
    });
};

export const fetchProducts = async (page, limit) => {
    // Si no se envían los parámetros, fetchProducts pedirá 'products' sin paginación,
    // y el backend devolverá todos los productos.
    const url = (page && limit) ? `products?page=${page}&limit=${limit}` : 'products';
    
    const cacheKey = `products_page_${page || 'all'}_limit_${limit || 'all'}`;
    const cachedItem = sessionStorage.getItem(cacheKey);

    if (cachedItem) {
        try {
            const parsed = JSON.parse(cachedItem);
            const isExpired = Date.now() - parsed.timestamp > 5 * 60 * 1000; // 5 minutos TTL
            if (!isExpired) {
                return parsed.data;
            }
        } catch (e) {
            // Ignorar errores de parseo y forzar re-fetch
        }
    }

    const res = await http.get(url);
    const result = res.data || { products: [], pagination: {} };
    
    sessionStorage.setItem(cacheKey, JSON.stringify({
        timestamp: Date.now(),
        data: result
    }));
    return result;
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

/**
 * [ADMIN ONLY]
 */
export const createProduct = async (productData) => {
    const res = await http.post('products', productData);
    clearProductsCache();
    return res.data;
};

/**
 * [ADMIN ONLY]
 */
export const updateProduct = async (id, productData) => {
    const res = await http.put(`products/${id}`, productData);
    clearProductsCache();
    return res.data;
};

/**
 * [ADMIN ONLY]
 */
export const deleteProduct = async (id) => {
    const res = await http.delete(`products/${id}`);
    clearProductsCache();
    return res.data;
};