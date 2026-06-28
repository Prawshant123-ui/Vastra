const express = require("express");
const router = express.Router();

const {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");



router.post("/",protect, placeOrder);
router.get("/my",protect, getMyOrders);
router.get("/my/:id",protect, getOrderById);
router.patch("/my/:id/cancel",protect, cancelOrder);

router.get("/admin",protect, adminOnly, getAllOrders);
router.patch("/admin/:id/status",protect, adminOnly, updateOrderStatus);

module.exports = router;