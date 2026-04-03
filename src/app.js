const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const foodroutes = require("./routes/foodRoutes");
const userRoutes = require("./routes/userroutes");

// Initialize environment variables
dotenv.config();

// Connect to the DB
connectDB();

const app = express();

// Middleware to handle JSON data from frontend
app.use(express.json());
app.use("/api/v1/food", foodroutes);
app.use("/api/v1/auth", userRoutes);

// A simple "Welcome" route to test
app.get("/", (req, res) => {
  res.send("Restaurant API is running...");
});
module.exports = app;
