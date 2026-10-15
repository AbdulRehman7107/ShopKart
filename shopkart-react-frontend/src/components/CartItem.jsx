import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();
  const product = item.product || {};
  const quantity = item.quantity || 1;

  const [updating, setUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const stock = product.stock || 0;
  const isMinQuantity = quantity <= 1;
  const isMaxQuantity = quantity >= stock;

  // Handle increment quantity (+)
  const handleIncrease = async () => {
    if (updating || isMaxQuantity) return;
    setUpdating(true);
    setErrorMsg(null);
    try {
      await updateQuantity(product._id, quantity + 1);
    } catch (err) {
      console.error("Failed to increase quantity:", err);
      setErrorMsg(err.message || "Cannot exceed available stock.");
    } finally {
      setUpdating(false);
    }
  };

  // Handle decrement quantity (-)
  const handleDecrease = async () => {
    if (updating || isMinQuantity) return;
    setUpdating(true);
    setErrorMsg(null);
    try {
      await updateQuantity(product._id, quantity - 1);
    } catch (err) {
      console.error("Failed to decrease quantity:", err);
      setErrorMsg(err.message || "Quantity must be at least 1.");
    } finally {
      setUpdating(false);
    }
  };

  // Handle explicit item removal
  const handleRemove = async () => {
    if (updating) return;
    setUpdating(true);
    setErrorMsg(null);
    try {
      await removeFromCart(product._id);
    } catch (err) {
      console.error("Failed to remove item from cart:", err);
      setErrorMsg("Unable to remove item.");
      setUpdating(false);
    }
  };

  const lineTotal = (product.price || 0) * quantity;

  return (
    <div className="cart-item-card">
      <div className="cart-item-image-container">
        <img
          src={product.image}
          alt={product.name}
          className="cart-item-image"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/150?text=No+Image";
          }}
        />
      </div>

      <div className="cart-item-details">
        <div className="cart-item-header">
          <Link to={`/products/${product._id}`} className="cart-item-title">
            {product.name}
          </Link>
          <span className="cart-item-category">{product.category}</span>
        </div>

        <div className="cart-item-price">
          ₹{product.price ? product.price.toLocaleString("en-IN") : product.price}
        </div>

        {errorMsg && <div className="card-error-text">{errorMsg}</div>}

        <div className="cart-item-controls">
          {/* Quantity selector: [-] quantity [+] */}
          <div className="quantity-controls">
            <button
              onClick={handleDecrease}
              disabled={updating || isMinQuantity}
              className="qty-btn"
              title={isMinQuantity ? "Use Remove button to delete item" : "Decrease quantity"}
            >
              -
            </button>
            <span className="qty-value">{updating ? "⏳" : quantity}</span>
            <button
              onClick={handleIncrease}
              disabled={updating || isMaxQuantity}
              className="qty-btn"
              title={isMaxQuantity ? `Maximum available stock (${stock}) reached` : "Increase quantity"}
            >
              +
            </button>
          </div>

          <button
            onClick={handleRemove}
            disabled={updating}
            className="cart-remove-btn"
          >
            {updating ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>

      <div className="cart-item-total">
        <span className="total-label">Total</span>
        <span className="total-amount">
          ₹{lineTotal.toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  );
}
