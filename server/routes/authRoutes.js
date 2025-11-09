require("dotenv").config();
const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const verifyToken = require("../middleware/verifyToken");
// Register
router.post("/register", authController.register);

// Login
router.post("/login", authController.login);

//Verify-email
router.post("/verify-email", authController.verifyEmail);

//log-out
router.post("/logout", authController.logOut);

//forgot-password
router.post("/forgot-password", authController.forgotPassword);

//reset-password
router.post("/reset-password/:token", authController.resetPassword);

//check-auth
router.get("/check-auth", verifyToken, authController.checkAuth);
module.exports = router;
