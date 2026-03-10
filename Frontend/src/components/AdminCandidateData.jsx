import React, { useEffect, useState } from "react";
import "./AdminCandidateData.css";
import {
  FaFilter,
  FaSearch,
  FaRedo,
  FaTable,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
} from "react-icons/fa";
import { useAdminPayoutStore } from "../store/AdminPayoutStore";
import AdminCandidateHistory from "./AdminCandidateHistory";
import { useAdminCadidateStore } from "../store/AdminCandidateStore";

const AdminCandidateData = ({status}) => {
    const {loading, candidates, fetchCandidatesByStatus, availableEmployees, fetchEmployeesForCandidateFilter, reassignCandidateToEmployee, 
        markAsAvailable, bulkDropCandidate} = useAdminCadidateStore();
    const {candidateHistory, fetchCandidateHistory} = useAdminPayoutStore();
    const [selectedIds, setSelectedIds] = useState([]);
    const [currentCandidate, setCurrentCandidate] = useState(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showReassignModal, setShowReassignModal] = useState(false);
    const [assignToEmployee, setAssignToEmployee] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null); 

    const [filters, setFilters] = useState({
        search: "",
        fromDate: "",
        toDate: "",
        employee: "",
        timesChanged: ""
    });
    useEffect(() => {
        fetchEmployeesForCandidateFilter();
    }, []);

    // const isAllSelected = selectedIds.length === candidatesWithStatus.length;
    const admin_id = sessionStorage.getItem('userId');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(candidates.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentCandidates = candidates.slice(startIndex, endIndex);
    useEffect(() => {
        setCurrentPage(1);
    }, [candidates]);

    const isAllSelected = currentCandidates.length > 0 && selectedIds.length === currentCandidates.length;

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(currentCandidates.map(c => c.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedIds(prev =>
            prev.includes(id)
            ? prev.filter(item => item !== id)
            : [...prev, id]
        );
    };

    const clearSelection = () => {
        setSelectedIds([]);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
        ...prev,
        [name]: value
        }));
    };

    const handleReset = () => {
        setFilters({
        search: "",
        fromDate: "",
        toDate: "",
        reason: "",
        employee: "",
        timesChanged: ""
        });
        fetchCandidatesByStatus({ status });
    };

    const handleApply = () => {
        fetchCandidatesByStatus({
            status,
            search: filters.search,
            fromDate: filters.fromDate,
            toDate: filters.toDate,
            employee: filters.employee,
            timesPassed: filters.timesPassed
        });
    };

    const handleConfirm = () => {
        if (confirmAction === "drop") {
            handleBulkDrop();
        }
        if (confirmAction === "markAvailable") {
            handleMarkAvailale(); 
        }
        setShowConfirmModal(false);
    };

    const handleMarkAvailale = async() => {
        await markAsAvailable({
            candidate_ids: selectedIds,
            employee_id: admin_id,
            reason: "Bulk action"
        });
        await fetchCandidatesByStatus({ status: status });
    };

    const handleBulkReassign = async () => {
        if (!assignToEmployee) return;

        try {
            await reassignCandidateToEmployee({
            candidate_ids: selectedIds,
            employee_id: admin_id,
            assigned_employee: assignToEmployee
            });

            // reset everything
            setShowReassignModal(false);
            setAssignToEmployee(null);
            setSelectedIds([]);

            // refresh table
            fetchCandidatesByStatus({ status });

        } catch (error) {
            console.error(error);
        }
    };

    const handleBulkDrop = async() => {
        await bulkDropCandidate({
            candidate_ids: selectedIds,
            employee_id: admin_id,
            reason: "Bulk action"
        });
        await fetchCandidatesByStatus({ status: status });
    };

    const handleOpenHistory = async (candidate) => {
        const candidateId = candidate.candidate_id;
        if (!candidateId) {
        showToast("error", "No candidate selected");
        return;
        }
        setCurrentCandidate(candidate);
        await fetchCandidateHistory(candidateId);
        setShowHistoryModal(true);
    };

  return (
    <>
        {/* Filters */}
        <div className="card pass-filters-card">
            <h2 className="pass-filters-title">
                <FaFilter /> Filters
            </h2>

            <div className="pass-filters-grid">
                <div className="pass-filter-box">
                    <label className="pass-filter-label">Search</label>
                    <input
                        name="search"
                        value={filters.search}
                        onChange={handleChange}
                        placeholder="Search by Candidate Name, reason"
                    />
                </div>

                <div className="pass-filter-box">
                    <label className="pass-filter-label">From date</label>
                    <input
                        type="date"
                        name="fromDate"
                        value={filters.fromDate}
                        onChange={handleChange}
                    />
                </div>

                <div className="pass-filter-box">
                    <label className="pass-filter-label">To date</label>
                    <input
                        type="date"
                        name="toDate"
                        value={filters.toDate}
                        onChange={handleChange}
                    />
                </div>

                <div className="pass-filter-box">
                    <label className="pass-filter-label">Employee</label>
                    <select
                        name="employee"
                        value={filters.employee}
                        onChange={handleChange}
                    >
                        <option value="">All</option>
                        {availableEmployees.map((e) => (
                            <option key={e.employee_id} value={e.employee_id}>{e.full_name}</option>
                        ))}
                    </select>
                </div>

                <div className="pass-filter-box">
                    <label className="pass-filter-label">Times {status}</label>
                    <select
                        name="timesChanged"
                        value={filters.timesChanged}
                        onChange={handleChange}
                    >
                        <option value="">All</option>
                        <option value="1">1 time</option>
                        <option value="2">2 times</option>
                        <option value="3">3 times</option>
                    </select>
                </div>

                <div className="pass-filter-box">
                    <div className="filter-actions">
                        <button className="btn primary" onClick={handleApply}>
                            <FaSearch /> Apply Filters
                        </button>
                        <button className="btn secondary" onClick={handleReset}>
                            <FaRedo /> Reset Filters
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Bulk Panel */}
        {selectedIds.length > 0 && (
            <div className="bulk-panel">
                <span>
                <strong>{selectedIds.length}</strong> candidate(s) selected
                </span>

                <div className="bulk-actions">
                {status === "dropout" ? (
                    <></>
                ) : (
                    <>
                        <button className="btn-drop" onClick={() => {setConfirmAction("drop"); setShowConfirmModal(true);}}>
                            ⬇ Make as Drop
                        </button>
                    </>
                )}
                <button className="btn-available" onClick={() => {setConfirmAction("markAvailable"); setShowConfirmModal(true);}}>
                    ✔ Make it Available Again
                </button>
                <button className="btn-reassign" onClick={() => setShowReassignModal(true)}>⇄ Re-Assign to Employee</button>
                <button className="btn-clear" onClick={clearSelection}>
                    Clear
                </button>
                </div>
            </div>
        )}

        {/* Table */}
        <div className="card">
            <h2><FaTable /> Candidates List</h2>
            <table>
                <thead>
                <tr>
                    <th><input type="checkbox" checked={isAllSelected} onChange={handleSelectAll}/></th>
                    <th>Candidate ID</th>
                    <th>Name</th>
                    <th>Employee</th>
                    <th>Reason</th>
                    <th>Times {status}</th>
                    <th>Action</th>
                </tr>
                </thead>

                <tbody>
                    {currentCandidates.map(candidate => (
                        <tr key={candidate.candidate_id}>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(candidate.candidate_id)}
                                    onChange={() => handleSelectOne(candidate.candidate_id)}
                                />
                            </td>
                            <td>{candidate.candidate_id}</td>
                            <td>{candidate.candidate_name}</td>
                            <td>{candidate.employee_name}</td>
                            <td>{candidate.change_reason}</td>
                            <td>
                                <span className="badge yellow">
                                    {candidate.times_reached} times
                                </span>
                            </td>
                            <td>
                                <button className="btn small" onClick={() => handleOpenHistory(candidate)}>History</button>
                            </td>
                        </tr>

                    ))}
                </tbody>
            </table>

            <div className="pagination">
                <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                ><FaChevronLeft /></button>
                {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    return (
                        <button
                            key={pageNumber}
                            className={currentPage === pageNumber ? "active" : ""}
                            onClick={() => setCurrentPage(pageNumber)}
                        >{pageNumber}</button>
                    );
                })}
                <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                ><FaChevronRight /></button>
            </div>
        </div>

        {/* History Modal */}
        {showHistoryModal && currentCandidate && (
            <AdminCandidateHistory
            open={showHistoryModal}
            onClose={() => setShowHistoryModal(false)}
            currentPayout={currentCandidate}
            candidateHistory={candidateHistory}
            />
        )}

        {/* Re-assign Modal */}
        {showReassignModal && (
        <div className="reassign-overlay" onClick={() => setShowReassignModal(false)}>
            <div className="reassign-modal" onClick={(e) => e.stopPropagation()}>
                <div className="reassign-header">
                    <h3>
                        <span className="material-symbols-outlined">
                            person_add
                        </span>
                        Bulk Reassign Candidates
                    </h3>
                    <button className="reassign-close" onClick={() => setShowReassignModal(false)}><FaTimes /></button>
                </div>

                <div className="reassign-body">
                    <div className="reassign-info">
                        {selectedIds.length} candidate(s) selected
                    </div>
                    <label>Select Employee</label>
                    <select
                        className="reassign-select"
                        value={assignToEmployee || ""}
                        onChange={(e) => setAssignToEmployee(e.target.value)}
                    >
                    <option value="">Choose employee</option>
                    {availableEmployees.map((emp) => (
                        <option key={emp.employee_id} value={emp.employee_id}>
                        {emp.full_name}
                        </option>
                    ))}
                    </select>
                </div>

                <div className="reassign-footer">
                    <button className="reassign-btn cancel" onClick={() => setShowReassignModal(false)}>
                        Cancel
                    </button>
                    <button className="reassign-btn confirm" disabled={!assignToEmployee} onClick={handleBulkReassign}>
                        Confirm Reassign
                    </button>
                </div>
            </div>
        </div>
        )}

        {/* Confirm Modal */}
        {showConfirmModal && (
        <div className="confirm-overlay" onClick={() => setShowConfirmModal(false)}>
            <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-header">
                <span className="material-symbols-outlined"> warning </span>
                Confirm Action
            </div>
            <div className="confirm-body">
                {confirmAction === "drop" && (
                <p>
                    You are about to <strong>drop {selectedIds.length}</strong> candidate(s).
                    <br />
                    This action cannot be undone.
                </p>
                )}
                {confirmAction === "markAvailable" && (
                <p>
                    You are about to mark
                    <strong>{selectedIds.length}</strong> candidate(s)
                    as available.
                </p>
                )}
            </div>

            <div className="confirm-footer">
                <button className="confirm-btn cancel" onClick={() => setShowConfirmModal(false)}>Cancel</button>
                <button className={`confirm-btn ${confirmAction === "drop" ? "danger" : "primary"}`} onClick={handleConfirm}>Confirm</button>
            </div>
            </div>
        </div>
        )}
    </>
  )
}

export default AdminCandidateData