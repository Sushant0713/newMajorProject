import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../assets/OHS.jpg";
import { authStore } from "../../store/authStore";

const AdminVerifyOTP = () => {
    const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const { verifyOTPAdmin } = authStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    verifyOTPAdmin(otp, navigate);
  };

  return (
    <div className="admin-wrapper">
      <div className="login-card">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="admin-logo" />
        </div>

        <h2 className="welcome-text">Verify OTP</h2>
        <p className="subtitle">Enter the OTP sent to your email</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <span className="input-icon">📧</span>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn">Verify OTP</button>

          <div className="divider">OR</div>

          <Link to="/admin-forgot-password">
            <button type="button" className="employee-btn">Back to Reset Page</button>
          </Link>
        </form>
      </div>
    </div>
  );
};

export default AdminVerifyOTP;