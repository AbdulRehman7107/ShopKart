const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// Helper function to return populated customer cart
async function getPopulatedCart(userId) {
  const customer = await Customer.findById(userId).populate({
    path: "cart.product",
    select: "name price category image stock description",
  });
  if (!customer) return [];
  // Filter out any cart entries where referenced product was deleted from DB
  return (customer.cart || []).filter((item) => item.product !== null);
}

// Task 2 — Add Product to Cart API (POST /cart/:productId)
exports.addToCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const quantityToAdd = Number(req.body.quantity) || 1;

    // Validate product ID format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Check quantity validity
    if (quantityToAdd < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    // Check if product exists in DB
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const customer = await Customer.findById(req.user._id);

    // Check if product is already in cart
    const existingCartItem = customer.cart.find(
      (item) => item.product.toString() === productId
    );

    if (existingCartItem) {
      // Calculate total new quantity
      const newQuantity = existingCartItem.quantity + quantityToAdd;

      // Validate against product stock
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more items. Only ${product.stock} units available in stock.`,
        });
      }

      existingCartItem.quantity = newQuantity;
    } else {
      // Validate initial quantity against stock
      if (quantityToAdd > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add ${quantityToAdd} units. Only ${product.stock} units available.`,
        });
      }

      // Add new product item to cart
      customer.cart.push({
        product: productId,
        quantity: quantityToAdd,
      });
    }

    await customer.save();

    // Fetch populated cart for frontend response
    const populatedCart = await getPopulatedCart(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart: populatedCart,
    });
  } catch (error) {
    next(error);
  }
};

// Task 3 — Get Current User Cart API (GET /cart)
exports.getCart = async (req, res, next) => {
  try {
    const cart = await getPopulatedCart(req.user._id);

    return res.status(200).json({
      success: true,
      count: cart.length,
      cart,
    });
  } catch (error) {
    next(error);
  }
};

// Task 4 — Update Product Quantity API (PATCH /cart/:productId)
exports.updateQuantity = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // Validate product ID format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Validate quantity parameter
    const newQuantity = Number(quantity);
    if (isNaN(newQuantity) || newQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a valid number and at least 1",
      });
    }

    // Check product existence and stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check stock limit
    if (newQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Quantity exceeds available stock (${product.stock} available)`,
      });
    }

    const customer = await Customer.findById(req.user._id);

    // Find item in user's cart
    const cartItem = customer.cart.find(
      (item) => item.product.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart",
      });
    }

    // Update quantity and save
    cartItem.quantity = newQuantity;
    await customer.save();

    const populatedCart = await getPopulatedCart(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated",
      cart: populatedCart,
    });
  } catch (error) {
    next(error);
  }
};

// Task 5 — Remove Product from Cart API (DELETE /cart/:productId)
exports.removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Validate product ID format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const customer = await Customer.findById(req.user._id);

    // Remove item from cart array
    customer.cart = customer.cart.filter(
      (item) => item.product.toString() !== productId
    );

    await customer.save();

    const populatedCart = await getPopulatedCart(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: populatedCart,
    });
  } catch (error) {
    next(error);
  }
};
