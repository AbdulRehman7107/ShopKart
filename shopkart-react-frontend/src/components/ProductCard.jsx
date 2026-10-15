import React, { useState } from "react";
import { Link } from "react-router-dom";
import { addToWishlist, removeFromWishlist } from "../services/api";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product, isInitiallyWishlisted = false, onWishlistChange }) {
  const isOutOfStock = product.stock <= 0;
  const { cart, addToCart } = useCart();

  // Wishlist state
  const [isSaved, setIsSaved] = useState(isInitiallyWishlisted);
  const [savingWishlist, setSavingWishlist] = useState(false);

  // Cart action state
  const [addingCart, setAddingCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);

  // Error feedback message
  const [errorMsg, setErrorMsg] = useState(null);

  // Check if item is already in user's cart
  const cartItem = cart.find((item) => item.product?._id === product._id);
  const isInCart = Boolean(cartItem);

  // Handle Wishlist Toggle
  const handleWishlistClick = async (e) => {
    e.preventDefault();
    if (savingWishlist) return;

    setSavingWishlist(true);
    setErrorMsg(null);

    try {
      if (!isSaved) {
        await addToWishlist(product._id);
        setIsSaved(true);
        if (onWishlistChange) onWishlistChange(product._id, true);
      } else {
        await removeFromWishlist(product._id);
        setIsSaved(false);
        if (onWishlistChange) onWishlistChange(product._id, false);
      }
    } catch (err) {
      console.error("Wishlist error:", err);
      setErrorMsg(err.message || "Unable to save product.");
    } finally {
      setSavingWishlist(false);
    }
  };

  // Handle Add to Cart action
  const handleAddToCartClick = async (e) => {
    e.preventDefault();
    if (addingCart || isOutOfStock) return;

    setAddingCart(true);
    setErrorMsg(null);

    try {
      await addToCart(product._id, 1);
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 2000);
    } catch (err) {
      console.error("Add to cart error:", err);
      setErrorMsg(err.message || "Could not add to cart. Stock limit reached.");
    } finally {
      setAddingCart(false);
    }
  };

  return (
    <div className="product-card">
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

        {/* Top-right quick heart wishlist action */}
        <button
          onClick={handleWishlistClick}
          disabled={savingWishlist}
          className={`wishlist-heart-btn ${isSaved ? "saved" : ""}`}
          title={isSaved ? "Remove from Wishlist" : "Add to Wishlist"}
          aria-label={isSaved ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          {savingWishlist ? "⏳" : isSaved ? "♥" : "♡"}
        </button>
      </div>

      <div className="product-card-body">
        <h3 className="product-card-title">{product.name}</h3>

        <div className="product-card-price">
          ₹{product.price ? product.price.toLocaleString("en-IN") : product.price}
        </div>

        <div className={`product-card-stock ${isOutOfStock ? "out-of-stock" : "in-stock"}`}>
          {isOutOfStock ? "Out of Stock" : `${product.stock} units left`}
        </div>

        {errorMsg && <div className="card-error-text">{errorMsg}</div>}

        <div className="product-card-actions-row">
          <Link to={`/products/${product._id}`} className="view-details-btn">
            View Details
          </Link>
          <button
            onClick={handleAddToCartClick}
            disabled={addingCart || isOutOfStock}
            className={`add-cart-btn ${isInCart ? "in-cart" : ""}`}
          >
            {addingCart
              ? "⏳ Adding..."
              : cartSuccess
              ? "Added ✓"
              : isInCart
              ? "Add Another"
              : "Add to Cart 🛒"}
          </button>
        </div>
      </div>
    </div>
  );
}
