const mongoose = require("mongoose");
const Food = require("../models/Food");
// @desc    Add a new food item to the menu
// @route   POST /api/v1/food
exports.addfood = async (req, res) => {
  try {
    const food = await Food.create(req.body);
    res.status(201).json({
      success: true,

      data: food,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getallfood = async (req, res) => {
  try {
    const foods = await Food.find();
    res.status(200).json({
      success: true,
      count: foods.length,
      data: foods,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getsinglefood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({
        success: false,
        error: "food not found",
      });
    }
    res.status(200).json({
      success: true,
      data: food,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
// @desc    Update a food item by ID
// @route   PUT /api/v1/food/:id
// @access  Private (Admin only)
exports.updatefood = async (req, res) => {
  try {
    // Validate MongoDB ObjectId before hitting the DB
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid food ID format",
      });
    }

    const food = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,           // return the updated document
      runValidators: true, // enforce schema validations on update
    });

    if (!food) {
      return res.status(404).json({
        success: false,
        error: "Food not found",
      });
    }

    res.status(200).json({
      success: true,
      data: food,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Delete a food item by ID
// @route   DELETE /api/v1/food/:id
// @access  Private (Admin only)
exports.deletefood = async (req, res) => {
  try {
    // Validate MongoDB ObjectId before hitting the DB
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid food ID format",
      });
    }

    const food = await Food.findByIdAndDelete(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        error: "Food not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Food item deleted successfully",
      data: {},
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
