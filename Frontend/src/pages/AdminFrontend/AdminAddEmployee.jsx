import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminAddEmployee.css";
import AdminNavbar from "../../components/AdminNavbar";
import AdminHeader from "../../components/AdminHeader";
import useAdminEmployeeStore from "../../store/AdminEmployeeStore";
import toast from "react-hot-toast";

export default function AdminAddEmployee() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const { loading, error, addEmployee } = useAdminEmployeeStore();

  // Apply dark mode
  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);
  const admin_id = sessionStorage.getItem('userId');

  // Form state
  const [formData, setFormData] = useState({
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
    status: "Active",
    payoutType: "Actual",
    selectionDate: "",
    joiningDate: "",
    viewLimit: "",
    monthlyRevenueTarget: "",
    monthlyCandidateTarget: "",
    password: "",
    confirmPassword: "",
  });

  const [files, setFiles] = useState({
    panFile: null,
    aadharFile: null,
    chequeFile: null,
  });


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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return;
    }

    // Validate required files
    if (!files.panFile || !files.aadharFile || !files.chequeFile) {
       toast.error("Please upload all required documents (PAN Card, Aadhar Card, and Cancelled Cheque)");
      return;
    }

    // Create FormData for file upload
    const formDataToSend = new FormData();
    
    // Map form data to backend format (snake_case)
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
    formDataToSend.append("password", formData.password);
    formDataToSend.append("designation", formData.designation);
    if (formData.percentage) {
      formDataToSend.append("percentage", formData.percentage);
    }
    if (formData.payoutType) {
      formDataToSend.append("show_payout", formData.payoutType.toLowerCase());
    }
    formDataToSend.append("status", formData.status.toLowerCase());
    if (formData.selectionDate) {
      formDataToSend.append("selection_date", formData.selectionDate);
    }
    if(formData.joiningDate) {
      formDataToSend.append("joining_date", formData.joiningDate);
    }
    formDataToSend.append("view_limit", formData.viewLimit || "");
    formDataToSend.append("monthly_revenue_target", formData.monthlyRevenueTarget || "");
    formDataToSend.append("monthly_candidate_target", formData.monthlyCandidateTarget || "");
    formDataToSend.append("admin_id", admin_id || "");


    // Append files with correct field names
    formDataToSend.append("aadhar_pic", files.aadharFile);
    formDataToSend.append("pan_pic", files.panFile);
    formDataToSend.append("cancelled_cheque_pic", files.chequeFile);
    
    await addEmployee(formDataToSend);
    navigate("/admin-employees");
  };

  return (
    <div className={`admin-add-employee-root ${darkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <AdminNavbar />

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <AdminHeader
          title="Add New Employee"
          darkMode={darkMode}
          setDarkMode={setDarkMode}
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
                  <label className="file-label">
                    Upload PAN Card <span className="required">*</span>
                  </label>
                  <input 
                    type="file" 
                    name="panFile" 
                    className="file-input"
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.pdf"
                    required
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
                  <label className="file-label">
                    Upload Aadhar Card <span className="required">*</span>
                  </label>
                  <input 
                    type="file" 
                    name="aadharFile" 
                    className="file-input"
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.pdf"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="file-label">
                    Upload cancelled Cheque <span className="required">*</span>
                  </label>
                  <input 
                    type="file" 
                    name="chequeFile" 
                    className="file-input"
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.pdf"
                    required
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
                    Payout Type
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
                    Mothly Revenue Target(in ₹)<span className="required">*</span>
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
                    Mothly Candidate Target(in ₹)<span className="required">*</span>
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

            {/* Login Credentials */}
            <div className="form-section">
              <h3 className="section-title">Login Credentials</h3>
              <div className="form-grid grid-2">
                <div className="form-group">
                  <label className="form-label">
                    Password <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Re-enter Password <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              <Link to="/admin-employees" className="btn-cancel">
                Cancel
              </Link>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? "Adding Employee..." : "Add Employee"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

