const express = require("express");
const router = express.Router();

const { initiatePayment, verifyPayment, getPaymentByOrder } = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

router.post("/initiate", protect, initiatePayment);
router.get("/verify", verifyPayment);
router.get("/order/:orderId", protect, getPaymentByOrder);

module.exports = router;