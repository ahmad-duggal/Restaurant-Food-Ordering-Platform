const http = require("http");
const app = require("./app");
const { initSocket } = require("./config/socket");

const PORT = process.env.PORT || 5000;

// Create a raw HTTP server from the Express app
// (Socket.IO needs direct access to the HTTP server, not just the Express app)
const httpServer = http.createServer(app);

// Attach Socket.IO to the HTTP server
initSocket(httpServer);

// Start listening
httpServer.listen(PORT, () => {
  console.log(`🚀 Server is flying on port ${PORT}`);
  console.log(`⚡ Socket.IO is live on port ${PORT}`);
});
