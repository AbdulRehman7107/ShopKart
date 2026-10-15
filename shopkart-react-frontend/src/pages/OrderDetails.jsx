import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getOrderById } from "../services/api";

// Single Order Details page — user must own the order
export default function OrderDetails() {
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

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="cart-page-container">
      <Navbar />
      <main className="main-content">
        <div className="breadcrumb">
          <Link to="/orders" className="back-link">← Back to My Orders</Link>
        </div>

        {loading && (
          <div className="state-container loading-state">
            <div className="spinner"></div>
            <p className="loading">Loading order details...</p>
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
          <div className="order-details-page">
            <header className="page-header">
              <h1>Order Details</h1>
              <p>Order ID: {order._id}</p>
            </header>

            {/* Status badges */}
            <div className="order-status-row">
              <span className={`order-status-badge status-${order.paymentStatus?.toLowerCase()}`}>
                Payment: {order.paymentStatus}
              </span>
              <span className={`order-status-badge status-${order.status?.toLowerCase().replace("_", "-")}`}>
                Status: {order.status}
              </span>
            </div>

            <div className="order-info-grid">
              {/* Items */}
              <div className="order-info-card">
                <h2>Items Ordered</h2>
                {order.items.map((item, i) => (
                  <div className="order-card-item-row" key={i}>
                    <div className="order-item-details">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="order-item-thumbnail"
                        />
                      )}
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                    </div>
                    <span>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                  </div>
                ))}
                <div className="summary-row subtotal-row">
                  <span>Total</span>
                  <span className="subtotal-amount">
                    ₹{order.totalAmount?.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="order-info-card">
                <h2>Shipping Address</h2>
                <p><strong>{order.shippingAddress?.fullName}</strong></p>
                <p>{order.shippingAddress?.phone}</p>
                <p>{order.shippingAddress?.addressLine1}</p>
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} -{" "}
                  {order.shippingAddress?.pincode}
                </p>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="order-info-card" style={{ marginTop: "20px" }}>
              <h2>Order Information</h2>
              <div className="summary-row">
                <span>Placed on</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              {order.razorpayOrderId && (
                <div className="summary-row">
                  <span>Razorpay Order ID</span>
                  <span className="order-id-text">{order.razorpayOrderId}</span>
                </div>
              )}
              {order.razorpayPaymentId && (
                <div className="summary-row">
                  <span>Payment ID</span>
                  <span className="order-id-text">{order.razorpayPaymentId}</span>
                </div>
              )}
            </div>

            <div className="success-actions" style={{ marginTop: "24px" }}>
              <Link to="/orders" className="view-orders-btn">Back to My Orders</Link>
              <Link to="/products" className="continue-shopping-btn">Continue Shopping</Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
