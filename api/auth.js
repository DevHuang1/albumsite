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

// ---------- MongoDB Connection (lazy for serverless) ----------
let dbConnected = false;
const lazyConnectDB = async () => {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
    console.log("✅ MongoDB connected (lazy)");
  }
};
app.use(async (req, res, next) => {
  try {
    await lazyConnectDB();
  } catch (err) {
    console.error("❌ DB connection failed:", err);
    return res.status(500).json({ message: "Database connection failed" });
  }
  next();
});

// ---------- API Routes ----------
app.use("/api/auth", authRoutes);

// ---------- Serve Static Files ----------
const publicDir = path.join(__dirname, "../public");
app.use(express.static(publicDir));

// ---------- HTML Routes ----------
const mainHTML = fs.readFileSync(
  path.join(publicDir, "main/main.html"),
  "utf-8"
);
const secondHTML = fs.readFileSync(
  path.join(publicDir, "second/second.html"),
  "utf-8"
);

app.get("/", (req, res) => res.type("html").send(mainHTML));
app.get("/second", (req, res) => res.type("html").send(secondHTML));

// ---------- Favicon ----------
app.get("/favicon.ico", (req, res) => res.status(204).end());
app.get("/favicon.png", (req, res) => {
  const faviconPath = path.join(publicDir, "favicon.png");
  if (fs.existsSync(faviconPath)) {
    res.sendFile(faviconPath);
  } else {
    res.status(204).end();
  }
});

// ---------- Export serverless ----------
module.exports = serverless(app);
