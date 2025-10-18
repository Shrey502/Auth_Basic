// frontend/src/pages/Login.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false); // State to track if OTP has been sent
  const navigate = useNavigate();

  // 1. Function to request the OTP
  const handleSendOtp = async () => {
    if (!email) {
      alert("Please enter your email address first.");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/auth/send-login-otp", { email });
      setOtpSent(true);
      alert("OTP has been sent to your email.");
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to send OTP.");
    }
  };

  // 2. Function to handle the final form submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
        alert("Please enter the OTP.");
        return;
    }
    try {
      // Send all three fields to the updated login endpoint
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
        otp,
      });

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      
      onLoginSuccess(); // Update parent state
      navigate("/portfolio");

    } catch (err) {
      alert(err.response?.data?.msg || "Login failed. Please check your credentials and OTP.");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h2 className="text-center mb-4">Login</h2>
      <form onSubmit={handleLoginSubmit}>
        
        {/* Email Input with "Send OTP" Button */}
        <div className="mb-3">
          <label>Email</label>
          <div className="input-group">
            <input
              type="email"
              className="form-control"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={otpSent} // Disable email field after sending OTP
            />
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={handleSendOtp}
              disabled={otpSent} // Disable button after sending
            >
              {otpSent ? "Sent" : "Send OTP"}
            </button>
          </div>
        </div>

        {/* Password Input */}
        <div className="mb-3">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Conditionally Rendered OTP Input */}
        {otpSent && (
          <div className="mb-3">
            <label>Verification Code</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>
        )}

        <button type="submit" className="btn btn-primary w-100">
          Login
        </button>
      </form>

      <p className="text-center mt-3">
        Don’t have an account? <a href="/register">Register here</a>
      </p>
    </div>
  );
};

export default Login;