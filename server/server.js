require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const app = express();

// Connect to DB
connectDB();

// Middleware
app.use(helmet());
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cookieParser());

// Rate limits
const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 150 });
app.use(generalLimiter);
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });
app.use("/api/auth/login", loginLimiter);

// Serve static files
app.use(express.static(path.join(__dirname, "../public")));

// API routes
app.use("/api/auth", authRoutes);

module.exports = app;
