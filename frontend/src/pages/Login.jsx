// frontend/src/pages/Login.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

// Accept the onLoginSuccess prop
const Login = ({ onLoginSuccess }) => { 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    // ... this function remains the same
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      setIsOtpSent(true);
      alert("OTP sent to your email for login verification.");
    } catch (err) {
      alert(err.response?.data?.msg || "Login failed.");
    }
  };
  
  const handleVerifyLogin = async (e) => {
    e.preventDefault();
    try {
        const res = await axios.post("http://localhost:5000/api/auth/verify-login", {
            email,
            otp
        });

        const { token, user } = res.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        
        // --- THIS IS THE KEY CHANGE ---
        // 1. Update the state in the parent App component
        onLoginSuccess(); 
        
        // 2. Then navigate
        navigate("/portfolio");
        
    } catch (err) {
        alert(err.response?.data?.msg || "Invalid OTP.");
    }
  };

  // The rest of your return JSX remains exactly the same...
  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      {!isOtpSent ? (
        <>
          <h2 className="text-center mb-4">Login</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label>Email</label>
              <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label>Password</label>
              <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary w-100">Login</button>
          </form>
          <p className="text-center mt-3">Don’t have an account? <a href="/register">Register here</a></p>
        </>
      ) : (
        <>
          <h2 className="text-center mb-4">Enter Login OTP</h2>
          <form onSubmit={handleVerifyLogin}>
            <div className="mb-3">
              <label>OTP:</label>
              <input type="text" className="form-control" placeholder="Enter the 6-digit OTP" onChange={(e) => setOtp(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary w-100">Verify & Login</button>
          </form>
        </>
      )}
    </div>
  );
};

export default Login;