import React from 'react';
import './ProductCardSkeleton.css';

export default function ProductCardSkeleton({ orientation = "vertical" }) {
    const cardClass = `product-card-skeleton product-card-skeleton--${orientation}`;

    return (
        <div className={cardClass} data-testid="product-card-skeleton">
            <div className="skeleton-image"></div>
            <div className="skeleton-content">
                <div className="skeleton-title"></div>
                <div className="skeleton-price"></div>
                <div className="skeleton-actions">
                    <div className="skeleton-btn"></div>
                    <div className="skeleton-btn"></div>
                </div>
            </div>
        </div>
    );
}
