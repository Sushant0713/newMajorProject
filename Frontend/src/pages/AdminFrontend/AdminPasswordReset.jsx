import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./AdminPasswordReset.css";
import logo from "../../assets/OHS.jpg";
import {authStore} from '../../store/authStore';

export default function AdminPasswordReset() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const { forgotPasswordAdmin } = authStore();

  const handleSend = (e) => {
    e?.preventDefault();
    setSending(true);
    setTimeout(() => {
      forgotPasswordAdmin(email, navigate);
      setSending(false);
    }, 800);
  };

  return (
    <motion.div
      className="apr-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
    >
      <motion.div
        className="apr-card"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 80, duration: 0.9 }}
      >
        {/* Logo */}
        <motion.div
          className="apr-logo-container"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.img
            src={logo}
            alt="Logo"
            className="apr-logo"
            whileHover={{
              scale: 1.1,
              rotate: [0, 10, -10, 0],
              transition: { duration: 0.6 },
            }}
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="apr-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          Password Reset
        </motion.h1>

        <motion.p
          className="apr-subtitle"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          Enter your email
        </motion.p>

        {/* Form */}
        <motion.form
          className="apr-form"
          onSubmit={handleSend}
          noValidate
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <motion.div
            className="apr-input-group"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 150 }}
          >
            <span className="apr-input-icon">📧</span>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="admin@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </motion.div>

          <motion.button
            className="apr-send-btn"
            type="submit"
            disabled={sending}
            whileHover={{
              scale: 1.05,
              boxShadow: "0px 0px 20px rgba(20, 184, 166, 0.7)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            {sending ? "SENDING..." : "SEND OTP"}
          </motion.button>

          <motion.div
            className="apr-back-link-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Link to="/" className="apr-back-link">
              ← Back to Admin Login
            </Link>
          </motion.div>
        </motion.form>
      </motion.div>
    </motion.div>
  );
}
