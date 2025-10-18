// frontend/src/pages/Register.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false); // <-- New state to control UI
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        password,
      });
      setIsOtpSent(true); // <-- Show OTP field on success
      alert("OTP sent to your email! Please check and verify.");
    } catch (err) {
      alert(err.response?.data?.msg || "Registration failed.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email,
        otp,
      });
      alert("Registration successful! Please log in.");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.msg || "OTP verification failed.");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      {!isOtpSent ? (
        <>
          <h2 className="text-center mb-4">Register</h2>
          <form onSubmit={handleRegister}>
            {/* Name, Email, Password fields... */}
            <div className="mb-3">
              <label>Name:</label>
              <input type="text" className="form-control" onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label>Email:</label>
              <input type="email" className="form-control" onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label>Password:</label>
              <input type="password" className="form-control" onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-success w-100">Register</button>
          </form>
          <p className="text-center mt-3">Already have an account? <a href="/">Login</a></p>
        </>
      ) : (
        <>
          <h2 className="text-center mb-4">Verify OTP</h2>
          <form onSubmit={handleVerifyOtp}>
            <div className="mb-3">
              <label>OTP:</label>
              <input type="text" className="form-control" placeholder="Enter the 6-digit OTP" onChange={(e) => setOtp(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary w-100">Verify</button>
          </form>
        </>
      )}
    </div>
  );
}

export default Register;