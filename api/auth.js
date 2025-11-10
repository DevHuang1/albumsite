const serverless = require("serverless-http");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const connectDB = require("../server/config/db");
const authRoutes = require("../server/routes/authRoutes");

const app = express();

// Middleware
app.use(helmet());
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cookieParser());
app.set("trust proxy", 1);

// Serverless-safe global DB connection
if (!global._mongoClientPromise) {
  global._mongoClientPromise = connectDB();
}
app.use(async (req, res, next) => {
  try {
    await global._mongoClientPromise;
    next();
  } catch (err) {
    console.error("❌ Database connection error:", err);
    res.status(500).json({ message: "Database connection failed" });
  }
});

// Routes
app.use("/api/auth", authRoutes);

// Export
module.exports = serverless(app);
