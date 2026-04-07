// src/pages/EmployeeLogin.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./EmployeeLogin.css";
import logo from "../../assets/OHS.jpg";
import {authStore} from '../../store/authStore';

const EmployeeLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  
  const { loginAsEmployee } = authStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    loginAsEmployee(email, password, navigate)
    setEmail("");
    setPassword("");
  };

  const handleAdminLogin = () => {
    navigate("/");
  };

  return (
    <div className="admin-wrapper">
      <div className="login-card">
        {/* Logo */}
        <div className="logo-container">
          <img src={logo} alt="Logo" className="admin-logo" />
        </div>

        {/* Title */}
        <h2 className="welcome-text">Hello Employee!</h2>
        <p className="subtitle">Log in to your employee dashboard</p>

        {/* Form */}
        <form >
          <div className="input-group">
            <span className="input-icon">👤</span>
            <input
              type="email"
              placeholder="Email ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <span className="input-icon">🔒</span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="eye-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>

          <div className="options">
            <label>
              <input type="checkbox" /> Remember Me
            </label>
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          {/* Employee Login Button */}
          <button type="button" onClick={handleSubmit} className="login-btn">Log in as Employee</button>

          {/* Divider */}
          <div className="divider">OR</div>

          {/* Back to Admin Login */}
          <button
            type="button"
            className="employee-btn"
            onClick={handleAdminLogin}
          >
            Log in as Admin
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmployeeLogin;