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
// update the price by id
exports.updatefood = async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
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

exports.deletefood = async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) {
      res.status(404).json({
        success: false,
        error: "food not found",
      });
    }
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
