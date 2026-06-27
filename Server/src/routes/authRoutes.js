const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  resendVerificationEmail,
} = require("../controllers/authController");

const {
  registerValidator,
  loginValidator,
  resetPasswordValidator,
} = require("../validators/authValidator");

const validateRequest = require("../validators/validateRequest");
const { apiLimiter, loginLimiter } = require("../services/rateLimiter");

router.post("/register",            apiLimiter,   registerValidator,      validateRequest, registerUser);
router.post("/login",               loginLimiter, loginValidator,         validateRequest, loginUser);
router.get( "/verify-email",                      verifyEmail);
router.post("/resend-verification", apiLimiter,   resendVerificationEmail);
router.post("/forgot-password",     apiLimiter,   forgotPassword);
router.post("/reset-password",      apiLimiter,   resetPasswordValidator, validateRequest, resetPassword);

module.exports = router;