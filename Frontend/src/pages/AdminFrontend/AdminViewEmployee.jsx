import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./AdminViewEmployee.css";
import AdminNavbar from "../../components/AdminNavbar.jsx";
import AdminHeader from "../../components/AdminHeader";
import useAdminEmployeeStore from "../../store/AdminEmployeeStore.js";
import toast from "react-hot-toast";

export default function AdminViewEmployee() {
  const [searchParams] = useSearchParams();
  const empId = searchParams.get("empId");
  const [darkMode, setDarkMode] = useState(false);
  const { selectedEmployee, loading, error, fetchSelectedEmployee } = useAdminEmployeeStore();

  useEffect(() => {
    if (empId) {
      fetchSelectedEmployee(empId);
    }
  }, [empId, fetchSelectedEmployee]);

  // Apply dark mode
  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric", 
        year: "numeric" 
      });
    } catch {
      return "Not set";
    }
  };

  // Helper function to format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return "Not set";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric", 
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });
    } catch {
      return "Not set";
    }
  };

  // Helper function to format designation
  const formatDesignation = (designation) => {
    if (!designation) return "Employee";
    const des = designation.toLowerCase();
    if (des === "team_leader") return "Team Leader";
    if (des === "salaryemp") return "Salary Employee";
    return designation.charAt(0).toUpperCase() + designation.slice(1).replace("_", " ");
  };

  // Helper function to format gender
  const formatGender = (gender) => {
    if (!gender) return "Not set";
    return gender.charAt(0).toUpperCase() + gender.slice(1);
  };

  // Helper function to get status badge class
  const getStatusBadgeClass = (status) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower === "active") return "status-badge-active";
    if (statusLower === "inactive") return "status-badge-inactive";
    return "status-badge-pending";
  };

  // Handle view file
  const handleViewFile = async (filePath) => {
    if (!filePath) {
      toast.error("File not available");
      return;
    }
    window.open(`${import.meta.env.VITE_BACKEND_URL}${filePath}`, "_blank");
  };



  if (loading) {
    return (
      <div className="admin-view-employee-root">
        <AdminNavbar />
        <main className="admin-main">
          <div className="loading-container">
            <p>Loading employee details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-view-employee-root">
        <AdminNavbar />
        <main className="admin-main">
          <div className="error-container">
            <p>Error: {error}</p>
            <Link to="/admin-employees" className="back-link-btn">
              Back to Employees
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!selectedEmployee || selectedEmployee.length === 0) {
    return (
      <div className="admin-view-employee-root">
        <AdminNavbar />
        <main className="admin-main">
          <div className="error-container">
            <p>Employee not found</p>
            <Link to="/admin-employees" className="back-link-btn">
              Back to Employees
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const employee = selectedEmployee[0];

  return (
    <div className={`admin-view-employee-root ${darkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <AdminNavbar />

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <AdminHeader
          title="Employee Details"
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        <div className="employee-details-title">
            <h2 className="admin-header-title">
            {employee.full_name || "Employee Name"}
            <span className={`status-badge ${getStatusBadgeClass(employee.status)}`}>
                {employee.status ? formatGender(employee.status) : "Active"}
            </span>
            </h2>
            <p className="header-subtitle">
            {employee.employee_id || "N/A"} • {formatDesignation(employee.designation)}
            </p>
        </div>

        {/* Content */}
        <main className="view-employee-content">
          <div className="content-wrapper">
            {/* Personal Information */}
            <div className="info-card">
              <h3 className="card-title">Personal Information</h3>
              <div className="info-grid grid-4">
                <div className="info-item">
                  <p className="info-label">First Name</p>
                  <p className="info-value">{employee.first_name || "Not set"}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">Middle Name</p>
                  <p className="info-value">{employee.middle_name || "Not set"}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">Last Name</p>
                  <p className="info-value">{employee.last_name || "Not set"}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">Gender</p>
                  <p className="info-value">{formatGender(employee.gender)}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">Date of Birth</p>
                  <p className="info-value">{formatDate(employee.dob)}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="info-card">
              <h3 className="card-title">Contact Information</h3>
              <div className="info-grid grid-2">
                <div className="info-item">
                  <p className="info-label">Email Address</p>
                  <p className="info-value">{employee.email || "Not set"}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">Recovery Email</p>
                  <p className="info-value">{employee.recovery_email || "Not set"}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">Phone Number</p>
                  <p className="info-value">{employee.phone || "Not set"}</p>
                </div>
                <div className="info-item span-2">
                  <p className="info-label">Aadhar Address</p>
                  <p className="info-value">{employee.aadhar_address || "Not set"}</p>
                </div>
                <div className="info-item span-2">
                  <p className="info-label">Correspondence Address</p>
                  <p className="info-value">
                    {employee.correspondence_address || employee.aadhar_address || "Not set"}
                  </p>
                </div>
              </div>
            </div>

            {/* Identity Documents */}
            <div className="info-card">
              <h3 className="card-title">Identity Documents</h3>
              <div className="info-grid grid-3">
                <div className="info-item">
                  <p className="info-label">PAN Number</p>
                  <p className="info-value">{employee.pan_number || "Not set"}</p>
                  <button
                    className="view-file-btn"
                    onClick={() => handleViewFile(employee.pan_file_path)}
                  >
                    <span className="material-symbols-outlined">visibility</span>
                    View File
                  </button>
                </div>
                <div className="info-item">
                  <p className="info-label">Aadhar Number</p>
                  <p className="info-value">{employee.aadhar_number || "Not set"}</p>
                  <button
                    className="view-file-btn"
                    onClick={() => handleViewFile(employee.aadhar_file_path)}
                  >
                    <span className="material-symbols-outlined">visibility</span>
                    View File
                  </button>
                </div>
                <div className="info-item">
                  <p className="info-label">Cancelled Cheque</p>
                  <p className="info-value italic">
                    {employee.cancelled_cheque_path ? "File available" : "No file available"}
                  </p>
                  <button
                    className="view-file-btn"
                    onClick={() => handleViewFile(employee.cancelled_cheque_path)}
                    disabled={!employee.cancelled_cheque_path}
                  >
                    <span className="material-symbols-outlined">visibility</span>
                    View File
                  </button>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="info-card">
              <h3 className="card-title">Bank Details</h3>
              <div className="info-grid grid-3">
                <div className="info-item">
                  <p className="info-label">Bank Name</p>
                  <p className="info-value">{employee.bank_name || "Not set"}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">Branch Name</p>
                  <p className="info-value">{employee.branch_name || "Not set"}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">IFSC Code</p>
                  <p className="info-value">{employee.ifsc_code || "Not set"}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">Account Number</p>
                  <p className="info-value">{employee.account_number || "Not set"}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">Account Holder Name</p>
                  <p className="info-value">{employee.account_holder_name || "Not set"}</p>
                </div>
              </div>
            </div>

            {/* Employment Details */}
            <div className="info-card">
              <h3 className="card-title">Employment Details</h3>
              <div className="info-grid grid-4">
                <div className="info-item">
                  <p className="info-label">Designation</p>
                  <p className="info-value">{formatDesignation(employee.designation)}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">Status</p>
                  <span className={`status-badge ${getStatusBadgeClass(employee.status)}`}>
                    {employee.status ? formatGender(employee.status) : "Active"}
                  </span>
                </div>
                {/* <div className="info-item">
                  <p className="info-label">Show Payout Type</p>
                  <p className="info-value">
                    {employee.show_payout ? formatDesignation(employee.show_payout) : "Not set"}
                  </p>
                </div> */}
                <div className="info-item">
                  <p className="info-label">Percentage</p>
                  <p className="info-value">
                    {employee.percentage !== null && employee.percentage !== undefined
                      ? `${employee.percentage}%`
                      : "Not set"}
                  </p>
                </div>
                <div className="info-item">
                  <p className="info-label">Selection Date</p>
                  <p className="info-value">{formatDate(employee.selection_date)}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">Joining Date</p>
                  <p className="info-value">{formatDate(employee.joining_date)}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">Created At</p>
                  <p className="info-value">{formatDateTime(employee.created_at) || "-"}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">Last Updated</p>
                  <p className="info-value">{formatDateTime(employee.updated_at) || "-"}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">View Limit</p>
                  <p className="info-value">{employee.view_limit || "-"}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">Monthly Revenue Target</p>
                  <p className="info-value">{employee.revenue_target || "-"}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">Monthly Candidate Target</p>
                  <p className="info-value">{employee.candidate_target !== null ? employee.candidate_target : "-"}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </main>
    </div>
  );
}

