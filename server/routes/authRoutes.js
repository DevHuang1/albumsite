const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const generateVerificationToken = require("../utils/generateVerificationToken");
const {
  sendVerificationEmail,
  sendWelcomeEmail,
} = require("../nodemailer/config");

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, ...rest } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });
    const verificationToken = generateVerificationToken();
    console.log("Verification token:", verificationToken);
    const user = new User({
      name,
      email,
      password,
      verificationToken: verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
      ...rest,
    });
    console.log("Saving new user...");
    await user.save();
    try {
      console.log("Sending verification email to:", user.email);
      await sendVerificationEmail(user.email, verificationToken);
      console.log("Email sent successfully!");
    } catch (err) {
      console.error("Verification email failed:", err);
    }
    res.status(200).json({ message: " User registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      message: "Login successful",
      token,
      user: { name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/verify-email", async (req, res) => {
  const { code } = req.body;
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();
    console.log("Attempting to send welcome email...");
    await sendWelcomeEmail(user.email, user.name);
    console.log("Welcome email function executed.");
    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
    console.log("Email Verified Successfully");
  } catch (error) {
    console.log("Error verifying email", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
