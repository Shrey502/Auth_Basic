// backend/controllers/authcontroller.js
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail"); // <-- IMPORT THE EMAIL SENDER
require("dotenv").config();

// Function to generate a random 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// --- MODIFIED REGISTER FUNCTION ---
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    let user = await User.findOne({ email });
    if (user && user.isVerified) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    if (user) {
      // If user exists but is not verified, update their info and resend OTP
      user.name = name;
      user.password = hashedPassword;
      user.otp = otp;
      user.otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
      await user.save();
    } else {
      // If user does not exist, create a new one
      user = new User({
        name,
        email,
        password: hashedPassword,
        otp,
        otpExpires: Date.now() + 10 * 60 * 1000,
      });
      await user.save();
    }

    // Send OTP email
    const emailHtml = `<h1>Welcome to Our App!</h1><p>Your OTP for registration is: <strong>${otp}</strong></p><p>It will expire in 10 minutes.</p>`;
    await sendEmail({
      email: user.email,
      subject: "Verify Your Email Address",
      html: emailHtml,
    });

    res.status(200).json({ msg: "OTP sent to your email. Please verify." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// --- NEW FUNCTION TO VERIFY OTP ---
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: "User not found" });
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    // OTP is correct, so update the user
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ msg: "Email verified successfully! You can now log in." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// --- MODIFIED LOGIN FUNCTION ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: "Invalid credentials" });
    if (!user.isVerified) return res.status(401).json({ msg: "Email not verified. Please register and verify your email first." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });
    
    // --- LOGIN OTP LOGIC ---
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const emailHtml = `<h1>Login Attempt</h1><p>Your OTP for login is: <strong>${otp}</strong></p><p>It will expire in 10 minutes.</p>`;
    await sendEmail({
      email: user.email,
      subject: "Your Login OTP",
      html: emailHtml,
    });
    
    // Don't send token yet, just a success message
    res.status(200).json({ msg: "Login OTP sent to your email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// --- NEW FUNCTION TO VERIFY LOGIN OTP AND SEND TOKEN ---
exports.verifyLogin = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ msg: "User not found" });
        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ msg: "Invalid or expired OTP" });
        }

        // Clear OTP fields
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        // Now, create and send the JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({
            msg: "Login successful",
            token,
            user: { id: user._id, name: user.name, email: user.email },
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};