const serverless = require("serverless-http");
const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const connectDB = require("../server/config/db");
const authRoutes = require("../server/routes/authRoutes");

const app = express();

// --------------------
// Middleware
// --------------------
app.use(helmet());
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cookieParser());

// --------------------
// Rate limiting
// --------------------
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 150 }));
app.use("/api/auth/login", rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }));

// --------------------
// API routes
// --------------------
app.use("/api/auth", authRoutes);

// --------------------
// Read HTML files into memory
// --------------------
const mainHTML = fs.readFileSync(
  path.join(__dirname, "../public/main/main.html"),
  "utf-8"
);
const secondHTML = fs.readFileSync(
  path.join(__dirname, "../public/second/second.html"),
  "utf-8"
);

// --------------------
// Favicon routes
// --------------------
app.get("/favicon.ico", (req, res) => res.status(204).end());
app.get("/favicon.png", (req, res) => res.status(204).end());

// --------------------
// HTML routes
// --------------------
app.get("/second", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(secondHTML);
});

// Catch-all for all other routes (serverless-friendly)
app.get("*", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(mainHTML);
});

// --------------------
// Connect to DB once per cold start
// --------------------
let dbConnected = false;
app.use(async (req, res, next) => {
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
    } catch (err) {
      console.error("DB connection failed:", err);
      return res.status(500).json({ message: "DB connection failed" });
    }
  }
  next();
});

// --------------------
// Export serverless handler
// --------------------
module.exports = serverless(app);
