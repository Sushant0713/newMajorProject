import React, { useRef, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./AdminHeader.css";
import "../pages/AdminFrontend/AdminDashboard.css";

export default function AdminHeader({
  title = "Dashboard",
}) {
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const dropdownRef = useRef(null);
  const adminName = sessionStorage.getItem('username');
  const adminId = sessionStorage.getItem('userId');

  // Modal States
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    subject: "",
    category: "general",
    message: "",
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // FAQ Data
  const faqData = [
    {
      question: "How do I reset my password?",
      answer: "Go to My Profile > Security Settings > Change Password and follow the prompts.",
    },
    {
      question: "How do I enable two-factor authentication?",
      answer: "Go to My Profile > Security Settings, click 'Enable 2FA', choose your preferred method and follow the setup instructions.",
    },
    {
      question: "How do I add a new employee?",
      answer: "Navigate to the Employees section from the sidebar, click 'Add Employee', and fill in the required information.",
    },
    {
      question: "How do I generate reports?",
      answer: "Go to the Dashboard, select the date range, and click on the specific metric card. You can export data from there.",
    },
    {
      question: "How do I manage client assignments?",
      answer: "Go to Clients > Assign Employee from the sidebar. Select employees and clients, then click 'Assign Selected'.",
    },
    {
      question: "How do I contact support?",
      answer: "Click 'Contact Support' in the Help Center or email us at support@ownhrsolutions.com.",
    },
  ];

  const [expandedFaq, setExpandedFaq] = useState(null);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

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

  // Format date function
  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "AD";
    const words = name.trim().split(/\s+/);
    if (words.length === 0) return "AD";
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  // Handle logout
  const handleLogout = () => {
    setShowUserDropdown(false);
    navigate("/");
  };

  // Contact Form Handler
  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.subject || !contactForm.message) {
      alert("Please fill in all required fields");
      return;
    }
    setContactSubmitted(true);
    setTimeout(() => {
      setShowContactModal(false);
      setContactSubmitted(false);
      setContactForm({ subject: "", category: "general", message: "" });
    }, 2000);
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const closeSettingsModals = () => {
    setShowHelpModal(false);
    setShowContactModal(false);
    setContactForm({ subject: "", category: "general", message: "" });
    setContactSubmitted(false);
    setExpandedFaq(null);
  };

  // Handle help click
  const handleHelpClick = () => {
    setShowUserDropdown(false);
    setShowHelpModal(true);
  };

  return (
    <motion.header
      className="admin-header"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="admin-header-left">
        <div className="header-title-section">
          <h2 className="admin-header-title">{title}</h2>
          {currentTime && (
            <p className="header-date">{formatDate(currentTime)}</p>
          )}
        </div>
      </div>

      <div className="admin-header-right">

        {/* User Info */}
        <div className="admin-user-info" ref={dropdownRef}>
          <motion.div
            className="admin-avatar"
            whileHover={{ scale: 1.05 }}
          >
            {getInitials(adminName)}
          </motion.div>
          <div className="admin-user-details">
            <p className="admin-user-name">{adminName}</p>
            <p className="admin-user-email">{adminId}</p>
          </div>
          <motion.button
            className="admin-dropdown-btn"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            animate={{ rotate: showUserDropdown ? 180 : 0 }}
          >
            <span className="material-symbols-outlined">expand_more</span>
          </motion.button>

          <AnimatePresence>
            {showUserDropdown && (
              <motion.div
                className="user-dropdown"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
              >
                <Link to="/admin-profile" className="dropdown-item">
                  <span className="material-symbols-outlined">person</span>
                  My Profile
                </Link>
                <button
                  className="dropdown-item"
                  onClick={handleHelpClick}
                >
                  <span className="material-symbols-outlined">help</span>
                  Help Center
                </button>
                <div className="dropdown-divider" />
                <button onClick={handleLogout} className="dropdown-item logout">
                  <span className="material-symbols-outlined">logout</span>
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Help/FAQ Modal */}
      <AnimatePresence>
        {showHelpModal && (
          <motion.div
            className="settings-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSettingsModals}
          >
            <motion.div
              className="settings-modal-content help-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="settings-modal-header">
                <div className="settings-modal-title">
                  <span className="material-symbols-outlined">help</span>
                  <h2>Help Center</h2>
                </div>
                <button className="settings-close-btn" onClick={closeSettingsModals}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="faq-list">
                {faqData.map((faq, index) => (
                  <div key={index} className={`faq-item ${expandedFaq === index ? "expanded" : ""}`}>
                    <button className="faq-question" onClick={() => toggleFaq(index)}>
                      <span>{faq.question}</span>
                      <span className="material-symbols-outlined">
                        {expandedFaq === index ? "expand_less" : "expand_more"}
                      </span>
                    </button>
                    <AnimatePresence>
                      {expandedFaq === index && (
                        <motion.div
                          className="faq-answer"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <p>{faq.answer}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              <div className="help-modal-footer">
                <p>Can't find what you're looking for?</p>
                <button
                  className="settings-btn-save"
                  onClick={() => {
                    setShowHelpModal(false);
                    setShowContactModal(true);
                  }}
                >
                  <span className="material-symbols-outlined">support_agent</span>
                  Contact Support
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Support Modal */}
      <AnimatePresence>
        {showContactModal && (
          <motion.div
            className="settings-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSettingsModals}
          >
            <motion.div
              className="settings-modal-content contact-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="settings-modal-header">
                <div className="settings-modal-title">
                  <span className="material-symbols-outlined">support_agent</span>
                  <h2>Contact Support</h2>
                </div>
                <button className="settings-close-btn" onClick={closeSettingsModals}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {contactSubmitted ? (
                <div className="contact-success">
                  <span className="material-symbols-outlined success-icon">check_circle</span>
                  <h3>Message Sent!</h3>
                  <p>Our support team will get back to you within 24 hours.</p>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleContactSubmit}>
                  <div className="contact-form-group">
                    <label>Category</label>
                    <select
                      value={contactForm.category}
                      onChange={(e) => setContactForm((prev) => ({ ...prev, category: e.target.value }))}
                      className="settings-select"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="technical">Technical Issue</option>
                      <option value="billing">Billing Question</option>
                      <option value="feature">Feature Request</option>
                      <option value="bug">Report a Bug</option>
                    </select>
                  </div>

                  <div className="contact-form-group">
                    <label>Subject *</label>
                    <input
                      type="text"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm((prev) => ({ ...prev, subject: e.target.value }))}
                      placeholder="Brief description of your issue"
                      className="contact-input"
                      required
                    />
                  </div>

                  <div className="contact-form-group">
                    <label>Message *</label>
                    <textarea
                      value={contactForm.message}
                      onChange={(e) => setContactForm((prev) => ({ ...prev, message: e.target.value }))}
                      placeholder="Please describe your issue in detail..."
                      className="contact-textarea"
                      rows="5"
                      required
                    />
                  </div>

                  <div className="contact-info-box">
                    <span className="material-symbols-outlined">info</span>
                    <p>
                      You can also reach us at{" "}
                      <a href="mailto:support@ownhrsolutions.com">support@ownhrsolutions.com</a>
                      {" "}or call <a href="tel:+919876543210">+91 98765 43210</a>
                    </p>
                  </div>

                  <div className="settings-modal-actions">
                    <button type="button" className="settings-btn-cancel" onClick={closeSettingsModals}>
                      Cancel
                    </button>
                    <button type="submit" className="settings-btn-save">
                      <span className="material-symbols-outlined">send</span>
                      Send Message
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

