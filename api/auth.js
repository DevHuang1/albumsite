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

// ---------- Middleware ----------
app.use(helmet());
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cookieParser());

// Trust proxy for serverless
app.set("trust proxy", 1);

// ---------- Rate Limiting (IPv6-safe by default) ----------
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 150, // max requests per IP
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use(
  "/api/auth/login",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ---------- MongoDB Connection ----------
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

// ---------- API Routes ----------
app.use("/api/auth", authRoutes);

// ---------- Static HTML ----------
const mainHTML = fs.readFileSync(
  path.join(__dirname, "../public/main/main.html"),
  "utf-8"
);
const secondHTML = fs.readFileSync(
  path.join(__dirname, "../public/second/second.html"),
  "utf-8"
);

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(mainHTML);
});

app.get("/second", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(secondHTML);
});

// ---------- Favicon ----------
app.get("/favicon.ico", (req, res) => res.status(204).end());
app.get("/favicon.png", (req, res) =>
  res.sendFile(path.join(__dirname, "../public/favicon.png"), (err) => {
    if (err) res.status(204).end();
  })
);

module.exports = serverless(app);
