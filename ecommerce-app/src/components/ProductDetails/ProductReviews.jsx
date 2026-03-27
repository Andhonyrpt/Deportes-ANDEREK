import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getProductReviews, createReview, deleteReview } from "../../services/reviewService";
import Button from "../common/Button/Button";
import "./ProductReviews.css";

export default function ProductReviews({ productId }) {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        loadReviews();
    }, [productId]);

    const loadReviews = async () => {
        setLoading(true);
        try {
            const data = await getProductReviews(productId);
            setReviews(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rating || !comment.trim()) {
            setError("Por favor incluye una calificación y un comentario.");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            await createReview({ productId, rating: Number(rating), comment });
            setComment('');
            setRating(5);
            await loadReviews();
        } catch (err) {
            setError(err.response?.data?.message || "Error al publicar la reseña.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm("¿Seguro que deseas eliminar esta reseña?")) return;
        try {
            await deleteReview(reviewId);
            setReviews(prev => prev.filter(r => r._id !== reviewId));
        } catch (err) {
            alert("No se pudo eliminar la reseña.");
        }
    };

    const renderStars = (num) => {
        return "★".repeat(num) + "☆".repeat(5 - num);
    };

    if (loading) return <div className="reviews-loading">Cargando reseñas...</div>;

    const userHasReviewed = user ? reviews.some(r => r.user?._id === user._id || r.user === user._id) : false;

    return (
        <div className="product-reviews-container">
            <h2 className="reviews-title">Reseñas del Producto</h2>

            <div className="reviews-list">
                {reviews.length === 0 ? (
                    <p className="no-reviews-text">Aún no hay reseñas para este producto. ¡Sé el primero en opinar!</p>
                ) : (
                    reviews.map(review => (
                        <div key={review._id} className="review-card">
                            <div className="review-header">
                                <span className="review-author">{review.user?.displayName || review.user?.name || "Usuario verificado"}</span>
                                <span className="review-stars">{renderStars(review.rating)}</span>
                            </div>
                            <p className="review-comment">{review.comment}</p>
                            <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                            {user && (review.user?._id === user._id || review.user === user._id) && (
                                <button className="delete-review-btn" onClick={() => handleDelete(review._id)}>
                                    Eliminar mi reseña
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>

            {user ? (
                !userHasReviewed ? (
                    <form className="review-form" onSubmit={handleSubmit}>
                        <h3>Escribe tu opinión</h3>
                        {error && <div className="review-error">{error}</div>}
                        
                        <div className="form-group">
                            <label>Calificación</label>
                            <select value={rating} onChange={(e) => setRating(e.target.value)} required>
                                <option value="5">5 - Excelente</option>
                                <option value="4">4 - Muy bueno</option>
                                <option value="3">3 - Bueno</option>
                                <option value="2">2 - Regular</option>
                                <option value="1">1 - Malo</option>
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label>Comentario</label>
                            <textarea 
                                rows="4" 
                                value={comment} 
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="¿Qué te pareció el producto?"
                                required
                            />
                        </div>

                        <Button type="submit" variant="primary" disabled={submitting}>
                            {submitting ? "Publicando..." : "Publicar Reseña"}
                        </Button>
                    </form>
                ) : (
                    <div className="already-reviewed-msg">
                        Ya has dejado una reseña para este producto. Gracias por tu opinión.
                    </div>
                )
            ) : (
                <div className="login-to-review">
                    <p><a href="/login" className="login-link">Inicia sesión</a> para dejar una reseña.</p>
                </div>
            )}
        </div>
    );
}
