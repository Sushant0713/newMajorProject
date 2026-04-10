import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./JoiningTracker.css";
import { useAdminJoiningStore } from "../store/AdminJoiningStore.js";
import { useAdminLineUpStore } from "../store/AdminLineUpStore.js";
import { useEmployeeTrackerStore } from "../store/EmployeeTrackerStore.js";
import { BASE_URL } from "../lib/axios.js";

const availableStatuses = [
  { value: "pass", label: "Pass" },
  { value: "ringing", label: "Ringing" },
  { value: "answered", label: "Answered" },
  { value: "not_answered", label: "Not Answered" },
  { value: "busy", label: "Busy" },
  { value: "switch_off", label: "Switch Off" },
  { value: "wrong_number", label: "Wrong Number" },
  { value: "callback_requested", label: "Callback Requested" },
  { value: "no_ring", label: "No Ring" },
  { value: "process_assigned", label: "Process Assigned" },
  { value: "resume_selected", label: "Resume Selected" },
  { value: "interview_scheduled", label: "Interview Scheduled" },
  { value: "selected", label: "Selected" },
  { value: "hold", label: "Hold" },
  { value: "dropout", label: "Dropout" },
  { value: "not_interested", label: "Not Interested" },
];

export default function JoiningTracker ({ role, employee_id }) {
    const isAdmin = role === "admin";
    const location = useLocation();
    const [selectedRow, setSelectedRow] = useState(null);
    const [selectedCandidateId, setSelectedCandidateId] = useState(null); 
    const [currentPage, setCurrentPage] = useState(1);
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [resumeFile, setResumeFile] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        process_id: "",
        assigned_employee: ""
    });
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [actionReason, setActionReason] = useState("");
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [noteText, setNoteText] = useState("");

    const {fetchJoinings, joinings, editJoining, exportJoiningUpCSV } = useAdminJoiningStore();
    const {addResume, addCallLog, addNote, employees, fetchEmployee, allProcessNames, fetchProcessNames, updateCandidateStatus} = useAdminLineUpStore();
    const { fetchJoiningEmployee, joiningsEmployee, fetchProcessesForEmployee, processesEmployee, fetchClientsForEmployee, clientsEmployee} = useEmployeeTrackerStore();

    const processNames = isAdmin ? allProcessNames : processesEmployee;

    useEffect(() => {
        const employeeName = location.state?.employeeName || "";
        if (employeeName) {
            setSearchQuery(employeeName);
        }
        if(isAdmin){
            fetchJoinings({search: employeeName, status: ""});
            fetchProcessNames();
        } else {
            fetchJoiningEmployee(employee_id, {search: employeeName, status: ""});
            fetchProcessesForEmployee(employee_id);
        }
    }, [location.state]);

    const dataSource = role === "admin" ? joinings : joiningsEmployee;
    const itemsPerPage = 10;
    const totalItems = dataSource.length;
    const totalPages = Math.ceil(dataSource.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = dataSource.slice(startIndex, startIndex + itemsPerPage);

    const handleRowClick = (row) => {
    if (selectedCandidateId === row.candidate_id) {
        setSelectedRow(null);
        setSelectedCandidateId(null);
    } else {
        setSelectedRow(row);
        setSelectedCandidateId(row.candidate_id);
    }
    };

    const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
        setSelectedRow(null);
    }
    };

    const handleCall = async(mobile) => {
        await addCallLog({candidate_id: selectedCandidateId, employee_id: admin_id});
        window.location.href = `tel:${mobile}`;
    };

    const handleWhatsApp = (mobile) => {
        const formatted = mobile.replace(/\D/g, "");
        window.open(`https://wa.me/${formatted}`, "_blank");
    };

    const openEditModal = async(row) => {
    await fetchEmployee();
    setSelectedRow(row);
    setEditForm({
        process_id: row.process_id ?? "",
        assigned_employee: ""
    });
    setShowEditModal(true);
    };

    const handleEdit = async(candidate_id, employee_id, process_id, assigned_employee) => {
        await editJoining({
            candidate_id,
            employee_id,
            process_id,
            assigned_employee: assigned_employee || null
        });
        
        if(isAdmin){
            fetchJoinings({});
        } else {
            fetchJoiningEmployee(employee_id, {});
        }
        setShowEditModal(false);
    };

    const handleStatusChange = async () => {
        if (!selectedStatus) return;

        await updateCandidateStatus({
            candidate_id: selectedRow.candidate_id,
            employee_id: employee_id,
            status: selectedStatus,
            reason: actionReason,
        });

        setShowStatusModal(false);
        setSelectedStatus("");
        setActionReason("");

        if (isAdmin) {
            fetchJoinings({});
        } else {
            fetchJoiningEmployee(employee_id, {});
        }
    };

    const applyFilters = () => {
        if(isAdmin){
            fetchJoinings({
                search: searchQuery,
                status: statusFilter
            });
        } else {
            fetchJoiningEmployee(employee_id,{
                search: searchQuery,
                status: statusFilter
            });
        }
    };

    const clearFilters = () => {
        setSearchQuery("");
        setStatusFilter("");
        if(isAdmin){
            fetchJoinings({});
        } else {
            fetchJoiningEmployee(employee_id, {});
        }
    };

    const handleExportCSV = async () => {
        const result = await exportJoiningUpCSV();
        if (result?.success) {
        showToast("success", "CSV exported successfully!");
        }
    };

    // Summary calculations
    const totalJoined = isAdmin ? joinings.filter((d) => d.assignment_status === "joined").length : joiningsEmployee.filter((d) => d.assignment_status === "joined").length;
    const totalPass = isAdmin ? joinings.filter((d) => d.assignment_status === "pass").length : joiningsEmployee.filter((d) => d.assignment_status === "pass").length;
    const totalDropout = isAdmin ? joinings.filter((d) => d.assignment_status === "dropout").length : joiningsEmployee.filter((d) => d.assignment_status === "dropout").length;
    const totalHold = isAdmin ? joinings.filter((d) => d.assignment_status === "hold").length : joiningsEmployee.filter((d) => d.assignment_status === "hold").length;

    return(
        <>
            {/* Content */}
            <div className="tracker-content">
                {/* Export CSV */}
                {isAdmin &&
                    <div className="joining-export-btn">
                        <button className="btn-secondary" onClick={handleExportCSV}>
                        <span className="material-symbols-outlined">download</span>
                        Export CSV
                        </button>
                    </div>
                }

                {/* Summary Cards */}
                <div className="summary-cards">
                    <div className="summary-card">
                        <div className="summary-icon icon-blue">
                        <span className="material-symbols-outlined">groups</span>
                        </div>
                        <div className="summary-info">
                        <p className="summary-label">Total Records</p>
                        <p className="summary-value">{totalItems}</p>
                        </div>
                    </div>
                    <div className="summary-card">
                        <div className="summary-icon icon-green">
                        <span className="material-symbols-outlined">how_to_reg</span>
                        </div>
                        <div className="summary-info">
                        <p className="summary-label">Joined</p>
                        <p className="summary-value">{totalJoined}</p>
                        </div>
                    </div>
                    <div className="summary-card">
                        <div className="summary-icon icon-yellow">
                        <span className="material-symbols-outlined">pending</span>
                        </div>
                        <div className="summary-info">
                        <p className="summary-label">Pass</p>
                        <p className="summary-value">{totalPass}</p>
                        </div>
                    </div>
                    <div className="summary-card">
                        <div className="summary-icon icon-red">
                        <span className="material-symbols-outlined">person_off</span>
                        </div>
                        <div className="summary-info">
                        <p className="summary-label">Hold</p>
                        <p className="summary-value">{totalHold}</p>
                        </div>
                    </div>
                    <div className="summary-card">
                        <div className="summary-icon icon-red">
                        <span className="material-symbols-outlined">person_off</span>
                        </div>
                        <div className="summary-info">
                        <p className="summary-label">Dropout</p>
                        <p className="summary-value">{totalDropout}</p>
                        </div>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="joining-filter-section">
                    <div className="joining-filter-grid">
                        <div className="joining-filter-item">
                            <label className="joining-filter-label">Search</label>
                            <div className="filter-search">
                                <span className="material-symbols-outlined search-icon">search</span>
                                <input
                                type="text"
                                className="filter-input"
                                placeholder="Search candidate, phone, or employee..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="joining-filter-item">
                            <label className="joining-filter-label">Status</label>
                            <select
                                className="filter-select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                <option value="joined">Joined</option>
                                <option value="clawback">Clawback</option>
                                <option value="invoice">Invoice</option>
                                <option value="completely_joined">Completely Joined</option>
                            </select>
                        </div>
                        <div className="joining-filter-item joining-filter-action">
                            <button className="btn-clear" onClick={clearFilters}>
                                clear
                            </button>
                        </div>
                        <div className="joining-filter-item joining-filter-action">
                            <button className="btn-primary" onClick={applyFilters}>
                                Apply
                            </button>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="joining-table-container">
                    <div className="joining-table-wrapper">
                        <table className="joining-table responsive-table">
                            <thead>
                                <tr>
                                <th>Candidate</th>
                                <th>Mobile No</th>
                                <th>Locations</th>
                                <th>Client</th>
                                <th>Process</th>
                                {isAdmin && <th>Employee</th>}
                                <th>Status</th>
                                {isAdmin && <th>Revenue</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="empty-table">
                                        <span className="material-symbols-outlined">search_off</span>
                                        <p>No records found</p>
                                        </td>
                                    </tr>
                                ) : (currentData.map((row) => {
                                    const isSelected = selectedCandidateId === row.candidate_id;

                                    return (
                                        <React.Fragment key={row.candidate_id}>
                                        {/* MAIN ROW */}
                                        <tr
                                            className={isSelected ? "selected-row" : ""}
                                            onClick={() => handleRowClick(row)}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <td>
                                            <div className="joining-cell">
                                                <div className="joining-info">
                                                <p className="joining-name">{row.candidate_name}</p>
                                                <p className="joining-id">Candidate Id: {row.candidate_id}</p>
                                                </div>
                                            </div>
                                            </td>
                                            <td>{row.candidate_phone}</td>
                                            <td>{row.locations}</td>
                                            <td>{row.client_name}</td>
                                            <td>{row.process_name}</td>
                                            {isAdmin && <td>{row.full_name}</td>}
                                            <td>{row.assignment_status}</td>
                                            {isAdmin && <td>₹{Number(row.real_payout_amount || 0).toFixed(2)}</td>}
                                        </tr>

                                        {/* INLINE ACTION BAR */}
                                        {isSelected && (
                                            <tr className="inline-action-row">
                                                <td colSpan={8}>
                                                    <div
                                                    className="action-buttons-bar"
                                                    onClick={(e) => e.stopPropagation()} // IMPORTANT
                                                    >
                                                    <button
                                                        className="action-bar-btn view"
                                                        onClick={() => handleCall(row.candidate_phone)}
                                                    >
                                                        <span className="material-symbols-outlined">call</span>
                                                        Call
                                                    </button>

                                                    <button
                                                        className="action-bar-btn whatsapp"
                                                        onClick={() => handleWhatsApp(row.candidate_phone)}
                                                    >
                                                        <span className="material-symbols-outlined">chat</span>
                                                        WhatsApp
                                                    </button>

                                                    <button
                                                        className="action-bar-btn note"
                                                        onClick={() => setShowNoteModal(true)}
                                                    >
                                                        <span className="material-symbols-outlined">note_add</span>
                                                        Note
                                                    </button>

                                                    {selectedRow.resume_pdf_path? (
                                                        <button
                                                        className="action-bar-btn resume"
                                                        onClick={() =>
                                                            window.open(
                                                            `${BASE_URL}${selectedRow.resume_pdf_path}`,
                                                            "_blank"
                                                            )
                                                        }
                                                        >
                                                        <span className="material-symbols-outlined">description</span>
                                                        View Resume
                                                        </button>
                                                    ) : (
                                                        <button
                                                        className="action-bar-btn resume"
                                                        onClick={() => setShowResumeModal(true)}
                                                        >
                                                        <span className="material-symbols-outlined">upload_file</span>
                                                        Add Resume
                                                        </button>
                                                    )}

                                                    <button
                                                        className="action-bar-btn edit"
                                                        onClick={() => openEditModal(row)}
                                                    >
                                                        <span className="material-symbols-outlined">edit</span>
                                                        Edit
                                                    </button>

                                                    <button
                                                    className="action-bar-btn change-status"
                                                    onClick={() => setShowStatusModal(true)}
                                                    >
                                                        <span className="material-symbols-outlined">swap_horiz</span>
                                                        Change Status
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

                    {/* PAGINATION */}
                    <div className="pagination">
                        <span className="pagination-info">
                        Showing {startIndex + 1}–
                        {Math.min(startIndex + itemsPerPage, totalItems)} of{" "}
                        {totalItems}
                        </span>

                        <div className="pagination-buttons">
                        <button
                            className="pagination-btn"
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                        >
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                            key={i + 1}
                            className={`pagination-btn ${
                                currentPage === i + 1 ? "active" : ""
                            }`}
                            onClick={() => handlePageChange(i + 1)}
                            >
                            {i + 1}
                            </button>
                        ))}

                        <button
                            className="pagination-btn"
                            disabled={currentPage === totalPages}
                            onClick={() => handlePageChange(currentPage + 1)}
                        >
                            <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add resume modal */}
            {showResumeModal && selectedRow && (
            <div className="modal-overlay" onClick={() => setShowResumeModal(false)}>
                <div className="modal-content modal-sm resume-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header resume-header">
                    <h3>
                    <span className="material-symbols-outlined">upload_file</span>
                    Upload Resume
                    </h3>
                    <button className="modal-close" onClick={() => setShowResumeModal(false)}>&times;</button>
                </div>

                <div className="modal-body">
                    <div className="tracker-info">
                    <p>Candidate: <strong>{selectedRow.candidate_name}</strong> </p> 
                    <p className="tracker-candidate-id">
                        ID: {selectedRow.candidate_id}
                    </p>
                    </div>
                    <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResumeFile(e.target.files[0])}
                    />

                    <div className="modal-actions">
                    <button className="btn-cancel" onClick={() => setShowResumeModal(false)}>Cancel</button>
                    <button className="btn-primary" onClick={() => {addResume({ candidate_id: selectedRow.candidate_id, file: resumeFile }); setShowResumeModal(false);}}>
                        Upload
                    </button>
                    </div>
                </div>
                </div>
            </div>
            )}

            {/* Edit modal */}
            {showEditModal && selectedRow && (
            <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                <div
                className="modal-content modal-sm edit-lineup-modal"
                onClick={(e) => e.stopPropagation()}
                >
                <div className="modal-header edit-lineup-header">
                    <h3 className="modal-title">
                    <span className="material-symbols-outlined">edit</span>
                    Edit Line-Up
                    </h3>
                    <button className="modal-close" onClick={() => setShowEditModal(false)}>
                    &times;
                    </button>
                </div>

                <div className="modal-body">
                    <div className="edit-info">
                    <p>
                        Candidate: <strong>{selectedRow.candidate_name}</strong>
                    </p>
                    <p className="edit-candidate-id">
                        ID: {selectedRow.candidate_id}
                    </p>
                    </div>

                    {/* Process */}
                    <div className="form-group">
                    <label className="form-label">Assign Process *</label>
                    <select
                    className="form-input"
                    value={editForm.process_id || ""}
                    onChange={(e) => setEditForm({ ...editForm, process_id: Number(e.target.value) || "" })}
                    >
                    <option value="">Select process</option>

                    {processNames.map((p) => (
                    <option key={p.id} value={p.process_id}>{p.process_name}</option>
                    ))}
                    </select>
                    </div>

                    {/* Employee */}
                    {isAdmin &&
                        <div className="form-group">
                            <label className="form-label">Assign Employee</label>
                            <select
                                className="form-input"
                                value={editForm.assigned_employee}
                                onChange={(e) =>
                                setEditForm({ ...editForm, assigned_employee: e.target.value })
                                }
                            >
                                <option value="">Select employee</option>
                                {console.log(employees)}
                                {employees.map((emp) => (
                                <option key={emp.assigned_employee} value={emp.assigned_employee}>
                                    {emp.full_name}
                                </option>
                                ))}
                            </select>
                        </div>
                    }
                    <div className="modal-actions">
                    <button className="btn-cancel" onClick={() => setShowEditModal(false)}>
                        Cancel
                    </button>

                    <button
                        className="btn-primary"
                        disabled={!editForm.process_id}
                        onClick={() => handleEdit(
                                                selectedRow.candidate_id,
                                                employee_id,
                                                editForm.process_id,
                                                editForm.assigned_employee
                                        )
                        }
                    >
                        <span className="material-symbols-outlined">save</span>
                        Save Changes
                    </button>
                    </div>
                </div>
                </div>
            </div>
            )}

            {/* Note modal */}
            {showNoteModal && selectedRow && (
            <div className="modal-overlay" onClick={() => setShowNoteModal(false)}>
                <div className="modal-content modal-sm note-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header note-header">
                    <h3>
                    <span className="material-symbols-outlined">note_add</span>
                    Add Note
                    </h3>
                    <button className="modal-close" onClick={() => setShowNoteModal(false)}>&times;</button>
                </div>

                <div className="modal-body">
                    <div className="tracker-info">
                    <p>Candidate: <strong>{selectedRow.candidate_name}</strong> </p> 
                    <p className="tracker-candidate-id">
                        ID: {selectedRow.candidate_id}
                    </p>
                    </div>

                    <textarea
                    className="form-textarea"
                    placeholder="Write note..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    />

                    <div className="modal-actions">
                    <button className="btn-cancel" onClick={() => setShowNoteModal(false)}>Cancel</button>
                    <button className="btn-primary" onClick={() => {addNote({ candidate_id: selectedRow.candidate_id, note: noteText }); setShowNoteModal(false);}}>
                        Save Note
                    </button>
                    </div>
                </div>
                </div>
            </div>
            )}

            {/* Change Status modal */}
            {showStatusModal && selectedRow && (
            <div
                className="modal-overlay"
                onClick={() => setShowStatusModal(false)}
            >
                <div
                className="modal-content modal-sm status-modal"
                onClick={(e) => e.stopPropagation()}
                >
                <div className="modal-header status-header">
                    <h3>
                        <span className="material-symbols-outlined">swap_horiz</span>
                        Change Candidate Status
                    </h3>
                    <button
                    className="modal-close"
                    onClick={() => setShowStatusModal(false)}
                    >
                    &times;
                    </button>
                </div>

                <div className="modal-body">
                    <div className="tracker-info">
                    <p>
                        Candidate:{" "}
                        <strong>{selectedRow.candidate_name}</strong>
                    </p>
                    <p className="tracker-candidate-id">
                        ID: {selectedRow.candidate_id}
                    </p>
                    </div>

                    <select
                        className="form-select"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                        <option value="">Select Status</option>

                        {availableStatuses.map((status) => (
                            <option key={status.value} value={status.value}>
                            {status.label}
                            </option>
                        ))}
                    </select>

                    <textarea
                    className="form-textarea"
                    placeholder="Reason for status change"
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    />

                    <div className="modal-actions">
                    <button
                        className="btn-cancel"
                        onClick={() => setShowStatusModal(false)}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleStatusChange}
                    >
                        Confirm
                    </button>
                    </div>
                </div>
                </div>
            </div>
            )}
        </>
    );
}