import { useState, useEffect } from "react";
import {
    fetchProducts,
    createProduct,
    deleteProduct,
    updateProduct
} from "../../../services/productService";
import { fetchCategories } from "../../../services/categoryService";
import Button from "../../../components/common/Button/Button";
import Loading from "../../../components/common/Loading/Loading";
import ErrorMessage from "../../../components/common/ErrorMessage/ErrorMessage";
import "./ProductsView.css"; // Importamos los estilos externos

export default function ProductsView() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    
    const initialFormState = {
        name: "",
        price: 0,
        description: "",
        modelo: "Local",
        genre: "Hombre",
        category: "",
        imagesUrl: "",
        variants: {
            S: 0,
            M: 0,
            L: 0,
            XL: 0
        }
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [productData, categoryData] = await Promise.all([
                fetchProducts(),
                fetchCategories()
            ]);
            setProducts(productData?.products || productData || []);
            setCategories(categoryData || []);
        } catch (err) {
            setError("Error al cargar datos");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const variantsArray = Object.entries(formData.variants).map(([size, stock]) => ({
                size,
                stock: parseInt(stock) || 0
            }));

            const dataToSend = {
                ...formData,
                price: parseFloat(formData.price),
                imagesUrl: typeof formData.imagesUrl === 'string' 
                    ? formData.imagesUrl.split(',').map(url => url.trim()).filter(url => url !== "")
                    : formData.imagesUrl,
                variants: variantsArray
            };

            if (editingProduct) {
                await updateProduct(editingProduct._id, dataToSend);
            } else {
                await createProduct(dataToSend);
            }
            
            setShowForm(false);
            setEditingProduct(null);
            setFormData(initialFormState);
            loadData();
        } catch (err) {
            setError("Error al guardar producto");
        }
    };

    const handleEdit = (prod) => {
        setEditingProduct(prod);
        
        const variantsObj = { S: 0, M: 0, L: 0, XL: 0 };
        prod.variants?.forEach(v => {
            variantsObj[v.size] = v.stock;
        });

        setFormData({
            name: prod.name,
            price: prod.price,
            description: prod.description || "",
            modelo: prod.modelo || "Local",
            genre: prod.genre || "Hombre",
            category: prod.category?._id || prod.category || "",
            imagesUrl: Array.isArray(prod.imagesUrl) ? prod.imagesUrl.join(', ') : (prod.imagesUrl || ""),
            variants: variantsObj
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Eliminar producto? El cache se limpiará automáticamente.")) {
            try {
                await deleteProduct(id);
                setProducts(prev => prev.filter(p => p._id !== id));
                loadData();
            } catch (err) {
                setError("Error al eliminar producto");
            }
        }
    };

    const getTotalStock = (variants) => {
        return variants?.reduce((total, v) => total + v.stock, 0) || 0;
    };

    const getStockBreakdown = (variants) => {
        const total = getTotalStock(variants);
        if (total === 0) return "Sin stock";
        return variants
            .filter(v => v.stock > 0)
            .map(v => `${v.size}: ${v.stock}`)
            .join(', ');
    };

    if (loading) return <Loading />;

    return (
        <div className="products-view">
            <div className="products-header">
                <h2>Gestión de Inventario</h2>
                <Button onClick={() => { setFormData(initialFormState); setEditingProduct(null); setShowForm(true); }}>
                    Nuevo Producto
                </Button>
            </div>

            {error && <ErrorMessage message={error} />}

            {showForm && (
                <div className="products-form-overlay">
                    <form onSubmit={handleSubmit} className="products-form">
                        <h3>{editingProduct ? "Editar" : "Nuevo"} Producto</h3>
                        
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Nombre</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Precio</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Descripción</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Modelo</label>
                                <select 
                                    value={formData.modelo}
                                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                                >
                                    <option value="Local">Local</option>
                                    <option value="Visitante">Visitante</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Género</label>
                                <select 
                                    value={formData.genre}
                                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                                >
                                    <option value="Hombre">Hombre</option>
                                    <option value="Mujer">Mujer</option>
                                    <option value="Niño">Niño</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Categoría (Liga/Equipo)</label>
                            <select 
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                required
                            >
                                <option value="">Seleccionar categoría</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>URLs de Imágenes (separadas por comas)</label>
                            <input
                                type="text"
                                placeholder="https://url1.jpg, https://url2.jpg"
                                value={formData.imagesUrl}
                                onChange={(e) => setFormData({ ...formData, imagesUrl: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-variants">
                            <label>Stock por Talla</label>
                            <div className="variants-grid">
                                {['S', 'M', 'L', 'XL'].map(size => (
                                    <div key={size} className="variant-input">
                                        <span>{size}</span>
                                        <input
                                            type="number"
                                            value={formData.variants[size]}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                variants: { ...formData.variants, [size]: e.target.value }
                                            })}
                                            min="0"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="form-actions">
                            <Button type="submit">Guardar Producto</Button>
                            <Button variant="secondary" onClick={() => { setShowForm(false); setEditingProduct(null); }}>
                                Cancelar
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="products-table-container">
                <table className="products-table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Precio</th>
                            <th>Stock Total</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((prod) => (
                            <tr key={prod._id}>
                                <td>{prod.name}</td>
                                <td>${prod.price}</td>
                                <td>
                                    <div className="stock-badge-container">
                                        <span className="stock-badge">
                                            {getTotalStock(prod.variants)}
                                        </span>
                                        <span className="tooltip-text">
                                            {getStockBreakdown(prod.variants)}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <Button size="small" onClick={() => handleEdit(prod)}>Editar</Button>
                                    <Button size="small" variant="danger" onClick={() => handleDelete(prod._id)}>Eliminar</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
