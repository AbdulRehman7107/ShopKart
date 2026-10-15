const mongoose = require("mongoose");
const Product = require("../models/product.model");

// Task 2 — Create Product API
exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    // Check missing fields
    if (!name || !description || price === undefined || !category || !image || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, description, price, category, image, stock",
      });
    }

    // Validate price and stock
    if (Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0",
      });
    }

    if (Number(stock) < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot be negative",
      });
    }

    const newProduct = await Product.create({
      name,
      description,
      price,
      category,
      image,
      stock,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    next(error);
  }
};

// Task 3 & Task 5 — Get All Products API with Search, Filter & Sort
exports.getAllProducts = async (req, res, next) => {
  try {
    const { search, category, sort } = req.query;

    const query = {};

    // Task 5: Case-insensitive search by product name
    if (search && search.trim() !== "") {
      query.name = { $regex: search.trim(), $options: "i" };
    }

    // Task 5: Filter by category (ignore if "All" or empty)
    if (category && category.trim() !== "" && category.toLowerCase() !== "all") {
      query.category = category.trim();
    }

    // Build Mongoose query
    let mongoQuery = Product.find(query);

    // Bonus: Sorting by price
    if (sort === "price_asc") {
      mongoQuery = mongoQuery.sort({ price: 1 });
    } else if (sort === "price_desc") {
      mongoQuery = mongoQuery.sort({ price: -1 });
    } else {
      mongoQuery = mongoQuery.sort({ createdAt: -1 });
    }

    const products = await mongoQuery;

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// Task 4 — Get Single Product API
exports.getSingleProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};
