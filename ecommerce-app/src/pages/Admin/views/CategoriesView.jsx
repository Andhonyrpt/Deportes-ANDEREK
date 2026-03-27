import { useState, useEffect } from "react";
import {
    getParentCategories,
    createCategory,
    deleteCategory,
    updateCategory
} from "../../../services/categoryService";
import Button from "../../../components/common/Button/Button";
import Loading from "../../../components/common/Loading/Loading";
import ErrorMessage from "../../../components/common/ErrorMessage/ErrorMessage";
import "./CategoriesView.css";

export default function CategoriesView() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: "", description: "" });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const data = await getParentCategories(); // Solo categorías principales
            setCategories(data);
        } catch (err) {
            setError("Error al cargar categorías principales");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await updateCategory(editingCategory._id, formData);
            } else {
                await createCategory(formData);
            }
            setShowForm(false);
            setEditingCategory(null);
            setFormData({ name: "", description: "" });
            loadCategories();
        } catch (err) {
            setError("Error al guardar categoría");
        }
    };

    const handleEdit = (cat) => {
        setEditingCategory(cat);
        setFormData({ name: cat.name, description: cat.description || "" });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de eliminar esta categoría principal? No debe tener subcategorías vinculadas.")) {
            try {
                await deleteCategory(id);
                loadCategories();
            } catch (err) {
                setError(err.response?.data?.message || "Error al eliminar");
            }
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="categories-view">
            <div className="categories-header">
                <h2>Categorías Principales (Ligas)</h2>
                <Button onClick={() => setShowForm(true)}>Nueva Categoría Principal</Button>
            </div>

            {error && <ErrorMessage message={error} />}

            {showForm && (
                <div className="categories-form-overlay">
                    <form onSubmit={handleSubmit} className="categories-form">
                        <h3>{editingCategory ? "Editar" : "Nueva"} Categoría Principal</h3>
                        
                        <div className="form-group">
                            <label>Nombre</label>
                            <input
                                type="text"
                                placeholder="Ej: LaLiga, Premier League"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Descripción</label>
                            <textarea
                                placeholder="Descripción de la liga o categoría"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-actions">
                            <Button type="submit">Guardar</Button>
                            <Button variant="secondary" onClick={() => { setShowForm(false); setEditingCategory(null); }}>
                                Cancelar
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="categories-table-container">
                <table className="categories-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((cat) => (
                            <tr key={cat._id}>
                                <td>{cat.name}</td>
                                <td>{cat.description}</td>
                                <td>
                                    <Button size="small" onClick={() => handleEdit(cat)}>Editar</Button>
                                    <Button size="small" variant="danger" onClick={() => handleDelete(cat._id)}>Eliminar</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
