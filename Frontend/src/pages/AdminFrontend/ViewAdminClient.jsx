import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { useAdminClientStore } from "../../store/AdminClientStore";
import { useAdminProcessStore } from "../../store/AdminProcessStore";
import AdminNavbar from "../../components/AdminNavbar";
import AdminHeader from "../../components/AdminHeader";
import "./ViewAdminClient.css";
import "../AdminFrontend/AdminProcess.css";


export default function ViewAdminClient() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clientId } = useParams();
  const [darkMode, setDarkMode] = useState(false);
  const [selectedProcessId, setSelectedProcessId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProcessId, setEditingProcessId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProcessId, setDeletingProcessId] = useState(null);
  const [deletingProcessName, setDeletingProcessName] = useState("");

  const {
    clientDetails,
    assignedEmployees,
    processes,
    fetchClientDetails,
    fetchAssignedEmployees,
    fetchProcessesForClient,
    fetchAvailableEmployees,
    removeAssignedEmployee,
    loading,
    error,
    clearError,
  } = useAdminClientStore();

  const {
    selectedProcess,
    spocs,
    fetchProcessDetails,
    fetchProcessSpocs,
    updateProcess,
    deleteProcess: deleteProcessFromStore,
    loading: processLoading,
    error: processError,
  } = useAdminProcessStore();

  const [editForm, setEditForm] = useState({
    process_name: "",
    process_description: "",
    hiring_type: "Fresher",
    openings: "",
    salary: "",
    locations: "",
    interview_dates: "",
    clawback_duration: "",
    invoice_clear_time: "",
    payout_type: "Fix",
    payout_amount: "",
    real_payout_amount: "",
    requirements: "",
    new_status: "Active"
  });

  const [editSpocs, setEditSpocs] = useState([
    { spoc_name: "", spoc_role: "", spoc_email: "", spoc_phone: "", spoc_note: "" }
  ]);

  useEffect(() => {
    if (clientId) {
      clearError();
      fetchClientDetails(clientId);
      fetchAssignedEmployees(clientId);
      fetchProcessesForClient(clientId);
      fetchAvailableEmployees();
    }
    return () => clearError();
  }, [clientId, fetchClientDetails, fetchAssignedEmployees, fetchProcessesForClient, fetchAvailableEmployees, clearError]);

  // Apply dark mode
  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (isEditModalOpen && editingProcessId) {
      loadProcessForEdit(editingProcessId);
    }
  }, [isEditModalOpen, editingProcessId]);

  useEffect(() => {
    if (selectedProcess && isEditModalOpen) {
      setEditForm({
        process_name: selectedProcess.process_name || "",
        process_description: selectedProcess.process_description || "",
        hiring_type: selectedProcess.hiring_type || "Fresher",
        openings: selectedProcess.openings || "",
        salary: selectedProcess.salary || "",
        locations: selectedProcess.locations || "",
        interview_dates: selectedProcess.interview_dates || "",
        clawback_duration: selectedProcess.clawback_duration || "",
        invoice_clear_time: selectedProcess.invoice_clear_time || "",
        payout_type: selectedProcess.payout_type || "Fix",
        payout_amount: selectedProcess.payout_amount || "",
        real_payout_amount: selectedProcess.real_payout_amount || "",
        requirements: selectedProcess.requirements || "",
        new_status: selectedProcess.status || "Active"
      });
    }
  }, [selectedProcess, isEditModalOpen]);

  useEffect(() => {
    if (spocs && spocs.length > 0 && isEditModalOpen) {
      const mappedSpocs = spocs.map(spoc => ({
        spoc_name: spoc.name || "",
        spoc_role: spoc.role || "",
        spoc_email: spoc.email || "",
        spoc_phone: spoc.phone || "",
        spoc_note: spoc.note || ""
      }));
      setEditSpocs(mappedSpocs);
    } else if (isEditModalOpen && (!spocs || spocs.length === 0)) {
      setEditSpocs([{ spoc_name: "", spoc_role: "", spoc_email: "", spoc_phone: "", spoc_note: "" }]);
    }
  }, [spocs, isEditModalOpen]);

  // Handle sticky horizontal scrollbar
  useEffect(() => {
    const tableContainer = document.getElementById('process-table-container');
    const stickyScrollbar = document.getElementById('sticky-scrollbar');
    
    if (!tableContainer || !stickyScrollbar || processes.length === 0) return;

    // Set the width of sticky scrollbar content to match table width
    const table = tableContainer.querySelector('.process-table');
    if (table) {
      const tableWidth = table.scrollWidth;
      stickyScrollbar.style.setProperty('--table-width', `${tableWidth}px`);
    }

    const handleScroll = () => {
      const tableRect = tableContainer.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Show sticky scrollbar after scrolling past 5 rows (approximately 250px from table top)
      const rowHeight = 50; // Approximate row height including padding
      const threshold = 250; // 5 rows * 50px
      const scrollPastThreshold = tableRect.top < -threshold;
      const tableVisible = tableRect.bottom > viewportHeight;
      
      if (scrollPastThreshold && tableVisible && tableContainer.scrollWidth > tableContainer.clientWidth) {
        stickyScrollbar.style.display = 'block';
        // Sync scroll position
        stickyScrollbar.scrollLeft = tableContainer.scrollLeft;
      } else {
        stickyScrollbar.style.display = 'none';
      }
    };

    const handleTableScroll = () => {
      if (stickyScrollbar && stickyScrollbar.style.display === 'block') {
        stickyScrollbar.scrollLeft = tableContainer.scrollLeft;
      }
    };

    const handleStickyScroll = (e) => {
      if (tableContainer) {
        tableContainer.scrollLeft = stickyScrollbar.scrollLeft;
      }
    };

    // Use requestAnimationFrame for smooth scrolling
    let ticking = false;
    const optimizedHandleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', optimizedHandleScroll, { passive: true });
    tableContainer.addEventListener('scroll', handleTableScroll, { passive: true });
    stickyScrollbar.addEventListener('scroll', handleStickyScroll, { passive: true });

    // Initial check
    handleScroll();

    // Also check on resize
    const handleResize = () => {
      const table = tableContainer.querySelector('.process-table');
      if (table) {
        const tableWidth = table.scrollWidth;
        stickyScrollbar.style.setProperty('--table-width', `${tableWidth}px`);
      }
      handleScroll();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', optimizedHandleScroll);
      window.removeEventListener('resize', handleResize);
      tableContainer.removeEventListener('scroll', handleTableScroll);
      stickyScrollbar.removeEventListener('scroll', handleStickyScroll);
    };
  }, [processes.length]);


  const handleRemoveEmployee = async (employeeId) => {
    if (window.confirm("Are you sure you want to remove this employee assignment?")) {
      clearError();
      await removeAssignedEmployee(clientId, employeeId);
    }
  };

  const handleProcessRowClick = (processId) => {
    setSelectedProcessId(processId);
  };

  const getSelectedProcess = () => {
    return processes.find(p => p.id === selectedProcessId);
  };

  const handleActionView = () => {
    if (selectedProcessId) {
      // TODO: Implement view functionality
      console.log("View process:", selectedProcessId);
    }
  };

  const loadProcessForEdit = async (processId) => {
    try {
      await fetchProcessDetails(processId);
      await fetchProcessSpocs(processId);
    } catch (err) {
      console.error("Error loading process for edit:", err);
    }
  };

  const handleActionEdit = () => {
    if (selectedProcessId) {
      handleEditClick(selectedProcessId);
    }
  };

  const handleActionDelete = () => {
    if (selectedProcessId) {
      const process = getSelectedProcess();
      if (process) {
        handleDeleteClick(selectedProcessId, process.processName);
      }
    }
  };

  const handleEditClick = async (processId) => {
    setEditingProcessId(processId);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingProcessId(null);
    setEditForm({
      process_name: "",
      process_description: "",
      hiring_type: "Fresher",
      openings: "",
      salary: "",
      locations: "",
      interview_dates: "",
      clawback_duration: "",
      invoice_clear_time: "",
      payout_type: "Fix",
      payout_amount: "",
      real_payout_amount: "",
      requirements: "",
      new_status: "Active"
    });
    setEditSpocs([{ spoc_name: "", spoc_role: "", spoc_email: "", spoc_phone: "", spoc_note: "" }]);
    setSelectedProcessId(null);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleEditSpocChange = (index, field, value) => {
    const updated = [...editSpocs];
    updated[index][field] = value;
    setEditSpocs(updated);
  };

  const addEditSpoc = () => {
    setEditSpocs([...editSpocs, { spoc_name: "", spoc_role: "", spoc_email: "", spoc_phone: "", spoc_note: "" }]);
  };

  const removeEditSpoc = (index) => {
    if (editSpocs.length > 1) {
      setEditSpocs(editSpocs.filter((_, i) => i !== index));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      process_name: editForm.process_name,
      process_description: editForm.process_description || "",
      hiring_type: editForm.hiring_type,
      openings: parseInt(editForm.openings) || 0,
      locations: editForm.locations || "",
      requirements: editForm.requirements || "",
      salary: editForm.salary || "",
      interview_dates: editForm.interview_dates || "",
      clawback_duration: parseInt(editForm.clawback_duration) || 0,
      invoice_clear_time: parseInt(editForm.invoice_clear_time) || 0,
      payout_type: editForm.payout_type,
      payout_amount: parseFloat(editForm.payout_amount) || 0,
      real_payout_amount: parseFloat(editForm.real_payout_amount) || 0,
      new_status: editForm.new_status,
      spocs: editSpocs
        .filter(spoc => spoc.spoc_name && spoc.spoc_email && spoc.spoc_phone)
        .map(spoc => ({
          spoc_name: spoc.spoc_name,
          spoc_role: spoc.spoc_role || "",
          spoc_email: spoc.spoc_email,
          spoc_phone: spoc.spoc_phone,
          spoc_note: spoc.spoc_note || ""
        }))
    };

    try {
      await updateProcess(editingProcessId, payload);
      handleCloseEditModal();
      // Refresh processes for the client
      if (clientId) {
        fetchProcessesForClient(clientId);
      }
    } catch (err) {
      console.error("Error updating process:", err);
    }
  };

  const handleDeleteClick = (processId, processName) => {
    setDeletingProcessId(processId);
    setDeletingProcessName(processName);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingProcessId(null);
    setDeletingProcessName("");
    setSelectedProcessId(null);
  };

  const handleConfirmDelete = async () => {
    if (deletingProcessId) {
      try {
        await deleteProcessFromStore(deletingProcessId);
        handleCloseDeleteModal();
        // Refresh processes for the client
        if (clientId) {
          fetchProcessesForClient(clientId);
        }
      } catch (err) {
        console.error("Error deleting process:", err);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "status-pill status-active";
      case "inactive":
        return "status-pill status-inactive";
      case "pending":
        return "status-pill status-pending";
      default:
        return "status-pill status-active";
    }
  };

  const getStatusDotClass = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "status-dot status-dot-active";
      case "inactive":
        return "status-dot status-dot-inactive";
      case "pending":
        return "status-dot status-dot-pending";
      default:
        return "status-dot status-dot-active";
    }
  };

  if (loading && !clientDetails) {
    return (
      <div className="view-admin-client-root">
        <div style={{ padding: "50px", textAlign: "center" }}>Loading...</div>
      </div>
    );
  }

  if (!clientId) {
    return (
      <div className="view-admin-client-root">
        <div style={{ padding: "50px", textAlign: "center" }}>
          <p>Invalid client ID</p>
          <Link to="/admin-clients">Back to Clients</Link>
        </div>
      </div>
    );
  }

  if (!clientDetails && !loading && !error) {
    return (
      <div className="view-admin-client-root">
        <div style={{ padding: "50px", textAlign: "center" }}>
          <p>Loading client details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`view-admin-client-root ${darkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <AdminNavbar />

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <AdminHeader
          title="Client Details"
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        {/* Content */}
        <div className="view-client-content">
          {/* Error Message */}
          {error && (
            <div className="error-message">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          {/* Client Title */}
          <div className="client-title-section">
            <div>
              <h1 className="client-title">{clientDetails?.client_name || "Client Details"}</h1>
              <p className="client-subtitle">Client Details</p>
            </div>
            <Link 
              to={`/admin-edit-client/${clientId}`} 
              className="edit-client-btn"
            >
              <span className="material-symbols-outlined">edit</span>
              Edit Client
            </Link>
          </div>

          {/* Client Details Card */}
          <div className="client-details-card">
            <h3 className="card-section-title">Client Information</h3>
            <div className="details-grid">
              <div className="details-column">
                <div className="detail-item">
                  <label className="detail-label">Contact Person</label>
                  <p className="detail-value">{clientDetails?.cp_name || "N/A"}</p>
                </div>
                <div className="detail-item">
                  <label className="detail-label">Email</label>
                  <p className="detail-value">{clientDetails?.cp_email || "N/A"}</p>
                </div>
                <div className="detail-item">
                  <label className="detail-label">Phone</label>
                  <p className="detail-value">{clientDetails?.cp_phone || "N/A"}</p>
                </div>
                <div className="detail-item">
                  <label className="detail-label">Approximate Revenue</label>
                  <p className="detail-value">{clientDetails?.approx_revenue}</p>
                </div>
              </div>
              <div className="details-column">
                <div className="detail-item">
                  <label className="detail-label">Status</label>
                  <div className="status-container">
                    <span className={getStatusClass(clientDetails?.status)}>
                      <span className={getStatusDotClass(clientDetails?.status)}></span>
                      {clientDetails?.status || "Active"}
                    </span>
                  </div>
                </div>
                <div className="detail-item">
                  <label className="detail-label">Address</label>
                  <p className="detail-value">{clientDetails?.address || "N/A"}</p>
                </div>
                <div className="detail-item">
                  <label className="detail-label">Created At</label>
                  <p className="detail-value">{formatDate(clientDetails?.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Assign Employees Section */}
          <div className="assign-employees-card">
            <div className="assign-section-header">
              <h3 className="card-section-title">Assign Employees</h3>
              <button
                className="assign-btn"
                type="button"
                onClick={() => navigate("/admin-assign-employee")}
              >
                Assign New Employee
              </button>
            </div>

            {/* Assigned Employees Cards */}
            {assignedEmployees.length > 0 ? (
              <div className="assigned-employees-section">
                <h4 className="assigned-section-title">
                  Assigned Employees ({assignedEmployees.length})
                </h4>
                <div className="assigned-cards-grid">
                  {assignedEmployees.map((emp) => (
                    <div key={emp.id} className="assigned-employee-card">
                      <button
                        className="remove-btn"
                        onClick={() => handleRemoveEmployee(emp.id)}
                        disabled={loading}
                        title="Remove assignment"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                      <div className="assigned-card-content">
                        <h4 className="assigned-name">{emp.fullName}</h4>
                        <p className="assigned-id">{emp.employeeId}</p>
                        <p className="assigned-date">
                          <span className="material-symbols-outlined">schedule</span>
                          Assigned: {formatDate(emp.assignedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="no-assigned-employees">
                <span className="material-symbols-outlined">group_remove</span>
                <p>No employees assigned to this client yet.</p>
                <p className="hint-text">Use the "Assign New Employee" button above to assign employees.</p>
              </div>
            )}
          </div>

          {/* Processes Section */}
          <div className="processes-card">
            <div className="card-section-title">
              <h3>Processes</h3>
              <Link to="/admin-add-process" className="add-process-btn">
                <span className="material-symbols-outlined">add</span>
                Add New Process
              </Link>
            </div>
            {processes.length > 0 ? (
              <div className="table-wrapper">
                <div className="table-container" id="process-table-container">
                  <table className="process-table">
                    <thead>
                      <tr>
                        <th>Process Name</th>
                        <th>Client Name</th>
                        <th>Hiring Type</th>
                        <th>Display Payout</th>
                        <th>Real Payout</th>
                        <th>Candidate Assigned</th>
                        <th>Salary</th>
                        <th>Status</th>
                        <th>SPOCs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processes.map((process) => {
                        const isSelectedForActions = selectedProcessId === process.id;

                        return (
                          <React.Fragment key={process.id}>
                            <tr
                              className={isSelectedForActions ? "selected-row" : ""}
                              onClick={() => handleProcessRowClick(process.id)}
                              style={{ cursor: "pointer" }}
                            >
                              <td className="process-name">{process.processName}</td>
                              <td>{process.clientName || clientDetails?.client_name || "N/A"}</td>
                              <td>{process.hiringType}</td>
                              <td>{process.displayPayout}</td>
                              <td>{process.realPayout}</td>
                              <td>{process.candidateAssigned}</td>
                              <td>{process.salary}</td>
                              <td>
                                <span
                                  className={`status-badge ${
                                    process.status?.toLowerCase() === "active"
                                      ? "status-active"
                                      : "status-inactive"
                                  }`}
                                >
                                  {process.status}
                                </span>
                              </td>
                              <td>
                                <span className="spoc-count">{process.totalSpocs}</span>
                              </td>
                            </tr>

                            {/* INLINE ACTION BAR ROW */}
                            {isSelectedForActions && (
                              <tr className="inline-action-row">
                                <td colSpan={9}>
                                  <div className="action-buttons-bar">
                                    <button
                                      className="action-bar-btn view"
                                      onClick={() => handleActionView(process)}
                                    >
                                      <span className="material-symbols-outlined">visibility</span>
                                      View
                                    </button>

                                    <button
                                      className="action-bar-btn edit"
                                      onClick={() => handleActionEdit(process)}
                                    >
                                      <span className="material-symbols-outlined">edit</span>
                                      Edit
                                    </button>

                                    <button
                                      className="action-bar-btn delete"
                                      onClick={() => handleActionDelete(process)}
                                    >
                                      <span className="material-symbols-outlined">delete</span>
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>

                  </table>
                </div>
                <div className="sticky-scrollbar" id="sticky-scrollbar"></div>
              </div>
            ) : (
              <div className="no-data-message">
                <p>No processes found for this client.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit Process Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={handleCloseEditModal}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Edit Process</h2>
              <button className="modal-close" onClick={handleCloseEditModal}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="modal-body">
              <form className="edit-process-form" onSubmit={handleEditSubmit}>
                {/* Process Details */}
                <div className="form-section-inner">
                  <h4 className="form-subtitle">Process Details</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="edit_process_name" className="form-label">
                        Process Name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="edit_process_name"
                        name="process_name"
                        value={editForm.process_name}
                        onChange={handleEditFormChange}
                        required
                        className="form-input"
                        placeholder="Enter process name"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="edit_hiring_type" className="form-label">
                        Hiring Type <span className="required">*</span>
                      </label>
                      <select
                        id="edit_hiring_type"
                        name="hiring_type"
                        value={editForm.hiring_type}
                        onChange={handleEditFormChange}
                        required
                        className="form-select"
                      >
                        <option value="Fresher">Fresher</option>
                        <option value="Experienced">Experienced</option>
                        <option value="Combined">Combined</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="edit_openings" className="form-label">
                        Number of Openings <span className="required">*</span>
                      </label>
                      <input
                        type="number"
                        id="edit_openings"
                        name="openings"
                        value={editForm.openings}
                        onChange={handleEditFormChange}
                        required
                        min="1"
                        className="form-input"
                        placeholder="Enter number of openings"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="edit_status" className="form-label">
                        Status <span className="required">*</span>
                      </label>
                      <select
                        id="edit_status"
                        name="new_status"
                        value={editForm.new_status}
                        onChange={handleEditFormChange}
                        required
                        className="form-select"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="edit_salary" className="form-label">Salary</label>
                      <input
                        type="text"
                        id="edit_salary"
                        name="salary"
                        value={editForm.salary}
                        onChange={handleEditFormChange}
                        className="form-input"
                        placeholder="e.g. 15000 (no commas)"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="edit_locations" className="form-label">Locations</label>
                      <input
                        type="text"
                        id="edit_locations"
                        name="locations"
                        value={editForm.locations}
                        onChange={handleEditFormChange}
                        className="form-input"
                        placeholder="e.g. Mumbai 400059"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="edit_interview_dates" className="form-label">Interview Dates</label>
                      <input
                        type="text"
                        id="edit_interview_dates"
                        name="interview_dates"
                        value={editForm.interview_dates}
                        onChange={handleEditFormChange}
                        className="form-input"
                        placeholder="e.g. 1 week, specific dates, or all days"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="edit_clawback_duration" className="form-label">
                        Clawback Duration (days)
                      </label>
                      <input
                        type="number"
                        id="edit_clawback_duration"
                        name="clawback_duration"
                        value={editForm.clawback_duration}
                        onChange={handleEditFormChange}
                        min="0"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="edit_invoice_clear_time" className="form-label">
                        Invoice Clear Time (days)
                      </label>
                      <input
                        type="number"
                        id="edit_invoice_clear_time"
                        name="invoice_clear_time"
                        value={editForm.invoice_clear_time}
                        onChange={handleEditFormChange}
                        min="0"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="edit_payout_type" className="form-label">Payout Type</label>
                      <select
                        id="edit_payout_type"
                        name="payout_type"
                        value={editForm.payout_type}
                        onChange={handleEditFormChange}
                        className="form-select"
                      >
                        <option value="Fix">Fix</option>
                        <option value="Percentage">Percentage</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="edit_payout_amount" className="form-label">Payout Amount</label>
                      <input
                        type="number"
                        id="edit_payout_amount"
                        name="payout_amount"
                        value={editForm.payout_amount}
                        onChange={handleEditFormChange}
                        min="0"
                        step="0.01"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="edit_real_payout_amount" className="form-label">Real Payout Amount</label>
                      <input
                        type="number"
                        id="edit_real_payout_amount"
                        name="real_payout_amount"
                        value={editForm.real_payout_amount}
                        onChange={handleEditFormChange}
                        min="0"
                        step="0.01"
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group-full">
                    <label htmlFor="edit_process_description" className="form-label">Process Description</label>
                    <textarea
                      id="edit_process_description"
                      name="process_description"
                      value={editForm.process_description}
                      onChange={handleEditFormChange}
                      rows="3"
                      className="form-textarea"
                      placeholder="Enter process description"
                    />
                  </div>

                  <div className="form-group-full">
                    <label htmlFor="edit_requirements" className="form-label">Requirements</label>
                    <textarea
                      id="edit_requirements"
                      name="requirements"
                      value={editForm.requirements}
                      onChange={handleEditFormChange}
                      rows="3"
                      className="form-textarea"
                      placeholder="Enter requirements"
                    />
                  </div>
                </div>

                <hr className="form-divider" />

                {/* SPOC Section */}
                <div className="form-section-inner">
                  <div className="spoc-header">
                    <h4 className="form-subtitle">SPOCs (Single Point of Contact)</h4>
                    <button
                      type="button"
                      onClick={addEditSpoc}
                      className="add-spoc-btn"
                    >
                      <span className="material-symbols-outlined">add</span>
                      Add Another SPOC
                    </button>
                  </div>

                  <div className="spoc-container">
                    {editSpocs.map((spoc, index) => (
                      <div key={index} className="spoc-card">
                        {editSpocs.length > 1 && (
                          <button
                            type="button"
                            className="remove-spoc-btn"
                            onClick={() => removeEditSpoc(index)}
                            title="Remove SPOC"
                          >
                            <span className="material-symbols-outlined">close</span>
                          </button>
                        )}
                        <div className="spoc-grid">
                          <div className="form-group">
                            <label className="form-label">Name</label>
                            <input
                              type="text"
                              value={spoc.spoc_name}
                              onChange={(e) => handleEditSpocChange(index, "spoc_name", e.target.value)}
                              required
                              className="form-input"
                              placeholder="Enter SPOC name"
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">Role</label>
                            <input
                              type="text"
                              value={spoc.spoc_role}
                              onChange={(e) => handleEditSpocChange(index, "spoc_role", e.target.value)}
                              className="form-input"
                              placeholder="Enter role"
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                              type="email"
                              value={spoc.spoc_email}
                              onChange={(e) => handleEditSpocChange(index, "spoc_email", e.target.value)}
                              required
                              className="form-input"
                              placeholder="Enter email"
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">Phone</label>
                            <input
                              type="tel"
                              value={spoc.spoc_phone}
                              onChange={(e) => handleEditSpocChange(index, "spoc_phone", e.target.value)}
                              required
                              className="form-input"
                              placeholder="Enter phone"
                            />
                          </div>

                          <div className="form-group-full">
                            <label className="form-label">Note</label>
                            <textarea
                              value={spoc.spoc_note}
                              onChange={(e) => handleEditSpocChange(index, "spoc_note", e.target.value)}
                              rows="2"
                              className="form-textarea"
                              placeholder="Enter note (optional)"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Error Message */}
                {(error || processError) && (
                  <div className="error-message">
                    <span className="material-symbols-outlined">error</span>
                    {error || processError}
                  </div>
                )}

                {/* Form Actions */}
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={handleCloseEditModal}
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={processLoading}
                  >
                    {processLoading ? "Updating..." : "Update Process"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay" onClick={handleCloseDeleteModal}>
          <div className="modal-content modal-sm delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="delete-modal-header">
                <div className="delete-icon-wrapper">
                  <span className="material-symbols-outlined delete-icon">warning</span>
                </div>
                <h2 className="modal-title">Delete Process</h2>
              </div>
              <button className="modal-close" onClick={handleCloseDeleteModal}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="modal-body">
              <div className="delete-confirm-content">
                <p className="delete-confirm-text">
                  Are you sure you want to delete the process <strong>"{deletingProcessName}"</strong>?
                </p>
                <p className="delete-warning-text">
                  This action cannot be undone. All associated data including SPOCs will be permanently deleted.
                </p>
              </div>

              {(error || processError) && (
                <div className="error-message">
                  <span className="material-symbols-outlined">error</span>
                  {error || processError}
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={handleCloseDeleteModal}
                  className="btn-cancel"
                  disabled={processLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="btn-delete"
                  disabled={processLoading}
                >
                  {processLoading ? "Deleting..." : "Delete Process"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

