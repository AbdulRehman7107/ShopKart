import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getProductById } from "../services/api";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProductById(id);
        if (data.success && data.product) {
          setProduct(data.product);
        } else if (data._id) {
          setProduct(data);
        } else {
          setError("Product not found");
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError(err.message || "Something went wrong while loading product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  return (
    <div className="product-details-page">
      <Navbar />

      <main className="main-content">
        <div className="breadcrumb">
          <Link to="/products" className="back-link">
            ← Back to Products
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="state-container loading-state">
            <div className="spinner"></div>
            <p className="loading">Loading product details...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="state-container error-state">
            <h2>Oops!</h2>
            <p className="error">{error}</p>
            <Link to="/products" className="retry-btn">
              Return to Catalog
            </Link>
          </div>
        )}

        {/* Product Details Display */}
        {!loading && !error && product && (
          <div className="product-details-card">
            <div className="product-details-image-section">
              <img
                src={product.image}
                alt={product.name}
                className="details-large-image"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/500x400?text=Product+Image";
                }}
              />
            </div>

            <div className="product-details-info-section">
              <span className="details-category-badge">{product.category}</span>
              <h1 className="details-title">{product.name}</h1>

              <div className="details-price">
                ₹{product.price ? product.price.toLocaleString("en-IN") : product.price}
              </div>

              <div className={`details-stock ${product.stock <= 0 ? "out-of-stock" : "in-stock"}`}>
                {product.stock <= 0 ? "Out of Stock" : `In Stock: ${product.stock} units available`}
              </div>

              <div className="details-description">
                <h3>Description</h3>
                <p>{product.description}</p>
              </div>

              <div className="details-actions">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="add-to-cart-btn"
                >
                  {addedToCart ? "Added to Cart! ✓" : "Add to Cart"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
