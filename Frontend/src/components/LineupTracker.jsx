import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./LineupTracker.css";
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

export default function LineupTracker({ role, employee_id }) {
    const isAdmin = role === "admin";
    const location = useLocation();
    const [selectedRow, setSelectedRow] = useState(null);
    const [selectedCandidateId, setSelectedCandidateId] = useState(null); 
    const [currentPage, setCurrentPage] = useState(1);
    const [showAddToTrackerModal, setShowAddToTrackerModal] = useState(false);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        process_id: "",
        assigned_employee: ""
    });
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [noteText, setNoteText] = useState("");
    const [resumeFile, setResumeFile] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [processFilter, setProcessFilter] = useState("");
    const [clientFilter, setClientFilter] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [showAddCandidateModal, setShowAddCandidateModal] = useState(false);
    const [candidateForm, setCandidateForm] = useState({
        name: "",
        email: "",
        gender: null,
        phone: "",
        address: "",
        experience_level: "",
        resume: null,
    });
    const [trackerForm, setTrackerForm] = useState({
        process_id: "",
        resume: null,
    });
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [actionReason, setActionReason] = useState("");

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

    const {lineups, fetchLineUps, addToTracker, addNote, addResume, loading, allProcessNames, allClientNames, fetchProcessNames, fetchClientNames,
        editLineUp, addCallLog, employees, fetchEmployee, addCandidate, updateCandidateStatus, exportLineUpCSV } = useAdminLineUpStore();
    const { lineupsEmployee, fetchLineUpsEmployee, fetchProcessesForEmployee, processesEmployee, fetchClientsForEmployee, clientsEmployee } = useEmployeeTrackerStore();
    const processNames = isAdmin ? allProcessNames : processesEmployee;
    const clientNames = isAdmin ? allClientNames : clientsEmployee;
    useEffect(() => {
        const employeeName = location.state?.employeeName || "";
        if (employeeName) {
            setSearchQuery(employeeName);
        }
        if(isAdmin) {
            fetchLineUps({search: employeeName, status: ""});
            fetchProcessNames();
            fetchClientNames();
        } else {
            fetchLineUpsEmployee(employee_id, {});
            fetchProcessesForEmployee(employee_id);
            fetchClientsForEmployee(employee_id);
        }
    }, []);

    const dataSource = role === "admin" ? lineups : lineupsEmployee;
    const itemsPerPage = 10;
    const totalItems = dataSource.length;
    const totalPages = Math.ceil(dataSource.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = dataSource.slice(startIndex, startIndex + itemsPerPage);

    const handleCall = async(mobile) => {
        await addCallLog({candidate_id: selectedCandidateId, employee_id: employee_id});
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
        await editLineUp({
            candidate_id,
            employee_id,
            process_id,
            assigned_employee: assigned_employee || null
        });
        
        if(isAdmin) {
            fetchLineUps({});
        } else {
            fetchLineUpsEmployee(employee_id, {});
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
            fetchLineUps({});
        } else {
            fetchLineUpsEmployee(employee_id, {});
        }
    };

    const openAddToTrackerModal = (row) => {
        setSelectedRow(row);
        setTrackerForm({
            process_id: "",
            resume: null,
        });
        setShowAddToTrackerModal(true);
    };

    const handleAddToTracker = async() =>{
        await addToTracker({
            candidate_id: selectedRow.candidate_id,
            employee_id: employee_id,
            process_id: trackerForm.process_id,
            resume: trackerForm.resume,
        });
        if(isAdmin) {
            fetchLineUps({});
        } else {
            fetchLineUpsEmployee(employee_id, {});
        }
        setShowAddToTrackerModal(false);
        setTrackerForm({
            process_id: "",
            resume: null,
        });
    };

    const handleAddCandidate = async () => {
        console.log(candidateForm);
        await addCandidate({name: candidateForm.name, email:candidateForm.email, gender: candidateForm.gender || null, phone: candidateForm.phone,
            address: candidateForm.address, experience_level: candidateForm.experience_level, employee_id: employee_id, 
            resume: candidateForm.resume});
        if(isAdmin) {
            fetchLineUps({});
        } else {
            fetchLineUpsEmployee(employee_id, {});
        }
        setShowAddCandidateModal(false);
        setCandidateForm({
        name: "",
        email: "",
        gender: null,
        phone: "",
        address: "",
        experience_level: "",
        resume: null,
        });
    };

    const applyFilters = () => {
        if(isAdmin) {
            fetchLineUps({
                search: searchQuery,
                processName: processFilter,
                clientName: clientFilter,
                startDate,
                endDate,
                status: statusFilter
            });
        } else {
            fetchLineUpsEmployee(employee_id,{
                search: searchQuery,
                processName: processFilter,
                clientName: clientFilter,
                startDate,
                endDate,
                status: statusFilter
            });
        }
    };

    const clearFilters = () => {
        setSearchQuery("");
        setProcessFilter("");
        setClientFilter("");
        setStartDate("");
        setEndDate("");
        setStatusFilter("");
        if(isAdmin) {
            fetchLineUps({});
        } else {
            fetchLineUpsEmployee(employee_id, {});
        }
    };

    const date = (created_date) => {
    return new Date(created_date).toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
    });
    };

    const handleExportCSV = async () => {
        const result = await exportLineUpCSV();
        if (result?.success) {
        showToast("success", "CSV exported successfully!");
        }
    };

    return (
    <>
        <div className="line-up-content">
            <div className="add-candidate-btn">
            {isAdmin &&
            <>
                <button className="btn-secondary" onClick={handleExportCSV}>
                <span className="material-symbols-outlined">download</span>
                Export CSV
                </button>
            </>}
            <button className="btn-primary" onClick={() => setShowAddCandidateModal(true)}>
                <span className="material-symbols-outlined">add</span>
                Add New Candidate 
            </button>
            </div>

            <div className="line-up-card">
                {/* Filter section */}
                <div className="lineup-filter-section">
                    <div className="lineup-filter-grid">
                    {/* Row 1 */}
                    <div className="lineup-filter-row-one">
                        <div className="lineup-filter-item ">
                        <label className="lineup-filter-label">Search</label>
                        <div className="filter-search">
                            <span className="material-symbols-outlined search-icon">search</span>
                            <input
                            type="text"
                            className="filter-input"
                            placeholder="Search candidate name, candidate ID, phone or employee name"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        </div>

                        <div className="lineup-filter-item">
                        <label className="lineup-filter-label">Prcesses</label>
                        <select
                            className="filter-select"
                            value={processFilter}
                            onChange={(e) => setProcessFilter(e.target.value)}
                        >
                            <option value="">All Processes</option>
                            {processNames.map((p) => (
                            <option key={p.id} value={p.process_name}>{p.process_name}</option>
                            ))}
                        </select>
                        </div>

                        <div className="lineup-filter-item">
                        <label className="lineup-filter-label">Client</label>
                        <select
                            className="filter-select"
                            value={clientFilter}
                            onChange={(e) => setClientFilter(e.target.value)}
                        >
                            <option value="">All Clients</option>
                            {clientNames.map((c) => (
                            <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        </div>
                    </div>
                    
                    {/* Row 2 */}
                    <div className="lineup-filter-row-two">
                        <div className="lineup-filter-item">
                            <label className="lineup-filter-label">From</label>
                            <input
                                type="date"
                                className="filter-date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>

                        <div className="lineup-filter-item">
                            <label className="lineup-filter-label">To</label>
                            <input
                                type="date"
                                className="filter-date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>

                        <div className="lineup-filter-item">
                            <label className="lineup-filter-label">Status</label>
                            <select
                                className="filter-select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                <option value="">Select Status</option>
                                {availableStatuses.map((status) => (
                                    <option key={status.value} value={status.value}>
                                    {status.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="lineup-filter-item filter-action">
                        <button className="btn-close" onClick={clearFilters}>
                            clear
                        </button>
                        </div>

                        <div className="lineup-filter-item filter-action">
                        <button className="btn-primary" onClick={applyFilters}>
                            Apply
                        </button>
                        </div>
                    </div>
                    </div>
                </div>

                {/* Table */}
                <div className="line-up-table-container">
                    <table className="line-up-table responsive-table">
                    <thead>
                        <tr>
                        <th>Name</th>
                        <th>Mobile No</th>
                        {isAdmin && <th>Employee</th>}
                        <th>Client</th>
                        <th>Process</th>
                        <th>Status</th>
                        <th>Created at</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((row) => {
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
                                <div className="line-up-cell">
                                    <div className="line-up-info">
                                    <p className="line-up-name">{row.candidate_name}</p>
                                    <p className="line-up-id">Candidate Id: {row.candidate_id}</p>
                                    </div>
                                </div>
                                </td>
                                <td>{row.candidate_phone}</td>
                                {isAdmin && <td>{row.full_name}</td>}
                                <td>{row.client_name}</td>
                                <td>{row.process_name}</td>
                                <td>{row.latest_status}</td>
                                <td>{date(row.created_at)}</td>
                            </tr>

                            {/* INLINE ACTION BAR */}
                            {isSelected && (
                                <tr className="inline-action-row">
                                <td colSpan={7}>
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
                                        className="action-bar-btn success"
                                        onClick={() => openAddToTrackerModal(row)}
                                    >
                                        <span className="material-symbols-outlined">playlist_add</span>
                                        Add to Tracker
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
                        })}
                    </tbody>
                    </table>
                </div>

                {/* Pagination */}
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

        {/* Add to tracker */}
        {showAddToTrackerModal && selectedRow && (
        <div
            className="modal-overlay"
            onClick={() => setShowAddToTrackerModal(false)}
        >
            <div
            className="modal-content modal-sm tracker-modal"
            onClick={(e) => e.stopPropagation()}
            >
            <div className="modal-header tracker-header">
                <h3 className="modal-title">
                <span className="material-symbols-outlined">playlist_add</span>
                Add Candidate to Tracker
                </h3>
                <button
                className="modal-close"
                onClick={() => setShowAddToTrackerModal(false)}
                >
                &times;
                </button>
            </div>

            <div className="modal-body">
                <div className="tracker-info">
                <p>
                    Candidate: <strong>{selectedRow.candidate_name}</strong>
                </p>
                <p>ID: {selectedRow.candidate_id}</p>
                </div>

                {/* PROCESS SELECT */}
                <div className="form-group">
                <label className="form-label">
                    Select Process <span className="required">*</span>
                </label>
                <select
                    className="form-input"
                    value={trackerForm.process_id}
                    onChange={(e) =>
                    setTrackerForm({
                        ...trackerForm,
                        process_id: e.target.value,
                    })
                    }
                >
                    <option value="">Select process</option>
                    {processNames.map((p) => (
                    <option key={p.id} value={p.process_id}>
                        {p.process_name}
                    </option>
                    ))}
                </select>
                </div>

                {/* RESUME UPLOAD */}
                <div className="form-group">
                <label className="form-label">Upload Resume (optional)</label>
                <input
                    type="file"
                    className="form-input"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) =>
                    setTrackerForm({
                        ...trackerForm,
                        resume: e.target.files[0],
                    })
                    }
                />
                </div>

                <div className="modal-actions">
                <button
                    className="btn-cancel"
                    onClick={() => setShowAddToTrackerModal(false)}
                >
                    Cancel
                </button>

                <button
                    className="btn-success"
                    disabled={!trackerForm.process_id || loading}
                    onClick={handleAddToTracker}
                >
                    <span className="material-symbols-outlined">playlist_add</span>
                    {loading ? "Processing..." : "Confirm"}
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

        {/* Add Candidate modal */}
        {showAddCandidateModal && (
        <div
            className="modal-overlay"
            onClick={() => setShowAddCandidateModal(false)}
        >
            <div
            className="modal-content modal-sm"
            onClick={(e) => e.stopPropagation()}
            >
            <div className="modal-header">
                <h3 className="modal-title">
                <span className="material-symbols-outlined">person_add</span>
                Add Candidate
                </h3>
                <button
                className="modal-close"
                onClick={() => setShowAddCandidateModal(false)}
                >
                &times;
                </button>
            </div>

            <div className="modal-body">
                {/* Name */}
                <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                    type="text"
                    className="form-input"
                    value={candidateForm.name}
                    onChange={(e) =>
                    setCandidateForm({ ...candidateForm, name: e.target.value })
                    }
                />
                </div>

                {/* Email */}
                <div className="form-group">
                <label className="form-label">Email</label>
                <input
                    type="email"
                    className="form-input"
                    value={candidateForm.email}
                    onChange={(e) =>
                    setCandidateForm({ ...candidateForm, email: e.target.value })
                    }
                />
                </div>

                {/* Gender */}
                <div className="form-group">
                <label className="form-label">Gender </label>
                <select
                    className="form-input"
                    value={candidateForm.gender}
                    onChange={(e) =>
                    setCandidateForm({ ...candidateForm, gender: e.target.value })
                    }
                >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>
                </div>

                {/* Phone */}
                <div className="form-group">
                <label className="form-label">Phone *</label>
                <input
                    type="tel"
                    className="form-input"
                    value={candidateForm.phone}
                    onChange={(e) =>
                    setCandidateForm({ ...candidateForm, phone: e.target.value })
                    }
                />
                </div>

                {/* Address */}
                <div className="form-group">
                <label className="form-label">Address</label>
                <textarea
                    className="form-textarea"
                    rows="3"
                    value={candidateForm.address}
                    onChange={(e) =>
                    setCandidateForm({ ...candidateForm, address: e.target.value })
                    }
                />
                </div>

                {/* Candidate Status */}
                <div className="form-group">
                <label className="form-label">Experience Level </label>
                <select
                    className="form-input"
                    value={candidateForm.experience_level}
                    onChange={(e) =>
                    setCandidateForm({
                        ...candidateForm,
                        experience_level: e.target.value,
                    })
                    }
                >
                    <option value="">Select Experience Level</option>
                    <option value="fresher">Fresher</option>
                    <option value="experienced">Experienced</option>
                </select>
                </div>

                {/* Resume */}
                <div className="form-group">
                <label className="form-label">Resume (PDF / DOC / DOCX)</label>
                <input
                    type="file"
                    className="form-input"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) =>
                    setCandidateForm({
                        ...candidateForm,
                        resume: e.target.files[0],
                    })
                    }
                />
                </div>

                {/* Actions */}
                <div className="modal-actions">
                <button
                    className="btn-cancel"
                    onClick={() => setShowAddCandidateModal(false)}
                    disabled={loading}
                >
                    Cancel
                </button>

                <button
                    className="btn-primary"
                    onClick={handleAddCandidate}
                    >
                    <span className="material-symbols-outlined">save</span>
                    {loading ? "Saving..." : "Add Candidate"}
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