const serverless = require("serverless-http");
const express = require("express");
const path = require("path");
const fs = require("fs").promises; // async version
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

// ---------- Serve Static Files ----------
const publicDir = path.join(__dirname, "../public");
app.use(express.static(publicDir));

// ---------- HTML Routes ----------
app.get("/", async (req, res) => {
  try {
    const mainHTML = await fs.readFile(
      path.join(publicDir, "main/main.html"),
      "utf-8"
    );
    res.type("html").send(mainHTML);
  } catch (err) {
    console.error("Error loading main.html:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/second", async (req, res) => {
  try {
    const secondHTML = await fs.readFile(
      path.join(publicDir, "second/second.html"),
      "utf-8"
    );
    res.type("html").send(secondHTML);
  } catch (err) {
    console.error("Error loading second.html:", err);
    res.status(500).send("Internal Server Error");
  }
});

// ---------- Favicon ----------
app.get("/favicon.ico", (req, res) => res.status(204).end());
app.get("/favicon.png", async (req, res) => {
  try {
    const faviconPath = path.join(publicDir, "favicon.png");
    await fs.access(faviconPath);
    res.sendFile(faviconPath);
  } catch {
    res.status(204).end();
  }
});

// ---------- Export serverless ----------
module.exports = serverless(app);
