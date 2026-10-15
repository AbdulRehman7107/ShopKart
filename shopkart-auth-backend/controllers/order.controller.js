const crypto = require("crypto");
const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const razorpay = require("../config/razorpay");

// POST /orders/create-payment-order
// Validates cart, checks stock, calculates total on server, creates pending order and Razorpay order
exports.createPaymentOrder = async (req, res, next) => {
  try {
    const { shippingAddress } = req.body;

    // Basic shipping address validation
    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.addressLine1 ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "All shipping address fields are required",
      });
    }

    // Load user with their cart
    const customer = await Customer.findById(req.user._id).populate({
      path: "cart.product",
      select: "name price stock image",
    });

    if (!customer.cart || customer.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty. Add items before placing an order.",
      });
    }

    // Reload fresh product data for each cart item (stock and price may have changed)
    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of customer.cart) {
      if (!cartItem.product) {
        return res.status(400).json({
          success: false,
          message: "One or more products in your cart no longer exist.",
        });
      }

      // Fetch fresh product data from DB
      const product = await Product.findById(cartItem.product._id);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product "${cartItem.product.name}" is no longer available.`,
        });
      }

      // Final stock check — stock may have changed after item was added to cart
      if (cartItem.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${product.stock} unit(s) available.`,
        });
      }

      // Snapshot purchase-time data — server calculates price, never trusts frontend
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,         // current price at time of purchase
        quantity: cartItem.quantity,
        image: product.image,
      });

      // Server-side total calculation
      totalAmount += product.price * cartItem.quantity;
    }

    // Create pending ShopKart order in MongoDB
    const shopKartOrder = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      totalAmount,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT",
    });

    // Create Razorpay order (amount in paise: 1 INR = 100 paise)
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: shopKartOrder._id.toString(),
    });

    // Store Razorpay order ID in ShopKart order for later signature verification
    shopKartOrder.razorpayOrderId = razorpayOrder.id;
    await shopKartOrder.save();

    // Return checkout info to frontend — Key Secret NEVER goes here
    return res.status(201).json({
      success: true,
      shopKartOrderId: shopKartOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,       // in paise
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,   // Key ID is safe to send, NOT the secret
    });
  } catch (error) {
    next(error);
  }
};

// POST /orders/verify-payment
// Verifies Razorpay HMAC signature and marks order as PAID, clears cart only after success
exports.verifyPayment = async (req, res, next) => {
  try {
    const {
      shopKartOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!shopKartOrderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification data",
      });
    }

    // Load the ShopKart order
    const order = await Order.findById(shopKartOrderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Ensure this order belongs to the authenticated user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Use the Razorpay Order ID stored in OUR database, not what the client sent
    const body = order.razorpayOrderId + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    // Signature mismatch — payment cannot be trusted
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature. Payment could not be verified.",
      });
    }

    // Signature verified — mark order as paid and placed
    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // Clear user's cart only AFTER successful payment verification
    const customer = await Customer.findById(req.user._id);
    customer.cart = [];
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully. Order placed!",
      order: {
        _id: order._id,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /orders
// Returns all orders for the currently authenticated user, newest first
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// GET /orders/:id
// Returns a single order — user must own it
exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // A user must never see someone else's order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to view this order" });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};
