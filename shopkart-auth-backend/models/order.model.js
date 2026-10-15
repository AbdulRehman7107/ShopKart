const mongoose = require("mongoose");

// Lab 06: Order model — stores a permanent snapshot of what the user purchased
// We snapshot name and price so old orders don't change if product changes later
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    // Each item stores a snapshot of product data at purchase time
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        // Snapshot fields — these don't change even if the product is updated later
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        image: {
          type: String,
        },
      },
    ],

    shippingAddress: {
      fullName: String,
      phone: String,
      addressLine1: String,
      city: String,
      state: String,
      pincode: String,
    },

    // Server calculates this — never trust the frontend total
    totalAmount: {
      type: Number,
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },

    status: {
      type: String,
      enum: ["PENDING_PAYMENT", "PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"],
      default: "PENDING_PAYMENT",
    },

    // Razorpay identifiers stored after successful payment
    razorpayOrderId: String,
    razorpayPaymentId: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
