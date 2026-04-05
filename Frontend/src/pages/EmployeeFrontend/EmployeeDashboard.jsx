import React, { useMemo, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {FileText, Calendar, CalendarDays, Briefcase, UserPlus, ClipboardList, HardDrive, TrendingUp, Award, CalendarClock, TrendingDown, 
  ArrowRight, Bell, MapPin, Video, Clock, User,Mail, Phone, Edit, X, Check, PlayCircle, ChevronDown, Settings, HelpCircle, LogOut,
  } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./EmployeeDashboard.css";
import { useEmployeeDashboardStore } from "../../store/EmployeeDashboardStore.js";
import { useEmployeeMeetingStore } from "../../store/EmployeeMeetingStore.js";
import MonthlySuccessChart from "../../components/MonthlySuccessChart.jsx";
import EmployeeNavbar from "../../components/EmployeeNavbar.jsx";
import toast from "react-hot-toast";
// Dynamic targets loaded from API using useMemo instead of this const.

export default function Dashboard() {
  const navigate = useNavigate();
  const employeeName = sessionStorage.getItem("username");
  const firstLetter = employeeName.charAt(0).toUpperCase();
  const empId = sessionStorage.getItem("userId");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMeetingsModal, setShowMeetingsModal] = useState(false);
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
  const [notifications, setNotifications] = useState([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState("notifications");

  const { stats, pipeline, loading, error, fetchDashboard, successLogs, fetchMonthlySuccess, fetchEmployeeProfile, updateEmployeeProfile, profileLoading, monthlyTargets, fetchMonthlyTargets } = useEmployeeDashboardStore();
  const { fetchTodaysMeetings, todaysMeetings } = useEmployeeMeetingStore();

  useEffect(() => {
      // if (!empId) {
      //   console.error("Employee ID missing in sessionStorage");
      //   return;
      // }
      fetchDashboard(empId);
      fetchMonthlySuccess(empId);
      fetchTodaysMeetings(empId);
      fetchMonthlyTargets(empId);
  }, []);

  // Fetch profile when modal opens
  useEffect(() => {
    if (showProfileModal && empId) {
      loadProfile();
    }
  }, [showProfileModal, empId]);

  const loadProfile = async () => {
    try {
      const data = await fetchEmployeeProfile(empId);
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

  const statCards = [
    { title: "Total Active Clients", value: stats.total_clients, color: "#60a5fa", icon: <Briefcase size={22} /> },
    { title: "Total Candidates", value: stats.total_candidates, color: "#a78bfa", icon: <UserPlus size={22} /> },
    { title: "Total Processes", value: stats.total_processes, color: "#34d399", icon: <ClipboardList size={22} /> },
    { title: "Today's Assignments", value: stats.today_assignments, color: "#06b6d4", icon: <CalendarClock size={22} /> },
    { title: "Conversion Rate", value: `${stats.conversion_rate}%`, color: "#f472b6", icon: <TrendingUp size={22} /> },
    { title: "Success Rate", value: `${stats.success_rate}%`, color: "#10b981", icon: <Award size={22} /> },
    { title: "Dropout Rate", value: `${stats.dropout_rate}%`, color: "#fb7185", icon: <TrendingDown size={22} /> },
    { title: "Commission Rate", value: `${stats.commission_rate}%`, color: "#a78bfa", icon: <HardDrive size={22} /> },
  ];
  
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

  const dropdownRef = useRef(null);

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

  // Navigate helpers
  const goToResume = () => {
    navigate("/employee-resumeupload");
  };

  const handleLogout = () => {
    navigate("/employee-login");
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      await updateEmployeeProfile(empId, {
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

  const handleJoinMeeting = (meeting) => {
    window.open(meeting.google_meet_link, "_blank");
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "status-scheduled";
      case "ongoing":
        return "status-ongoing";
      case "completed":
        return "status-completed";
      case "cancelled":
        return "status-cancelled";
      default:
        return "status-default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return <Clock size={16} />;
      case "ongoing":
        return <PlayCircle size={16} />;
      case "completed":
        return <CheckCircle2 size={16} />;
      case "cancelled":
        return <XCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const date = (meeting) => {
    return new Date(meeting.meeting_date).toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
  };

  const time = (meeting) => {
    return new Date(meeting.meeting_date).toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const today = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString("en-IN", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  const dynamicPersonalTargets = useMemo(() => {
    if (!monthlyTargets) return [];
    
    // Revenue Data
    const currentRev = Number(monthlyTargets.generatedRevenue) || 0;
    const targetRev = Number(monthlyTargets.revenueTarget) || 0;
    const revPercent = targetRev > 0 ? Math.round((currentRev / targetRev) * 100) : (currentRev > 0 ? 100 : 0);
    
    // Joins Data
    const currentJoins = Number(monthlyTargets.completelyJoined) || 0;
    const targetJoins = Number(monthlyTargets.candidateTarget) || 0;
    const joinsPercent = targetJoins > 0 ? Math.round((currentJoins / targetJoins) * 100) : (currentJoins > 0 ? 100 : 0);

    return [
      { 
        label: "Monthly Joins Target", 
        current: currentJoins, 
        target: targetJoins, 
        color: "#22c55e",
        percent: joinsPercent,
        prefix: ""
      },
      { 
        label: "Monthly Revenue Target", 
        current: currentRev, 
        target: targetRev, 
        color: "#3b82f6",
        percent: revPercent,
        prefix: "₹" 
      }
    ];
  }, [monthlyTargets]);

  return (
    <div className="dash-root">
      <EmployeeNavbar />

      <main className="dash-main">
        <header className="dash-header">
          <div className="dash-header-left">
            <h2>
              {greeting}, {employeeName}
            </h2>
            <p className="dash-header-subtitle">
              Here is your performance overview and today's schedule.
            </p>
            <p className="dash-header-date">{today}</p>
          </div>
          <div className="dash-header-right">
            <div className="dash-quick-actions">
              <button className="dash-chip primary" onClick={goToResume}>
                <FileText size={16} /> Upload Resume
              </button>
              <button
                className="dash-chip"
                onClick={() => setShowMeetingsModal(true)}
              >
                <Calendar size={16} /> Today's Meetings
              </button>
            </div>
            {/* User Info with Dropdown */}
            <div className="dash-user-info" ref={dropdownRef}>
              <div className="dash-avatar" style={{ cursor: "pointer" }}>
                {firstLetter}
              </div>
              <div className="dash-user-details">
                <p className="dash-user-name">{employeeName}</p>
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
            {notifications.length > 0 && (
              <div className="dash-notification-badge" onClick={() => setShowMeetingsModal(true)}>
                <Bell size={18} />
                <span className="notification-count">{notifications.length}</span>
              </div>
            )}
          </div>
        </header>

        {/* STAT CARDS */}
        <section className="dash-stats">
          {statCards.map((c) => (
            <div className="stat-card" key={c.title}>
              <div className="stat-header">
                <span className="stat-icon" style={{ color: c.color }}>{c.icon}</span>
                <div className="stat-title">{c.title}</div>
              </div>
              <div className="stat-value" style={{ color: c.color }}>
                {c.value}
              </div>
            </div>
          ))}
        </section>

        {/* Pipeline and Chart Section */}
        <section className="dash-lower">
          {/* Pipeline Section */}
          <div className="dash-left">
            <div className="card">
              <div className="card-title-row">
                <h3 className="card-title">Recruitment Pipeline</h3>
                <Link to="/employee-recruitment" className="view-btn">
                  View Recruitment <ArrowRight size={14} />
                </Link>
              </div>

              <div className="pipeline">
                {Object.entries(pipeline).map(([key, value]) => {
                  const max = Math.max(...Object.values(pipeline));
                  const percentage = max ? Math.round((value / max) * 100) : 0;

                  return (
                    <div className="pipeline-row" key={key}>
                      <div className="pipeline-label">{key}</div>
                      <div className="pipeline-bar">
                        <div
                          className="pipeline-fill"
                          style={{ width: `${percentage}%`, background: "#60a5fa" }}
                        />
                      </div>
                      <div className="pipeline-value">{value}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Chart Section (kept same) */}
          {!loading && !error && (
            <div className="dash-right">
              <MonthlySuccessChart data={successLogs} />
            </div>
          )}
        </section>

        <section className="dash-extra">
          {/* This month's targets */}
          <div className="extra-card">
            <div className="card-title-row">
              <h3 className="card-title">My Monthly Targets</h3>
              <span className="card-range subtle">
                Auto-calculated from assignment data
              </span>
            </div>
            <div className="targets-grid">
              {dynamicPersonalTargets.map((t) => {
                const isExceeded = t.current > t.target;
                // Cap the visual bar to 100% so it doesn't break layout
                const displayPercent = Math.min(100, t.percent);
                
                return (
                  <div className="target-item" key={t.label}>
                    <div className="target-header">
                      <span className="target-label">
                        {t.label} 
                        {isExceeded && <span style={{color: '#fff', backgroundColor: '#fbbf24', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', fontWeight: 'bold'}}>EXCEEDED</span>}
                      </span>
                      <span className="target-value">
                        {t.prefix}{t.current.toLocaleString("en-IN")} / {t.prefix}{t.target.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="target-bar">
                      <div
                        className="target-fill"
                        style={{ width: `${displayPercent}%`, background: t.color }}
                      />
                    </div>
                    <span className="target-percent" style={{ color: isExceeded ? '#d97706' : '#64748b', fontWeight: isExceeded ? 'bold' : 'normal' }}>
                      {t.percent}% achieved {isExceeded && "🎉"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

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

      {/* Today's Meetings Modal */}
      {showMeetingsModal && (
        <div className="modal-overlay" onClick={() => setShowMeetingsModal(false)}>
          <div className="meetings-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="meetings-modal-header">
              <div>
                <h3>Today's Meetings</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setShowMeetingsModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="meetings-modal-body">
              {todaysMeetings?.length === 0 ? (
                <div className="empty-state">
                  <Calendar size={48} />
                  <p>No meetings found</p>
                </div>
              ) : (
                todaysMeetings.map((meeting) => (
                  <div key={meeting.id} className="meeting-item">
                    <div className="meeting-main">
                      <div className="meeting-header">
                        <div className="meeting-title-section">
                          <h4 className="meeting-title">
                            {meeting.meeting_name}
                          </h4>
                          <span className="meeting-createdBy">Created by: {meeting.created_by}</span>
                        </div>
    
                        <div
                          className={`status-badge ${getStatusClass(meeting.status)}`}
                        >
                          {getStatusIcon(meeting.status)}
                          <span>{meeting.status}</span>
                        </div>
                      </div>
    
                      <p className="meeting-description">
                        {meeting.description || "No description"}
                      </p>
    
                      <div className="meeting-meta">
                        <span className="meta-item">
                        <CalendarDays size={14} />
                        {date(meeting)} • <Clock size={14} /> {time(meeting)}
                      </span>
    
                        <span className="meta-item">
                          <Video size={14} />
                          {meeting.duration_minutes} mins
                        </span>
                      </div>
                    </div>
    
                    <div className="meeting-actions">
                      <button
                        className="action-btn primary"
                        onClick={() => handleJoinMeeting(meeting)}
                        disabled={meeting.status === "Completed"}
                      >
                        <PlayCircle size={16} />
                        Join Meeting
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {notifications.length > 0 && (
              <div className="meetings-notifications">
                <h4>Notifications</h4>
                {notifications.map((notif) => (
                  <div key={notif.id} className="notification-item">
                    <Bell size={16} />
                    <div>
                      <p className="notification-title">{notif.title}</p>
                      <p className="notification-message">{notif.message}</p>
                    </div>
                    <span className="notification-time">{notif.time}</span>
                  </div>
                ))}
              </div>
            )}
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
    </div>
  );
}
