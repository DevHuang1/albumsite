const serverless = require("serverless-http");
const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit/lib/utils");
const connectDB = require("../server/config/db");
const authRoutes = require("../server/routes/authRoutes");

const app = express();

// Middleware
app.use(helmet());
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cookieParser());

app.set("trust proxy", 1); // needed for rate-limiter behind proxies

// IPv6-safe custom IP reader
const getClientIp = (req) => {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["forwarded"] ||
    req.ip ||
    "unknown";
  return ipKeyGenerator(ip); // normalize IPv6 addresses
};

// Rate limits
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 150,
    keyGenerator: getClientIp,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use(
  "/api/auth/login",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    keyGenerator: getClientIp,
  })
);

// Lazy DB connect
let dbConnected = false;
app.use(async (req, res, next) => {
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
      console.log("✅ MongoDB connected (lazy)");
    } catch (err) {
      console.error("❌ DB connection failed:", err);
      return res.status(500).json({ message: "Database connection failed" });
    }
  }
  next();
});

// API routes
app.use("/api/auth", authRoutes);

// Serve static assets (like favicon) from public folder
app.use(express.static(path.join(__dirname, "../public")));

// Read HTML files into memory
const mainHTML = fs.readFileSync(
  path.join(__dirname, "../public/main/main.html"),
  "utf-8"
);
const secondHTML = fs.readFileSync(
  path.join(__dirname, "../public/second/second.html"),
  "utf-8"
);

// HTML routes
app.get("/", (req, res) => res.send(mainHTML));
app.get("/second", (req, res) => res.send(secondHTML));

// Handle favicon requests gracefully
app.get("/favicon.ico", (req, res) => res.status(204).end());

module.exports = serverless(app);
