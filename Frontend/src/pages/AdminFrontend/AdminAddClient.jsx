import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/OHS.jpg";
import { useAdminClientStore } from "../../store/AdminClientStore";
import "./AdminAddClient.css";
import AdminNavbar from "../../components/AdminNavbar";
import AdminHeader from "../../components/AdminHeader";

const navItems = [
  { icon: "dashboard", label: "Dashboard", path: "/admin-dashboard" },
  { icon: "group", label: "Clients", path: "/admin-clients", hasSubmenu: true },
  { icon: "work", label: "Process", path: "/admin-process" },
  { icon: "badge", label: "Employees", path: "/admin-employees" },
  { icon: "groups", label: "Teams", path: "/admin-teams" },
  { icon: "person_search", label: "Tracker", path: "/admin-joining-tracker", hasSubmenu: true },
  { icon: "upload_file", label: "Data Import", path: "/admin-data-import" },
  { icon: "videocam", label: "Meetings", path: "/admin-meetings" },
  { icon: "mail", label: "Messages", path: "/admin-messages" },
  { icon: "paid", label: "Payout Management", path: "/admin-payout-management" },
  { icon: "event_busy", label: "LOP Management", path: "/admin-lop-management" },
];

export default function AdminAddClient() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  const { addClient, loading, error, clearError } = useAdminClientStore();

  const [formData, setFormData] = useState({
    client_name: "",
    cp_name: "",
    cp_email: "",
    cp_phone: "",
    address: "",
    website: "",
    status: "Active",
    approx_revenue: 0.00,
    notes: "",
  });

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    await addClient(formData);
    
    // Check store state directly after async operation
    const currentState = useAdminClientStore.getState();
    if (!currentState.error && !currentState.loading) {
      navigate("/admin-clients");
    }
  };

  return (
    <div className="admin-add-client-root">
      {/* Sidebar */}
      <AdminNavbar />

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <AdminHeader
          title="Add New Client"
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        {/* Form Content */}
        <div className="form-content">
          <form onSubmit={handleSubmit} className="client-form">
            {/* Client Information */}
            <div className="form-section">
              <h3 className="section-title">Client Information</h3>
              <div className="form-grid grid-2">
                <div className="form-group">
                  <label className="form-label">
                    Client Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="client_name"
                    value={formData.client_name}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="Enter client name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Status <span className="required">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="form-select"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Approximate Revenue <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="approx_revenue"
                    value={formData.approx_revenue}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="Enter approximate revenue"
                  />
                </div>
              </div>
            </div>

            {/* Contact Person */}
            <div className="form-section">
              <h3 className="section-title">Contact Person</h3>
              <div className="form-grid grid-3">
                <div className="form-group">
                  <label className="form-label">
                    Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="cp_name"
                    value={formData.cp_name}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="Enter contact person name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Email Address <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    name="cp_email"
                    value={formData.cp_email}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="Enter email address"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Phone Number <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    name="cp_phone"
                    value={formData.cp_phone}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="form-section">
              <h3 className="section-title">Additional Details</h3>
              <div className="form-grid grid-1">
                <div className="form-group">
                  <label className="form-label">
                    Address <span className="required">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    rows="3"
                    className="form-textarea"
                    placeholder="Enter client address"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="https://example.com"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="4"
                    className="form-textarea"
                    placeholder="Enter any additional notes"
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message">
                <span className="material-symbols-outlined">error</span>
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="form-actions">
              <Link to="/admin-clients" className="btn-cancel">
                Cancel
              </Link>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? "Saving..." : "Save Client"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
