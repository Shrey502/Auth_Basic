import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

// Accept the onLoginSuccess prop from App.js
function Register({ onLoginSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false); // Controls the UI state
  const navigate = useNavigate();

  // Step 1: Handle initial registration details submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        password,
      });
      setIsOtpSent(true); // Show the OTP field
      alert("OTP sent to your email! Please verify to complete registration.");
    } catch (err) {
      alert(err.response?.data?.msg || "Registration failed.");
    }
  };

  // Step 2: Handle OTP verification and automatic login
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      // This endpoint now returns a token upon success
      const res = await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email,
        otp,
      });

      // Automatic Login Logic
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      
      onLoginSuccess(); // Update the parent App's state
      navigate("/portfolio"); // Redirect directly to the portfolio

    } catch (err) {
      alert(err.response?.data?.msg || "OTP verification failed.");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h2 className="text-center mb-4">Register</h2>
      <form onSubmit={!isOtpSent ? handleRegisterSubmit : handleVerifyOtp}>
        <div className="mb-3">
          <label>Name:</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isOtpSent} // Disable after OTP is sent
          />
        </div>
        <div className="mb-3">
          <label>Email:</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isOtpSent} // Disable after OTP is sent
          />
        </div>
        <div className="mb-3">
          <label>Password:</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isOtpSent} // Disable after OTP is sent
          />
        </div>

        {/* Conditionally render the OTP input field */}
        {isOtpSent && (
          <div className="mb-3">
            <label>Verification Code:</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter the 6-digit OTP"
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>
        )}

        {/* Change button text based on the UI state */}
        <button type="submit" className="btn btn-success w-100">
          {!isOtpSent ? "Register & Send OTP" : "Verify & Complete Registration"}
        </button>
      </form>
      <p className="text-center mt-3">
        Already have an account? <a href="/">Login</a>
      </p>
    </div>
  );
}

export default Register;
