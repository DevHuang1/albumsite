const serverless = require("serverless-http");
const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const connectDB = require("../server/config/db");
const authRoutes = require("../server/routes/authRoutes");

const app = express();

// Connect to DB
connectDB();

// Middleware
app.use(helmet());
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cookieParser());

// Rate limits
const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 150 });
app.use(generalLimiter);
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });
app.use("/api/auth/login", loginLimiter);

// Serve static files
const publicDir = path.join(__dirname, "../public");
app.use(express.static(publicDir));

// API routes
app.use("/api/auth", authRoutes);

// HTML routes
app.get("/second", (req, res) => {
  res.sendFile(path.join(publicDir, "second/second.html"));
});

// Fallback for root and everything else
app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "main/main.html"));
});

module.exports = serverless(app);
