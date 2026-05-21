const mongoose = require("mongoose");
const Order = require("../models/order");
const Food = require("../models/Food");
const { getIO } = require("../config/socket");

// @desc    Place a new order
// @route   POST /api/v1/orders
// @access  Private (Logged-in users)
exports.placeOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod } = req.body;

    // --- 1. Basic input validation ---
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Order must contain at least one item",
      });
    }

    if (!deliveryAddress) {
      return res.status(400).json({
        success: false,
        error: "Delivery address is required",
      });
    }

    // --- 2. Validate each item and calculate total price ---
    let totalPrice = 0;
    const resolvedItems = [];

    for (const item of items) {
      // Validate food ObjectId
      if (!mongoose.Types.ObjectId.isValid(item.food)) {
        return res.status(400).json({
          success: false,
          error: `Invalid food ID: ${item.food}`,
        });
      }

      // Validate quantity
      if (!item.quantity || item.quantity < 1) {
        return res.status(400).json({
          success: false,
          error: "Each item must have a quantity of at least 1",
        });
      }

      // Fetch food from DB to get real price and check availability
      const food = await Food.findById(item.food);

      if (!food) {
        return res.status(404).json({
          success: false,
          error: `Food item not found: ${item.food}`,
        });
      }

      if (!food.isavailable) {
        return res.status(400).json({
          success: false,
          error: `"${food.name}" is currently unavailable`,
        });
      }

      // Snapshot the current price from DB (not from client)
      resolvedItems.push({
        food: food._id,
        quantity: item.quantity,
        price: food.price,
      });

      totalPrice += food.price * item.quantity;
    }

    // --- 3. Create the order ---
    const order = await Order.create({
      user: req.user._id,        // set from protect middleware
      items: resolvedItems,
      totalPrice,
      deliveryAddress,
      paymentMethod: paymentMethod || "cash",
    });

    // Populate food details in the response
    await order.populate("items.food", "name price category");
    await order.populate("user", "name email");

    // 🔴 REAL-TIME: Notify all admins about the new order
    try {
      getIO().to("admin").emit("orderPlaced", {
        message: `New order from ${req.user.name || "a customer"}`,
        order,
      });
    } catch (_) {} // socket may not be needed in test environments

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get orders (Admin: all orders | Customer: own orders only)
// @route   GET /api/v1/orders
// @access  Private (Logged-in users)
exports.getOrders = async (req, res) => {
  try {
    let query;

    if (req.user.role === "admin") {
      // Admin sees ALL orders, newest first
      query = Order.find();
    } else {
      // Customer sees ONLY their own orders
      query = Order.find({ user: req.user._id });
    }

    const orders = await query
      .populate("user", "name email")           // show who placed the order
      .populate("items.food", "name price category") // show food details
      .sort({ createdAt: -1 });                  // newest first

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Update order status
// @route   PUT /api/v1/orders/:id
// @access  Private (Admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // --- 1. Validate the ObjectId ---
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid order ID format",
      });
    }

    // --- 2. Validate the status value ---
    const allowedStatuses = ["pending", "confirmed", "preparing", "delivered", "cancelled"];

    if (!status) {
      return res.status(400).json({
        success: false,
        error: "Status field is required",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`,
      });
    }

    // --- 3. Find the order ---
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // --- 4. Block updates on already cancelled orders ---
    if (order.status === "cancelled") {
      return res.status(400).json({
        success: false,
        error: "Cannot update a cancelled order",
      });
    }

    // --- 5. Auto-mark payment when delivered ---
    order.status = status;
    if (status === "delivered" && !order.isPaid) {
      order.isPaid = true;
      order.paidAt = new Date();
    }

    await order.save();

    // Populate for a rich response
    await order.populate("user", "name email");
    await order.populate("items.food", "name price category");

    // 🔴 REAL-TIME: Notify the customer who placed this order
    try {
      getIO().to(`user:${order.user._id}`).emit("orderStatusUpdated", {
        orderId: order._id,
        status: order.status,
        message: `Your order status changed to "${status}"`,
        isPaid: order.isPaid,
      });
    } catch (_) {} // socket may not be needed in test environments

    res.status(200).json({
      success: true,
      message: `Order status updated to "${status}"`,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
