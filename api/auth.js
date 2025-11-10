const serverless = require("serverless-http");
const express = require("express");
const path = require("path");
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
app.set("trust proxy", 1);

// ---------- MongoDB Connection ----------
let dbConnected = false;
const lazyConnectDB = async () => {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
    console.log("✅ MongoDB connected (lazy)");
  }
};
app.use(async (req, res, next) => {
  if (!dbConnected) {
    try {
      await lazyConnectDB();
    } catch (err) {
      console.error("❌ DB connection failed:", err);
      return res.status(500).json({ message: "Database connection failed" });
    }
  }
  next();
});

// ---------- API Routes ----------
app.use("/api/auth", authRoutes);

// ---------- Serve Static Files (HTML + assets) ----------
const publicDir = path.join(__dirname, "../public");
app.use(express.static(publicDir));

// ---------- HTML Routes ----------
app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "main/main.html"));
});
app.get("/second", (req, res) => {
  res.sendFile(path.join(publicDir, "second/second.html"));
});

// ---------- Favicon ----------
app.get("/favicon.ico", (req, res) => res.status(204).end());
app.get("/favicon.png", (req, res) => {
  res.sendFile(path.join(publicDir, "favicon.png"), (err) => {
    if (err) res.status(204).end();
  });
});

// ---------- Export serverless ----------
module.exports = serverless(app);
