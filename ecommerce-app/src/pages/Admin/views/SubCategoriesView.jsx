import { useState, useEffect } from "react";
import {
    getParentCategories,
    fetchSubCategories,
    createSubCategoryByAdmin,
    updateSubCategoryByAdmin,
    deleteSubCategoryByAdmin
} from "../../../services/categoryService";
import Button from "../../../components/common/Button/Button";
import Loading from "../../../components/common/Loading/Loading";
import ErrorMessage from "../../../components/common/ErrorMessage/ErrorMessage";
import "./SubCategoriesView.css";

export default function SubCategoriesView() {
    const [subCategories, setSubCategories] = useState([]);
    const [parentCategories, setParentCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingSub, setEditingSub] = useState(null);
    
    const [formData, setFormData] = useState({ 
        name: "", 
        description: "", 
        parentCategory: "" 
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [subs, parents] = await Promise.all([
                fetchSubCategories(),
                getParentCategories()
            ]);
            setSubCategories(subs);
            setParentCategories(parents);
        } catch (err) {
            setError("Error al cargar subcategorías");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSub) {
                await updateSubCategoryByAdmin(editingSub._id, formData);
            } else {
                await createSubCategoryByAdmin(formData);
            }
            setShowForm(false);
            setEditingSub(null);
            setFormData({ name: "", description: "", parentCategory: "" });
            loadData();
        } catch (err) {
            setError("Error al guardar subcategoría");
        }
    };

    const handleEdit = (sub) => {
        setEditingSub(sub);
        setFormData({ 
            name: sub.name, 
            description: sub.description || "", 
            parentCategory: sub.parentCategory?._id || sub.parentCategory || "" 
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Eliminar esta subcategoría?")) {
            try {
                await deleteSubCategoryByAdmin(id);
                loadData();
            } catch (err) {
                setError(err.response?.data?.message || "Error al eliminar");
            }
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="subcategories-view">
            <div className="subcategories-header">
                <h2>Gestión de Subcategorías (Equipos/Niveles)</h2>
                <Button onClick={() => setShowForm(true)}>Nueva Subcategoría</Button>
            </div>

            {error && <ErrorMessage message={error} />}

            {showForm && (
                <div className="subcategories-form-overlay">
                    <form onSubmit={handleSubmit} className="subcategories-form">
                        <h3>{editingSub ? "Editar" : "Nueva"} Subcategoría</h3>
                        
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
                            <label>Categoría Principal (Liga)</label>
                            <select 
                                value={formData.parentCategory}
                                onChange={(e) => setFormData({ ...formData, parentCategory: e.target.value })}
                                required
                            >
                                <option value="">Seleccionar padre...</option>
                                {parentCategories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Descripción</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-actions">
                            <Button type="submit">Guardar</Button>
                            <Button variant="secondary" onClick={() => { setShowForm(false); setEditingSub(null); }}>
                                Cancelar
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="subcategories-table-container">
                <table className="subcategories-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Categoría Padre</th>
                            <th>Descripción</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subCategories.map((sub) => (
                            <tr key={sub._id}>
                                <td>{sub.name}</td>
                                <td>
                                    <span className="parent-badge">
                                        {sub.parentCategory?.name || "Sin padre"}
                                    </span>
                                </td>
                                <td>{sub.description}</td>
                                <td>
                                    <Button size="small" onClick={() => handleEdit(sub)}>Editar</Button>
                                    <Button size="small" variant="danger" onClick={() => handleDelete(sub._id)}>Eliminar</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
