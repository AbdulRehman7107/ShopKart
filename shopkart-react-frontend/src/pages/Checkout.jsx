import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { createPaymentOrder, verifyPayment } from "../services/api";

// Dynamically loads the Razorpay checkout script from Razorpay CDN
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const INITIAL_FORM = {
  fullName: "",
  phone: "",
  addressLine1: "",
  city: "",
  state: "",
  pincode: "",
};

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, subtotal, clearCart } = useCart();

  const [form, setForm] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [backendError, setBackendError] = useState("");
  const [paymentError, setPaymentError] = useState("");

  // Redirect to cart if somehow accessed with empty cart
  if (!cart || cart.length === 0) {
    return (
      <div className="cart-page-container">
        <Navbar />
        <main className="main-content">
          <div className="state-container empty-state">
            <div className="empty-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>You need to add items to your cart before checking out.</p>
            <Link to="/products" className="retry-btn">Browse Products</Link>
          </div>
        </main>
      </div>
    );
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear the field error as user types
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: "" });
    }
  };

  // Task 3: Client-side shipping form validation
  const validate = () => {
    const errors = {};
    if (!form.fullName.trim()) errors.fullName = "Full name is required";
    if (!form.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      errors.phone = "Enter a valid 10-digit Indian phone number";
    }
    if (!form.addressLine1.trim()) errors.addressLine1 = "Address is required";
    if (!form.city.trim()) errors.city = "City is required";
    if (!form.state.trim()) errors.state = "State is required";
    if (!form.pincode.trim()) {
      errors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(form.pincode.trim())) {
      errors.pincode = "Pincode must contain exactly 6 digits";
    }
    return errors;
  };

  const handlePlaceOrder = async () => {
    setBackendError("");
    setPaymentError("");

    // Validate form before calling backend
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);

    // Load Razorpay checkout script
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setBackendError("Could not load payment gateway. Please check your internet connection.");
      setLoading(false);
      return;
    }

    let orderData;
    try {
      // Backend validates cart, stock, calculates total, creates pending order and Razorpay order
      orderData = await createPaymentOrder(form);
    } catch (err) {
      setBackendError(err.message || "Failed to create order. Please try again.");
      setLoading(false);
      return;
    }

    setLoading(false);

    // Open Razorpay Checkout — cart is NOT cleared yet
    const options = {
      key: orderData.key,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "ShopKart",
      description: "ShopKart Order",
      order_id: orderData.razorpayOrderId,
      prefill: {
        name: form.fullName,
        contact: form.phone,
      },
      theme: {
        color: "#2563eb",
      },
      handler: async function (response) {
        // Razorpay returned payment data — send to backend for signature verification
        setLoading(true);
        try {
          const verifyResponse = await verifyPayment({
            shopKartOrderId: orderData.shopKartOrderId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (verifyResponse.success) {
            // Payment verified — now clear global cart state and navigate to confirmation
            clearCart();
            navigate(`/order-success/${verifyResponse.order._id}`);
          }
        } catch (err) {
          setPaymentError(
            err.message || "Payment verification failed. Please contact support."
          );
        } finally {
          setLoading(false);
        }
      },
    };

    const paymentObject = new window.Razorpay(options);

    paymentObject.on("payment.failed", function (response) {
      console.error("Razorpay payment failed:", response.error);
      setPaymentError(
        "Payment failed. Your cart has not been cleared. Please try again."
      );
    });

    paymentObject.open();
  };

  return (
    <div className="cart-page-container">
      <Navbar />
      <main className="main-content">
        <header className="page-header">
          <h1>Checkout</h1>
          <p>Fill in your shipping details to place the order</p>
        </header>

        <div className="checkout-layout">
          {/* Shipping Details Form */}
          <div className="checkout-form-card">
            <h2 className="checkout-section-title">Shipping Details</h2>

            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={form.fullName}
                onChange={handleChange}
                placeholder="e.g. Aarav Sharma"
                className={formErrors.fullName ? "input-error" : ""}
              />
              {formErrors.fullName && (
                <span className="field-error">{formErrors.fullName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
                className={formErrors.phone ? "input-error" : ""}
              />
              {formErrors.phone && (
                <span className="field-error">{formErrors.phone}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="addressLine1">Address</label>
              <input
                id="addressLine1"
                name="addressLine1"
                type="text"
                value={form.addressLine1}
                onChange={handleChange}
                placeholder="e.g. 22 MG Road, Indiranagar"
                className={formErrors.addressLine1 ? "input-error" : ""}
              />
              {formErrors.addressLine1 && (
                <span className="field-error">{formErrors.addressLine1}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="e.g. Bengaluru"
                  className={formErrors.city ? "input-error" : ""}
                />
                {formErrors.city && (
                  <span className="field-error">{formErrors.city}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="e.g. Karnataka"
                  className={formErrors.state ? "input-error" : ""}
                />
                {formErrors.state && (
                  <span className="field-error">{formErrors.state}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="pincode">Pincode</label>
              <input
                id="pincode"
                name="pincode"
                type="text"
                value={form.pincode}
                onChange={handleChange}
                placeholder="e.g. 560001"
                className={formErrors.pincode ? "input-error" : ""}
              />
              {formErrors.pincode && (
                <span className="field-error">{formErrors.pincode}</span>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-summary-box">
            <h2>Order Summary</h2>

            <div className="checkout-items-list">
              {cart.map((item) => (
                <div className="checkout-item-row" key={item.product?._id || item._id}>
                  <span className="checkout-item-name">
                    {item.product?.name || "Product"} × {item.quantity}
                  </span>
                  <span className="checkout-item-price">
                    ₹{((item.product?.price || 0) * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            <div className="summary-row subtotal-row">
              <span>Total</span>
              <span className="subtotal-amount">₹{subtotal.toLocaleString("en-IN")}</span>
            </div>

            <p className="summary-note">
              Final amount is calculated and verified by the server before payment.
            </p>

            {backendError && (
              <p className="error" style={{ marginBottom: "12px" }}>{backendError}</p>
            )}
            {paymentError && (
              <p className="error" style={{ marginBottom: "12px" }}>{paymentError}</p>
            )}

            <button
              id="place-order-btn"
              onClick={handlePlaceOrder}
              disabled={loading}
              className="checkout-btn"
            >
              {loading ? "Processing..." : "Place Order"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
