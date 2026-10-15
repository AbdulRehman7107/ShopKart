const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const customerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: [true, "Full name is required"], trim: true },
    email: { type: String, required: [true, "Email is required"], unique: true, lowercase: true, trim: true },
    password: { type: String, required: [true, "Password is required"], minlength: [6, "Password must contain at least 6 characters"], select: false },
    phone: { type: String, required: [true, "Phone number is required"], trim: true },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      }
    ],
    // Lab 05: Shopping cart array storing product references and quantity
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Cart item must reference a product"]
        },
        quantity: {
          type: Number,
          default: 1,
          min: [1, "Quantity must be at least 1"]
        }
      }
    ]
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

customerSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

customerSchema.methods.comparePassword = function comparePassword(plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

module.exports = mongoose.model("Customer", customerSchema);
