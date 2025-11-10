const serverless = require("serverless-http");
const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const connectDB = require("../server/config/db");
const authRoutes = require("../server/routes/authRoutes");

const app = express();

// ---------- Middleware ----------
app.use(helmet());
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cookieParser());

// Trust proxy (needed for serverless / Cloudflare / API Gateway)
app.set("trust proxy", 1);

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

// ---------- Serve Static Files ----------
app.use(express.static(path.join(__dirname, "../public")));

// ---------- HTML Routes ----------
const mainHTML = fs.readFileSync(
  path.join(__dirname, "../public/main/main.html"),
  "utf-8"
);
const secondHTML = fs.readFileSync(
  path.join(__dirname, "../public/second/second.html"),
  "utf-8"
);

app.get("/", (req, res) => res.type("html").send(mainHTML));
app.get("/second", (req, res) => res.type("html").send(secondHTML));

// ---------- Export serverless ----------
module.exports = serverless(app);
