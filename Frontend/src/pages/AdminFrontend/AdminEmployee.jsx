import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./AdminEmployee.css";
import AdminNavbar from "../../components/AdminNavbar";
import AdminHeader from "../../components/AdminHeader";
import useAdminEmployeeStore from "../../store/AdminEmployeeStore";
import { X, Copy } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { FaFacebookF } from "react-icons/fa";
import { FaLinkedinIn } from "react-icons/fa";
import { FaTelegramPlane } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import toast from "react-hot-toast";


export default function AdminEmployee() {
  const navigate = useNavigate();
  const location = useLocation();
  const { employees, loading, error, fetchAllEmployees, markAsPIP, endPIP, deleteEmployee } = useAdminEmployeeStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [designationFilter, setDesignationFilter] = useState("All Designations");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showPIPModal, setShowPIPModal] = useState(false);
  const [showEndPIPModal, setShowEndPIPModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [pipForm, setPipForm] = useState({
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [showShareModal, setShowShareModal] = useState(false);

  const registrationPath = "/employee-registration-form";
  const shareUrl = `${window.location.origin}${registrationPath}`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const text = encodeURIComponent("Register using this link:");

  // Fetch employees on component mount
  useEffect(() => {
    fetchAllEmployees();
  }, [fetchAllEmployees]);

  // Clear selected employee on refresh/page load
  useEffect(() => {
    setSelectedEmployeeId(null);
    setSelectedEmployee(null);
  }, []);

  // Apply dark mode
  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied");
  };

  const shareWhatsApp = () =>
    window.open(`https://wa.me/?text=${text}%20${encodedUrl}`, "_blank");

  const shareFacebook = () =>
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank");

  const shareTwitter = () =>
    window.open(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${text}`, "_blank");

  const shareLinkedIn = () =>
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, "_blank");

  const shareTelegram = () =>
    window.open(`https://t.me/share/url?url=${encodedUrl}&text=${text}`, "_blank");

  const shareGmail = () =>
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&su=Employee Registration&body=${text}%20${encodedUrl}`,
      "_blank"
    );

  const hadleCloseShareModal = () => {
    setShowShareModal(false);
  };

  // Helper function to get initials from name
  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Helper function to get background color based on designation
  const getBgColor = (designation) => {
    const des = designation?.toLowerCase() || "";
    if (des.includes("team_leader") || des.includes("team leader")) return "green";
    if (des.includes("manager")) return "purple";
    if (des.includes("freelancer")) return "pink";
    return "indigo";
  };

  // Helper function to format designation for display
  const formatDesignation = (designation) => {
    if (!designation) return "Employee";
    const des = designation.toLowerCase();
    if (des === "team_leader") return "Team Leader";
    return designation.charAt(0).toUpperCase() + designation.slice(1).replace("_", " ");
  };

  // Helper function to format salary/percentage
  const formatSalary = (salary, percentage) => {
    if (percentage !== null && percentage !== undefined) {
      return `${percentage}%`;
    }
    if (salary !== null && salary !== undefined) {
      return new Intl.NumberFormat("en-IN").format(salary);
    }
    return "Not set";
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "Not set";
    }
  };

  // Map backend data to component format
  const mappedEmployees = employees.map((emp) => ({
    id: emp.id,
    name: emp.full_name || "",
    empId: emp.employee_id || "",
    email: emp.email || "",
    phone: emp.phone || "",
    designation: formatDesignation(emp.designation),
    salary: formatSalary(emp.salary, emp.percentage),
    status: emp.is_online === "active" ? "Online" : "Offline",
    pipStatus: emp.pip_id ? (<div style={{color: "#b71c1c"}}>PIP Active
                              <br />
                              ({formatDate(emp.pip_start_date)} - {formatDate(emp.pip_end_date)})
                            </div>
                          ) : (
                            "Not on PIP"
                          ),
    joiningDate: formatDate(emp.joining_date),
    initials: getInitials(emp.full_name),
    bgColor: getBgColor(emp.designation),
    // Keep original data for API calls
    originalData: emp,
  }));

  // Handle employee row click to select employee
  const handleEmployeeClick = (employee) => {
    setSelectedEmployeeId(employee.originalData?.employee_id || employee.empId);
    setSelectedEmployee(employee);
  };

  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setShowPIPModal(false);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  const openPIPModal = () => {
    if (selectedEmployee) {
      setShowPIPModal(true);
      setPipForm({ startDate: "", endDate: "", reason: "" });
    } else {
      toast.error("Please select an employee first");
    }
  };

  const handleViewEmployee = () => {
    if (selectedEmployeeId) {
      navigate(`/admin-view-employee?empId=${selectedEmployeeId}`);
    } else {
      toast.error("Please select an employee first");
    }
  };

  const handleEditEmployee = () => {
    if (selectedEmployeeId) {
      navigate(`/admin-edit-employee?empId=${selectedEmployeeId}`);
    } else {
      toast.error("Please select an employee first");
    }
  };

  const handleEmployeePortfolio = () => {
    if (selectedEmployeeId) {
      navigate(`/employee-portfolio?empId=${selectedEmployeeId}`);
    } else {
      toast.error("Please select an employee first");
    }
  };

  const handleDeleteEmployee = () => {
    if (selectedEmployeeId && selectedEmployee) {
      setShowDeleteModal(true);
    } else {
      toast.error("Please select an employee first");
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedEmployeeId) {
      useAdminEmployeeStore.getState().setError(null);
      await deleteEmployee(selectedEmployeeId);
      const currentError = useAdminEmployeeStore.getState().error;
      if (currentError) {
        toast.error(currentError);
        useAdminEmployeeStore.getState().setError(null);
        return;
      }
      
      setShowDeleteModal(false);
      setSelectedEmployeeId(null);
      setSelectedEmployee(null);
      fetchAllEmployees();
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleEndPIP = () => {
    if (selectedEmployee?.originalData?.pip_id) {
      setShowEndPIPModal(true);
    } else {
      toast.error("No active PIP found for this employee");
    }
  };

  const handleConfirmEndPIP = async () => {
    if (selectedEmployee?.originalData?.pip_id) {
      useAdminEmployeeStore.getState().setError(null);
      await endPIP(selectedEmployee.originalData.pip_id);
      const currentError = useAdminEmployeeStore.getState().error;
      if (currentError) {
        toast.error(currentError);
        useAdminEmployeeStore.getState().setError(null);
        return;
      }
      setShowEndPIPModal(false);
      fetchAllEmployees();
    }
  };

  const handleCloseEndPIPModal = () => {
    setShowEndPIPModal(false);
  };

  const closePIPModal = () => {
    setShowPIPModal(false);
  };

  const handlePIPSubmit = async (e) => {
    e.preventDefault();
    if (new Date(pipForm.endDate) <= new Date(pipForm.startDate)) {
      toast.error("End date must be after start date!");
      return;
    }
    const pipData = {
      pip_start_date: pipForm.startDate,
      pip_end_date: pipForm.endDate,
      pip_reason: pipForm.reason || "",
      admin_name: sessionStorage.getItem('username') || "Admin",
    };
    useAdminEmployeeStore.getState().setError(null);
    await markAsPIP(selectedEmployeeId, pipData);
    const currentError = useAdminEmployeeStore.getState().error;
    if (currentError) {
      toast.error(currentError);
      useAdminEmployeeStore.getState().setError(null); // Clear error after showing
      return;
    }
    
    toast.success(
      `Employee "${selectedEmployee?.name}" has been marked as PIP from ${pipForm.startDate} to ${pipForm.endDate}`
    );
    closePIPModal();
    fetchAllEmployees();
  };

  const filteredEmployees = mappedEmployees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.empId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All Status" ||
      (statusFilter === "Online" && employee.status === "Online") ||
      (statusFilter === "Offline" && employee.status === "Offline");

    const matchesDesignation =
      designationFilter === "All Designations" ||
      employee.designation.toLowerCase().includes(designationFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesDesignation;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, designationFilter]);

  const getDesignationClass = (designation) => {
    switch (designation.toLowerCase()) {
      case "team leader":
        return "designation-green";
      case "manager":
        return "designation-purple";
      case "freelancer":
        return "designation-pink";
      case "salaryemp":
      case "employee":
      default:
        return "designation-indigo";
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("All Status");
    setDesignationFilter("All Designations");
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of table
    const tableContainer = document.querySelector('.table-container');
    if (tableContainer) {
      tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Calculate start and end page
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      // Adjust if we're near the end
      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  return (
    <div className={`admin-employee-root ${darkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <AdminNavbar />

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <AdminHeader
          title="Employee Management"
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        {/* Content */}
        <div className="employee-content">
          <div className="top-section-btn">
            <button className="share-link-btn" onClick={() => setShowShareModal(true)}>
              <span className="material-symbols-outlined">share</span>
              Share Registration Link
            </button>
            <Link to="/admin-add-employee" className="add-employee-btn">
              Add New Employee
            </Link>
          </div>

          {/* Filter Bar */}
          <div className="filter-bar">
            <input
              type="text"
              className="search-input"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Status</option>
              <option>Online</option>
              <option>Offline</option>
            </select>
            <select
              className="filter-select"
              value={designationFilter}
              onChange={(e) => setDesignationFilter(e.target.value)}
            >
              <option>All Designations</option>
              <option>Employee</option>
              <option>Team Leader</option>
              <option>Manager</option>
              <option>Freelancer</option>
            </select>
            <button className="clear-btn" onClick={clearFilters}>
              Clear
            </button>
          </div>

          {/* Employee Table */}
          <div className="table-container">
            <div style={{ overflowY: "auto", flex: 1 }}>
              <table className="employee-table">
                <thead>
                  <tr>
                    <th>EMPLOYEE</th>
                    <th>CONTACT</th>
                    <th>DESIGNATION</th>
                    <th>SALARY/PERCENTAGE</th>
                    <th>ONLINE STATUS</th>
                    <th>PIP STATUS</th>
                    <th>JOINING DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
                        No employees found
                      </td>
                    </tr>
                  ) : (
                    paginatedEmployees.map((employee) => {
                      const employeeId = employee.originalData?.employee_id || employee.empId;
                      const isSelectedForActions = selectedEmployeeId === employeeId;
                      return (
                        <React.Fragment key={employeeId}>
                          <tr
                            className={isSelectedForActions ? 'selected-row' : ''}
                            onClick={() => handleEmployeeClick(employee)}
                            style={{ cursor: 'pointer' }}
                          >
                            <td>
                              <div className="employee-cell">
                                <div className="employee-info">
                                  <p className="employee-name">{employee.name}</p>
                                  <p className="employee-id">{employee.empId}</p>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="contact-cell">
                                <span className="contact-email">{employee.email}</span>
                                <span className="contact-phone">{employee.phone}</span>
                              </div>
                            </td>
                            <td>
                              <span className={`designation-badge ${getDesignationClass(employee.designation)}`}>
                                {employee.designation}
                              </span>
                            </td>
                            <td className="salary-cell">{employee.salary}</td>
                            <td>
                              <span className={`status-badge status-${employee.status === 'Online' ? 'online' : 'offline'}`}>
                                <span className="status-dot"></span>
                                {employee.status}
                              </span>
                            </td>
                            <td>
                              <span className="pip-badge">{employee.pipStatus}</span>
                            </td>
                            <td className="date-cell">{employee.joiningDate}</td>
                          </tr>

                          {/* INLINE ACTION BAR ROW */}
                          {isSelectedForActions && (
                            <tr className="inline-action-row">
                              <td colSpan={7}>
                                <div className="inline-actions-bar">
                                  <div className="action-buttons-bar">
                                    <button
                                      className="action-bar-btn view"
                                      onClick={() => handleViewEmployee(employee)}
                                      title="View Employee"
                                    >
                                      <span className="material-symbols-outlined">visibility</span>
                                      View
                                    </button>

                                    <button
                                      className="action-bar-btn edit"
                                      onClick={() => handleEditEmployee(employee)}
                                      title="Edit Employee"
                                    >
                                      <span className="material-symbols-outlined">edit</span>
                                      Edit
                                    </button>

                                    <button
                                      className="action-bar-btn portfolio"
                                      onClick={() => handleEmployeePortfolio(employee)}
                                      title="Employee Portfolio"
                                    >
                                      <span className="material-symbols-outlined">folder_open</span>
                                      Portfolio
                                    </button>

                                    {employee.originalData?.pip_id? (
                                      <button
                                        className="action-bar-btn end-pip"
                                        onClick={() => handleEndPIP(employee)}
                                        title="End PIP"
                                      >
                                        <span className="material-symbols-outlined">check_circle</span>
                                        End PIP
                                      </button>
                                    ) : (
                                      <button
                                        className="action-bar-btn pip"
                                        onClick={() => openPIPModal(employee)}
                                        title="Mark as PIP"
                                      >
                                        <span className="material-symbols-outlined">warning</span>
                                        Mark as PIP
                                      </button>
                                    )}

                                    <button
                                      className="action-bar-btn delete"
                                      onClick={() => handleDeleteEmployee(employee)}
                                      title="Delete Employee"
                                    >
                                      <span className="material-symbols-outlined">delete</span>
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>

              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {filteredEmployees.length > 0 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredEmployees.length)} of {filteredEmployees.length} employees
              </div>
              <div className="pagination-controls">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                  Previous
                </button>
                
                <div className="pagination-numbers">
                  {currentPage > 3 && (
                    <>
                      <button
                        className="pagination-number"
                        onClick={() => handlePageChange(1)}
                      >
                        1
                      </button>
                      {currentPage > 4 && <span className="pagination-ellipsis">...</span>}
                    </>
                  )}
                  
                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}
                  
                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && <span className="pagination-ellipsis">...</span>}
                      <button
                        className="pagination-number"
                        onClick={() => handlePageChange(totalPages)}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Share Modal */}
      {showShareModal && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && hadleCloseShareModal()}
        >
          <div className="share-modal">
            <div className="share-header">
              <h3>Share Registration Link</h3>
              <button className="close-btn" onClick={hadleCloseShareModal}>
                <X size={18} />
              </button>
            </div>

            <div className="share-url-box">
              <input value={shareUrl} readOnly />
              <button onClick={handleCopyLink} className="copy-btn">
                <Copy size={16} />
              </button>
            </div>

            <div className="share-options">
              <button className="whatsapp" onClick={shareWhatsApp}>
                <FaWhatsapp size={20} />
              </button>

              <button className="facebook" onClick={shareFacebook}>
                <FaFacebookF size={20} />
              </button>

              <button className="twitter" onClick={shareTwitter}>
                <FaXTwitter size={20} />
              </button>

              <button className="linkedin" onClick={shareLinkedIn}>
                <FaLinkedinIn size={20} />
              </button>

              <button className="telegram" onClick={shareTelegram}>
                <FaTelegramPlane size={20} />
              </button>

              <button className="gmail" onClick={shareGmail}>
                <MdEmail size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIP Modal */}
      {showPIPModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closePIPModal()}>
          <div className="pip-modal">
            <div className="modal-header">
              <h3>Mark Employee as PIP</h3>
              <button className="modal-close-btn" onClick={closePIPModal}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handlePIPSubmit} className="modal-body">
              <div className="employee-info-box">
                <span className="label">Employee:</span>
                <span className="value">{selectedEmployee?.name}</span>
              </div>

              <div className="form-group">
                <label htmlFor="pipStartDate">
                  Start Date <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="pipStartDate"
                  required
                  value={pipForm.startDate}
                  onChange={(e) => setPipForm({ ...pipForm, startDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="pipEndDate">
                  End Date <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="pipEndDate"
                  required
                  value={pipForm.endDate}
                  onChange={(e) => setPipForm({ ...pipForm, endDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="pipReason">
                  Reason <span className="optional">(Optional)</span>
                </label>
                <textarea
                  id="pipReason"
                  rows="4"
                  placeholder="Enter reason for PIP..."
                  value={pipForm.reason}
                  onChange={(e) => setPipForm({ ...pipForm, reason: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={closePIPModal}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Mark as PIP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* End PIP Confirmation Modal */}
      {showEndPIPModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleCloseEndPIPModal()}>
          <div className="confirmation-modal">
            <div className="modal-header">
              <div className="delete-modal-header">
                <div className="delete-icon-wrapper">
                  <span className="material-symbols-outlined delete-icon">warning</span>
                </div>
                <h3>End PIP</h3>
              </div>
              <button className="modal-close-btn" onClick={handleCloseEndPIPModal}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="confirmation-content">
                <p className="confirmation-text">
                  Are you sure you want to end PIP for <strong>"{selectedEmployee?.name}"</strong>?
                </p>
                <p className="confirmation-warning-text">
                  This action will mark the PIP as completed. This cannot be undone.
                </p>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseEndPIPModal}>
                  Cancel
                </button>
                <button type="button" className="submit-btn end-pip-btn" onClick={handleConfirmEndPIP}>
                  End PIP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Employee Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleCloseDeleteModal()}>
          <div className="confirmation-modal">
            <div className="modal-header">
              <div className="delete-modal-header">
                <div className="delete-icon-wrapper">
                  <span className="material-symbols-outlined delete-icon">delete</span>
                </div>
                <h3>Delete Employee</h3>
              </div>
              <button className="modal-close-btn" onClick={handleCloseDeleteModal}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="confirmation-content">
                <p className="confirmation-text">
                  Are you sure you want to delete employee <strong>"{selectedEmployee?.name}"</strong> ({selectedEmployee?.empId})?
                </p>
                <p className="confirmation-warning-text">
                  This action cannot be undone. All employee data will be permanently deleted.
                </p>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseDeleteModal}>
                  Cancel
                </button>
                <button type="button" className="submit-btn delete-btn-modal" onClick={handleConfirmDelete}>
                  Delete Employee
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

