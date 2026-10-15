const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// Task 2 — Add Product to Wishlist API
exports.addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Validate product ID format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Check if product exists in database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const customer = await Customer.findById(req.user._id);

    // Check duplicate
    const isAlreadyWishlisted = customer.wishlist.some(
      (id) => id.toString() === productId
    );

    if (isAlreadyWishlisted) {
      return res.status(409).json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    // Add to wishlist and save
    customer.wishlist.push(productId);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist",
    });
  } catch (error) {
    next(error);
  }
};

// Task 3 — Get Current User's Wishlist API with populate()
exports.getWishlist = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: "wishlist",
      select: "name price category image stock description",
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Filter out null entries in case a referenced product was removed from DB
    const wishlist = (customer.wishlist || []).filter((item) => item !== null);

    return res.status(200).json({
      success: true,
      count: wishlist.length,
      wishlist,
    });
  } catch (error) {
    next(error);
  }
};

// Task 4 — Remove Product from Wishlist API
exports.removeFromWishlist = async (req, res, next) => {
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

    // Check if product exists in user's wishlist
    const exists = customer.wishlist.some(
      (id) => id.toString() === productId
    );

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "Product not in wishlist",
      });
    }

    // Filter out product ID and save
    customer.wishlist = customer.wishlist.filter(
      (id) => id.toString() !== productId
    );
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    next(error);
  }
};

// Bonus Task 23 — Wishlist Toggle API
exports.toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const customer = await Customer.findById(req.user._id);
    const isWishlisted = customer.wishlist.some(
      (id) => id.toString() === productId
    );

    if (isWishlisted) {
      customer.wishlist = customer.wishlist.filter(
        (id) => id.toString() !== productId
      );
      await customer.save();
      return res.status(200).json({
        success: true,
        message: "Product removed from wishlist",
        isWishlisted: false,
      });
    } else {
      customer.wishlist.push(productId);
      await customer.save();
      return res.status(200).json({
        success: true,
        message: "Product added to wishlist",
        isWishlisted: true,
      });
    }
  } catch (error) {
    next(error);
  }
};
