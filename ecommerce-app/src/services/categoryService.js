import categories from "../data/categories.json";
import products from "../data/products.json";

export const fetchCategories = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(categories);
        }, 1200); // 1.2 segundos de delay
    });
};

export const fetchProducts = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(products);
        }, 800);
    });
};

export const searchCategories = async (query) => {
    const lowerQuery = query.trim().toLowerCase();
    return fetchCategories().then((data) =>
        data.filter(
            (cat) =>
                cat.name.toLowerCase().includes(lowerQuery) ||
                cat.description?.toLowerCase().includes(lowerQuery)
        )
    );
};

export const getCategoryById = async (categoryId) => {
    return fetchCategories().then((data) => {
        const trimmedId = categoryId.toString().trim();

        // 1. INTENTO ORIGINAL: Buscar la categoría por su _id principal (funciona para equipos/hijos)
        let category = data.find((cat) => cat._id.toString().trim() === trimmedId);
        if (category) return category;

        // 2. SOLUCIÓN para IDs de ligas (padres): Si no se encuentra, buscar si existe como CATEGORÍA PADRE anidada
        const parentAsChild = data.find(
            (cat) => cat.parentCategory && cat.parentCategory._id.toString().trim() === trimmedId
        );

        // 3. Si se encuentra un padre anidado, CONSTRUIR y devolver el objeto de la categoría padre
        if (parentAsChild) {
            // Devolvemos el objeto parentCategory que está anidado (ej. { _id: "...", name: "LaLiga (España)", ...})
            return parentAsChild.parentCategory;
        }
        return null;
    });
};

// Obtener todas las categorías hijas de una categoría padre
export const getChildCategories = async (parentCategoryId) => {
    const trimmedId = parentCategoryId.toString().trim();
    return fetchCategories().then((data) =>
        data.filter((cat) => cat.parentCategory?._id.toString() === trimmedId)
    );
};

// Obtener productos por categoría específica
export const getProductsByCategory = async (categoryId) => {
    const trimmedId = categoryId.toString().trim();
    return fetchProducts().then((data) =>
        data.filter((product) => product.category._id.toString() === trimmedId)
    );
};

// Obtener productos de una categoría incluyendo sus subcategorías
export const getProductsByCategoryAndChildren = async (categoryId) => {
    const allProducts = await fetchProducts();
    const allCategories = await fetchCategories();
    const trimmedId = categoryId.toString().trim();

    // Encontrar la categoría
    const category = await getCategoryById(trimmedId);

    if (!category) return [];

    // Si es una categoría padre (parentCategory is null)
    if (!category.parentCategory) {
        // Obtener IDs de todas las categorías hijas
        const childCategoryIds = allCategories
            .filter((cat) => cat.parentCategory && cat.parentCategory?._id.toString().trim() === trimmedId)
            .map((cat) => cat._id.toString().trim());

        // Incluir el ID de la categoría padre también
        const allCategoryIds = [categoryId, ...childCategoryIds];

        // Retornar productos de la categoría padre y sus hijas
        return allProducts.filter((product) =>
            product.category && allCategoryIds.includes(product.category._id.toString().trim())
        );
    }

    // Si es una categoría hija, solo retornar sus productos
    return allProducts.filter((product) => product.category && product.category._id.toString().trim() === trimmedId
    );
};

// Obtener categorías principales (sin padre)
export const getParentCategories = async () => {
    return fetchCategories().then((data) =>
        data.filter((cat) => cat.parentCategory === null)
    );
};