import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./AdminMeetings.css";
import { Video } from "lucide-react";
import { useAdminMeetingStore } from "../../store/AdminMeetingStore.js";
import AdminNavbar from "../../components/AdminNavbar.jsx";
import AdminHeader from "../../components/AdminHeader";

export default function AdminMeetings() {
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingMeetingId, setDeletingMeetingId] = useState(null);
  const [deletingMeetingName, setDeletingMeetingName] = useState("");
  const [editingMeetingId, setEditingMeetingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [durationFilter, setDurationFilter] = useState("All durations");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const meetingsPerPage = 10;

  // Form state
  const [formData, setFormData] = useState({
    meetingName: "",
    description: "",
    date: "",
    time: "",
    durationMinutes: "30",
    googleMeetLink: "",
    members: [],
    status: "Scheduled",
  });

  const adminName = sessionStorage.getItem("username");

  const { meetings, members, selectedMeeting, loading, error, fetchAllMeetings, fetchMeetingById, addMeeting, updateMeeting, 
        deleteMeeting, fetchMembers, getEmployeeNamesByIds } = useAdminMeetingStore();
  
  const [employeeNamesMap, setEmployeeNamesMap] = useState({});

  useEffect(() => {
    fetchAllMeetings();
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply dark mode
  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  // Fetch employee names when meetings are loaded
  useEffect(() => {
    const fetchEmployeeNames = async () => {
      if (!meetings || meetings.length === 0) return;

      // Collect all unique employee IDs from all meetings
      const allEmployeeIds = new Set();
      meetings.forEach((meeting) => {
        const parsed = parseMembers(meeting.members);
        parsed.forEach((id) => {
          if (id && id.trim()) {
            allEmployeeIds.add(id.trim());
          }
        });
      });

      if (allEmployeeIds.size > 0) {
        try {
          const namesMap = await getEmployeeNamesByIds(Array.from(allEmployeeIds));
          setEmployeeNamesMap(namesMap);
        } catch (error) {
          console.error("Failed to fetch employee names:", error);
        }
      }
    };

    fetchEmployeeNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetings]);

  const date = (meeting) => {
    return new Date(meeting.meeting_date).toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
  };

  const time = (meeting) => {
    return new Date(meeting.meeting_date).toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setDurationFilter("All durations");
    setCurrentPage(1); // Reset to first page when clearing filters
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, durationFilter]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "status-scheduled";
      case "ongoing":
        return "status-ongoing";
      case "completed":
        return "status-completed";
      case "cancelled":
        return "status-cancelled";
      default:
        return "status-default";
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleMemberChange = (employeeId, isChecked) => {
    setFormData((prev) => {
      const trimmedId = String(employeeId).trim();
      if (isChecked) {
        // Add member if not already in the list
        const isAlreadyIncluded = prev.members.some(id => String(id).trim() === trimmedId);
        if (isAlreadyIncluded) {
          return prev;
        }
        return {
          ...prev,
          members: [...prev.members, trimmedId],
        };
      } else {
        // Remove member from the list
        return {
          ...prev,
          members: prev.members.filter((m) => String(m).trim() !== trimmedId),
        };
      }
    });
  };

  const handleSelectAllMembers = (e) => {
    if (e.target.checked && members && members.length > 0) {
      const allEmployeeIds = members.map((member) => String(member.employee_id).trim());
      setFormData((prev) => ({ ...prev, members: allEmployeeIds }));
    } else {
      setFormData((prev) => ({ ...prev, members: [] }));
    }
  };

  const resetForm = () => {
    setFormData({
      meetingName: "",
      description: "",
      date: "",
      time: "",
      durationMinutes: "30",
      googleMeetLink: "",
      members: [],
      status: "Scheduled",
    });
    setSubmitError(null);
    setEditingMeetingId(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEditModal = async (id) => {
    setEditingMeetingId(id);
    setSubmitError(null);
    try {
      await fetchMeetingById(id);
    } catch (error) {
      setSubmitError("Failed to load meeting details");
    }
  };

  // Effect to populate form when selectedMeeting is loaded
  useEffect(() => {
    if (editingMeetingId && selectedMeeting) {
      const meeting = Array.isArray(selectedMeeting) && selectedMeeting.length > 0 
        ? selectedMeeting[0] 
        : selectedMeeting;
      
      if (meeting && meeting.id === editingMeetingId) {
        try {
          const meetingDate = new Date(meeting.meeting_date);
          
          // Format date and time for inputs
          const dateStr = meetingDate.toISOString().split('T')[0];
          const timeStr = meetingDate.toTimeString().split(' ')[0].slice(0, 5);
          
          // Parse members (backend stores employee IDs as JSON array)
          const parsedEmployeeIds = parseMembers(meeting.members);
          // Ensure all IDs are trimmed strings
          const cleanedEmployeeIds = parsedEmployeeIds.map(id => String(id).trim()).filter(id => id);
          
          setFormData({
            meetingName: meeting.meeting_name || "",
            description: meeting.description || "",
            date: dateStr,
            time: timeStr,
            durationMinutes: meeting.duration_minutes?.toString() || "30",
            googleMeetLink: meeting.google_meet_link || "",
            members: cleanedEmployeeIds,
            status: meeting.status || "Scheduled",
          });
          setShowEditModal(true);
        } catch (error) {
          setSubmitError("Failed to parse meeting details");
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMeeting, editingMeetingId]);

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    resetForm();
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError(null);

    try {
      // Combine date and time
      const meetingDateTime = new Date(`${formData.date}T${formData.time}`);
      const meetingDateISO = meetingDateTime.toISOString();

      // Convert members array to comma-separated string
      const membersString = formData.members.join(',');

      const meetingData = {
        meetingName: formData.meetingName,
        googleMeetLink: formData.googleMeetLink,
        members: membersString,
        description: formData.description || "",
        meetingDate: meetingDateISO,
        durationMinutes: parseInt(formData.durationMinutes),
        adminName: adminName,
      };

      await addMeeting(meetingData);
      handleCloseAddModal();
    } catch (error) {
      setSubmitError(error.response?.data?.message || "Failed to create meeting");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError(null);

    try {
      // Combine date and time
      const meetingDateTime = new Date(`${formData.date}T${formData.time}`);
      const meetingDateISO = meetingDateTime.toISOString();

      // Convert members array to comma-separated string
      const membersString = formData.members.join(',');

      const meetingData = {
        meetingName: formData.meetingName,
        googleMeetLink: formData.googleMeetLink,
        members: membersString,
        description: formData.description || "",
        meetingDate: meetingDateISO,
        durationMinutes: parseInt(formData.durationMinutes),
        status: formData.status,
      };

      await updateMeeting(editingMeetingId, meetingData);
      handleCloseEditModal();
    } catch (error) {
      setSubmitError(error.response?.data?.message || "Failed to update meeting");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleJoinMeeting = (url) => {
    window.open(url, "_blank");
  };

  const handleDeleteMeeting = (id, meetingName) => {
    setDeletingMeetingId(id);
    setDeletingMeetingName(meetingName || "this meeting");
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingMeetingId) return;
    
    setDeleteLoading(true);
    try {
      await deleteMeeting(deletingMeetingId);
      setShowDeleteModal(false);
      setDeletingMeetingId(null);
      setDeletingMeetingName("");
    } catch (error) {
      setSubmitError("Failed to delete meeting");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingMeetingId(null);
    setDeletingMeetingName("");
    setSubmitError(null);
  };

  // Helper function to safely parse members
  const parseMembers = (members) => {
    if (!members) return [];
    if (Array.isArray(members)) return members;
    try {
      const parsed = JSON.parse(members);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      // If not valid JSON, try splitting by comma
      if (typeof members === 'string') {
        return members.split(',').map(m => m.trim()).filter(m => m);
      }
      return [];
    }
  };

  // Helper function to format members for display
  const formatMembers = (membersData) => {
    const parsed = parseMembers(membersData);
    if (parsed.length === 0) return "No attendees";
    
    // Convert employee IDs to names using the API response
    const memberNames = parsed.map((id) => {
      const trimmedId = String(id).trim();
      // Check if we have the name in our map
      return employeeNamesMap[trimmedId] || trimmedId;
    });
    
    return memberNames.join(", ");
  };

  const filteredMeetings = useMemo(() => {
    if (!meetings || meetings.length === 0) return [];

    return meetings.filter((meeting) => {
      // ---- Safe values ----
      const title = (meeting.meeting_name || "").toLowerCase();
      const description = (meeting.description || "").toLowerCase();
      
      // Format date for search (multiple formats)
      let dateStr = "";
      try {
        const meetingDate = new Date(meeting.meeting_date);
        if (!isNaN(meetingDate.getTime())) {
          // Include multiple date formats for better search
          dateStr = meetingDate.toLocaleDateString("en-IN", {
            timeZone: "Asia/Kolkata",
          }).toLowerCase();
          // Also include ISO date format
          dateStr += " " + meetingDate.toISOString().split('T')[0];
        }
      } catch (e) {
        dateStr = "";
      }

      // Parse members safely and convert to names for search
      const membersArray = parseMembers(meeting.members);
      const memberNames = membersArray.map((id) => {
        const trimmedId = String(id).trim();
        return employeeNamesMap[trimmedId] || trimmedId;
      });
      const membersStr = memberNames.join(", ").toLowerCase();

      const search = searchQuery.toLowerCase().trim();

      // Search matches: title, description, date, or members
      const matchesSearch =
        !search ||
        title.includes(search) ||
        description.includes(search) ||
        dateStr.includes(search) ||
        membersStr.includes(search);

      // Status filter (case-insensitive)
      const matchesStatus =
        statusFilter === "All" ||
        (meeting.status && meeting.status.toLowerCase() === statusFilter.toLowerCase());

      // Duration filter
      const matchesDuration =
        durationFilter === "All durations" ||
        (meeting.duration_minutes &&
          meeting.duration_minutes === Number(durationFilter.replace(" minutes", "")));

      return matchesSearch && matchesStatus && matchesDuration;
    });
  }, [meetings, searchQuery, statusFilter, durationFilter, employeeNamesMap]);

  // Calculate pagination after filteredMeetings is defined
  const totalPages = Math.ceil(filteredMeetings.length / meetingsPerPage);
  const startIndex = (currentPage - 1) * meetingsPerPage;
  const endIndex = startIndex + meetingsPerPage;
  const paginatedMeetings = filteredMeetings.slice(startIndex, endIndex);

  return (
    <div className={`admin-meetings-root ${darkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <AdminNavbar />

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <AdminHeader
          title="Meetings Management"
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        {/* Content */}
        <div className="meetings-content">
          {/* Header Actions - Button on the right */}
          <div className="header-actions-right">
            <button className="btn-primary" onClick={handleOpenAddModal}>
              <span className="material-symbols-outlined">add</span>
              Add New Meeting
            </button>
          </div>
      
          <div className="filter-panel">
            {/* Top filters row */}
            <div className="filter-panel__row">
              
              <div className="filter-field filter-field--search">
                <label className="filter-field__label">Search</label>
                <div className="search-box">
                  <span className="search-box__icon material-symbols-outlined">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search by title, date or member"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-box__input"
                  />
                </div>
              </div>

              <div className="filter-field">
                <label className="filter-field__label">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="select-box"
                >
                  <option>All</option>
                  <option>Scheduled</option>
                  <option>Ongoing</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>
              </div>

              <div className="filter-field">
                <label className="filter-field__label">Duration</label>
                <select
                  value={durationFilter}
                  onChange={(e) => setDurationFilter(e.target.value)}
                  className="select-box"
                >
                  <option>All durations</option>
                  <option>15 minutes</option>
                  <option>30 minutes</option>
                  <option>60 minutes</option>
                </select>
              </div>

            </div>

            {/* Clear button row */}
            <div className="filter-panel__actions">
              <button className="btn-reset" onClick={handleClearFilters}>
                Clear
              </button>
            </div>

          </div>


          {/* Meetings Table */}
          <div className="table-section">
            <div className="table-header">
              <span className="table-info">All meetings</span>
            </div>

            <div className="table-container">
              <table className="meetings-table">
                <thead>
                  <tr>
                    <th>Meeting Title</th>
                    <th>Description / Agenda</th>
                    <th>Date & Time</th>
                    {/* <th>Duration</th> */}
                    {/* <th>Attendees</th> */}
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", padding: "2rem" }}>
                        Loading meetings...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", padding: "2rem", color: "red" }}>
                        {error}
                      </td>
                    </tr>
                  ) : filteredMeetings.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", padding: "2rem" }}>
                        No meetings found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedMeetings.map((meeting) => (
                    <tr key={meeting.id}>
                      <td className="meeting-title-cell">
                        <p className="meeting-title">{meeting.meeting_name}</p>
                        <p className="meeting-subtitle">Created by: {meeting.created_by}</p>
                      </td>
                      <td className="description-cell">
                        <p className="meeting-description">{meeting.description}</p>
                      </td>
                      <td>{date(meeting)} {time(meeting)}</td>
                      {/* <td>{meeting.duration_minutes} minutes</td> */}
                      {/* <td>{formatMembers(meeting.members)}</td> */}
                      <td>
                        <span className={`status-badge ${getStatusClass(meeting.status)}`}>
                          {meeting.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-btn"
                            title="Edit"
                            onClick={() => handleOpenEditModal(meeting.id)}
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button
                            className="action-btn"
                            title="Join"
                            onClick={() => handleJoinMeeting(meeting.google_meet_link)}
                          >
                            <span className="material-symbols-outlined"><Video size={14} /></span>
                          </button>
                          <button
                            className="action-btn delete"
                            title="Delete"
                            onClick={() => handleDeleteMeeting(meeting.id, meeting.meeting_name)}
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredMeetings.length > 0 && (
              <div className="pagination">
                <span className="pagination-info">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredMeetings.length)} of {filteredMeetings.length} meetings
                </span>
                <div className="pagination-buttons">
                  <button 
                    className="pagination-btn" 
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          className={`pagination-btn ${currentPage === page ? "active" : ""}`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="pagination-ellipsis">...</span>;
                    }
                    return null;
                  })}
                  <button 
                    className="pagination-btn" 
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Meeting Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={handleCloseAddModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add New Meeting</h3>
              <button className="modal-close" onClick={handleCloseAddModal}>
                &times;
              </button>
            </div>
            <form className="modal-form" onSubmit={handleSubmitAdd}>
              {submitError && (
                <div className="form-error">
                  {submitError}
                </div>
              )}
              <div className="form-group full-width">
                <label>Meeting Title <span className="required">*</span></label>
                <input
                  type="text"
                  name="meetingName"
                  value={formData.meetingName}
                  onChange={handleFormChange}
                  placeholder="Enter meeting title"
                  required
                />
              </div>
              <div className="form-group full-width">
                <label>Agenda / Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={4}
                  placeholder="Enter meeting agenda or description"
                />
              </div>
              <div className="form-group">
                <label>Date <span className="required">*</span></label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Time <span className="required">*</span></label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Duration (minutes) <span className="required">*</span></label>
                <select name="durationMinutes" value={formData.durationMinutes} onChange={handleFormChange} required>
                  <option value="15">15</option>
                  <option value="30">30</option>
                  <option value="45">45</option>
                  <option value="60">60</option>
                  <option value="90">90</option>
                  <option value="120">120</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleFormChange}>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className="form-group full-width">
                <label>Google Meet Link <span className="required">*</span></label>
                <input
                  type="url"
                  name="googleMeetLink"
                  value={formData.googleMeetLink}
                  onChange={handleFormChange}
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  required
                />
              </div>
              <div className="form-group full-width">
                <label>Select Attendees</label>
                <div className="attendees-checkbox-container">
                  {members && members.length > 0 ? (
                    <>
                      <label className="checkbox-label select-all-label">
                        <input
                          type="checkbox"
                          checked={formData.members.length === members.length && members.length > 0}
                          onChange={handleSelectAllMembers}
                        />
                        <span>Select All ({members.length} members)</span>
                      </label>
                      <div className="attendees-checkbox-list">
                        {members.map((member) => {
                          const memberId = String(member.employee_id).trim();
                          const isChecked = formData.members.some(id => String(id).trim() === memberId);
                          return (
                            <label key={member.employee_id} className="checkbox-label attendee-checkbox">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => handleMemberChange(member.employee_id, e.target.checked)}
                              />
                              <span>{member.employee_id} - {member.full_name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="loading-members">Loading members...</div>
                  )}
                </div>
                {formData.members.length > 0 && (
                  <small className="form-hint">
                    {formData.members.length} attendee{formData.members.length !== 1 ? 's' : ''} selected
                  </small>
                )}
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseAddModal} disabled={submitLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={submitLoading}>
                  {submitLoading ? "Creating..." : "Create Meeting"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Meeting Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={handleCloseEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Meeting</h3>
              <button className="modal-close" onClick={handleCloseEditModal}>
                &times;
              </button>
            </div>
            <form className="modal-form" onSubmit={handleSubmitEdit}>
              {submitError && (
                <div className="form-error">
                  {submitError}
                </div>
              )}
              <div className="form-group full-width">
                <label>Meeting Title <span className="required">*</span></label>
                <input
                  type="text"
                  name="meetingName"
                  value={formData.meetingName}
                  onChange={handleFormChange}
                  placeholder="Enter meeting title"
                  required
                />
              </div>
              <div className="form-group full-width">
                <label>Agenda / Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={4}
                  placeholder="Enter meeting agenda or description"
                />
              </div>
              <div className="form-group">
                <label>Date <span className="required">*</span></label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Time <span className="required">*</span></label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Duration (minutes) <span className="required">*</span></label>
                <select name="durationMinutes" value={formData.durationMinutes} onChange={handleFormChange} required>
                  <option value="15">15</option>
                  <option value="30">30</option>
                  <option value="45">45</option>
                  <option value="60">60</option>
                  <option value="90">90</option>
                  <option value="120">120</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status <span className="required">*</span></label>
                <select name="status" value={formData.status} onChange={handleFormChange} required>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className="form-group full-width">
                <label>Google Meet Link <span className="required">*</span></label>
                <input
                  type="url"
                  name="googleMeetLink"
                  value={formData.googleMeetLink}
                  onChange={handleFormChange}
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  required
                />
              </div>
              <div className="form-group full-width">
                <label>Select Attendees</label>
                <div className="attendees-checkbox-container">
                  {members && members.length > 0 ? (
                    <>
                      <label className="checkbox-label select-all-label">
                        <input
                          type="checkbox"
                          checked={formData.members.length === members.length && members.length > 0}
                          onChange={handleSelectAllMembers}
                        />
                        <span>Select All ({members.length} members)</span>
                      </label>
                      <div className="attendees-checkbox-list">
                        {members.map((member) => {
                          const memberId = String(member.employee_id).trim();
                          const isChecked = formData.members.some(id => String(id).trim() === memberId);
                          return (
                            <label key={member.employee_id} className="checkbox-label attendee-checkbox">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => handleMemberChange(member.employee_id, e.target.checked)}
                              />
                              <span>{member.employee_id} - {member.full_name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="loading-members">Loading members...</div>
                  )}
                </div>
                {formData.members.length > 0 && (
                  <small className="form-hint">
                    {formData.members.length} attendee{formData.members.length !== 1 ? 's' : ''} selected
                  </small>
                )}
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseEditModal} disabled={submitLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={submitLoading}>
                  {submitLoading ? "Updating..." : "Update Meeting"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Delete Meeting</h3>
              <button className="modal-close" onClick={handleCancelDelete}>
                &times;
              </button>
            </div>
            <div className="delete-modal-body">
              {submitError && (
                <div className="form-error">
                  {submitError}
                </div>
              )}
              <div className="delete-warning-icon">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <p className="delete-message">
                Are you sure you want to delete <strong>"{deletingMeetingName}"</strong>?
              </p>
              <p className="delete-warning-text">
                This action cannot be undone. All meeting details and attendee information will be permanently deleted.
              </p>
            </div>
            <div className="delete-modal-actions">
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={handleCancelDelete}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-delete" 
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete Meeting"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}