import React, { useState, useEffect } from "react";
import "./AdminTeam.css";
import AdminNavbar from "../../components/AdminNavbar";
import AdminHeader from "../../components/AdminHeader";
import { useAdminTeamStore } from "../../store/AdminTeamStore";
import toast from "react-hot-toast";

export default function AdminTeam() {
  const {
    teams,
    revenue,
    teamMembers,
    employees,
    loading,
    error,
    getTeams,
    getTeamMembers,
    getAllEmployees,
    addTeam,
    getTeamDetails,
    updateTeam,
    deleteTeam,
  } = useAdminTeamStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
    
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewMembersModal, setShowViewMembersModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form states
  const [teamForm, setTeamForm] = useState({
    team_name: "",
    team_type: "",
    destination: "",
    leader_id: "",
    members: [],
  });

  // Fetch data on component mount
  useEffect(() => {
    getTeams({});
    getAllEmployees();
  }, [getTeams, getAllEmployees]);

  // Apply dark mode
  // Handle team row click
  const handleTeamClick = (team) => {
    setSelectedTeam(team);
  };

  // Open Add Modal
  const openAddModal = () => {
    setTeamForm({
      team_name: "",
      team_type: "",
      destination: "",
      leader_id: "",
      members: [],
    });
    setMemberSearchQuery("");
    setShowAddModal(true);
  };

  // Open Edit Modal
  const openEditModal = async () => {
    if (!selectedTeam) {
      toast.error("Please select a team first");
      return;
    }
    await getTeamDetails(selectedTeam.id);
    const details = useAdminTeamStore.getState().teamDetails;
    await getTeamMembers(selectedTeam.id);
    const members = useAdminTeamStore.getState().teamMembers;
    
    setTeamForm({
      team_name: details?.team_name || "",
      team_type: details?.team_type || "",
      destination: details?.destination || "",
      leader_id: details?.leader_id || "",
      members: members.map((m) => ({ member_id: m.employee_id || m.id || "" })).filter(m => m.member_id),
    });
    setMemberSearchQuery("");
    setShowEditModal(true);
  };

  // Open View Members Modal
  const openViewMembersModal = async () => {
    if (!selectedTeam) {
      toast.error("Please select a team first");
      return;
    }
    try {
      await getTeamMembers(selectedTeam.id, fromDate, toDate);
      setShowViewMembersModal(true);
    } catch (error) {
      toast.error("Failed to load team members");
    }
  };

  // Open Delete Modal
  const openDeleteModal = () => {
    if (!selectedTeam) {
      toast.error("Please select a team first");
      return;
    }
    setShowDeleteModal(true);
  };

  // Handle member checkbox change
  const handleMemberChange = (employeeId) => {
    setTeamForm((prev) => {
      const memberIndex = prev.members.findIndex((m) => m.member_id === employeeId);
      if (memberIndex >= 0) {
        return {
          ...prev,
          members: prev.members.filter((m) => m.member_id !== employeeId),
        };
      } else {
        return {
          ...prev,
          members: [...prev.members, { member_id: employeeId }],
        };
      }
    });
  };

  // Handle Add Team
  const handleAddTeam = async (e) => {
    e.preventDefault();
    useAdminTeamStore.getState().setError(null);
    await addTeam(teamForm);
    await getTeams({});
    setShowAddModal(false);
    setTeamForm({
      team_name: "",
      team_type: "",
      destination: "",
      leader_id: "",
      members: [],
    });
  };

  // Handle Update Team
  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    useAdminTeamStore.getState().setError(null);
    await updateTeam(selectedTeam.id, teamForm);
    await getTeams({});
    setShowEditModal(false);
    setSelectedTeam(null);
  };

  // Handle Delete Team
  const handleDeleteTeam = async () => {
    useAdminTeamStore.getState().setError(null);
    await deleteTeam(selectedTeam.id);
    await getTeams({});
    setShowDeleteModal(false);
    setSelectedTeam(null);
  };

  // Pagination calculations
  const totalPages = Math.ceil(teams.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTeams = teams.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const tableContainer = document.querySelector('.table-container');
    if (tableContainer) {
      tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "Not set";
    }
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

  // Helper function to get avatar color class based on designation
  const getAvatarColorClass = (designation) => {
    if (!designation) return "avatar-indigo";
    const des = designation.toLowerCase();
    if (des.includes("team_leader") || des.includes("team leader")) return "avatar-green";
    if (des.includes("manager")) return "avatar-purple";
    if (des.includes("freelancer")) return "avatar-pink";
    if (des.includes("salaryemp") || des.includes("salary_emp")) return "avatar-blue";
    if (des.includes("core")) return "avatar-orange";
    return "avatar-indigo";
  };

  // Helper function to get team type badge class
  const getTeamTypeClass = (teamType) => {
    if (!teamType) return "designation-indigo";
    const type = teamType.toLowerCase();
    if (type === "salaryemp" || type === "salary_emp") return "designation-orange";
    if (type === "employee") return "designation-indigo";
    if (type === "freelancer") return "designation-pink";
    return "designation-indigo";
  };

  const applyFiltersToBackend = () => {
    const filterData = {
      search: searchQuery || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      type: typeFilter !== "All Types" ? typeFilter : undefined,
    };
    getTeams(filterData);
    getAllEmployees();
  };

  // Filter employees for member selection
  const filteredEmployeesForSelection = employees.filter((emp) => {
    const searchLower = memberSearchQuery.toLowerCase();
    return (
      emp.full_name?.toLowerCase().includes(searchLower) ||
      emp.designation?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className={`admin-employee-root`}>
      {/* Sidebar */}
      <AdminNavbar />

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <AdminHeader
          title="Team Management"
          
        />

        {/* Content */}
        <div className="employee-content">

          <div className="top-section-btn">
            <button className="add-employee-btn" onClick={openAddModal}>
              <span className="material-symbols-outlined">add</span>
              Add New Team
            </button>
          </div>

          {/* Revenue cards */}
          <div className="revenue-grid">
            <div className="revenue-card green">
                <h3>Total Display Revenue</h3>
                <p>₹{Number(revenue.total_revenue).toFixed(2)}</p>
            </div>
            <div className="revenue-card blue">
                <h3>Total Actual Revenue</h3>
                <p>₹{Number(revenue.total_actual_revenue).toFixed(2)}</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="filters-bar">
            <div className="filter-grid ">
              <div className="filter-unit">
                <label className="filter-label">Search</label>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="filter-unit">
                <label className="filter-label">From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="filter-input date-input"
                  placeholder="dd-mm-yyyy"
                />
              </div>
              <div className="filter-unit">
                <label className="filter-label">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="filter-input date-input"
                  placeholder="dd-mm-yyyy"
                />
              </div>
              <div className="filter-unit">
                <label className="filter-label">Type</label>
                <select
                  className="filter-select"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option>All Types</option>
                  <option>salaryemp</option>
                  <option>employee</option>
                  <option>freelancer</option>
                </select>
              </div>
            </div>
            <div className="filter-action">
              <button className="apply-btn" onClick={applyFiltersToBackend}>
                Apply
              </button>
              <button className="clear-btn" onClick={() => { setSearchQuery(""); setFromDate(""); setToDate(""); setTypeFilter("All Types"); getTeams({}); }}>
                Clear
              </button>
            </div>
          </div>

          {/* Teams Table */}
          <div className="table-container">
            {loading && (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
                Loading teams...
              </div>
            )}
            {error && (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--danger-color)" }}>
                Error: {error}
              </div>
            )}
            {!loading && !error && (
              <div style={{ overflowY: "auto", flex: 1 }}>
                <table className="employee-table">
                  <thead>
                    <tr>
                      <th>TEAM NAME</th>
                      <th>TYPE</th>
                      <th>DESTINATION</th>
                      <th>LEADER</th>
                      <th>DISPLAY REVENUE</th>
                      <th>ACTUAL REVENUE</th>
                      <th>MEMBERS</th>
                      <th>CREATED AT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTeams.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
                          No teams found
                        </td>
                      </tr>
                    ) : (
                      paginatedTeams.map((team) => {
                        const isSelectedForActions = selectedTeam?.id === team.id;

                        return (
                          <React.Fragment key={team.id}>
                            <tr
                              className={isSelectedForActions ? 'selected-row' : ''}
                              onClick={() => handleTeamClick(team)}
                              style={{ cursor: 'pointer' }}
                            >
                              <td>
                                <div className="employee-cell">
                                  <div className="employee-info">
                                    <p className="employee-name">{team.team_name || "N/A"}</p>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className={`designation-badge ${getTeamTypeClass(team.team_type)}`}>
                                  {team.team_type || "N/A"}
                                </span>
                              </td>
                              <td className="salary-cell">{team.destination || "N/A"}</td>
                              <td>
                                <span className="contact-email">{team.leader_name || "Not assigned"}</span>
                              </td>
                              <td>{team.total_revenue || 0}</td>
                              <td>{team.total_actual_revenue || 0}</td>
                              <td>
                                <span className="status-badge">
                                  {team.member_count || 0} members
                                </span>
                              </td>
                              <td className="date-cell">{formatDate(team.created_at)}</td>
                            </tr>

                            {/* INLINE ACTION BAR ROW */}
                            {isSelectedForActions && (
                              <tr className="inline-action-row">
                                <td colSpan={8}>
                                  <div className="action-buttons-bar">
                                    <button
                                      className="action-bar-btn view"
                                      onClick={() => openViewMembersModal(team)}
                                      title="View Members"
                                    >
                                      <span className="material-symbols-outlined">people</span>
                                      View Members
                                    </button>
                                    <button
                                      className="action-bar-btn edit"
                                      onClick={() => openEditModal(team)}
                                      title="Edit Team"
                                    >
                                      <span className="material-symbols-outlined">edit</span>
                                      Edit
                                    </button>
                                    <button
                                      className="action-bar-btn delete"
                                      onClick={() => openDeleteModal(team)}
                                      title="Delete Team"
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
          </div>

          {/* Pagination Controls */}
          {!loading && !error && teams.length > 0 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {startIndex + 1} to {Math.min(endIndex, teams.length)} of {teams.length} teams
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

      {/* Add Team Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}>
          <div className="pip-modal" style={{ maxWidth: "600px" }}>
            <div className="modal-header">
              <h3>Add New Team</h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddTeam} className="modal-body">
              <div className="form-group">
                <label htmlFor="team_name">
                  Team Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="team_name"
                  required
                  value={teamForm.team_name}
                  onChange={(e) => setTeamForm({ ...teamForm, team_name: e.target.value })}
                  placeholder="Enter team name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="team_type">
                  Team Type <span className="required">*</span>
                </label>
                <select
                  id="team_type"
                  required
                  value={teamForm.team_type}
                  onChange={(e) => setTeamForm({ ...teamForm, team_type: e.target.value })}
                >
                  <option value="">Select team type</option>
                  <option value="salaryemp">salaryemp</option>
                  <option value="employee">employee</option>
                  <option value="freelancer">freelancer</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="destination">
                  Destination <span className="required">*</span>
                </label>
                <select
                  id="destination"
                  required
                  value={teamForm.destination}
                  onChange={(e) => setTeamForm({ ...teamForm, destination: e.target.value })}
                >
                  <option value="">Select Designation</option>
                  <option value="core">core</option>
                  <option value="team_leader">team_leader</option>
                  <option value="manager">manager</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="leader_id">
                  Team Leader <span className="required">*</span>
                </label>
                <select
                  id="leader_id"
                  required
                  value={teamForm.leader_id}
                  onChange={(e) => setTeamForm({ ...teamForm, leader_id: e.target.value })}
                >
                  <option value="">Select team leader</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name} - {emp.designation}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Team Members</label>
                <div className="member-selection-container">
                  <div className="member-search-wrapper">
                    <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "var(--text-secondary)" }}>search</span>
                    <input
                      type="text"
                      className="member-search-input"
                      placeholder="Search employees..."
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="member-list-container">
                    {filteredEmployeesForSelection.length === 0 ? (
                      <div className="no-members-message">
                        <span className="material-symbols-outlined" style={{ fontSize: "32px", color: "var(--text-secondary)", marginBottom: "8px" }}>person_off</span>
                        <p>No employees found</p>
                      </div>
                    ) : (
                      filteredEmployeesForSelection.map((emp) => {
                        const isSelected = teamForm.members.some((m) => m.member_id === emp.id);
                        return (
                          <div
                            key={emp.id}
                            className={`member-item ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleMemberChange(emp.id)}
                          >
                            <div className={`member-avatar ${getAvatarColorClass(emp.designation)}`}>
                              {getInitials(emp.full_name)}
                            </div>
                            <div className="member-info">
                              <span className="member-name">{emp.full_name?.toUpperCase() || "N/A"}</span>
                              <span className="member-designation">{emp.designation?.toUpperCase() || "N/A"}</span>
                            </div>
                            <div className="member-checkbox-wrapper">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleMemberChange(emp.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  {teamForm.members.length > 0 && (
                    <div className="selected-count">
                      {teamForm.members.length} member{teamForm.members.length !== 1 ? 's' : ''} selected
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" style={{ backgroundColor: "var(--primary-color)", boxShadow: "0 2px 4px rgba(25, 118, 210, 0.3)" }}>
                  Add Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowEditModal(false)}>
          <div className="pip-modal" style={{ maxWidth: "600px" }}>
            <div className="modal-header">
              <h3>Edit Team</h3>
              <button className="modal-close-btn" onClick={() => setShowEditModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleUpdateTeam} className="modal-body">
              <div className="employee-info-box">
                <span className="label">Team:</span>
                <span className="value">{selectedTeam?.team_name}</span>
              </div>

              <div className="form-group">
                <label htmlFor="edit_team_name">
                  Team Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="edit_team_name"
                  required
                  value={teamForm.team_name}
                  onChange={(e) => setTeamForm({ ...teamForm, team_name: e.target.value })}
                  placeholder="Enter team name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit_team_type">
                  Team Type <span className="required">*</span>
                </label>
                <select
                  id="edit_team_type"
                  required
                  value={teamForm.team_type}
                  onChange={(e) => setTeamForm({ ...teamForm, team_type: e.target.value })}
                >
                  <option value="">Select team type</option>
                  <option value="salaryemp">salaryemp</option>
                  <option value="employee">employee</option>
                  <option value="freelancer">freelancer</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edit_destination">
                  Destination <span className="required">*</span>
                </label>
                <select
                  id="edit_destination"
                  required
                  value={teamForm.destination}
                  onChange={(e) => setTeamForm({ ...teamForm, destination: e.target.value })}
                >
                  <option value="">Select Designation</option>
                  <option value="core">core</option>
                  <option value="team_leader">team_leader</option>
                  <option value="manager">manager</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edit_leader_id">
                  Team Leader <span className="required">*</span>
                </label>
                <select
                  id="edit_leader_id"
                  required
                  value={teamForm.leader_id}
                  onChange={(e) => setTeamForm({ ...teamForm, leader_id: e.target.value })}
                >
                  <option value="">Select team leader</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name} - {emp.designation}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Team Members</label>
                <div className="member-selection-container">
                  <div className="member-search-wrapper">
                    <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "var(--text-secondary)" }}>search</span>
                    <input
                      type="text"
                      className="member-search-input"
                      placeholder="Search employees..."
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="member-list-container">
                    {filteredEmployeesForSelection.length === 0 ? (
                      <div className="no-members-message">
                        <span className="material-symbols-outlined" style={{ fontSize: "32px", color: "var(--text-secondary)", marginBottom: "8px" }}>person_off</span>
                        <p>No employees found</p>
                      </div>
                    ) : (
                      filteredEmployeesForSelection.map((emp) => {
                        const isSelected = teamForm.members.some((m) => m.member_id === emp.id);
                        return (
                          <div
                            key={emp.id}
                            className={`member-item ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleMemberChange(emp.id)}
                          >
                            <div className={`member-avatar ${getAvatarColorClass(emp.designation)}`}>
                              {getInitials(emp.full_name)}
                            </div>
                            <div className="member-info">
                              <span className="member-name">{emp.full_name?.toUpperCase() || "N/A"}</span>
                              <span className="member-designation">{emp.designation?.toUpperCase() || "N/A"}</span>
                            </div>
                            <div className="member-checkbox-wrapper">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleMemberChange(emp.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  {teamForm.members.length > 0 && (
                    <div className="selected-count">
                      {teamForm.members.length} member{teamForm.members.length !== 1 ? 's' : ''} selected
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" style={{ backgroundColor: "var(--success-color)", boxShadow: "0 2px 4px rgba(16, 185, 129, 0.3)" }}>
                  Update Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Members Modal */}
      {showViewMembersModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowViewMembersModal(false)}>
          <div className="confirmation-modal" style={{ maxWidth: "600px" }}>
            <div className="modal-header">
              <h3>Team Members - {selectedTeam?.team_name}</h3>
              <button className="modal-close-btn" onClick={() => setShowViewMembersModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="modal-body">
              {loading ? (
                <div style={{ padding: "20px", textAlign: "center", color: "var(--text-secondary)" }}>
                  Loading members...
                </div>
              ) : teamMembers.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", color: "var(--text-secondary)" }}>
                  No members found
                </div>
              ) : (
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                        <th style={{ textAlign: "left", padding: "12px", fontSize: "0.75rem", fontWeight: "600", color: "var(--text-secondary)" }}>NAME</th>
                        <th style={{ textAlign: "left", padding: "12px", fontSize: "0.75rem", fontWeight: "600", color: "var(--text-secondary)" }}>DESIGNATION</th>
                        <th style={{ textAlign: "left", padding: "12px", fontSize: "0.75rem", fontWeight: "600", color: "var(--text-secondary)" }}>DISPLAY REVENUE</th>
                        <th style={{ textAlign: "left", padding: "12px", fontSize: "0.75rem", fontWeight: "600", color: "var(--text-secondary)" }}>ACTUAL REVENUE</th>
                        <th style={{ textAlign: "left", padding: "12px", fontSize: "0.75rem", fontWeight: "600", color: "var(--text-secondary)" }}>JOINED AT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamMembers.map((member, index) => (
                        <tr key={index} style={{ borderBottom: "1px solid var(--border-color)" }}>
                          <td style={{ padding: "12px", fontSize: "0.875rem", color: "var(--text-primary)" }}>{member.full_name}</td>
                          <td style={{ padding: "12px", fontSize: "0.875rem", color: "var(--text-secondary)" }}>{member.designation}</td>
                          <td style={{ padding: "12px", fontSize: "0.875rem", color: "var(--text-secondary)" }}>{member.revenue || 0}</td>
                          <td style={{ padding: "12px", fontSize: "0.875rem", color: "var(--text-secondary)" }}>{member.actual_revenue || 0}</td>
                          <td style={{ padding: "12px", fontSize: "0.875rem", color: "var(--text-secondary)" }}>{formatDate(member.joined_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="modal-actions" style={{ marginTop: "20px" }}>
                <button type="button" className="cancel-btn" onClick={() => setShowViewMembersModal(false)} style={{ width: "100%" }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Team Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowDeleteModal(false)}>
          <div className="confirmation-modal">
            <div className="modal-header">
              <div className="delete-modal-header">
                <div className="delete-icon-wrapper">
                  <span className="material-symbols-outlined delete-icon">delete</span>
                </div>
                <h3>Delete Team</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setShowDeleteModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="confirmation-content">
                <p className="confirmation-text">
                  Are you sure you want to delete team <strong>"{selectedTeam?.team_name}"</strong>?
                </p>
                <p className="confirmation-warning-text">
                  This action cannot be undone. All team data will be permanently deleted.
                </p>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button type="button" className="submit-btn delete-btn-modal" onClick={handleDeleteTeam}>
                  Delete Team
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

