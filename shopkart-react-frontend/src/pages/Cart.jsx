import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CartItem from "../components/CartItem";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const navigate = useNavigate();
  const { cart, loading, error, totalItems, subtotal, fetchCart } = useCart();

  const handleCheckoutClick = () => {
    navigate("/checkout");
  };

  return (
    <div className="cart-page-container">
      <Navbar />

      <main className="main-content">
        <header className="page-header">
          <h1>My Cart</h1>
          <p>Review items in your cart before checkout</p>
        </header>

        {/* Task 17 — Loading Cart State */}
        {loading && (
          <div className="state-container loading-state">
            <div className="spinner"></div>
            <p className="loading">Loading your cart...</p>
          </div>
        )}

        {/* Task 17 — Error State */}
        {!loading && error && (
          <div className="state-container error-state">
            <div className="empty-icon">⚠️</div>
            <h3>Unable to load your cart.</h3>
            <p className="error">{error}</p>
            <button onClick={fetchCart} className="retry-btn">
              Try Again
            </button>
          </div>
        )}

        {/* Task 17 — Empty Cart State */}
        {!loading && !error && cart.length === 0 && (
          <div className="state-container empty-state">
            <div className="empty-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything yet.</p>
            <Link to="/products" className="retry-btn">
              Browse Products
            </Link>
          </div>
        )}

        {/* Task 8 & 13 — Cart Layout with Items & Order Summary */}
        {!loading && !error && cart.length > 0 && (
          <div className="cart-layout">
            <div className="cart-items-list">
              {cart.map((item) => (
                <CartItem key={item.product?._id || item._id} item={item} />
              ))}
            </div>

            {/* Order Summary Box */}
            <div className="order-summary-box">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Items ({cart.length} unique)</span>
                <span>{totalItems} units</span>
              </div>
              <div className="summary-row subtotal-row">
                <span>Subtotal</span>
                <span className="subtotal-amount">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>
              <p className="summary-note">Taxes and shipping calculated at checkout.</p>
              <button onClick={handleCheckoutClick} className="checkout-btn">
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
