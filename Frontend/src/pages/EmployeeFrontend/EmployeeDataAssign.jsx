import React, { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Database,
  Briefcase,
  BarChart2,
  Calendar,
  Search,
  X,
  UserPlus,
  UserMinus,
  Filter,
  CheckSquare,
  Square,
  ChevronDown,
  ArrowRight,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import "./EmployeeDataAssign.css";
import logo from "../../assets/OHS.jpg";

const employees = [
  { id: 1, name: "Asma Khan", empId: "Emp 001", assigned: 50, available: true },
  { id: 2, name: "Rohit Sharma", empId: "Emp 002", assigned: 45, available: true },
  { id: 3, name: "Priya Singh", empId: "Emp 003", assigned: 60, available: true },
  { id: 4, name: "Amit Kumar", empId: "Emp 004", assigned: 35, available: true },
  { id: 5, name: "Sneha Patel", empId: "Emp 005", assigned: 40, available: false },
];

const availableCandidates = [
  {
    id: 1,
    name: "Mahesh Gupta",
    phone: "9619827334",
    location: "Mumbai",
    source: "Apna Hire",
    status: "New",
  },
  {
    id: 2,
    name: "Rajesh Kumar",
    phone: "9876543210",
    location: "Delhi",
    source: "General",
    status: "New",
  },
  {
    id: 3,
    name: "Priya Sharma",
    phone: "8765432109",
    location: "Bangalore",
    source: "Job Hai",
    status: "New",
  },
  {
    id: 4,
    name: "Vikram Singh",
    phone: "7654321098",
    location: "Pune",
    source: "Work India",
    status: "New",
  },
  {
    id: 5,
    name: "Anita Desai",
    phone: "6543210987",
    location: "Chennai",
    source: "Shine",
    status: "New",
  },
  {
    id: 6,
    name: "Karan Mehta",
    phone: "5432109876",
    location: "Mumbai",
    source: "Apna Hire",
    status: "New",
  },
  {
    id: 7,
    name: "Riya Patel",
    phone: "4321098765",
    location: "Ahmedabad",
    source: "General",
    status: "New",
  },
  {
    id: 8,
    name: "Suresh Yadav",
    phone: "3210987654",
    location: "Surat",
    source: "Job Hai",
    status: "New",
  },
];

export default function EmployeeDataAssign() {
  const location = useLocation();
  const [selectedEmployees, setSelectedEmployees] = useState(new Set());
  const [selectedCandidates, setSelectedCandidates] = useState(new Set());
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [candidateSearch, setCandidateSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [assignmentHistory, setAssignmentHistory] = useState([]);
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
  const [showUnassignModal, setShowUnassignModal] = useState(false);
  const [assignCount, setAssignCount] = useState(1);
  const [draggedCandidate, setDraggedCandidate] = useState(null);
  const [dragOverEmployee, setDragOverEmployee] = useState(null);

  const uniqueSources = useMemo(() => {
    return [...new Set(availableCandidates.map((c) => c.source))];
  }, []);

  const uniqueLocations = useMemo(() => {
    return [...new Set(availableCandidates.map((c) => c.location))];
  }, []);

  const filteredEmployees = useMemo(() => {
    if (!employeeSearch) return employees;
    const query = employeeSearch.toLowerCase();
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(query) ||
        emp.empId.toLowerCase().includes(query)
    );
  }, [employeeSearch]);

  const filteredCandidates = useMemo(() => {
    return availableCandidates.filter((candidate) => {
      const matchesSearch =
        !candidateSearch ||
        candidate.name.toLowerCase().includes(candidateSearch.toLowerCase()) ||
        candidate.phone.includes(candidateSearch);
      const matchesSource = sourceFilter === "all" || candidate.source === sourceFilter;
      const matchesLocation =
        locationFilter === "all" || candidate.location === locationFilter;
      return matchesSearch && matchesSource && matchesLocation;
    });
  }, [candidateSearch, sourceFilter, locationFilter]);

  const toggleEmployeeSelection = (empId) => {
    setSelectedEmployees((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(empId)) {
        newSet.delete(empId);
      } else {
        newSet.add(empId);
      }
      return newSet;
    });
  };

  const toggleCandidateSelection = (candidateId) => {
    setSelectedCandidates((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(candidateId)) {
        newSet.delete(candidateId);
      } else {
        newSet.add(candidateId);
      }
      return newSet;
    });
  };

  const toggleSelectAllCandidates = () => {
    if (selectedCandidates.size === filteredCandidates.length) {
      setSelectedCandidates(new Set());
    } else {
      setSelectedCandidates(new Set(filteredCandidates.map((c) => c.id)));
    }
  };

  const handleAssign = (employeeId, candidateIds) => {
    const employee = employees.find((e) => e.id === employeeId);
    const candidates = availableCandidates.filter((c) => candidateIds.includes(c.id));

    const assignment = {
      id: Date.now(),
      employeeId,
      employeeName: employee.name,
      candidateIds,
      candidates: candidates.map((c) => c.name),
      date: new Date().toLocaleString(),
      count: candidateIds.length,
    };

    setAssignmentHistory((prev) => [assignment, ...prev]);

    // Update employee assigned count
    const updatedEmployees = employees.map((emp) =>
      emp.id === employeeId
        ? { ...emp, assigned: emp.assigned + candidateIds.length }
        : emp
    );

    // Remove assigned candidates from available list
    const remainingCandidates = availableCandidates.filter(
      (c) => !candidateIds.includes(c.id)
    );

    setSelectedCandidates(new Set());
    setSelectedEmployees(new Set());
  };

  const handleBulkAssign = () => {
    if (selectedEmployees.size === 0 || selectedCandidates.size === 0) {
      alert("Please select at least one employee and one candidate");
      return;
    }

    const candidateIds = Array.from(selectedCandidates);
    const employeeIds = Array.from(selectedEmployees);

    // Distribute candidates evenly among selected employees
    const candidatesPerEmployee = Math.ceil(candidateIds.length / employeeIds.length);
    let candidateIndex = 0;

    employeeIds.forEach((empId) => {
      const candidatesForThisEmployee = candidateIds.slice(
        candidateIndex,
        candidateIndex + candidatesPerEmployee
      );
      if (candidatesForThisEmployee.length > 0) {
        handleAssign(empId, candidatesForThisEmployee);
      }
      candidateIndex += candidatesPerEmployee;
    });

    setShowBulkAssignModal(false);
  };

  const handleDragStart = (e, candidate) => {
    setDraggedCandidate(candidate);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, employeeId) => {
    e.preventDefault();
    setDragOverEmployee(employeeId);
  };

  const handleDragLeave = () => {
    setDragOverEmployee(null);
  };

  const handleDrop = (e, employeeId) => {
    e.preventDefault();
    if (draggedCandidate) {
      handleAssign(employeeId, [draggedCandidate.id]);
      setDraggedCandidate(null);
    }
    setDragOverEmployee(null);
  };

  const handleUnassign = (employeeId, candidateIds) => {
    if (window.confirm("Are you sure you want to unassign these candidates?")) {
      // Logic to unassign
      console.log("Unassigning:", employeeId, candidateIds);
      setShowUnassignModal(false);
    }
  };

  const clearFilters = () => {
    setCandidateSearch("");
    setSourceFilter("all");
    setLocationFilter("all");
  };

  const hasActiveFilters =
    candidateSearch || sourceFilter !== "all" || locationFilter !== "all";

  const stats = useMemo(() => {
    const totalAssigned = employees.reduce((sum, emp) => sum + emp.assigned, 0);
    const totalAvailable = availableCandidates.length;
    const avgPerEmployee = employees.length > 0 ? Math.round(totalAssigned / employees.length) : 0;
    return { totalAssigned, totalAvailable, avgPerEmployee };
  }, []);

  return (
    <div className="emp-data-assign-root">
      <aside className="dash-sidebar">
        <div className="dash-brand">
          <img src={logo} alt="logo" className="dash-logo" />
          <div className="dash-brand-name">Owh HR Solutions</div>
        </div>

        <nav className="dash-nav">
          <Link to="/employee-dashboard" className={`dash-nav-item ${location.pathname === "/employee-dashboard" ? "active" : ""}`}>
            <LayoutDashboard size={18} /> <span>Dashboard</span>
          </Link>
          <Link to="/employee-clients" className={`dash-nav-item ${location.pathname === "/employee-clients" ? "active" : ""}`}>
            <Users size={18} /> <span>Clients</span>
          </Link>
          <Link to="/employee-tracker" className={`dash-nav-item ${location.pathname === "/employee-tracker" ? "active" : ""}`}>
            <UserCheck size={18} /> <span>Tracker</span>
          </Link>
          <div className="nav-with-submenu">
            <button
              className={`dash-nav-item with-submenu ${location.pathname === "/employee-data" || location.pathname === "/employee-data-assign" ? "active" : ""}`}
            >
              <div className="nav-item-left">
                <Database size={18} /> <span>Data</span>
              </div>
              <ChevronDown size={16} />
            </button>
            <div className="submenu">
              <Link to="/employee-data" className={`submenu-item ${location.pathname === "/employee-data" ? "active" : ""}`}>
                <span>• management</span>
              </Link>
              <Link to="/employee-data-assign" className={`submenu-item ${location.pathname === "/employee-data-assign" ? "active" : ""}`}>
                <span>• data assign</span>
              </Link>
            </div>
          </div>
          <Link
            to="/employee-payout"
            className={`dash-nav-item ${
              location.pathname === "/employee-payout" ? "active" : ""
            }`}
          >
            <Briefcase size={18} /> <span>Payout</span>
          </Link>
          <Link
            to="/employee-reports"
            className={`dash-nav-item ${
              location.pathname === "/employee-reports" ? "active" : ""
            }`}
          >
            <BarChart2 size={18} /> <span>Reports</span>
          </Link>
          <Link
            to="/employee-meetings"
            className={`dash-nav-item ${location.pathname === "/employee-meetings" ? "active" : ""}`}
          >
            <Calendar size={18} /> <span>Meetings</span>
          </Link>
        </nav>
      </aside>

      <main className="emp-data-assign-main">
        <header className="emp-data-assign-header">
          <div className="emp-data-assign-header-content">
            <h1 className="emp-data-assign-title">Data Assign</h1>
            <div className="emp-data-assign-header-actions">
              <button className="emp-data-assign-export-btn">
                <Download size={16} />
                Export
              </button>
              <button className="emp-data-assign-refresh-btn" onClick={() => window.location.reload()}>
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>
          </div>
        </header>

        <div className="emp-data-assign-content">
          {/* Statistics Cards */}
          <div className="emp-data-assign-stats">
            <div className="emp-data-assign-stat-card">
              <div className="stat-icon blue">
                <UserPlus size={20} />
              </div>
              <div className="stat-content">
                <p className="stat-label">Total Assigned</p>
                <p className="stat-value">{stats.totalAssigned}</p>
              </div>
            </div>
            <div className="emp-data-assign-stat-card">
              <div className="stat-icon green">
                <Users size={20} />
              </div>
              <div className="stat-content">
                <p className="stat-label">Available Candidates</p>
                <p className="stat-value">{stats.totalAvailable}</p>
              </div>
            </div>
            <div className="emp-data-assign-stat-card">
              <div className="stat-icon purple">
                <BarChart2 size={20} />
              </div>
              <div className="stat-content">
                <p className="stat-label">Avg per Employee</p>
                <p className="stat-value">{stats.avgPerEmployee}</p>
              </div>
            </div>
            <div className="emp-data-assign-stat-card">
              <div className="stat-icon orange">
                <CheckCircle2 size={20} />
              </div>
              <div className="stat-content">
                <p className="stat-label">Selected</p>
                <p className="stat-value">
                  {selectedCandidates.size} candidates, {selectedEmployees.size} employees
                </p>
              </div>
            </div>
          </div>

          {/* Main Assignment Area */}
          <div className="emp-data-assign-main-area">
            {/* Employees Section */}
            <div className="emp-data-assign-section">
              <div className="emp-data-assign-section-header">
                <h2>Employees</h2>
                <span className="section-count">{filteredEmployees.length} employees</span>
              </div>
              <div className="emp-data-assign-search-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="emp-data-assign-search-input"
                  placeholder="Search employees..."
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                />
              </div>
              <div className="emp-data-assign-employees-list">
                {filteredEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className={`emp-data-assign-employee-card ${
                      selectedEmployees.has(employee.id) ? "selected" : ""
                    } ${dragOverEmployee === employee.id ? "drag-over" : ""}`}
                    onClick={() => toggleEmployeeSelection(employee.id)}
                    onDragOver={(e) => handleDragOver(e, employee.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, employee.id)}
                  >
                    <div className="employee-checkbox">
                      {selectedEmployees.has(employee.id) ? (
                        <CheckSquare size={20} className="checked" />
                      ) : (
                        <Square size={20} className="unchecked" />
                      )}
                    </div>
                    <div className="employee-info">
                      <h3>{employee.name}</h3>
                      <p>{employee.empId}</p>
                      <div className="employee-stats">
                        <span className="assigned-count">
                          Assigned: {employee.assigned}
                        </span>
                        {employee.available && (
                          <span className="available-badge">Available</span>
                        )}
                      </div>
                    </div>
                    <button
                      className="assign-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedCandidates.size > 0) {
                          handleAssign(employee.id, Array.from(selectedCandidates));
                        }
                      }}
                      disabled={selectedCandidates.size === 0}
                    >
                      <ArrowRight size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Candidates Section */}
            <div className="emp-data-assign-section">
              <div className="emp-data-assign-section-header">
                <div className="header-left">
                  <h2>Available Candidates</h2>
                  <span className="section-count">{filteredCandidates.length} candidates</span>
                </div>
                <div className="header-actions">
                  <button
                    className="select-all-btn"
                    onClick={toggleSelectAllCandidates}
                  >
                    {selectedCandidates.size === filteredCandidates.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                  {selectedCandidates.size > 0 && (
                    <button
                      className="bulk-assign-btn"
                      onClick={() => setShowBulkAssignModal(true)}
                    >
                      <UserPlus size={16} />
                      Bulk Assign ({selectedCandidates.size})
                    </button>
                  )}
                </div>
              </div>

              {/* Filters */}
              <div className="emp-data-assign-filters">
                <div className="filter-group">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    className="emp-data-assign-search-input"
                    placeholder="Search candidates..."
                    value={candidateSearch}
                    onChange={(e) => setCandidateSearch(e.target.value)}
                  />
                </div>
                <select
                  className="filter-select"
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                >
                  <option value="all">All Sources</option>
                  {uniqueSources.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
                <select
                  className="filter-select"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                >
                  <option value="all">All Locations</option>
                  {uniqueLocations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
                {hasActiveFilters && (
                  <button className="clear-filters-btn" onClick={clearFilters}>
                    <X size={16} />
                    Clear
                  </button>
                )}
              </div>

              <div className="emp-data-assign-candidates-list">
                {filteredCandidates.length > 0 ? (
                  filteredCandidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className={`emp-data-assign-candidate-card ${
                        selectedCandidates.has(candidate.id) ? "selected" : ""
                      }`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, candidate)}
                      onClick={() => toggleCandidateSelection(candidate.id)}
                    >
                      <div className="candidate-checkbox">
                        {selectedCandidates.has(candidate.id) ? (
                          <CheckSquare size={18} className="checked" />
                        ) : (
                          <Square size={18} className="unchecked" />
                        )}
                      </div>
                      <div className="candidate-info">
                        <h4>{candidate.name}</h4>
                        <p>{candidate.phone}</p>
                        <div className="candidate-tags">
                          <span className="tag source">{candidate.source}</span>
                          <span className="tag location">{candidate.location}</span>
                          <span className={`tag status ${candidate.status.toLowerCase()}`}>
                            {candidate.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <AlertCircle size={48} />
                    <h3>No candidates found</h3>
                    <p>Try adjusting your filters</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Assignment History */}
          {assignmentHistory.length > 0 && (
            <div className="emp-data-assign-history">
              <h2>Recent Assignments</h2>
              <div className="history-list">
                {assignmentHistory.slice(0, 5).map((assignment) => (
                  <div key={assignment.id} className="history-item">
                    <div className="history-icon">
                      <CheckCircle2 size={20} />
                    </div>
                    <div className="history-content">
                      <p>
                        <strong>{assignment.employeeName}</strong> assigned{" "}
                        <strong>{assignment.count}</strong> candidate(s)
                      </p>
                      <p className="history-candidates">
                        {assignment.candidates.join(", ")}
                      </p>
                      <p className="history-date">{assignment.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Bulk Assign Modal */}
      {showBulkAssignModal && (
        <div
          className="emp-data-assign-modal-overlay"
          onClick={() => setShowBulkAssignModal(false)}
        >
          <div
            className="emp-data-assign-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="emp-data-assign-modal-header">
              <h2>Bulk Assign Candidates</h2>
              <button
                className="modal-close-btn"
                onClick={() => setShowBulkAssignModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="emp-data-assign-modal-body">
              <p className="modal-info">
                Assigning <strong>{selectedCandidates.size}</strong> candidate(s) to{" "}
                <strong>{selectedEmployees.size}</strong> employee(s)
              </p>
              <p className="modal-note">
                Candidates will be distributed evenly among selected employees.
              </p>
            </div>
            <div className="emp-data-assign-modal-footer">
              <button
                className="modal-btn secondary"
                onClick={() => setShowBulkAssignModal(false)}
              >
                Cancel
              </button>
              <button className="modal-btn primary" onClick={handleBulkAssign}>
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

