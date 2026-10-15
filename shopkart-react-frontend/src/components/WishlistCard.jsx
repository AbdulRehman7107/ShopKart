import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function WishlistCard({ product, onRemove }) {
  const [removing, setRemoving] = useState(false);
  const isOutOfStock = product.stock <= 0;

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await onRemove(product._id);
    } catch (err) {
      console.error("Failed to remove product:", err);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="product-card wishlist-card">
      <div className="product-card-image-container">
        <img
          src={product.image}
          alt={product.name}
          className="product-card-image"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
          }}
        />
        <span className="product-card-category">{product.category}</span>
      </div>

      <div className="product-card-body">
        <h3 className="product-card-title">{product.name}</h3>

        <div className="product-card-price">
          ₹{product.price ? product.price.toLocaleString("en-IN") : product.price}
        </div>

        <div className={`product-card-stock ${isOutOfStock ? "out-of-stock" : "in-stock"}`}>
          {isOutOfStock ? "Out of Stock" : `${product.stock} units left`}
        </div>

        <div className="product-card-actions wishlist-card-actions">
          <Link to={`/products/${product._id}`} className="view-details-btn">
            View Details
          </Link>
          <button
            onClick={handleRemove}
            disabled={removing}
            className="remove-wishlist-btn"
          >
            {removing ? "⏳ Removing..." : "Remove ♥"}
          </button>
        </div>
      </div>
    </div>
  );
}
