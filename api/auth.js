const serverless = require("serverless-http");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const connectDB = require("../server/config/db");
const authRoutes = require("../server/routes/authRoutes");

const app = express();

// ---------- Middleware ----------
app.use(helmet());
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.set("trust proxy", 1);

// ---------- MongoDB Lazy Connection (serverless safe) ----------
let dbConnected = false;

async function ensureDB() {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
    console.log("✅ MongoDB connected");
  }
}

app.use(async (req, res, next) => {
  try {
    await ensureDB();
    next();
  } catch (err) {
    console.error("❌ Database connection error:", err);
    res.status(500).json({ message: "Database connection failed" });
  }
});

// ---------- API Routes ----------
app.use("/api/auth", authRoutes);

// ---------- Export ----------
module.exports = serverless(app);
