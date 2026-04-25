import React, { useState, useMemo, useEffect } from "react";
import {Search, Filter, History, CheckCircle, XCircle, FileText, ArrowUpDown, ArrowUp, ArrowDown, Grid3x3, List, AlertCircle,} from "lucide-react";
import "./EmployeePayout.css";
import EmployeeNavbar from "../../components/EmployeeNavbar.jsx";
import EmployeeHeader from "../../components/EmployeeHeader.jsx";
import { useEmployeePayoutStore } from "../../store/EmployeePayoutStore.js";

export default function EmployeePayout() {
  const [currentPayout, setCurrentPayout] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [clientFilter, setClientFilter] = useState("");
  const [processFilter, setProcessFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [toast, setToast] = useState(null);

  // View & Sort states
  const [viewMode, setViewMode] = useState("table");
  const [sortConfig, setSortConfig] = useState({ key: "createdDate", direction: "desc" });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {fetchPayouts, fetchPayoutHistory, fetchProcessNames, fetchClientNames, fetchStatusOptions, payouts, processNames, 
    clientNames, statusOptions, setFilters, payoutHistory, fetchStatusCounts, statusCounts} = useEmployeePayoutStore();

  const empId = sessionStorage.getItem("userId");
  useEffect(() => {
    fetchProcessNames(empId);
    fetchClientNames(empId);
    fetchStatusOptions(empId);
    fetchStatusCounts(empId);
  }, []);
  useEffect(() => {
    applyFiltersToBackend();
  }, [statusFilter, searchQuery, processFilter, clientFilter, fromDate, toDate]);

  const applyFiltersToBackend = () => {
    const filterData = {
      search: searchQuery || undefined,
      process_name: processFilter !== "All" ? processFilter : undefined,
      client_name: clientFilter !== "All" ? clientFilter : undefined,
      status: statusFilter !== "All" ? statusFilter : undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    };
    Object.keys(filterData).forEach(key => filterData[key] === undefined && delete filterData[key]);
    setFilters(filterData);
    fetchPayouts(empId);
  };

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return payouts.slice(startIndex, startIndex + itemsPerPage);
  }, [payouts, currentPage]);

  const totalPages = Math.ceil(payouts.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [totalPages]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp size={14} />
    ) : (
      <ArrowDown size={14} />
    );
  };

  const formatDate = (date) => date.toISOString().split("T")[0];

  const handleQuickDateFilter = (range) => {
    const today = new Date();
    let from = "";
    let to = formatDate(today);
    const fromDate = new Date(today); // clone to avoid mutation
    switch (range) {
      case "today":
        from = to;
        break;

      case "week":
        fromDate.setDate(fromDate.getDate() - 7);
        from = formatDate(fromDate);
        break;

      case "month":
        fromDate.setMonth(fromDate.getMonth() - 1);
        from = formatDate(fromDate);
        break;

      case "quarter":
        fromDate.setMonth(fromDate.getMonth() - 3);
        from = formatDate(fromDate);
        break;

      default:
        from = "";
        to = "";
    }

    setFromDate(from);
    setToDate(to);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setClientFilter("");
    setProcessFilter("All");
    setFromDate("");
    setToDate("");
  };

  const handleViewHistory = (payout) => {
    setCurrentPayout(payout);
    fetchPayoutHistory(payout.candidate_id, empId);
    setShowHistoryModal(true);
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "waiting_period":
      case "pending":
        return "status-pending";
      case "approved":
        return "status-approved";
      case "processing":
        return "status-processing";
      case "completed":
        return "status-completed";
      default:
        return "status-default";
    }
  };

  const getCount = (status) => statusCounts?.[status] ?? 0;

  return (
    <div className="emp-payout-root">
      <EmployeeNavbar />

      {/* Main Content */}
      <main className="emp-payout-main">
        {/* Header */}
        <EmployeeHeader 
          title="My Payouts"
          subtitle="Track your earnings, view payout history, and download slips."
        />

        {/* Content */}
        <div className="emp-payout-content">
          {/* Search & Filter Bar */}
          <div className="search-filter-bar">
            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search by candidate, ID, process, client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button
                  className="search-clear"
                  onClick={() => setSearchQuery("")}
                >
                  <XCircle size={16} />
                </button>
              )}
            </div>
            <button
              className={`filter-toggle ${showFilters ? "active" : ""}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
              Filters
              {(statusFilter !== "All" ||
                clientFilter ||
                fromDate ||
                toDate) && (
                <span className="filter-count">
                  {
                    [
                      statusFilter !== "All",
                      clientFilter,
                      fromDate,
                      toDate,
                    ].filter(Boolean).length
                  }
                </span>
              )}
            </button>
          </div>

          {/* Filters Section */}
          {showFilters && (
            <div className="filters-section">
              <div className="filter-tabs">
                <h4 className="filter-section-title">Advanced Filters</h4>
              </div>

              <div className="filters-grid">
                <div className="filter-group">
                  <label className="filter-label">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option>All</option>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <label className="filter-label">Process</label>
                  <select
                    value={processFilter}
                    onChange={(e) => setProcessFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option>All</option>
                    {processNames.map((process) => (
                      <option key={process} value={process}>
                        {process}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <label className="filter-label">Client</label>
                  <select
                    value={clientFilter}
                    onChange={(e) => setClientFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option>All</option>
                    {clientNames.map((client) => (
                      <option key={client} value={client}>
                        {client}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <label className="filter-label">Quick Date Range</label>
                  <div className="quick-date-btns">
                    <button onClick={() => handleQuickDateFilter("today")}>Today</button>
                    <button onClick={() => handleQuickDateFilter("week")}>Week</button>
                    <button onClick={() => handleQuickDateFilter("month")}>Month</button>
                    <button onClick={() => handleQuickDateFilter("quarter")}>Quarter</button>
                  </div>
                </div>
                <div className="filter-group">
                  <label className="filter-label">From Date</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="filter-input"
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-label">To Date</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="filter-input"
                  />
                </div>
              </div>
              <div className="filters-actions">
                <button className="btn-clear" onClick={handleClearFilters}>
                  Clear Filters
                </button>
              </div>
            </div>
          )}

          {/* Quick Status Filters */}
          <div className="quick-filters">
            <button
              className={`quick-filter-btn ${statusFilter === "All" ? "active" : ""}`}
              onClick={() => setStatusFilter("All")}
            >
              All Payouts
            </button>

            <button
              className={`quick-filter-btn joined ${statusFilter === "joined" ? "active" : ""}`}
              onClick={() => setStatusFilter("joined")}
            >
              Joined ({getCount("joined")})
            </button>

            <button
              className={`quick-filter-btn clawback ${statusFilter === "clawback" ? "active" : ""}`}
              onClick={() => setStatusFilter("clawback")}
            >
              Clawback ({getCount("clawback")})
            </button>

            <button
              className={`quick-filter-btn invoice-clear ${statusFilter === "invoice_clear" ? "active" : ""}`}
              onClick={() => setStatusFilter("invoice_clear")}
            >
              Invoice Clear ({getCount("invoice_clear")})
            </button>

            <button
              className={`quick-filter-btn approved ${statusFilter === "approved" ? "active" : ""}`}
              onClick={() => setStatusFilter("approved")}
            >
              Approved ({getCount("approved")})
            </button>

            <button
              className={`quick-filter-btn completely-joined ${statusFilter === "completely_joined" ? "active" : ""}`}
              onClick={() => setStatusFilter("completely_joined")}
            >
              Completely Joined ({getCount("completely_joined")})
            </button>

            <button
              className={`quick-filter-btn dropout ${statusFilter === "dropout" ? "active" : ""}`}
              onClick={() => setStatusFilter("dropout")}
            >
              Dropout ({getCount("dropout")})
            </button>

            <button
              className={`quick-filter-btn rejected ${statusFilter === "rejected" ? "active" : ""}`}
              onClick={() => setStatusFilter("rejected")}
            >
              Rejected ({getCount("rejected")})
            </button>
          </div>


          {/* Payouts Table */}
          <div className="payouts-table-section">
            <div className="table-header">
              <div className="table-header-left">
                <h3>Payout History</h3>
                <span className="table-info">
                  {payouts.length === 0
                    ? "Showing 0 of 0"
                    : `Showing ${(currentPage - 1) * itemsPerPage + 1} 
                      to ${Math.min(currentPage * itemsPerPage, payouts.length)} 
                      of ${payouts.length}`}
                </span>
              </div>
              <div className="table-header-actions">
                <div className="view-toggle">
                  <button
                    className={`view-btn ${viewMode === "table" ? "active" : ""}`}
                    onClick={() => setViewMode("table")}
                    title="Table View"
                  >
                    <List size={16} />
                  </button>
                  <button
                    className={`view-btn ${viewMode === "card" ? "active" : ""}`}
                    onClick={() => setViewMode("card")}
                    title="Card View"
                  >
                    <Grid3x3 size={16} />
                  </button>
                </div>
              </div>
            </div>

            {viewMode === "table" ? (
              <div className="table-container">
                <table className="payouts-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort("candidateName")} className="sortable">
                        <div className="th-content">
                          Candidate {getSortIcon("candidateName")}
                        </div>
                      </th>
                      <th onClick={() => handleSort("process")} className="sortable">
                        <div className="th-content">
                          Process {getSortIcon("process")}
                        </div>
                      </th>
                      <th onClick={() => handleSort("client")} className="sortable">
                        <div className="th-content">
                          Client {getSortIcon("client")}
                        </div>
                      </th>
                      <th onClick={() => handleSort("joiningDate")} className="sortable">
                        <div className="th-content">
                          Joining Date {getSortIcon("joiningDate")}
                        </div>
                      </th>
                      <th onClick={() => handleSort("status")} className="sortable">
                        <div className="th-content">
                          Status {getSortIcon("status")}
                        </div>
                      </th>
                      <th onClick={() => handleSort("payoutDate")} className="sortable">
                        <div className="th-content">
                          Payout Date {getSortIcon("payoutDate")}
                        </div>
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                <tbody>
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="empty-state">
                        <FileText size={48} />
                        <p>No payouts found</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((payout) => (
                      <tr key={payout.payout_id}>
                        <td>
                          <div className="candidate-cell">
                            <div className="candidate-avatar">
                              {payout.candidate_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                            <div>
                              <p className="candidate-name">
                                {payout.candidate_name}
                              </p>
                              <p className="candidate-id">Candidate ID: {payout.candidate_id}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="process-tag">{payout.process_name}</span>
                        </td>
                        <td>
                          <div>
                            <p className="client-name">{payout.client_name}</p>
                            <p className="approx-revenue">₹({payout.revenue})</p>
                          </div>
                        </td>
                        <td>{new Date(payout.joined_date).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-badge ${getStatusClass(payout.status ?? "waiting_period")}`}>
                            {payout.status ?? "waiting_period"}
                          </span>
                        </td>
                        <td>{new Date(payout.generated_at).toLocaleDateString()}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="card-action-btn history"
                              onClick={() => handleViewHistory(payout)}
                            >
                              <History size={16} />
                              History
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            ) : (
              <div className="card-view-container">
                {paginatedData.length === 0 ? (
                  <div className="empty-state">
                    <FileText size={48} />
                    <p>No payouts found</p>
                  </div>
                ) : (
                  paginatedData.map((payout) => (
                    <div key={payout.payout_id} className="payout-card">
                      <div className="payout-card-header">
                        <div className="candidate-info-card">
                          <div className="candidate-avatar">
                            {payout.candidate_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <h4>{payout.candidate_name}</h4>
                            <p className="card-subtitle">{payout.candidate_id}</p>
                          </div>
                        </div>
                        <span className={`status-badge ${getStatusClass(payout.status ?? "waiting_period")}`}>
                          {payout.status ?? "waiting_period"}
                        </span>
                      </div>
                      <div className="payout-card-body">
                        <div className="card-detail-row">
                          <span className="card-label">Process:</span>
                          <span className="card-value">{payout.process_name}</span>
                        </div>
                        <div className="card-detail-row">
                          <span className="card-label">Client:</span>
                          <span className="card-value">{payout.client_name}</span>
                        </div>
                        <div className="card-detail-row">
                          <span className="card-label">Revenue:</span>
                          <span className="card-value">₹{payout.revenue}</span>
                        </div>
                        <div className="card-detail-row">
                          <span className="card-label">Joining Date:</span>
                          <span className="card-value">
                            {new Date(payout.joined_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="card-detail-row">
                          <span className="card-label">Payout Date:</span>
                          <span className="card-value">
                            {new Date(payout.generated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="payout-card-footer">
                        <button
                          className="card-action-btn history"
                          onClick={() => handleViewHistory(payout)}
                        >
                          <History size={16} />
                          History
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <div className="pagination-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        className={`pagination-btn ${
                          currentPage === page ? "active" : ""
                        }`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* History Modal */}
      {showHistoryModal && currentPayout&& (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header history-header-modal">
              <h3 className="modal-title">
                <History size={20} />
                Payout History
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowHistoryModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="history-header">
                <div>
                  <p>
                    <strong>{currentPayout.candidate_name}</strong> Candidate ID: {currentPayout.candidate_id}
                  </p>
                </div>
              </div>
              <div className="timeline">
                {payoutHistory && payoutHistory.length > 0 ? (
                  payoutHistory.map((item, index) => (
                    <div key={index} className="timeline-item">
                      <div className={`timeline-dot`}></div>

                      <div className="timeline-content">
                        <p className="timeline-date">
                          {new Date(item.changed_at).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>

                        <p className="timeline-status">
                          {item.new_status.toUpperCase()}
                        </p>

                        <p className="timeline-detail">
                          {item.change_reason}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-history">
                    <AlertCircle size={48} />
                    <p>No history available</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === "success" && <CheckCircle size={20} />}
          {toast.type === "error" && <XCircle size={20} />}
          {toast.type === "info" && <History size={20} />}
          <p>{toast.message}</p>
        </div>
      )}
    </div>
  );
}

