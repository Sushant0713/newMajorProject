import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminEmployeeRegistration.css";
import useAdminEmployeeStore from "../../store/AdminEmployeeStore";
import toast from "react-hot-toast";

const AdminEmployeeRegistration = () => {
  const navigate = useNavigate();
    const { loading, error, registerEmployee } = useAdminEmployeeStore();

  // Apply dark mode  const admin_id = sessionStorage.getItem('userId');

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
    password: "",
    confirmPassword: "",
  });

  const [passwordError, setPasswordError] = useState(false);
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
      setPasswordError(true);
      return;
    }
    setPasswordError(false);

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

    // Append files with correct field names
    formDataToSend.append("aadhar_pic", files.aadharFile);
    formDataToSend.append("pan_pic", files.panFile);
    formDataToSend.append("cancelled_cheque_pic", files.chequeFile);
    console.log(formDataToSend);

    try {
      await registerEmployee(formDataToSend);
      toast.success("Employee added successfully");
    } catch (err) {
      console.error("Error adding employee:", err);
      toast.error("Failed to add employee. Please try again.");
    }
  };

  return (
    <div className="employee-page">
      <main className="employee-container">
        {/* Page Header */}
        <div className="employee-page-header">
            <h2 className="employee-page-title">Employee Registration</h2>
        </div>

        {/* Form Wrapper */}
      <div className="employee-form-wrapper">
        <form onSubmit={handleSubmit} className="employee-form">

            {/* Personal Information */}
            <section className="employee-card">
                <h3 className="employee-card-title">Personal Information</h3>
                <div className="employee-grid grid-4">
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
            </section>

            {/* Contact Information */}
            <section className="employee-card">
                <h3 className="employee-card-title">Contact Information</h3>
                <div className="employee-grid grid-3">
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
                <div className="form-group span-full">
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
                <div className="form-group span-full">
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
            </section>

            {/* Identity Documents */}
            <section className="employee-card">
                <h3 className="employee-card-title">Identity Documents</h3>
                <div className="employee-grid grid-3">
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
                  <label className="file-label">Upload PAN Card <span className="required">*</span> </label>
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
                  <label className="file-label">Upload Aadhar Card <span className="required">*</span> </label>
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
                  <label className="file-label">Upload cancelled Cheque <span className="required">*</span> </label>
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
            </section>

            {/* Bank Details */}
            <section className="employee-card">
                <h3 className="employee-card-title">Bank Details</h3>
                <div className="employee-grid grid-3">
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
            </section>

            {/* Login Credentials */}
            <section className="employee-card">
                <h3 className="employee-card-title">Login Credentials</h3>
                <div className="employee-grid grid-2">
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
              {passwordError && (
                <div className="password-error">Passwords do not match.</div>
              )}
            </section>

            {/* Action Buttons */}
            <div className="employee-actions">
                <button type="submit" className="employee-submit-btn">
                    Submit
                </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default AdminEmployeeRegistration