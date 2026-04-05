import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./AdminPayoutManagement.css";
import { useAdminPayoutStore } from "../../store/AdminPayoutStore";
import AdminNavbar from "../../components/AdminNavbar.jsx";
import AdminHeader from "../../components/AdminHeader.jsx";
import AdminCandidateHistory from "../../components/AdminCandidateHistory.jsx";


export default function AdminPayoutManagement() {
  const navigate = useNavigate();
  const location = useLocation();
    const [selectedRows, setSelectedRows] = useState(new Set());
  const [selectedCandidateId, setSelectedCandidateId] = useState(null); 
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [currentPayout, setCurrentPayout] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [candidateFilter, setCandidateFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [processFilter, setProcessFilter] = useState("All processes");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  // const [fromDate, setFromDate] = useState("");
  // const [toDate, setToDate] = useState("");
  const adminId = sessionStorage.getItem("userId");
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDropoutModal, setShowDropoutModal] = useState(false);
  const [dropoutReason, setDropoutReason] = useState("Fake");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [toast, setToast] = useState(null);
  
  
  // Zustand store
  const {
    payouts, processNames, statusOptions, filters, ids, loading, error, fetchPayouts, fetchProcessNames, fetchStatusOptions, 
    setFilters, clearFilters, batchApprove, markDropout, fetchCandidateHistory, candidateHistory,
    startClawback, markInvoiceClear, markApproved, markCompletelyJoined, exportCSV, generatePayout, rejectPayout,
  } = useAdminPayoutStore();

  const STATUS_FLOW = {
    waiting_period: {
      label: "Generate Payout",
      icon: "payments",
      nextStatus: "joined",
      reason: "Payout generated"
    },
    joined: {
      label: "Start Clawback",
      icon: "undo",
      nextStatus: "clawback",
      reason: "Clawback initiated"
    },
    clawback: {
      label: "Mark Invoice Clear",
      icon: "receipt_long",
      nextStatus: "invoice_clear",
      reason: "Invoice marked as cleared"
    },
    invoice_clear: {
      label: "Mark Approved",
      icon: "check_circle",
      nextStatus: "approved",
      reason: "Invoice approved"
    },
    approved: {
      label: "Complete Join",
      icon: "task_alt",
      nextStatus: "completely_joined",
      reason: "Candidate completely joined"
    }
  };

  const getStatusConfig = (status) => {
    if (status === null) {
      return STATUS_FLOW.waiting_period;
    }

    const key = status.toLowerCase().trim();
    return STATUS_FLOW[key] || STATUS_FLOW.waiting_period;
  };

  useEffect(() => {
    fetchProcessNames();
    fetchStatusOptions();
    fetchPayouts();
  }, []);

  // Apply dark mode
  const applyFiltersToBackend = () => {
    const filter = {
      search: globalSearch || undefined,
      candidate_name: candidateFilter || undefined,
      employee_name: employeeFilter || undefined,
      process: processFilter !== "All processes" ? processFilter : undefined,
      status: statusFilter !== "All statuses" ? statusFilter : undefined,
    };

    // Remove undefined values
    Object.keys(filter).forEach(key => filter[key] === undefined && delete filter[key]);

    setFilters(filter);
    fetchPayouts();
    setCurrentPage(1); // Reset to first page when filters change
  };
  const filteredData = payouts;
  const handleClearFilters = () => {
    setGlobalSearch("");
    setCandidateFilter("");
    setEmployeeFilter("");
    setProcessFilter("All processes");
    setStatusFilter("All statuses");
    // setFromDate("");
    // setToDate("");
    clearFilters();
    fetchPayouts();
    setCurrentPage(1);
  };

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Summary calculations
  const summaryData = useMemo(() => {
    const total = payouts.length;
    
    const normalizeStatus = (status) => (status || "").toLowerCase().trim();
    
    // Count statuses based on actual database values: joined, clawback, invoice_clear, approved, completely_joined, rejected
    const joined = payouts.filter((p) => {
      const status = normalizeStatus(p.payout_status);
      return !status || status === "" || status === "joined" || (!p.payout_status);
    }).length;
    
    const clawback = payouts.filter((p) => {
      const status = normalizeStatus(p.payout_status);
      return status === "clawback";
    }).length;
    
    const invoiceClear = payouts.filter((p) => {
      const status = normalizeStatus(p.payout_status);
      return status === "invoice_clear";
    }).length;
    
    const approved = payouts.filter((p) => {
      const status = normalizeStatus(p.payout_status);
      return status === "approved" || status === "completely_joined";
    }).length;
    
    const active = total - approved;
    const inProgress = joined + clawback + invoiceClear;
    
    return [
      { label: "Total Payouts", value: total.toString(), icon: "paid", color: "blue" },
      { label: "Active Payouts", value: active.toString(), icon: "autorenew", color: "indigo" },
      { label: "In Progress", value: inProgress.toString(), icon: "pending", color: "yellow" },
      { label: "Approved / Completed", value: approved.toString(), icon: "task_alt", color: "green" },
    ];
  }, [payouts]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // Select all functionality
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(new Set(paginatedData.map((p) => p.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (id) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const handleCandidateRowClick = (payout) => {
    const candidateId = payout.candidateId || payout.candidate_id;
    if (selectedCandidateId === candidateId) {
      setSelectedCandidateId(null);
      setSelectedPayout(null); 
    } else {
      setSelectedCandidateId(candidateId);
      setSelectedPayout(payout); 
    }
  };

  const handleExportCSV = async () => {
    const result = await exportCSV();
    if (result?.success) {
      showToast("success", "CSV exported successfully!");
    }
  };
  
  const handleBatchApprove = async () => {
    if (!adminId) {
      showToast("error", "Admin ID not found");
      return;
    }
    let candidateIds = null;
    if (selectedRows.size > 0) {
      const selectedPayouts = payouts.filter((p) => selectedRows.has(p.candidate_id));
      candidateIds = selectedPayouts
        .map((p) => p.candidateId || p.candidate_id)
        .filter(Boolean);
      
      if (candidateIds.length === 0) {
        showToast("error", "No valid candidate IDs found for selected payouts");
        return;
      }
    }
    
    const result = await batchApprove( candidateIds, adminId );
    
    if (result?.success) {
      await fetchPayouts();
      setSelectedRows(new Set());
      if (result.failed > 0) {
        showToast("error", `${result.approved} approved, ${result.failed} failed`);
      } else {
        showToast("success", result.message || "Batch approval completed");
      }
    }
  };

  const handleOpenHistory = async (payout) => {
    const candidateId = selectedCandidateId || payout?.candidateId || payout?.candidate_id;
    if (!candidateId) {
      showToast("error", "No candidate selected");
      return;
    }
    setCurrentPayout(payout);
    await fetchCandidateHistory(candidateId);
    setShowHistoryModal(true);
  };

  const handleConfirmDropout = async () => {
    if (!dropoutReason) {
      showToast("error", "Please select a reason for dropout");
      return;
    }

    // Use selectedCandidateId if available, otherwise fallback to selectedPayout
    const candidateId = selectedCandidateId || selectedPayout?.candidateId || selectedPayout?.candidate_id;
    
    if (!candidateId) {
      showToast("error", "No candidate selected");
      return;
    }

    const result = await markDropout(candidateId, dropoutReason);

    if (result?.success) {
      await fetchPayouts();
      setShowDropoutModal(false);
      setDropoutReason("Fake");
      setSelectedPayout(null);
      setSelectedCandidateId(null); // Clear selection after action
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectReason) {
      showToast("Please write a reason");
      return;
    }

    // Use selectedCandidateId if available, otherwise fallback to selectedPayout
    const candidateId = selectedCandidateId || selectedPayout?.candidateId || selectedPayout?.candidate_id;
    
    if (!candidateId) {
      showToast("No candidate selected");
      return;
    }

    const result = await rejectPayout(candidateId, rejectReason, adminId);

    if (result?.success) {
      await fetchPayouts();
      setShowRejectModal(false);
      setRejectReason("Fake");
      setSelectedPayout(null);
      setSelectedCandidateId(null); // Clear selection after action
    }
  }

  const handleConfirmStatusChange = async () => {
    const candidateId = selectedCandidateId || selectedPayout?.candidateId || selectedPayout?.candidate_id;
    if (!candidateId || !selectedPayout) {
      showToast("error", "No candidate selected");
      return;
    }
    const rawStatus =  selectedPayout.status ?? selectedPayout.payout_status ?? "";

    const currentStatus = rawStatus.toLowerCase().trim();
    let result;

    switch (currentStatus) {
      case "":
        case "rejected":
      case "waiting_period":
        result = await generatePayout(candidateId);
        break;

      case "joined":
        result = await startClawback(candidateId);
        break;

      case "clawback":
        result = await markInvoiceClear(candidateId);
        break;

      case "invoice_clear":
        result = await markApproved(adminId, candidateId);
        break;

      case "approved":
        result = await markCompletelyJoined(candidateId);
        break;

      default:
        showToast("error", `Invalid status transition from ${currentStatus}`);
        return;
    }

    if (result?.success) {
      await fetchPayouts();
      setShowConfirmModal(false);
      setSelectedPayout(null);
      setSelectedCandidateId(null); 
    }
  };

  const getStatusClass = (status) => {
    const normalizedStatus = (status || "waiting_period").toLowerCase().trim();
    switch (normalizedStatus) {
      case "joined":
        return "status-joined";
      case "approved":
        return "status-approved";
      case "clawback":
        return "status-clawback";
      case "invoice_clear":
        return "status-invoice-clear";
      case "completely_joined":
        return "status-completed";
      case "rejected":
        return "status-rejected";
      case "cancelled":
        return "status-cancelled";
      case "waiting_period":
        return "status-waiting_period";
      default:
        return "status-default";
    }
  };

  return (
    <div className={`admin-payout-root`}>
      {/* Sidebar */}
      <AdminNavbar />

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <AdminHeader
          title="Payout Management"
          
        />

        {/* Content */}
        <div className="payout-content">
          <div className="header-actions-right">
            <button className="btn-secondary" onClick={handleExportCSV}>
              <span className="material-symbols-outlined">download</span>
              Export CSV
            </button>
            <button className="btn-success" onClick={handleBatchApprove}>
              <span className="material-symbols-outlined">check</span>
              Batch Approve
            </button>
          </div>
          {/* Summary Cards */}
          <div className="summary-cards">
            {summaryData.map((card, index) => (
              <div key={index} className="summary-card">
                <div className={`summary-icon icon-${card.color}`}>
                  <span className="material-symbols-outlined">{card.icon}</span>
                </div>
                <div className="summary-info">
                  <p className="summary-label">{card.label}</p>
                  <p className="summary-value">{card.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filters Section - Collapsible */}
          <div className="filters-section">
            <details open={showFilters} onToggle={(e) => setShowFilters(e.target.open)}>
              <summary className="filters-summary">
                <span className="material-symbols-outlined filters-arrow">expand_more</span>
                <span className="filters-title">Filters</span>
              </summary>
              <div className="filters-content">
                <div className="filters-grid">
                  {/* Top Row */}
                  <div className="filter-group">
                    <label className="filter-label">Search</label>
                    <input
                      type="text"
                      placeholder="Search candidate, employee, process..."
                      value={globalSearch}
                      onChange={(e) => setGlobalSearch(e.target.value)}
                      className="filter-input"
                    />
                  </div>
                  <div className="filter-group">
                    <label className="filter-label">Candidate</label>
                    <input
                      type="text"
                      placeholder="Candidate name"
                      value={candidateFilter}
                      onChange={(e) => setCandidateFilter(e.target.value)}
                      className="filter-input"
                    />
                  </div>
                  <div className="filter-group">
                    <label className="filter-label">Employee</label>
                    <input
                      type="text"
                      placeholder="Employee name"
                      value={employeeFilter}
                      onChange={(e) => setEmployeeFilter(e.target.value)}
                      className="filter-input"
                    />
                  </div>
                  
                  {/* Bottom Row */}
                  <div className="filter-group">
                    <label className="filter-label">Process</label>
                    <select
                      value={processFilter}
                      onChange={(e) => setProcessFilter(e.target.value)}
                      className="filter-select"
                    >
                      <option>All processes</option>
                      {processNames.map((process) => (
                        <option key={process} value={process}>
                          {process}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="filter-group">
                    <label className="filter-label">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="filter-select"
                    >
                      <option>All statuses</option>
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* <div className="filter-group">
                    <label className="filter-label">From Date</label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="filter-input date-input"
                      placeholder="dd-mm-yyyy"
                    />
                  </div>
                  <div className="filter-group">
                    <label className="filter-label">To Date</label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="filter-input date-input"
                      placeholder="dd-mm-yyyy"
                    />
                  </div> */}
                </div>
                <div className="filters-actions">
                  <button className="btn-clear" onClick={handleClearFilters}>
                    <span className="material-symbols-outlined">filter_alt_off</span>
                    Clear Filters
                  </button>
                  <button className="btn-apply" onClick={applyFiltersToBackend}>
                    Apply Filters
                  </button>
                </div>
              </div>
            </details>
          </div>

          {/* Results Info */}
          {(globalSearch || candidateFilter || employeeFilter || processFilter !== "All processes" || statusFilter !== "All statuses") && (
            <div className="results-info">
              <span className="material-symbols-outlined">info</span>
              Showing <strong>{payouts.length}</strong> payout{payouts.length !== 1 ? 's' : ''}
              {globalSearch && <span className="filter-tag">Search: "{globalSearch}"</span>}
              {statusFilter !== "All statuses" && <span className="filter-tag">Status: {statusFilter}</span>}
              {processFilter !== "All processes" && <span className="filter-tag">Process: {processFilter}</span>}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="loading-state">
              <span className="material-symbols-outlined">hourglass_empty</span>
              <p>Loading payouts...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="error-state">
              <span className="material-symbols-outlined">error</span>
              <p>{error}</p>
            </div>
          )}


          {/* Data Table or Empty State */}
          {!loading && !error && (
            paginatedData.length === 0 ? (
              <div className="empty-state-container">
                <div className="empty-state-content">
                  <div className="empty-state-icon">
                    <span className="material-symbols-outlined">inbox</span>
                  </div>
                  <h3 className="empty-state-title">No payouts found</h3>
                </div>
              </div>
            ) : (
              <div className="table-section">
                <div className="table-header">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                    <span>Select all ({selectedRows.size} selected)</span>
                  </label>
                  <span className="table-info">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, payouts.length)} of {payouts.length} entries
                  </span>
                </div>

                <div className="table-container">
                  <table className="payout-table">
                    <thead>
                      <tr>
                        <th style={{ width: "40px" }}></th>
                        <th>Candidate</th>
                        <th>Process</th>
                        <th>Employee</th>
                        {/* <th>Amount (%)</th>
                        <th>Shown Payout</th> */}
                        <th>Payout</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((payout) => {
                        const candidateId = payout.candidate_id;
                        const isSelectedForActions = selectedCandidateId === candidateId;

                        const payoutStatus = payout.payout_status || "waiting_period";
                        const normalizedStatus = payoutStatus;
                        const config = getStatusConfig(payoutStatus);
                        const showStatusButton = normalizedStatus !== "completely_joined";

                        return (
                          <React.Fragment key={candidateId}>
                            {/* MAIN ROW */}
                            <tr
                              className={`${selectedRows.has(candidateId) ? "selected" : ""} ${isSelectedForActions ? "row-selected-for-actions" : ""}`}
                              onClick={() => handleCandidateRowClick(payout)}
                              style={{ cursor: "pointer" }}
                            >
                              <td onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={selectedRows.has(payout.candidate_id)}
                                  onChange={() => handleSelectRow(payout.candidate_id)}
                                />
                              </td>

                              <td>
                                <div className="candidate-info">
                                  <div className="candidate-avatar">{payout.candidate_name?.slice(0, 2).toUpperCase()}</div>
                                  <div>
                                    <p className="candidate-name">{payout.candidate_name}</p>
                                    <p className="candidate-details">
                                      {payout.candidate_email} <br /> ID:{candidateId}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td><span className="process-tag">{payout.process_name}</span></td>

                              <td>
                                <p className="employee-name">{payout.employee_name}</p>
                              </td>
                              <td className="payout-value real">₹{Number(payout.real_payout_amount || 0).toFixed(2)}</td>

                              <td>
                                <span className={`status-badge ${getStatusClass(payoutStatus)}`}>
                                  {payoutStatus}
                                </span>
                              </td>
                            </tr>

                            {/* ACTION BAR ROW (appears just below selected row) */}
                            {isSelectedForActions && (
                              <tr className="inline-action-row">
                                <td colSpan={6}>
                                  <div className="inline-actions-bar">
                                    <div className="action-buttons-bar">
                                      <button
                                        className="action-bar-btn history"
                                        onClick={() => handleOpenHistory(payout)}
                                      >
                                        <span className="material-symbols-outlined">history</span>
                                        History
                                      </button>

                                      <button
                                        className="action-bar-btn dropout"
                                        onClick={() => {
                                          setSelectedPayout(payout);
                                          setShowDropoutModal(true);
                                        }}
                                      >
                                        <span className="material-symbols-outlined">person_off</span>
                                        Mark Dropout
                                      </button>

                                      {showStatusButton && (
                                        <button
                                          className="action-bar-btn status-change"
                                          onClick={() => {
                                            setSelectedPayout(payout);
                                            setShowConfirmModal(true);
                                          }}
                                        >
                                          <span className="material-symbols-outlined">{config.icon}</span>
                                          {config.label}
                                        </button>
                                      )}

                                      {payout.payout_status && (
                                        <button
                                          className="action-bar-btn dropout"
                                          onClick={() => {
                                            setSelectedPayout(payout);
                                            setShowRejectModal(true);
                                          }}
                                        >
                                          <span className="material-symbols-outlined">person_off</span>
                                          Reject
                                        </button>
                                      )}
                                    </div>
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

                {/* Pagination */}
                <div className="pagination">
                  <span className="pagination-info">
                    Page {currentPage} of {totalPages || 1}
                  </span>
                  <div className="pagination-buttons">
                    <button
                      className="pagination-btn"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <span className="material-symbols-outlined">chevron_left</span>
                      Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        className={`pagination-btn ${currentPage === page ? "active" : ""}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      className="pagination-btn"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages || totalPages === 0}
                    >
                      Next
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          )}

        </div>
      </main>


      {/* History Modal */}
      {showHistoryModal && currentPayout && (
        <AdminCandidateHistory
          open={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          currentPayout={currentPayout}
          candidateHistory={candidateHistory}
        />
      )}

      {showDropoutModal && selectedPayout && (
        <div
          className="modal-overlay"
          onClick={() => {setShowDropoutModal(false)}}
        >
          <div
            className="modal-content modal-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header dropout-header">
              <h3 className="modal-title">
                <span className="material-symbols-outlined">person_off</span>
                Mark Dropout
              </h3>
              <button
                className="modal-close"
                onClick={() => {setShowDropoutModal(false)}}
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
              <div className="dropout-info">
                <p>Marking as dropout:</p>
                <strong>{selectedPayout.candidate_name}</strong>
                <p className="dropout-candidate-id">
                  ID: {selectedPayout.candidate_id}
                </p>
              </div>

              <label className="form-label">Select Reason *</label>
              <div className="dropout-options">
                {["Fake", "Not Joined", "Resigned", "Terminated"].map((reason) => (
                  <label
                    key={reason}
                    className={`dropout-option ${
                      dropoutReason === reason ? "selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="dropout"
                      value={reason}
                      checked={dropoutReason === reason}
                      onChange={(e) => setDropoutReason(e.target.value)}
                    />
                    {reason}
                  </label>
                ))}
              </div>

              <div className="modal-actions">
                <button
                  className="btn-cancel"
                  onClick={() => {setShowDropoutModal(false)}}
                  disabled={loading}
                >
                  Cancel
                </button>

                <button
                  className="btn-danger"
                  onClick={handleConfirmDropout}
                  disabled={loading}
                >
                  <span className="material-symbols-outlined">person_off</span>
                  {loading ? "Processing..." : "Mark Dropout"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && selectedPayout && (
        <div
          className="modal-overlay"
          onClick={() => {setShowRejectModal(false)}}
        >
          <div
            className="modal-content modal-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header dropout-header">
              <h3 className="modal-title">
                <span className="material-symbols-outlined">person_off</span>
                Reject
              </h3>
              <button
                className="modal-close"
                onClick={() => {setShowRejectModal(false)}}
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
              <div className="dropout-info">
                <p>Marking as rejected:</p>
                <strong>{selectedPayout.candidate_name}</strong>
                <p className="dropout-candidate-id">
                  ID: {selectedPayout.candidate_id}
                </p>
              </div>

              <label className="form-label">Reason *</label>
                <textarea
                  className="form-textarea"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />

              <div className="modal-actions">
                <button
                  className="btn-cancel"
                  onClick={() => {setShowRejectModal(false)}}
                  disabled={loading}
                >
                  Cancel
                </button>

                <button
                  className="btn-danger"
                  onClick={handleConfirmReject}
                  disabled={loading}
                >
                  <span className="material-symbols-outlined">person_off</span>
                  {loading ? "Processing..." : "Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Status Change Modal */}
      {showConfirmModal && selectedPayout && (() => {
        const currentStatus = selectedPayout.status || selectedPayout.payout_status || "waiting_period";
        const config = getStatusConfig(currentStatus);
        return (
          <div className="modal-overlay" onClick={() => {
            setShowConfirmModal(false);
          }}>
            <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  <span className="material-symbols-outlined">{config.icon}</span>
                  Confirm Status Change
                </h3>
                <button
                  className="modal-close"
                  onClick={() => {
                    setShowConfirmModal(false);
                  }}
                >
                  &times;
                </button>
              </div>

              <div className="modal-body">
                <p>
                  Candidate <strong>{selectedPayout.candidate_name}</strong>'s status will
                  change from <strong>{currentStatus}</strong> to{" "}
                  <strong>{config.nextStatus}</strong>.
                </p>
                <div className="modal-actions">
                  <button
                    className="btn-cancel"
                    onClick={() => {
                      setShowConfirmModal(false);
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </button>

                  <button
                    className="btn-orange"
                    onClick={handleConfirmStatusChange}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Confirm"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <span className="material-symbols-outlined">
            {toast.type === "success" ? "check_circle" : toast.type === "error" ? "error" : "info"}
          </span>
          <p>{toast.message}</p>
        </div>
      )}
    </div>
  );
}
