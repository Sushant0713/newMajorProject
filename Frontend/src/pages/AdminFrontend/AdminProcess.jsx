import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./AdminProcess.css";
import AdminNavbar from "../../components/AdminNavbar.jsx";
import AdminHeader from "../../components/AdminHeader.jsx";
import { useAdminProcessStore } from "../../store/AdminProcessStore";

export default function AdminProcess() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [clientFilter, setClientFilter] = useState("All");
  const [darkMode, setDarkMode] = useState(false);
  const [hoveredSpoc, setHoveredSpoc] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProcessId, setEditingProcessId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProcessId, setDeletingProcessId] = useState(null);
  const [deletingProcessName, setDeletingProcessName] = useState("");
  const [selectedProcessId, setSelectedProcessId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const { 
    processes, 
    loading, 
    error, 
    clientNames,
    fetchAllProcesses,
    fetchClientNames,
    selectedProcess,
    spocs,
    fetchProcessDetails,
    fetchProcessSpocs,
    updateProcess,
    deleteProcess
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
    fetchAllProcesses();
    fetchClientNames();
  }, [fetchAllProcesses, fetchClientNames]);

  useEffect(() => {
    if (isEditModalOpen && editingProcessId) {
      loadProcessForEdit(editingProcessId);
    }
  }, [isEditModalOpen, editingProcessId]);

  // Apply dark mode
  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);


  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setClientFilter("All");
    setCurrentPage(1);
  };

  const filteredProcesses = processes.filter((process) => {
    const matchesSearch =
      process.processName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      process.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      process.hiringType?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "All" || 
      process.status?.toLowerCase() === statusFilter.toLowerCase();
    
    const matchesClient =
      clientFilter === "All" ||
      process.clientName === clientFilter;
    
    return matchesSearch && matchesStatus && matchesClient;
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, clientFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredProcesses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProcesses = filteredProcesses.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages with ellipsis
      if (currentPage <= 3) {
        // Show first pages
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Show last pages
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show middle pages
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };


  const getStatusClass = (status) => {
    return status.toLowerCase() === "active" ? "status-active" : "status-inactive";
  };

  const loadProcessForEdit = async (processId) => {
    try {
      await fetchProcessDetails(processId);
      await fetchProcessSpocs(processId);
    } catch (err) {
      console.error("Error loading process for edit:", err);
    }
  };

  useEffect(() => {
    if (!isEditModalOpen || !selectedProcess) return;
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

    // Set SPOCs
    if (spocs && spocs.length > 0) {
      setEditSpocs(
        spocs.map(spoc => ({
          spoc_name: spoc.name || "",
          spoc_role: spoc.role || "",
          spoc_email: spoc.email || "",
          spoc_phone: spoc.phone || "",
          spoc_note: spoc.note || ""
        }))
      );
    } else {
      setEditSpocs([{ spoc_name: "", spoc_role: "", spoc_email: "", spoc_phone: "", spoc_note: "" }]);
    }
  }, [isEditModalOpen, selectedProcess, spocs]);

  useEffect(() => {
    if (location.state?.clientName) {
      setClientFilter(location.state.clientName);
    }
  }, [location.state]);

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
        await deleteProcess(deletingProcessId);
        handleCloseDeleteModal();
        setSelectedProcessId(null);
      } catch (err) {
        console.error("Error deleting process:", err);
      }
    }
  };

  const handleProcessRowClick = (processId) => {
    setSelectedProcessId(processId);
  };

  const handleActionView = () => {
    if (selectedProcessId) {
      // TODO: Implement view functionality
      console.log("View process:", selectedProcessId);
    }
  };

  const handleActionEdit = () => {
    if (selectedProcessId) {
      handleEditClick(selectedProcessId);
    }
  };

  const handleActionDelete = () => {
    if (selectedProcessId) {
      const process = processes.find(p => p.id === selectedProcessId);
      if (process) {
        handleDeleteClick(selectedProcessId, process.processName);
      }
    }
  };

  return (
    <div className={`admin-process-root ${darkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <AdminNavbar />

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <AdminHeader
          title="Process Management"
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        <div className="top-section-btn">
          <Link to="/admin-add-process" className="add-process-btn">
            <span className="material-symbols-outlined">add</span>
            Add New Process
          </Link>
        </div>

        {/* Filter Section */}
        {!loading && !error && (
          <div className="filter-section">
            <div className="filter-container">
              <div className="search-container">
                <span className="material-symbols-outlined search-icon">search</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by process name, client, or hiring type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="status-filter-container">
                <label htmlFor="statusFilter" className="status-filter-label">
                  Status:
                </label>
                <select
                  id="statusFilter"
                  className="status-filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="status-filter-container">
                <label htmlFor="clientFilter" className="status-filter-label">
                  Client:
                </label>
                <select
                  id="clientFilter"
                  className="status-filter-select"
                  value={clientFilter}
                  onChange={(e) => setClientFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  {clientNames.map((clientName, index) => (
                    <option key={index} value={clientName}>
                      {clientName}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="clear-filter-btn"
                onClick={handleClearFilters}
                title="Clear all filters"
              >
                <span className="material-symbols-outlined">close</span>
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="process-content">
          <div className="process-card">
            {!loading && !error && (
              <div className="table-container">
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
                    {paginatedProcesses.length === 0 ? (
                      <tr>
                        <td colSpan={9} style={{ textAlign: "center", padding: "2rem" }}>
                          No processes found
                        </td>
                      </tr>
                    ) : (
                      paginatedProcesses.map((process) => {
                        const isSelectedForActions = selectedProcessId === process.id;

                        return (
                          <React.Fragment key={process.id}>
                            {/* MAIN ROW */}
                            <tr
                              className={isSelectedForActions ? "selected-row" : ""}
                              onClick={() => handleProcessRowClick(process.id)}
                              style={{ cursor: "pointer" }}
                            >
                              <td className="process-name">{process.processName}</td>
                              <td>{process.clientName}</td>
                              <td>{process.hiringType}</td>
                              <td>{process.displayPayout}</td>
                              <td>{process.realPayout}</td>
                              <td>{process.candidateAssigned}</td>
                              <td>{process.salary}</td>
                              <td>
                                <span className={`status-badge ${getStatusClass(process.status)}`}>
                                  {process.status}
                                </span>
                              </td>
                              <td>
                                <div
                                  className="spoc-tooltip"
                                  onMouseEnter={() => setHoveredSpoc(process.id)}
                                  onMouseLeave={() => setHoveredSpoc(null)}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <span className="spoc-count">{process.spocs?.length || 0}</span>
                                  {hoveredSpoc === process.id &&
                                    process.spocs &&
                                    process.spocs.length > 0 && (
                                      <div className="tooltip-content">
                                        {process.spocs.join(", ")}
                                      </div>
                                    )}
                                </div>
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
                      })
                    )}
                  </tbody>

                </table>
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && filteredProcesses.length > 0 && (
              <div className="pagination">
                <span className="pagination-info">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredProcesses.length)} of {filteredProcesses.length} results
                </span>
                <div className="pagination-buttons">
                  <button 
                    className="pagination-btn" 
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  {getPageNumbers().map((page, index) => {
                    if (page === 'ellipsis') {
                      return (
                        <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                      );
                    }
                    return (
                      <button
                        key={page}
                        className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button 
                    className="pagination-btn"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
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
                        Process Name 
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
                        Hiring Type
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
                        Number of Openings 
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
                        Status 
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
                {error && (
                  <div className="error-message">
                    <span className="material-symbols-outlined">error</span>
                    {error}
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
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Process"}
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

              {error && (
                <div className="error-message">
                  <span className="material-symbols-outlined">error</span>
                  {error}
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={handleCloseDeleteModal}
                  className="btn-cancel"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="btn-delete"
                  disabled={loading}
                >
                  {loading ? "Deleting..." : "Delete Process"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

