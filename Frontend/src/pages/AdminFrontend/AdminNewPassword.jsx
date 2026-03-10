import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../assets/OHS.jpg";
import { authStore } from "../../store/authStore";
import toast, { Toaster } from 'react-hot-toast';

const AdminNewPassword = () => {
    const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const { resetPasswordAdmin } = authStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    resetPasswordAdmin(newPassword, navigate);
  };

  return (
    <div className="admin-wrapper">
      <div className="login-card">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="admin-logo" />
        </div>

        <h2 className="welcome-text">Reset Password</h2>
        <p className="subtitle">Enter your new password</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <span className="input-icon">🔑</span>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <span className="input-icon">🔑</span>
            <input
              type="password"
              placeholder="Re-enter New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn">Reset Password</button>

          <div className="divider">OR</div>

          <Link to="/">
            <button type="button" className="employee-btn">Back to Login</button>
          </Link>
        </form>
      </div>
    </div>
  );
};

export default AdminNewPassword;