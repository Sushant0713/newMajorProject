import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../assets/OHS.jpg";
import { authStore } from "../../store/authStore";

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const { verifyOTPEmp } = authStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    verifyOTPEmp(otp, navigate);
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

          <Link to="/forgot-password">
            <button type="button" className="employee-btn">Back to Reset Page</button>
          </Link>
        </form>

        {/* <p className="otp-resend-text">
          Didn’t get the OTP?{" "}
          <button
            type="button"
            className="otp-resend-btn"
            onClick={() => }
          >
            Resend OTP
          </button>
        </p> */}
      </div>
    </div>
  );
}

export default VerifyOTP;