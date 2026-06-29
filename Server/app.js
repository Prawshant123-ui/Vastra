const express = require("express");
const cors    = require("cors");
const helmet  = require("helmet");
const morgan  = require("morgan");

const authRoutes      = require("./src/routes/authRoutes");
const categoryRoutes  = require("./src/routes/categoryRoutes");
const productRoutes   = require("./src/routes/productRoutes");
const cartRoutes      = require("./src/routes/cartRoutes");
const wishlistRoutes  = require("./src/routes/wishlistRoutes");
const addressRoutes   = require("./src/routes/addressRoutes");
const orderRoutes     = require("./src/routes/orderRoutes");
const paymentRoutes   = require("./src/routes/paymentRoutes");
const analyticsRoutes = require("./src/routes/analyticsRoutes");
const userRoutes = require("./src/routes/userRoutes");

const app = express();

app.use(helmet());


app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options("/{*path}", cors());  
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/api/auth",       authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products",   productRoutes);
app.use("/api/cart",       cartRoutes);
app.use("/api/wishlist",   wishlistRoutes);
app.use("/api/addresses",  addressRoutes);
app.use("/api/orders",     orderRoutes);
app.use("/api/payments",   paymentRoutes);
app.use("/api/analytics",  analyticsRoutes);
app.use("/api/users", userRoutes);


app.use((err, req, res, next) => {
  console.error(" Global error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "Internal Server Error" : err.message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

module.exports = app;