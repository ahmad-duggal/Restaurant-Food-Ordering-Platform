const express = require("express");
const router = express.Router();

const { placeOrder, getOrders, updateOrderStatus } = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/usermiddleware");

// @route   GET  /api/v1/orders  - Get orders (Admin: all | Customer: own)
// @route   POST /api/v1/orders  - Place a new order
// @access  Private (any logged-in user)
router.route("/").get(protect, getOrders).post(protect, placeOrder);

// @route   PUT /api/v1/orders/:id  - Update order status
// @access  Private (Admin only)
router.route("/:id").put(protect, authorize("admin"), updateOrderStatus);

module.exports = router;
