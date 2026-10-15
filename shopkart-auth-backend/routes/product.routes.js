const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getSingleProduct,
} = require("../controllers/product.controller");

router.post("/", createProduct);
router.get("/", getAllProducts);
router.get("/:id", getSingleProduct);

module.exports = router;