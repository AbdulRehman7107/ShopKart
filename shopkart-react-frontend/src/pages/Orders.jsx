import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getMyOrders } from "../services/api";

// Task 8 — My Orders Page: shows all historical orders for the logged-in user
export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await getMyOrders();
        setOrders(response.orders || []);
      } catch (err) {
        setError(err.message || "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="cart-page-container">
      <Navbar />
      <main className="main-content">
        <header className="page-header">
          <h1>My Orders</h1>
          <p>Your complete order history</p>
        </header>

        {/* Loading state */}
        {loading && (
          <div className="state-container loading-state">
            <div className="spinner"></div>
            <p className="loading">Loading your orders...</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="state-container error-state">
            <div className="empty-icon">⚠️</div>
            <h3>Unable to load orders</h3>
            <p className="error">{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && orders.length === 0 && (
          <div className="state-container empty-state">
            <div className="empty-icon">📦</div>
            <h3>You haven't placed any orders yet</h3>
            <p>Browse products and add them to your cart to get started!</p>
            <Link to="/products" className="retry-btn">Start Shopping</Link>
          </div>
        )}

        {/* Orders list */}
        {!loading && !error && orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order) => (
              <div className="order-card" key={order._id}>
                <div className="order-card-header">
                  <div>
                    <span className="order-card-id">Order #{order._id.slice(-8).toUpperCase()}</span>
                    <span className="order-card-date">{formatDate(order.createdAt)}</span>
                  </div>
                  <span className={`order-status-badge status-${order.status?.toLowerCase().replace("_", "-")}`}>
                    {order.status}
                  </span>
                </div>

                <div className="order-card-items">
                  {order.items.map((item, index) => (
                    <div key={index} className="order-card-item-row">
                      <span>{item.name} × {item.quantity}</span>
                      <span>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>

                <div className="order-card-footer">
                  <div className="order-card-total">
                    Total: <strong>₹{order.totalAmount?.toLocaleString("en-IN")}</strong>
                  </div>
                  <Link to={`/orders/${order._id}`} className="view-details-btn order-view-btn">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
