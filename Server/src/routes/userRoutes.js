
const express      = require("express");
const router       = express.Router();
const { getAllUsers, getUserById, updateUserRole, deleteUser } = require("../controllers/userController");
const { protect }  = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

router.get("/",           protect, adminOnly, getAllUsers);
router.get("/:id",        protect, adminOnly, getUserById);
router.patch("/:id/role", protect, adminOnly, updateUserRole);
router.delete("/:id",     protect, adminOnly, deleteUser);

module.exports = router;