import React, { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Calendar,
  Bell,
  ChevronDown,
  Settings,
  HelpCircle,
  LogOut,
  User,
  Mail,
  Phone,
  Edit,
  X,
  Check,
  Briefcase,
  MapPin,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEmployeeDashboardStore } from "../store/EmployeeDashboardStore.js";
import toast from "react-hot-toast";
import "./EmployeeHeader.css";

export default function EmployeeHeader({
  title,
  subtitle,
}) {
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    employeeId: "",
    joinDate: "",
    address: "",
    avatar: "",
    status: "",
  });
  const [originalProfileData, setOriginalProfileData] = useState(null);
  const [activeSettingsTab, setActiveSettingsTab] = useState("notifications");
  const dropdownRef = useRef(null);
  const employeeName = sessionStorage.getItem("username");
  const employeeId = sessionStorage.getItem("userId");
  const firstLetter = employeeName?.charAt(0).toUpperCase() || "U";

  const { fetchEmployeeProfile, updateEmployeeProfile, profileLoading, profileError } = useEmployeeDashboardStore();

  // Settings State
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    weeklyDigest: true,
    loginAlerts: true,
    language: "en",
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    theme: "light",
    compactMode: false,
    autoLogout: "30",
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch profile when modal opens
  useEffect(() => {
    if (showProfileModal && employeeId) {
      loadProfile();
    }
  }, [showProfileModal, employeeId]);

  const loadProfile = async () => {
    try {
      const data = await fetchEmployeeProfile(employeeId);
      if (data) {
        // Map backend fields to frontend fields
        const formattedData = {
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          middleName: data.middle_name || "",
          email: data.email || "",
          phone: data.phone || "",
          role: data.designation || "",
          employeeId: data.employee_id || "",
          joinDate: data.joining_date ? new Date(data.joining_date).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }) : "",
          address: data.aadhar_address || "",
          avatar: `https://ui-avatars.com/api/?name=${(data.first_name || "")}+${(data.last_name || "")}&background=3b82f6&color=fff`,
          status: data.status || "Active",
          commissionRate: data.commission_rate || 0,
        };
        setProfileData(formattedData);
        setOriginalProfileData(formattedData);
      }
    } catch (error) {
      toast.error("Failed to load profile");
    }
  };


  // const today = useMemo(() => {
  //   const now = new Date();
  //   return now.toLocaleDateString("en-IN", {
  //     weekday: "long",
  //     month: "short",
  //     day: "numeric",
  //     year: "numeric",
  //   });
  // }, []);

  const handleLogout = () => {
    navigate("/employee-login");
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      await updateEmployeeProfile(employeeId, {
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address,
      });
      toast.success("Profile updated successfully!");
      setIsEditingProfile(false);
      setOriginalProfileData({ ...profileData });
      // Reload profile to get latest data
      await loadProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    if (originalProfileData) {
      setProfileData({ ...originalProfileData });
    }
  };

  // Settings Handlers
  const handleSettingChange = (setting, value) => {
    setSettings((prev) => ({ ...prev, [setting]: value }));
  };

  const handleSaveSettings = () => {
    alert("Settings saved successfully!");
    setShowSettingsModal(false);
  };

  return (
    <>
      <header className="employee-header">
        <div className="dash-header-left">
          <h2>
            {title}
          </h2>
          <p className="dash-header-subtitle">
            {subtitle}
          </p>
          {/* <p className="dash-header-date">{today}</p> */}
        </div>
        <div className="dash-header-right">
          {/* User Info with Dropdown */}
          <div className="dash-user-info" ref={dropdownRef}>
            <div className="dash-avatar" style={{ cursor: "pointer" }}>
              {firstLetter}
            </div>
            <div className="dash-user-details">
              <p className="dash-user-name">{employeeName}</p>
              <p className="dash-user-id">{employeeId}</p>
            </div>
            <motion.button
              className="dash-dropdown-btn"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              animate={{ rotate: showUserDropdown ? 180 : 0 }}
            >
              <ChevronDown size={16} />
            </motion.button>

            <AnimatePresence>
              {showUserDropdown && (
                <motion.div
                  className="dash-user-dropdown"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                >
                  <button
                    className="dash-dropdown-item"
                    onClick={() => {
                      setShowProfileModal(true);
                      setShowUserDropdown(false);
                    }}
                  >
                    <User size={18} />
                    My Profile
                  </button>
                  <button
                    className="dash-dropdown-item"
                    onClick={() => {
                      setShowSettingsModal(true);
                      setShowUserDropdown(false);
                    }}
                  >
                    <Settings size={18} />
                    Settings
                  </button>
                  <button
                    className="dash-dropdown-item"
                    onClick={() => {
                      setShowHelpModal(true);
                      setShowUserDropdown(false);
                    }}
                  >
                    <HelpCircle size={18} />
                    Help Center
                  </button>
                  <div className="dash-dropdown-divider" />
                  <button
                    className="dash-dropdown-item dash-dropdown-logout"
                    onClick={handleLogout}
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Employee Profile Modal */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h3>My Profile</h3>
              <div className="profile-modal-actions">
                {!isEditingProfile ? (
                  <button className="profile-edit-btn" onClick={() => setIsEditingProfile(true)}>
                    <Edit size={16} />
                    Edit
                  </button>
                ) : (
                  <>
                    <button className="profile-cancel-btn" onClick={handleCancelEdit} disabled={profileLoading}>
                      <X size={16} />
                      Cancel
                    </button>
                    <button className="profile-save-btn" onClick={handleSaveProfile} disabled={profileLoading}>
                      <Check size={16} />
                      {profileLoading ? "Saving..." : "Save"}
                    </button>
                  </>
                )}
                <button className="modal-close-btn" onClick={() => setShowProfileModal(false)}>
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="profile-modal-body">
              {profileLoading && !profileData.firstName ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <p>Loading profile...</p>
                </div>
              ) : (
                <>
              <div className="profile-avatar-section">
                <div className="profile-avatar-wrapper">
                  {profileData.avatar ? (
                    <img src={profileData.avatar} alt="Profile" className="profile-avatar-img" />
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
                      {profileData.firstName?.charAt(0) || ''}{profileData.lastName?.charAt(0) || ''}
                    </div>
                  )}
                </div>
                <div className="profile-name-section">
                  <h2>
                    {`${profileData.firstName} ${profileData.lastName}`}
                  </h2>
                  <p className="profile-role">{profileData.role}</p>
                  <span className={`profile-status-badge ${profileData.status.toLowerCase()}`}>
                    <span className="status-dot"></span>
                    {profileData.status}
                  </span>
                </div>
              </div>

              <div className="profile-details-grid">
                <div className="profile-detail-item">
                  <label>
                    <Mail size={16} />
                    Email Address
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileInputChange}
                      className="profile-input"
                    />
                  ) : (
                    <p>{profileData.email}</p>
                  )}
                </div>
                <div className="profile-detail-item">
                  <label>
                    <Phone size={16} />
                    Phone Number
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileInputChange}
                      className="profile-input"
                    />
                  ) : (
                    <p>{profileData.phone}</p>
                  )}
                </div>
                <div className="profile-detail-item">
                  <label>
                    <Briefcase size={16} />
                    Employee ID
                  </label>
                  <p className="profile-value-code">{profileData.employeeId}</p>
                </div>
                <div className="profile-detail-item">
                  <label>
                    <Calendar size={16} />
                    Join Date
                  </label>
                  <p>{profileData.joinDate}</p>
                </div>
                <div className="profile-detail-item full-width">
                  <label>
                    <MapPin size={16} />
                    Address
                  </label>
                  {isEditingProfile ? (
                    <textarea
                      name="address"
                      value={profileData.address}
                      onChange={handleProfileInputChange}
                      className="profile-textarea"
                      rows="2"
                    />
                  ) : (
                    <p>{profileData.address}</p>
                  )}
                </div>
              </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSettingsModal(false)}
          >
            <motion.div
              className="settings-modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="settings-modal-header">
                <h2>Settings</h2>
                <button className="modal-close-btn" onClick={() => setShowSettingsModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="settings-modal-body">
                <div className="settings-tabs">
                  <button
                    className={`settings-tab ${activeSettingsTab === "notifications" ? "active" : ""}`}
                    onClick={() => setActiveSettingsTab("notifications")}
                  >
                    <Bell size={18} />
                    Notifications
                  </button>
                  <button
                    className={`settings-tab ${activeSettingsTab === "appearance" ? "active" : ""}`}
                    onClick={() => setActiveSettingsTab("appearance")}
                  >
                    <Settings size={18} />
                    Appearance
                  </button>
                </div>
                <div className="settings-content">
                  {activeSettingsTab === "notifications" && (
                    <div className="settings-section">
                      <h4>Notification Preferences</h4>
                      <div className="settings-option">
                        <div className="settings-option-info">
                          <h5>Email Notifications</h5>
                          <p>Receive updates and alerts via email</p>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={settings.emailNotifications}
                            onChange={(e) => handleSettingChange("emailNotifications", e.target.checked)}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                      <div className="settings-option">
                        <div className="settings-option-info">
                          <h5>Push Notifications</h5>
                          <p>Receive browser push notifications</p>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={settings.pushNotifications}
                            onChange={(e) => handleSettingChange("pushNotifications", e.target.checked)}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    </div>
                  )}
                  {activeSettingsTab === "appearance" && (
                    <div className="settings-section">
                      <h4>Appearance Settings</h4>
                      <div className="settings-option">
                        <div className="settings-option-info">
                          <h5>Language</h5>
                          <p>Select your preferred language</p>
                        </div>
                        <select
                          value={settings.language}
                          onChange={(e) => handleSettingChange("language", e.target.value)}
                          className="settings-select"
                        >
                          <option value="en">English</option>
                          <option value="hi">Hindi</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="settings-modal-footer">
                <button className="profile-cancel-btn" onClick={() => setShowSettingsModal(false)}>
                  Cancel
                </button>
                <button className="profile-save-btn" onClick={handleSaveSettings}>
                  Save Settings
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelpModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHelpModal(false)}
          >
            <motion.div
              className="help-modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="help-modal-header">
                <h2>
                  <HelpCircle size={20} />
                  Help Center
                </h2>
                <button className="modal-close-btn" onClick={() => setShowHelpModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="help-modal-body">
                <div className="help-section">
                  <h4>Frequently Asked Questions</h4>
                  <div className="faq-item">
                    <h5>How do I update my profile?</h5>
                    <p>Click on your profile in the header, select "My Profile", and click "Edit" to update your information.</p>
                  </div>
                  <div className="faq-item">
                    <h5>How do I view my meetings?</h5>
                    <p>Click on "Today's Meetings" in the header or navigate to the Meetings section from the sidebar.</p>
                  </div>
                  <div className="faq-item">
                    <h5>How do I track candidates?</h5>
                    <p>Navigate to the Tracker section from the sidebar to view and manage your candidate tracking.</p>
                  </div>
                </div>
                <div className="help-contact">
                  <h4>Need More Help?</h4>
                  <p>Contact support at support@ownhrsolutions.com</p>
                </div>
              </div>
              <div className="help-modal-footer">
                <button className="profile-cancel-btn" onClick={() => setShowHelpModal(false)}>
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

