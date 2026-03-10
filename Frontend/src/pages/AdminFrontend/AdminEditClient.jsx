import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { useAdminClientStore } from "../../store/AdminClientStore";
import AdminNavbar from "../../components/AdminNavbar";
import AdminHeader from "../../components/AdminHeader";
import "./AdminEditClient.css";


export default function AdminEditClient() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clientId } = useParams();
  const [darkMode, setDarkMode] = useState(false);

  const { 
    clientDetails, 
    fetchClientDetails, 
    updateClient, 
    loading, 
    error, 
    clearError 
  } = useAdminClientStore();

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

  // Fetch client details when component mounts
  useEffect(() => {
    if (clientId) {
      clearError();
      fetchClientDetails(clientId);
    }
  }, [clientId, fetchClientDetails, clearError]);

  // Populate form when client details are loaded
  useEffect(() => {
    if (clientDetails) {
      setFormData({
        client_name: clientDetails.client_name || "",
        cp_name: clientDetails.cp_name || "",
        cp_email: clientDetails.cp_email || "",
        cp_phone: clientDetails.cp_phone || "",
        address: clientDetails.address || "",
        website: clientDetails.website || "",
        status: clientDetails.status || "Active",
        approx_revenue: clientDetails.approx_revenue,
        notes: clientDetails.notes || "",
      });
    }
  }, [clientDetails]);

  // Apply dark mode
  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    await updateClient(clientId, formData);
    
    // Check store state directly after async operation
    const currentState = useAdminClientStore.getState();
    if (!currentState.error && !currentState.loading) {
      navigate(`/admin-client-details/${clientId}`);
    }
  };

  if (loading && !clientDetails) {
    return (
      <div className="admin-edit-client-root">
        <div style={{ padding: "50px", textAlign: "center" }}>Loading...</div>
      </div>
    );
  }

  if (!clientId) {
    return (
      <div className="admin-edit-client-root">
        <div style={{ padding: "50px", textAlign: "center" }}>
          <p>Invalid client ID</p>
          <Link to="/admin-clients">Back to Clients</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`admin-edit-client-root ${darkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <AdminNavbar />

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <AdminHeader
          title="Edit Client"
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
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
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
              <Link to={`/admin-client-details/${clientId}`} className="btn-cancel">
                Cancel
              </Link>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? "Updating..." : "Update Client"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

