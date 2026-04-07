import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./AdminLopManagement.css";
import adminLopStore from "../../store/AdminLopStore";
import AdminNavbar from "../../components/AdminNavbar.jsx";
import AdminHeader from "../../components/AdminHeader";


export default function AdminLopManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAddModal, setShowAddModal] = useState(false);
  //
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteRow, setDeleteRow] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());

  const {
    records,
    employees,
    stats,
    loading,
    error,
    fetchLops,
    fetchSalaryEmployees,
    addLop,
    deleteLop,
    clearFilters
  } = adminLopStore();

  useEffect(() => {
    fetchSalaryEmployees();
    fetchLops();
  }, []);

  // Apply dark mode
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Form states
  const [formEmployee, setFormEmployee] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formReason, setFormReason] = useState("");
  const [formError, setFormError] = useState(null);

  const filteredData = useMemo(() => {
    return records.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        [
          item.employee_name,
          item.employee_id,
          item.lop_reason,
          item.email,
        ]
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesEmployee =
        !employeeFilter || String(item.employee_id) === String(employeeFilter);

      const itemDate = new Date(item.lop_date);
      const matchesFromDate =
        !fromDate || itemDate >= new Date(fromDate);
      const matchesToDate =
        !toDate || itemDate <= new Date(toDate);

      return (
        matchesSearch &&
        matchesEmployee &&
        matchesFromDate &&
        matchesToDate
      );
    });
  }, [records, searchQuery, employeeFilter, fromDate, toDate]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setEmployeeFilter("");
    setFromDate("");
    setToDate("");
    clearFilters();
    fetchLops();
  };

  useEffect(() => {
    fetchLops();
  }, []);

  const handleAddRecord = async () => {
    if (!formEmployee || !formDate || !formAmount) {
      setFormError("All fields are required");
      return;
    }

    const success = await addLop({
      employee_id: formEmployee,
      lop_date: formDate,
      lop_amount: formAmount,
      lop_reason: formReason
    });
    setShowAddModal(false);
    setFormEmployee("");
    setFormDate("");
    setFormAmount("");
    setFormReason("");
    setFormError(null);
  };


  const toggleSelectRow = (id) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const toggleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(new Set(filteredData.map((d) => d.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  // Summary calculations
  const totalEmployees = employees.length;
  const totalRecords = stats.total_records;
  const thisMonthCount = stats.this_month_count;
  const totalAmount = stats.total_amount.toFixed(2);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, employeeFilter, fromDate, toDate]);
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  return (
    <div className={`admin-lop-root`}>
      {/* Sidebar */}
      <AdminNavbar />

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <AdminHeader
          title="LOP Management"

        />

        {/* Content */}
        <div className="lop-content">
          <div className="header-actions-right">
            <button className="btn-primary" onClick={() => setShowAddModal(true)}>
              <span className="material-symbols-outlined">add</span>
              Add New LOP Record
            </button>
          </div>
          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-icon icon-blue">
                <span className="material-symbols-outlined">badge</span>
              </div>
              <div className="summary-info">
                <p className="summary-label">Salary Employees</p>
                <p className="summary-value">{totalEmployees}</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon icon-indigo">
                <span className="material-symbols-outlined">assignment_ind</span>
              </div>
              <div className="summary-info">
                <p className="summary-label">Total LOP Records</p>
                <p className="summary-value">{totalRecords}</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon icon-green">
                <span className="material-symbols-outlined">calendar_today</span>
              </div>
              <div className="summary-info">
                <p className="summary-label">This Month</p>
                <p className="summary-value">{thisMonthCount} records</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon icon-yellow">
                <span className="material-symbols-outlined">paid</span>
              </div>
              <div className="summary-info">
                <p className="summary-label">Total Amount</p>
                <p className="summary-value">₹{totalAmount}</p>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          <div className="filter-panel">
            <div className="filter-row filter-row--top">
              <div className="filter-field filter-field--search">
                <label className="filter-label">Search</label>
                <div className="filter-search">
                  <span className="material-symbols-outlined filter-search__icon">search</span>
                  <input
                    type="text"
                    placeholder="Search by name, ID, reason, email ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="filter-input filter-input--search"
                  />
                  {searchQuery && (
                    <button
                      className="filter-search__clear"
                      onClick={() => setSearchQuery("")}
                      title="Clear search"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  )}
                </div>
              </div>
              <div className="filter-field">
                <label className="filter-label">Employee</label>
                <select
                  value={employeeFilter}
                  onChange={(e) => setEmployeeFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Employees</option>
                  {Array.isArray(employees) &&
                    employees.map(emp => (
                      <option key={emp.employee_id} value={emp.employee_id}>
                        {emp.full_name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="filter-row filter-row--dates">
              <div className="filter-field">
                <label className="filter-label">From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                  }}
                  className="filter-input"
                />
              </div>
              <div className="filter-field">
                <label className="filter-label">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                  }}
                  className="filter-input"
                />
              </div>
            </div>
            <div className="filter-row filter-row--actions">
              <button className="filter-clear-btn" onClick={handleClearFilters}>
                <span className="material-symbols-outlined">filter_alt_off</span>
                Clear All
              </button>
            </div>
            {(searchQuery || employeeFilter || fromDate || toDate) && (
              <div className="filter-results">
                <span className="material-symbols-outlined">info</span>
                Showing <strong>{filteredData.length}</strong> of{" "}
                <strong>{records.length}</strong> records
                {searchQuery && (
                  <span className="filter-chip">Search: "{searchQuery}"</span>
                )}
                {employeeFilter && (
                  <span className="filter-chip">
                    Employee: {employees.find(e => e.employee_id === employeeFilter)?.full_name || employeeFilter}
                  </span>
                )}
                {fromDate && <span className="filter-chip">From: {fromDate}</span>}
                {toDate && <span className="filter-chip">To: {toDate}</span>}
              </div>
            )}
          </div>

          {/* Data Table */}
          <div className="table-section">
            <div className="table-container">
              <table className="lop-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Employee ID</th>
                    <th>LOP Date</th>
                    <th>Amount</th>
                    <th>Reason</th>
                    <th>Created On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <div className="employee-cell">
                          <p className="employee-name">{row.employee_name}</p>
                          <p className="employee-email">{row.email}</p>
                        </div>
                      </td>
                      <td>{row.employee_id}</td>
                      <td>{new Date(row.lop_date).toLocaleDateString("en-GB")}</td>
                      <td>₹{row.lop_amount}</td>
                      <td>{row.lop_reason}</td>
                      <td>{new Date(row.created_at).toLocaleDateString("en-GB")}</td>
                      <td>
                        <button
                          className="action-btn delete"
                          onClick={() => {
                            setDeleteRow(row);
                            setShowDeleteModal(true);
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
              <span className="pagination-info">
                Showing{" "}
                {(currentPage - 1) * recordsPerPage + 1}–
                {Math.min(currentPage * recordsPerPage, filteredData.length)} of{" "}
                {filteredData.length} records
              </span>
              <div className="pagination-buttons">
                <button
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >Prev</button>
                <span className="pagination-page">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <button
                  className="pagination-btn"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >Next</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add New LOP Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add New LOP Record</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              {formError && <div className="form-error">{formError}</div>}
              <div className="form-group">
                <label className="form-label">Employee</label>
                <select
                  value={formEmployee}
                  onChange={(e) => setFormEmployee(e.target.value)}
                  className="form-input"
                >
                  <option value="">Select Employee</option>
                  {Array.isArray(employees) &&
                    employees.map(emp => (
                      <option key={emp.employee_id} value={emp.employee_id}>
                        {emp.full_name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">LOP Date</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">LOP Amount (₹)</label>
                  <input
                    type="text"
                    placeholder="e.g. 333.00"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Reason</label>
                <textarea
                  placeholder="Enter reason for LOP"
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  className="form-textarea"
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button className="btn-submit" onClick={handleAddRecord}>
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteRow && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header delete-header">
              <h3 className="modal-title">
                <span className="material-symbols-outlined">warning</span>
                Confirm Delete
              </h3>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="delete-info">
                <p>Are you sure you want to delete this LOP record?</p>
              </div>
              <div className="modal-actions">
                <button
                  className="btn-cancel"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteRow(null);
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  className="btn-danger"
                  onClick={async () => {
                    await deleteLop(deleteRow.id);
                    setShowDeleteModal(false);
                    setDeleteRow(null);
                  }}
                  disabled={loading}
                >
                  <span className="material-symbols-outlined">delete</span>
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

