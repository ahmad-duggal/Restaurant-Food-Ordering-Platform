const mongoose = require("mongoose");

const foodschema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "please add a food name "],
      unique: true,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "enter the price"],
    },
    category: {
      type: String,
      required: [true, "please add the category"],
      enum: ["appetizer", "Main Course", "Dessert", "Beverages"],
    },
    description: String,
    isavailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Food", foodschema);
