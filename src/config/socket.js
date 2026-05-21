/**
 * socket.js
 * Socket.IO server configuration.
 *
 * Room strategy:
 * - Each user joins their own room: "user:<userId>"
 * - Admins additionally join the "admin" room
 *
 * Events emitted by server:
 * - "orderPlaced"         → to "admin" room (new order arrived)
 * - "orderStatusUpdated"  → to "user:<customerId>" room (status changed)
 */

const { Server } = require("socket.io");

let io;

/**
 * Initialize Socket.IO and attach it to the HTTP server
 * @param {http.Server} httpServer - Node HTTP server instance
 * @returns {Server} io instance
 */
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`⚡ Socket connected: ${socket.id}`);

    // Client sends their userId and role to join the right rooms
    socket.on("joinRoom", ({ userId, role }) => {
      // Every user joins their personal room
      socket.join(`user:${userId}`);
      console.log(`📦 User ${userId} joined room: user:${userId}`);

      // Admins additionally join the shared admin room
      if (role === "admin") {
        socket.join("admin");
        console.log(`🛡️  Admin ${userId} joined room: admin`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Get the initialized io instance (use in controllers)
 * @returns {Server}
 */
const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized. Call initSocket() first.");
  }
  return io;
};

module.exports = { initSocket, getIO };
