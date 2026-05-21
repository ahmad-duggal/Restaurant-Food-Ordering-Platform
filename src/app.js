const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const foodroutes = require("./routes/foodRoutes");
const userRoutes = require("./routes/userroutes");
const orderRoutes = require("./routes/orderRoutes");

// Initialize environment variables
dotenv.config();

// Connect to the DB
connectDB();

const app = express();

// Middleware to handle JSON data from frontend
app.use(express.json());

// CORS — allow requests from React frontend (dev + production)
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, mobile apps, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
  })
);

app.use("/api/v1/food", foodroutes);
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/orders", orderRoutes);

// A simple "Welcome" route to test
app.get("/", (req, res) => {
  res.send("Restaurant API is running...");
});
module.exports = app;
