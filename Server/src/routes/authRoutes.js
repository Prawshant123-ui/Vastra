const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  resendVerificationEmail,
  changePassword
} = require("../controllers/authController");

const {
  registerValidator,
  loginValidator,
  resetPasswordValidator,
} = require("../validators/authValidator");

const validateRequest = require("../validators/validateRequest");
const { loginLimiter } = require("../services/rateLimiter");
const {protect}=require("../middleware/authMiddleware")

router.post("/register", registerValidator, validateRequest, registerUser);
router.post("/login", loginLimiter, loginValidator, validateRequest, loginUser);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);
router.post("/forgot-password", forgotPassword);
router.post(
  "/reset-password",
  resetPasswordValidator,
  validateRequest,
  resetPassword,
);
router.patch("/change-password", protect, changePassword);

module.exports = router;
