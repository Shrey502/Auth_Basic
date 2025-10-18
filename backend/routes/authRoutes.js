// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { register, verifyOtp, login, verifyLogin } = require("../controllers/authcontroller");

router.post("/register", register);
router.post("/verify-otp", verifyOtp); // <-- New route for email verification
router.post("/login", login);
router.post("/verify-login", verifyLogin); // <-- New route for login verification

module.exports = router;