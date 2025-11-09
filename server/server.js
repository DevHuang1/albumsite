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
const PORT = process.env.PORT || 3000;

// Limit requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});

// Connect to DB
connectDB();

// Middleware
app.use(helmet());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(limiter);

app.use(cookieParser());

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // 100 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});
app.use(generalLimiter);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 login attempts per IP
  message: {
    success: false,
    message: "Too many login attempts, please try again after 15 minutes.",
  },
});
app.use("/api/auth/login", loginLimiter);

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/main/main.html"));
});

app.get("/second", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/second/second.html"));
});

// Routes
app.use("/api/auth", authRoutes);

app.listen(PORT, () =>
  console.log(` Server running on http://localhost:${PORT}`)
);
