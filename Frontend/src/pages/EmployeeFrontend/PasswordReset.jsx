import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./EmployeeLogin.css"; // reuse existing styles
import logo from "../../assets/OHS.jpg";
import {authStore} from '../../store/authStore';

export default function PasswordReset() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);
  const { forgotPasswordEmp } = authStore();

  const handleSubmit = (e) => {
    e?.preventDefault();
    setSending(true);
    setTimeout(() => {
      forgotPasswordEmp(email, navigate);
      setSending(false);
    }, 800);
  };

  return (
    <div className="admin-wrapper">
      <div className="login-card">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="admin-logo" />
        </div>

        <h2 className="welcome-text">Reset Password</h2>
        <p className="subtitle">Enter your email</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <span className="input-icon">📧</span>
            <input
              type="email"
              placeholder="Email ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn">
            {sending ? "SENDING..." : "SEND OTP"}
          </button>

          <div className="divider">OR</div>

          <Link to="/employee-login">
            <button type="button" className="employee-btn">← Back to Employee Login</button>
          </Link>
        </form>
      </div>
    </div>
  );
}