/**
 * socket.js — Frontend Socket.IO client
 *
 * Usage:
 *   import { connectSocket, disconnectSocket, getSocket } from "../api/socket";
 *
 *   // On login:
 *   connectSocket(userId, role);
 *
 *   // To listen to events:
 *   getSocket().on("orderStatusUpdated", (data) => { ... });
 *
 *   // On logout:
 *   disconnectSocket();
 */

import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api/v1", "") || "http://localhost:5000";

let socket = null;

/**
 * Connect to the Socket.IO server and join user/admin rooms
 * @param {string} userId - MongoDB user _id
 * @param {string} role   - "user" | "admin"
 */
export const connectSocket = (userId, role) => {
  if (socket?.connected) return; // already connected

  socket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("⚡ Socket connected:", socket.id);
    // Join personal room (and admin room if admin)
    socket.emit("joinRoom", { userId, role });
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected");
  });
};

/**
 * Disconnect from Socket.IO (call on logout)
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("🔌 Socket manually disconnected");
  }
};

/**
 * Get the active socket instance (to attach event listeners)
 * @returns {Socket|null}
 */
export const getSocket = () => socket;
