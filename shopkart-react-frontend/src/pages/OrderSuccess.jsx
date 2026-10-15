import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getOrderById } from "../services/api";

// Task 6 — Order Confirmation Page shown after successful Razorpay payment
export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      try {
        const response = await getOrderById(id);
        setOrder(response.order);
      } catch (err) {
        setError(err.message || "Failed to load order details.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  return (
    <div className="cart-page-container">
      <Navbar />
      <main className="main-content">

        {loading && (
          <div className="state-container loading-state">
            <div className="spinner"></div>
            <p className="loading">Loading your order...</p>
          </div>
        )}

        {!loading && error && (
          <div className="state-container error-state">
            <div className="empty-icon">⚠️</div>
            <h3>Could not load order</h3>
            <p className="error">{error}</p>
            <Link to="/orders" className="retry-btn">My Orders</Link>
          </div>
        )}

        {!loading && order && (
          <div className="order-success-container">
            <div className="success-icon">✅</div>
            <h1 className="success-title">Order Placed Successfully!</h1>
            <p className="success-subtitle">
              Your payment was verified and your order has been saved.
            </p>

            <div className="order-detail-card">
              <div className="order-detail-row">
                <span className="order-detail-label">Order ID</span>
                <span className="order-detail-value order-id-text">{order._id}</span>
              </div>
              <div className="order-detail-row">
                <span className="order-detail-label">Total Amount</span>
                <span className="order-detail-value order-total-amount">
                  ₹{order.totalAmount?.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="order-detail-row">
                <span className="order-detail-label">Payment Status</span>
                <span className={`order-status-badge status-${order.paymentStatus?.toLowerCase()}`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="order-detail-row">
                <span className="order-detail-label">Order Status</span>
                <span className={`order-status-badge status-placed`}>
                  {order.status}
                </span>
              </div>
              {order.createdAt && (
                <div className="order-detail-row">
                  <span className="order-detail-label">Placed On</span>
                  <span className="order-detail-value">
                    {new Date(order.createdAt).toLocaleString("en-IN")}
                  </span>
                </div>
              )}
            </div>

            <div className="success-actions">
              <Link to="/orders" className="view-orders-btn">View My Orders</Link>
              <Link to="/products" className="continue-shopping-btn">Continue Shopping</Link>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
