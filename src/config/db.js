const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // This will tell us EXACTLY why it failed (Auth vs Network)
    if (error.message.includes("Authentication failed")) {
      console.error(
        "❌ Error: Your username or password in .env is incorrect."
      );
    } else {
      console.error(`❌ Database Error: ${error.message}`);
    }
    process.exit(1);
  }
};

module.exports = connectDB;
