import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminProfileStore } from "../../store/AdminProfileStore.js";
import AdminNavbar from "../../components/AdminNavbar.jsx";
import toast from "react-hot-toast";
import "./AdminProfile.css";

export default function AdminProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    recoveryEmail: "",
    phone: "",
    address: "",
    role: "",
    department: "",
    employeeId: "",
    joinDate: "",
    avatar: "",
    status: "",
    lastLogin: "",
    permissions: [],
  });
  const [originalFormData, setOriginalFormData] = useState(null);

  const adminId = sessionStorage.getItem("userId");
  const { adminProfile, loading, error, fetchAdminProfile, updateAdminProfile, updateAdminPassword } = useAdminProfileStore();

  // Fetch profile on component mount
  useEffect(() => {
    if (adminId) {
      loadProfile();
    }
  }, [adminId]);

  const loadProfile = async () => {
    try {
      await fetchAdminProfile(adminId);
    } catch (error) {
      toast.error("Failed to load profile");
    }
  };

  // Map backend data to frontend format when adminProfile changes
  useEffect(() => {
    if (adminProfile && Array.isArray(adminProfile) && adminProfile.length > 0) {
      const profileData = adminProfile[0];
      const mappedProfile = {
        firstName: profileData.first_name || "",
        lastName: profileData.last_name || "",
        middleName: profileData.middle_name || "",
        email: profileData.email || "",
        recoveryEmail: profileData.recovery_email || "",
        phone: profileData.phone_number || "",
        address: profileData.address || "",
        role: "Admin",
        department: profileData.department || "Management",
        employeeId: profileData.admin_id || "",
        joinDate: profileData.created_at 
          ? new Date(profileData.created_at).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "",
        avatar: profileData.avatar || `https://ui-avatars.com/api/?name=${(profileData.first_name || "")}+${(profileData.last_name || "")}&background=3b82f6&color=fff`,
        status: profileData.status || "Active",
        lastLogin: profileData.last_login || "N/A",
        permissions: profileData.permissions || ["Full Access"],
      };
      setFormData(mappedProfile);
      setOriginalFormData(mappedProfile);
    }
  }, [adminProfile]);

  // Security Modal States
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await updateAdminProfile(adminId, {
        first_name: formData.firstName,
        middle_name: formData.middleName || "",
        last_name: formData.lastName,
        email: formData.email,
        recovery_email: formData.recoveryEmail || formData.email,
        phone_number: formData.phone,
        address: formData.address,
      });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      setOriginalFormData({ ...formData });
      // Reload profile to get latest data
      await loadProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handleCancel = () => {
    if (originalFormData) {
      setFormData({ ...originalFormData });
    }
    setIsEditing(false);
  };

  // Password Change Handlers
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setPasswordError("");
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (passwordForm.currentPassword.length < 6) {
      setPasswordError("Current password is required");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      await updateAdminPassword(adminId, { newPassword: passwordForm.newPassword });
      setPasswordSuccess(true);
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(false);
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        toast.success("Password changed successfully!");
      }, 1500);
    } catch (error) {
      setPasswordError(error.response?.data?.message || "Failed to update password");
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const closeModal = () => {
    setShowPasswordModal(false);
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordError("");
    setPasswordSuccess(false);
    setOtpCode(["", "", "", "", "", ""]);
  };

  return (
    <div className="profile-page-root">
      {/* Admin Navbar */}
      <AdminNavbar />

      {/* Main Content */}
      <main className="profile-main">
        {/* Header */}
        <header className="profile-header">
          <div className="profile-header-left">
            <Link to="/admin-dashboard" className="profile-back-btn">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <h1 className="profile-header-title">My Profile</h1>
          </div>
          <div className="profile-header-right">
            {!isEditing ? (
              <motion.button
                className="profile-edit-btn"
                onClick={() => setIsEditing(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
              >
                <span className="material-symbols-outlined">edit</span>
                Edit Profile
              </motion.button>
            ) : (
              <div className="profile-action-btns">
                <button className="profile-cancel-btn" onClick={handleCancel} disabled={loading}>
                  Cancel
                </button>
                <motion.button
                  className="profile-save-btn"
                  onClick={handleSave}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                >
                  <span className="material-symbols-outlined">check</span>
                  {loading ? "Saving..." : "Save Changes"}
                </motion.button>
              </div>
            )}
          </div>
        </header>

        {/* Profile Content */}
        <div className="profile-content">
          {loading && !formData.firstName ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <p>Loading profile...</p>
            </div>
          ) : (
            <>
          {/* Profile Card */}
          <motion.div
            className="profile-card profile-info-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="profile-avatar-section">
              <div className="profile-avatar-wrapper">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Profile" className="profile-avatar-img" />
                ) : (
                  <div className="profile-avatar-img" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: '#3b82f6',
                    color: '#fff',
                    fontSize: '2rem',
                    fontWeight: '600'
                  }}>
                    {formData.firstName?.charAt(0) || ''}{formData.lastName?.charAt(0) || ''}
                  </div>
                )}
                {isEditing && (
                  <button className="profile-avatar-edit">
                    <span className="material-symbols-outlined">photo_camera</span>
                  </button>
                )}
              </div>
              <div className="profile-name-section">
                <h2 className="profile-full-name">
                  {formData.firstName} {formData.middleName ? `${formData.middleName} ` : ""}{formData.lastName}
                </h2>
                <p className="profile-role">{formData.role}</p>
                <span className={`profile-status-badge ${formData.status.toLowerCase()}`}>
                  <span className="status-dot"></span>
                  {formData.status}
                </span>
              </div>
            </div>

            <div className="profile-quick-stats">
              <div className="quick-stat">
                <span className="material-symbols-outlined">badge</span>
                <div>
                  <p className="stat-label">Employee ID</p>
                  <p className="stat-value">{formData.employeeId}</p>
                </div>
              </div>
              <div className="quick-stat">
                <span className="material-symbols-outlined">calendar_month</span>
                <div>
                  <p className="stat-label">Joined</p>
                  <p className="stat-value">{formData.joinDate}</p>
                </div>
              </div>
              <div className="quick-stat">
                <span className="material-symbols-outlined">schedule</span>
                <div>
                  <p className="stat-label">Last Login</p>
                  <p className="stat-value">{formData.lastLogin}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Details Grid */}
          <div className="profile-details-grid">
            {/* Personal Information */}
            <motion.div
              className="profile-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="card-header">
                <span className="material-symbols-outlined">person</span>
                <h3>Personal Information</h3>
              </div>
              <div className="card-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    ) : (
                      <p className="form-value">{formData.firstName}</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    ) : (
                      <p className="form-value">{formData.lastName}</p>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label>Middle Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="middleName"
                      value={formData.middleName || ""}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  ) : (
                    <p className="form-value">{formData.middleName || "-"}</p>
                  )}
                </div>
                <div className="form-group full-width">
                  <label>Address</label>
                  {isEditing ? (
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="form-textarea"
                      rows="2"
                    />
                  ) : (
                    <p className="form-value">{formData.address}</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              className="profile-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="card-header">
                <span className="material-symbols-outlined">contact_mail</span>
                <h3>Contact Information</h3>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label>Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  ) : (
                    <p className="form-value">
                      <span className="material-symbols-outlined icon-sm">mail</span>
                      {formData.email}
                    </p>
                  )}
                </div>
                <div className="form-group">
                  <label>Recovery Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="recoveryEmail"
                      value={formData.recoveryEmail || formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  ) : (
                    <p className="form-value">
                      <span className="material-symbols-outlined icon-sm">mail</span>
                      {formData.recoveryEmail || formData.email}
                    </p>
                  )}
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  ) : (
                    <p className="form-value">
                      <span className="material-symbols-outlined icon-sm">phone</span>
                      {formData.phone}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

          </div>
          </>
          )}

          {/* Security Section */}
          <motion.div
            className="profile-card profile-security-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <div className="card-header">
              <span className="material-symbols-outlined">lock</span>
              <h3>Security Settings</h3>
            </div>
            <div className="card-body security-body">
              <div className="security-item">
                <div className="security-info">
                  <span className="material-symbols-outlined">password</span>
                  <div>
                    <h4>Password</h4>
                    <p>Last changed 30 days ago</p>
                  </div>
                </div>
                <button
                  className="security-action-btn"
                  onClick={() => setShowPasswordModal(true)}
                >
                  Change Password
                </button>
              </div>
            </div>
          </motion.div>

          </div>
      </main>

      {/* Password Change Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div className="modal-title-section">
                  <span className="material-symbols-outlined modal-icon">password</span>
                  <h2>Change Password</h2>
                </div>
                <button className="modal-close-btn" onClick={closeModal}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {passwordSuccess ? (
                <div className="modal-success">
                  <span className="material-symbols-outlined success-icon">check_circle</span>
                  <h3>Password Changed!</h3>
                  <p>Your password has been updated successfully.</p>
                </div>
              ) : (
                <form className="modal-form" onSubmit={handlePasswordSubmit}>
                  <div className="modal-form-group">
                    <label>Current Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter current password"
                        className="modal-input"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility("current")}
                      >
                        <span className="material-symbols-outlined">
                          {showPasswords.current ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="modal-form-group">
                    <label>New Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter new password"
                        className="modal-input"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility("new")}
                      >
                        <span className="material-symbols-outlined">
                          {showPasswords.new ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                    <p className="input-hint">Must be at least 8 characters</p>
                  </div>

                  <div className="modal-form-group">
                    <label>Confirm New Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm new password"
                        className="modal-input"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility("confirm")}
                      >
                        <span className="material-symbols-outlined">
                          {showPasswords.confirm ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {passwordError && <p className="modal-error">{passwordError}</p>}

                  <div className="modal-actions">
                    <button type="button" className="modal-btn-cancel" onClick={closeModal} disabled={loading}>
                      Cancel
                    </button>
                    <button type="submit" className="modal-btn-primary" disabled={loading}>
                      {loading ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
