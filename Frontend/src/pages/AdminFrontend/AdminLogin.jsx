import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./AdminLogin.css";
import logo from "../../assets/OHS.jpg";
import {authStore} from '../../store/authStore';

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { loginAsAdmin } = authStore();

  // Handle Admin Login
  const handleSubmit = (e) => {
    e.preventDefault();   
    loginAsAdmin(email, password, navigate);
    setEmail("");
    setPassword("");
  };

  // Handle Employee Login button click
  const handleEmployeeLogin = () => {
    // ✅ Navigate to EmployeeLogin page (src/pages/EmployeeLogin.jsx)
    navigate("/employee-login");
  };

  return (
    <motion.div
      className="admin-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
    >
      <motion.div
        className="login-card"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 80, duration: 0.9 }}
      >
        {/* Logo */}
        <motion.div
          className="logo-container"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.img
            src={logo}
            alt="Logo"
            className="admin-logo"
            whileHover={{
              scale: 1.1,
              rotate: [0, 10, -10, 0],
              transition: { duration: 0.6 },
            }}
          />
        </motion.div>

        {/* Title */}
        <motion.h2
          className="welcome-text"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          Welcome Back!
        </motion.h2>

        <motion.p
          className="subtitle"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          Log in to your admin dashboard
        </motion.p>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <motion.div
            className="input-group"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 150 }}
          >
            <span className="input-icon">👤</span>
            <input
              type="email"
              placeholder="Email ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </motion.div>

          <motion.div
            className="input-group"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 150 }}
          >
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
          </motion.div>

          <motion.div
            className="options"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Link to="/admin-forgot-password">Forgot Password?</Link>
          </motion.div>

          {/* Admin Login Button */}
          <motion.button
            type="submit"
            className="login-btn"
            whileHover={{
              scale: 1.05,
              boxShadow: "0px 0px 20px rgba(20, 184, 166, 0.7)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            Log in as Admin
          </motion.button>

          {/* Divider */}
          <motion.div
            className="divider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            OR
          </motion.div>

          {/* Employee Login Button */}
          <motion.button
            type="button"
            className="employee-btn"
            onClick={handleEmployeeLogin}
            whileHover={{
              scale: 1.05,
              boxShadow: "0px 0px 20px rgba(249, 115, 22, 0.7)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            Log in as Employee
          </motion.button>
        </motion.form>
      </motion.div>
    </motion.div>
  );
};

export default AdminLogin;
