require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
// Allow configuring frontend origin via env so deployed frontend can connect
const FRONTEND_URL = process.env.FRONTEND_URL || '*';

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL === '*' ? '*' : FRONTEND_URL,
    methods: ['GET', 'POST']
  }
});

// Middleware - configure CORS for Express as well
app.use(cors({
  origin: FRONTEND_URL === '*' ? true : FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use("/public", express.static(path.join(__dirname, "public")));

// Store socket instance in app for use in routes
app.set('socketio', io);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/client", require("./routes/client.routes"));
app.use("/api/whatsapp", require("./routes/whatsapp.routes"));
app.use("/api/campaign", require("./routes/campaign.routes"));
app.use("/api/chat", require("./routes/chat.routes"));
app.use("/api/wallet", require("./routes/wallet.routes"));
app.use("/api/profile", require("./routes/profile.routes"));
app.use("/api/team", require("./routes/team.routes"));
app.use("/api/automation", require("./routes/automation.routes")); // New Automation
app.use("/api/contact", require("./routes/contact.routes")); // Contact Management
app.use("/api/chatbot", require("./routes/chatbot.routes")); // Chatbot Builder
app.use("/api/call", require("./routes/call.routes")); // Click-to-Call
app.use("/api/reports", require("./routes/reports.routes"));
app.use("/api/external", require("./routes/external.routes")); // Public API

// Basic Route
app.get("/", (req, res) => {
  res.send("WhatsApp Cloud CRM API is Running...");
});

// Socket Events
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their private room`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
