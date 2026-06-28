const express = require("express");
const router = express.Router();

const {
  createProduct,
  getAllProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  deleteProductImage,
} = require("../controllers/productController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { createProductValidator } = require("../validators/productValidator");
const validateRequest = require("../validators/validateRequest");

router.post(
  "/",
  protect,
  adminOnly,
  upload.array("images", 5),
  createProductValidator,
  validateRequest,
  createProduct
);

router.get("/", getAllProducts);

router.get("/slug/:slug", getProductBySlug);

router.get("/:id", getProductById);

router.patch(
  "/:id",
  protect,
  adminOnly,
  upload.array("images", 5),
  updateProduct
);

router.delete("/:id", protect, adminOnly, deleteProduct);

router.delete("/:id/images/:imageId", protect, adminOnly, deleteProductImage);

module.exports = router;
