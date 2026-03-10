// src/pages/EmployeeLogin.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./EmployeeLogin.css";
import logo from "../../assets/OHS.jpg";
import {authStore} from '../../store/authStore';

const EmployeeLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
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