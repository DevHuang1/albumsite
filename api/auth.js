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

// Middleware
app.use(helmet());
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cookieParser());

// Rate limits
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 150 }));
app.use("/api/auth/login", rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }));

// Connect DB once at cold start
let dbConnected = false;
const ensureDB = async () => {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
    console.log("DB connected");
  }
};

// API routes (wrap with DB connection)
app.use(
  "/api/auth",
  async (req, res, next) => {
    try {
      await ensureDB();
      next();
    } catch (err) {
      console.error("DB connection failed:", err);
      return res.status(500).json({ message: "DB connection failed" });
    }
  },
  authRoutes
);

// Serve HTML files
const mainHTML = path.join(__dirname, "../public/main/main.html");
const secondHTML = path.join(__dirname, "../public/second/second.html");

app.get("/second", (req, res) => res.sendFile(secondHTML));
app.get("/:path(*)", (req, res) => res.sendFile(mainHTML));

module.exports = serverless(app);
