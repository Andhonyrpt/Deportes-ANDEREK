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
        const subCategorias = subCatResponse.data?.subCategories || subCatResponse.data || [];

        // 3. ¡Fusión! Juntamos ambos arreglos en uno solo para que el frontend sea feliz
        const combinadas = [...categorias, ...subCategorias];
        return combinadas;

    } catch (error) {
        console.error("Error fetching categories", error);
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

// Obtener productos por categoría — usar endpoint dedicado del servidor
export const getProductsByCategory = async (categoryId) => {
    try {
        const trimmedId = categoryId.toString().trim();
        const response = await http.get(`products/category/${trimmedId}`);
        const data = response.data?.products || response.data || [];
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error fetching products by category', error);
        return [];
    }
};

// Obtener productos de una categoría incluyendo sus subcategorías
export const getProductsByCategoryAndChildren = async (categoryId) => {
    // Simplificamos: Llamamos directamente al endpoint del backend, 
    // el cual ahora es lo suficientemente inteligente para devolver 
    // los productos de la categoría y de sus subcategorías.
    return getProductsByCategory(categoryId);
};

// Obtener categorías principales (sin padre)
export const getParentCategories = async () => {
    return fetchCategories().then((data) =>
        data.filter((cat) => cat.parentCategory === null)
    );
};

/**
 * [ADMIN ONLY]
 */
export const createCategory = async (categoryData) => {
    const res = await http.post('categories', categoryData);
    return res.data;
};

/**
 * [ADMIN ONLY]
 */
export const updateCategory = async (id, categoryData) => {
    const res = await http.put(`categories/${id}`, categoryData);
    return res.data;
};

/**
 * [ADMIN ONLY] subcategories CRUD
 */
export const createSubCategoryByAdmin = async (subCategoryData) => {
    const res = await http.post('subcategories', subCategoryData);
    return res.data;
};

export const updateSubCategoryByAdmin = async (id, subCategoryData) => {
    const res = await http.put(`subcategories/${id}`, subCategoryData);
    return res.data;
};

export const deleteSubCategoryByAdmin = async (id) => {
    const res = await http.delete(`subcategories/${id}`);
    return res.data;
};

export const fetchSubCategories = async () => {
    const res = await http.get('subcategories');
    const data = res.data?.subCategories || []; // Solo retornar el array
    console.log("DEBUG: fetchSubCategories returns array:", data);
    return data;
};

/**
 * [ADMIN ONLY]
 */
export const deleteCategory = async (id) => {
    const res = await http.delete(`categories/${id}`);
    return res.data;
};