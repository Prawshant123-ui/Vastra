const express = require("express");
const router = express.Router();

const { getAddresses, addAddress, updateAddress, deleteAddress } = require("../controllers/addressController");
const { protect } = require("../middleware/authMiddleware");



router.get("/",protect, getAddresses);
router.post("/",protect, addAddress);
router.patch("/:id",protect, updateAddress);
router.delete("/:id", deleteAddress);

module.exports = router;