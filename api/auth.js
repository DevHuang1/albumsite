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
// Middleware
app.use(helmet());
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cookieParser());

app.set("trust proxy", 1);

const getClientIp = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || // use first forwarded IP
    req.headers["forwarded"] ||
    req.ip ||
    "unknown"
  );
};

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 150,
    keyGenerator: getClientIp, // use custom IP reader
    standardHeaders: true, // return rate limit info in RateLimit-* headers
    legacyHeaders: false, // disable X-RateLimit-* headers
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

// Connect to DB
let dbConnected = false;
app.use(async (req, res, next) => {
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
      console.log("MongoDB connected (lazy)");
    } catch (err) {
      console.error("DB connection failed:", err);
      return res.status(500).json({ message: "Database connection failed" });
    }
  }
  next();
});

// API routes
app.use("/api/auth", authRoutes);

app.use(express.static(path.join(__dirname, "../public")));

const mainHTML = fs.readFileSync(
  path.join(__dirname, "../public/main/main.html"),
  "utf-8"
);
const secondHTML = fs.readFileSync(
  path.join(__dirname, "../public/second/second.html"),
  "utf-8"
);

// HTML routes
app.get("/second", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(secondHTML);
});

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(mainHTML);
});

module.exports = serverless(app);
