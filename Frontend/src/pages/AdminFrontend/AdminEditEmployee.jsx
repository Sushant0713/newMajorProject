import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "./AdminAddEmployee.css";
import AdminNavbar from "../../components/AdminNavbar";
import AdminHeader from "../../components/AdminHeader";
import useAdminEmployeeStore from "../../store/AdminEmployeeStore";

export default function AdminEditEmployee() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const empId = searchParams.get("empId");
    const { loading, error, selectedEmployee, fetchSelectedEmployee, updateEmployee } = useAdminEmployeeStore();
  const admin_id = sessionStorage.getItem('userId');
  
  // Form state
  const [formData, setFormData] = useState({
    employee_id: "",
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    dob: "",
    email: "",
    recoveryEmail: "",
    phone: "",
    aadharAddress: "",
    correspondenceAddress: "",
    panNumber: "",
    aadharNumber: "",
    bankName: "",
    branchName: "",
    ifscCode: "",
    accountNumber: "",
    accountHolderName: "",
    designation: "",
    percentage: "",
    status: "active",
    payoutType: "actual",
    selectionDate: "",
    joiningDate: "",
    viewLimit: "",
    monthlyRevenueTarget: "",
    monthlyCandidateTarget: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordError, setPasswordError] = useState(false);
  const [files, setFiles] = useState({
    panFile: null,
    aadharFile: null,
    chequeFile: null,
  });

  // Fetch employee data on mount
  useEffect(() => {
    if (empId) {
      fetchSelectedEmployee(empId);
    }
  }, [empId, fetchSelectedEmployee]);

  // Populate form when employee data is loaded
  useEffect(() => {
    if (selectedEmployee && selectedEmployee.length > 0) {
      const employee = selectedEmployee[0];
      setFormData({
        employee_id: employee.employee_id || "",
        firstName: employee.first_name || "",
        middleName: employee.middle_name || "",
        lastName: employee.last_name || "",
        gender: employee.gender || "",
        dob: employee.dob ? employee.dob.split('T')[0] : "",
        email: employee.email || "",
        recoveryEmail: employee.recovery_email || "",
        phone: employee.phone || "",
        aadharAddress: employee.aadhar_address || "",
        correspondenceAddress: employee.correspondence_address || "",
        panNumber: employee.pan_number || "",
        aadharNumber: employee.aadhar_number || "",
        bankName: employee.bank_name || "",
        branchName: employee.branch_name || "",
        ifscCode: employee.ifsc_code || "",
        accountNumber: employee.account_number || "",
        accountHolderName: employee.account_holder_name || "",
        designation: employee.designation || "",
        percentage: employee.percentage || "",
        status: employee.status || "active",
        payoutType: employee.show_payout || "actual",
        selectionDate: employee.selection_date ? employee.selection_date.split('T')[0] : "",
        joiningDate: employee.joining_date ? employee.joining_date.split('T')[0] : "",
        viewLimit: employee.view_limit || "",
        monthlyRevenueTarget: employee.revenue_target || "",
        monthlyCandidateTarget: employee.candidate_target || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [selectedEmployee]);

  // Apply dark mode
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    if (fileList && fileList.length > 0) {
      setFiles((prev) => ({
        ...prev,
        [name]: fileList[0],
      }));
    }
  };

  // Helper function to get filename from path
  const getFileName = (filePath) => {
    if (!filePath) return "No file";
    return filePath.split('/').pop() || "No file";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Only validate password if it's being changed
    if (formData.password && formData.password !== formData.confirmPassword) {
      setPasswordError(true);
      return;
    }
    setPasswordError(false);

    // Create FormData for file upload
    const formDataToSend = new FormData();
    
    // Map form data to backend format (snake_case)
    formDataToSend.append("employee_id", formData.employee_id);
    formDataToSend.append("first_name", formData.firstName);
    formDataToSend.append("middle_name", formData.middleName || "");
    formDataToSend.append("last_name", formData.lastName);
    formDataToSend.append("gender", formData.gender.toLowerCase());
    formDataToSend.append("dob", formData.dob);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("recovery_email", formData.recoveryEmail || formData.email);
    formDataToSend.append("phone", formData.phone);
    formDataToSend.append("aadhar_address", formData.aadharAddress);
    formDataToSend.append("correspondence_address", formData.correspondenceAddress || formData.aadharAddress);
    formDataToSend.append("pan_number", formData.panNumber.toUpperCase());
    formDataToSend.append("aadhar_number", formData.aadharNumber);
    formDataToSend.append("bank_name", formData.bankName);
    formDataToSend.append("branch_name", formData.branchName);
    formDataToSend.append("ifsc_code", formData.ifscCode.toUpperCase());
    formDataToSend.append("account_number", formData.accountNumber);
    formDataToSend.append("account_holder_name", formData.accountHolderName);
    formDataToSend.append("designation", formData.designation);
    if (formData.percentage) {
      formDataToSend.append("percentage", formData.percentage);
    }
    formDataToSend.append("show_payout", formData.payoutType.toLowerCase());
    formDataToSend.append("status", formData.status.toLowerCase());
    if (formDataToSend.selectionDate){
      formDataToSend.append("selection_date", formData.selectionDate || "");
    }
    if (formDataToSend.joiningDate){
      formDataToSend.append("joining_date", formData.joiningDate || "");
    }
    formDataToSend.append("view_limit", formData.viewLimit || "");
    formDataToSend.append("monthly_revenue_target", formData.monthlyRevenueTarget || "");
    formDataToSend.append("monthly_candidate_target", formData.monthlyCandidateTarget || "");
    formDataToSend.append("admin_id", admin_id);

    // Only append password if it's being changed
    if (formData.password) {
      formDataToSend.append("password", formData.password);
    }

    // Append files only if they are provided (optional for update)
    if (files.panFile) {
      formDataToSend.append("pan_pic", files.panFile);
    }
    if (files.aadharFile) {
      formDataToSend.append("aadhar_pic", files.aadharFile);
    }
    if (files.chequeFile) {
      formDataToSend.append("cancelled_cheque_pic", files.chequeFile);
    }

    try {
      // Clear any previous errors
      useAdminEmployeeStore.getState().setError(null);
      
      await updateEmployee(formDataToSend);
      
      // Check for errors from the store
      const currentError = useAdminEmployeeStore.getState().error;
      if (currentError) {
        alert(currentError);
        useAdminEmployeeStore.getState().setError(null);
        return;
      }
      
      // Success - navigate back to view employee page
      navigate(`/admin-view-employee?empId=${empId}`);
    } catch (err) {
      console.error("Error updating employee:", err);
      alert("Failed to update employee. Please try again.");
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

  if (loading && !selectedEmployee) {
    return (
      <div className="admin-add-employee-root">
        <AdminNavbar />
        <main className="admin-main">
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
            Loading employee data...
          </div>
        </main>
      </div>
    );
  }

  if (error && !selectedEmployee) {
    return (
      <div className="admin-add-employee-root">
        <AdminNavbar />
        <main className="admin-main">
          <div style={{ padding: "40px", textAlign: "center", color: "var(--danger-color)" }}>
            Error: {error}
            <br />
            <Link to="/admin-employees" style={{ marginTop: "16px", display: "inline-block" }}>
              Back to Employees
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const employee = selectedEmployee && selectedEmployee.length > 0 ? selectedEmployee[0] : null;

  return (
    <div className={`admin-add-employee-root`}>
      {/* Sidebar */}
      <AdminNavbar />

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <AdminHeader
          title="Edit Employee"
          
        />

        {/* Form Content */}
        <div className="form-content">
          <form onSubmit={handleSubmit} className="employee-form">
            {/* Personal Information */}
            <div className="form-section">
              <h3 className="section-title">Personal Information</h3>
              <div className="form-grid grid-4">
                <div className="form-group">
                  <label className="form-label">
                    First Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Middle Name</label>
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Last Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Gender <span className="required">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Date of Birth <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="form-section">
              <h3 className="section-title">Contact Information</h3>
              <div className="form-grid grid-2">
                <div className="form-group">
                  <label className="form-label">
                    Email Address <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Recovery Email</label>
                  <input
                    type="email"
                    name="recoveryEmail"
                    value={formData.recoveryEmail}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Phone Number <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group span-2">
                  <label className="form-label">
                    Aadhar Address <span className="required">*</span>
                  </label>
                  <textarea
                    name="aadharAddress"
                    value={formData.aadharAddress}
                    onChange={handleInputChange}
                    required
                    rows="2"
                    className="form-textarea"
                  />
                </div>
                <div className="form-group span-2">
                  <label className="form-label">Correspondence Address</label>
                  <textarea
                    name="correspondenceAddress"
                    value={formData.correspondenceAddress}
                    onChange={handleInputChange}
                    rows="2"
                    className="form-textarea"
                  />
                </div>
              </div>
            </div>

            {/* Identity Documents */}
            <div className="form-section">
              <h3 className="section-title">Identity Documents</h3>
              <div className="form-grid grid-3">
                <div className="form-group">
                  <label className="form-label">
                    PAN Number <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="panNumber"
                    value={formData.panNumber}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                  {employee?.pan_file_path && (
                    <div className="current-file-info">
                      Current File: <span className="file-name">{getFileName(employee.pan_file_path)}</span>
                    </div>
                  )}
                  <label className="file-label">Upload New PAN Card (Optional)</label>
                  <input 
                    type="file" 
                    name="panFile" 
                    className="file-input"
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.pdf"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Aadhar Number <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="aadharNumber"
                    value={formData.aadharNumber}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                  {employee?.aadhar_file_path && (
                    <div className="current-file-info">
                      Current File: <span className="file-name">{getFileName(employee.aadhar_file_path)}</span>
                    </div>
                  )}
                  <label className="file-label">Upload New Aadhar Card (Optional)</label>
                  <input 
                    type="file" 
                    name="aadharFile" 
                    className="file-input"
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.pdf"
                  />
                </div>
                <div className="form-group">
                  <label className="file-label">Upload New Cancelled Cheque (Optional)</label>
                  {employee?.cancelled_cheque_path ? (
                    <div className="current-file-info">
                      Current File: <span className="file-name">{getFileName(employee.cancelled_cheque_path)}</span>
                    </div>
                  ) : (
                    <div className="current-file-info" style={{ fontStyle: "italic", color: "var(--text-secondary)" }}>
                      No file available
                    </div>
                  )}
                  <input 
                    type="file" 
                    name="chequeFile" 
                    className="file-input"
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.pdf"
                  />
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="form-section">
              <h3 className="section-title">Bank Details</h3>
              <div className="form-grid grid-3">
                <div className="form-group">
                  <label className="form-label">
                    Bank Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Branch Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="branchName"
                    value={formData.branchName}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    IFSC Code <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="ifscCode"
                    value={formData.ifscCode}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Account Number <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Account Holder Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="accountHolderName"
                    value={formData.accountHolderName}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Employment Details */}
            <div className="form-section">
              <h3 className="section-title">Employment Details</h3>
              <div className="form-grid grid-4">
                <div className="form-group">
                  <label className="form-label">
                    Designation <span className="required">*</span>
                  </label>
                  <select
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select Designation</option>
                    <option value="employee">Employee</option>
                    <option value="team_leader">Team Leader</option>
                    <option value="core">Core</option>
                    <option value="manager">Manager</option>
                    <option value="salaryemp">Salary Employee</option>
                    <option value="freelancer">Freelancer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Percentage
                  </label>
                  <input
                    type="number"
                    name="percentage"
                    value={formData.percentage}
                    onChange={handleInputChange}
                    placeholder="e.g. 10.00"
                    min="0"
                    max="100"
                    step="0.01"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Status <span className="required">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Payout Type <span className="required">*</span>
                  </label>
                  <select
                    name="payoutType"
                    value={formData.payoutType}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="actual">Actual</option>
                    <option value="fake">Fake</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Selection Date
                  </label>
                  <input
                    type="date"
                    name="selectionDate"
                    value={formData.selectionDate}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Joining Date 
                  </label>
                  <input
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    View Limit <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="viewLimit"
                    value={formData.viewLimit}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Monthly Revenue Target <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="monthlyRevenueTarget"
                    value={formData.monthlyRevenueTarget}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Monthly Candidate Target <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="monthlyCandidateTarget"
                    value={formData.monthlyCandidateTarget}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Login Credentials - Optional for Edit */}
            <div className="form-section">
              <h3 className="section-title">Change Password (Optional)</h3>
              <div className="form-grid grid-2">
                <div className="form-group">
                  <label className="form-label">
                    New Password <span className="optional">(Leave blank to keep current)</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter new password"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Re-enter new password"
                  />
                </div>
              </div>
              {passwordError && (
                <div className="password-error">Passwords do not match.</div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message" style={{ marginBottom: "20px", padding: "12px", backgroundColor: "#fee2e2", color: "#dc2626", borderRadius: "8px" }}>
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="form-actions">
              <Link to={`/admin-view-employee?empId=${empId}`} className="btn-cancel">
                Cancel
              </Link>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? "Updating Employee..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

