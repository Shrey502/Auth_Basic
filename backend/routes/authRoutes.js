// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
// Update the imported functions
const { register, verifyOtp, login, sendLoginOtp } = require("../controllers/authcontroller");

router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/send-login-otp", sendLoginOtp); // <-- New route
router.post("/login", login); // <-- This now handles the final verification

// The '/verify-login' route is no longer needed.
module.exports = router;