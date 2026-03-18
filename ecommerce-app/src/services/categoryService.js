import { http } from "./http";

// 🛡️ HELPER NIVEL DIOS: Extrae el ID sin importar si el backend manda un Objeto o un String
const extractId = (campo) => {
    if (!campo) return null;

    const id = campo._id || campo; // Si tiene _id lo usa, si no, asume que el campo en sí es el texto del ID
    return id.toString().trim();
};

export const fetchCategories = async () => {
    try {
        // 1. Vamos por las Ligas (Categorías Padre)
        const catResponse = await http.get("categories");
        const categorias = catResponse.data?.categories || catResponse.data || [];

        // 2. Vamos por los Equipos (SubCategorías Hijas)
        const subCatResponse = await http.get("subcategories");
        const subCategorias = subCatResponse.data?.subcategories || subCatResponse.data || [];

        // 3. ¡Fusión! Juntamos ambos arreglos en uno solo para que el frontend sea feliz
        const combinadas = [...categorias, ...subCategorias];
        console.log("🕵️‍♂️ TODAS las categorías fusionadas (Ligas + Equipos):", combinadas);
        return combinadas;
    } catch (error) {
        console.error("Error fetching categories", error);
        return [];
    }
};

export const fetchProducts = async () => {
    try {
        const response = await http.get("products");
        const data = response.data?.products || response.data || [];
        console.log("🕵️‍♂️ Productos reales recibidos:", data);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Error fetching products", error);
        return [];
    }
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
        let category = data.find((cat) => extractId(cat) === trimmedId);
        if (category) return category;

        // 2. SOLUCIÓN para IDs de ligas (padres): Si no se encuentra, buscar si existe como CATEGORÍA PADRE anidada
        const parentAsChild = data.find(
            (cat) => cat.parentCategory && extractId(cat.parentCategory) === trimmedId
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
        data.filter((cat) => extractId(cat.parentCategory) === trimmedId)
    );
};

// Obtener productos por categoría específica
export const getProductsByCategory = async (categoryId) => {
    const trimmedId = categoryId.toString().trim();

    return fetchProducts().then((data) =>
        data.filter((product) => extractId(product.category) === trimmedId)
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
            .filter((cat) => cat.parentCategory && extractId(cat.parentCategory) === trimmedId)
            .map((cat) => extractId(cat));

        // Incluir el ID de la categoría padre también
        const allCategoryIds = [trimmedId, ...childCategoryIds];

        // Retornar productos de la categoría padre y sus hijas
        return allProducts.filter((product) =>
            product.category && allCategoryIds.includes(extractId(product.category))
        );
    }

    // Si es una categoría hija, solo retornar sus productos
    return allProducts.filter((product) => product.category && extractId(product.category) === trimmedId
    );

};

// Obtener categorías principales (sin padre)
export const getParentCategories = async () => {
    return fetchCategories().then((data) =>
        data.filter((cat) => cat.parentCategory === null)
    );
};