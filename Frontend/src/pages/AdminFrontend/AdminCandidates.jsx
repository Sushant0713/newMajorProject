import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./AdminCandidates.css";
import logo from "../../assets/OHS.jpg";

const candidatesData = [
  {
    id: 1,
    name: "Vinit Kumar",
    code: "CAND-00123",
    initials: "VK",
    email: "vinit@example.com",
    phone: "90000 00000",
    status: "Interview Scheduled",
    matchingScore: 78,
    process: "Frontend Developer",
    client: "Acme Corp",
    assignedTo: "Rohit Sharma",
    uploadedBy: "Priya (upload)",
    assignedDate: "Aug 15, 2025",
  },
  {
    id: 2,
    name: "Priya Singh",
    code: "CAND-00124",
    initials: "PS",
    email: "priya@example.com",
    phone: "90000 00001",
    status: "Selected",
    matchingScore: 92,
    process: "Backend Developer",
    client: "Tech Solutions",
    assignedTo: "Amit Kumar",
    uploadedBy: "Rahul (upload)",
    assignedDate: "Aug 16, 2025",
  },
  {
    id: 3,
    name: "Rahul Verma",
    code: "CAND-00125",
    initials: "RV",
    email: "rahul@example.com",
    phone: "90000 00002",
    status: "Joined",
    matchingScore: 85,
    process: "Full Stack Developer",
    client: "Innovate Inc",
    assignedTo: "Sara Khan",
    uploadedBy: "Priya (upload)",
    assignedDate: "Aug 17, 2025",
  },
];

const statusCards = [
  { label: "Total Candidates", value: "1,500", percentage: "100%", icon: "person_search", color: "purple" },
  { label: "Available", value: "120", percentage: "8%", icon: "check_circle", color: "green" },
  { label: "Interview Scheduled", value: "120", percentage: "8%", icon: "calendar_month", color: "orange" },
  { label: "Joined", value: "750", percentage: "50%", icon: "thumb_up", color: "blue" },
  { label: "Dropout", value: "225", percentage: "15%", icon: "trending_down", color: "red" },
  { label: "Selected", value: "120", percentage: "8%", icon: "military_tech", color: "yellow" },
];

const navItems = [
  { icon: "dashboard", label: "Dashboard", path: "/admin-dashboard" },
  { icon: "group", label: "Clients", path: "/admin-clients" },
  { icon: "work", label: "Process", path: "/admin-process" },
  { icon: "badge", label: "Employees", path: "/admin-employees" },
  { icon: "groups", label: "Teams", path: "/admin-teams" },
  { icon: "person_search", label: "Candidates", path: "/admin-candidates" },
  { icon: "upload_file", label: "Data Import", path: "/admin-data-import" },
  { icon: "videocam", label: "Meetings", path: "/admin-meetings" },
  { icon: "mail", label: "Messages", path: "/admin-messages" },
  { icon: "paid", label: "Payout Management", path: "/admin-payout-management" },
  { icon: "event_busy", label: "LOP Management", path: "/admin-lop-management" },
];

export default function AdminCandidates() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [scopeFilter, setScopeFilter] = useState("All Fields");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showMatchingModal, setShowMatchingModal] = useState(false);

  const adminName = "Admin";
  const adminEmail = "admin@ownhrsolutions.com";

  const handleLogout = () => {
    navigate("/");
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setScopeFilter("All Fields");
    setStatusFilter("All Status");
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "interview scheduled":
        return "status-orange";
      case "selected":
        return "status-yellow";
      case "joined":
        return "status-blue";
      case "available":
        return "status-green";
      case "dropout":
        return "status-red";
      default:
        return "status-gray";
    }
  };

  return (
    <div className="admin-candidates-root">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src={logo} alt="Logo" className="admin-logo-img" />
          <h2 className="admin-brand-name">Owh HR Solutions</h2>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`admin-nav-item ${location.pathname === item.path ? "active" : ""}`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button onClick={handleLogout} className="admin-nav-item logout-btn">
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="header-left">
            <h1 className="admin-header-title">Candidates Dashboard</h1>
            <p className="header-subtitle">View candidate matching results and assignment status.</p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary">Upload Resume</button>
            <button className="btn-primary">
              <span className="material-symbols-outlined">autorenew</span>
              Run Batch Matching
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="candidates-content">
          {/* Status Cards */}
          <div className="status-cards-grid">
            {statusCards.map((card, index) => (
              <div key={index} className={`status-card status-card-${card.color}`}>
                <div className="status-card-content">
                  <div className="status-card-info">
                    <p className="status-card-label">{card.label}</p>
                    <p className="status-card-value">{card.value}</p>
                  </div>
                  <div className={`status-card-icon icon-${card.color}`}>
                    <span className="material-symbols-outlined">{card.icon}</span>
                  </div>
                </div>
                <p className="status-card-percentage">{card.percentage}</p>
              </div>
            ))}
          </div>

          {/* Search & Filters */}
          <div className="filters-section">
            <div className="filters-row">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="Search candidates, client, process, employee..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              <select
                value={scopeFilter}
                onChange={(e) => setScopeFilter(e.target.value)}
                className="filter-select"
              >
                <option>All Fields</option>
                <option>Candidate</option>
                <option>Client</option>
                <option>Process</option>
                <option>Employee</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option>All Status</option>
                <option>Available</option>
                <option>Assigned</option>
                <option>Interview Scheduled</option>
                <option>Selected</option>
                <option>Joined</option>
                <option>Dropout</option>
              </select>
              <div className="filter-buttons">
                <button className="btn-primary">Search</button>
                <button className="btn-secondary" onClick={handleClearFilters}>Clear</button>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="table-section">
            <div className="table-header">
              <div className="table-header-left">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span>Select all</span>
                </label>
                <span className="results-info">Showing 1-25 of 1500</span>
              </div>
              <button className="btn-export">Export CSV</button>
            </div>

            <div className="table-container">
              <table className="candidates-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Matching Score</th>
                    <th>Process</th>
                    <th>Client</th>
                    <th>Assigned To</th>
                    <th>Uploaded By</th>
                    <th>Assigned Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidatesData.map((candidate) => (
                    <tr key={candidate.id}>
                      <td>
                        <div className="candidate-info">
                          <div className="candidate-avatar">{candidate.initials}</div>
                          <div>
                            <p className="candidate-name">{candidate.name}</p>
                            <p className="candidate-code">{candidate.code}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="contact-info">
                          <a href={`mailto:${candidate.email}`} className="email-link">{candidate.email}</a>
                          <a href={`tel:${candidate.phone}`} className="phone-link">{candidate.phone}</a>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusClass(candidate.status)}`}>
                          <span className="status-dot"></span>
                          {candidate.status}
                        </span>
                      </td>
                      <td>
                        <div className="matching-score">
                          <span className="score-value">{candidate.matchingScore}%</span>
                          <div className="score-bar">
                            <div className="score-fill" style={{ width: `${candidate.matchingScore}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td>{candidate.process}</td>
                      <td>{candidate.client}</td>
                      <td>{candidate.assignedTo}</td>
                      <td>{candidate.uploadedBy}</td>
                      <td>{candidate.assignedDate}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn" title="Resume">
                            <span className="material-symbols-outlined">description</span>
                          </button>
                          <button className="action-btn" title="Details">
                            <span className="material-symbols-outlined">visibility</span>
                          </button>
                          <button className="action-btn" title="History" onClick={() => setShowHistoryModal(true)}>
                            <span className="material-symbols-outlined">history</span>
                          </button>
                          <button className="action-btn" title="Scores" onClick={() => setShowMatchingModal(true)}>
                            <span className="material-symbols-outlined">score</span>
                          </button>
                          <button className="action-btn" title="More">
                            <span className="material-symbols-outlined">more_vert</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
              <span className="pagination-info">Showing 1 to 25 of 1500 entries</span>
              <div className="pagination-buttons">
                <button className="pagination-btn">Prev</button>
                <button className="pagination-btn active">1</button>
                <button className="pagination-btn">2</button>
                <button className="pagination-btn">3</button>
                <button className="pagination-btn">Next</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Status History</h2>
                <div className="modal-subtitle">
                  <div className="modal-avatar">RA</div>
                  <span>Ram Gohine</span>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowHistoryModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-dot green"></div>
                  <div className="timeline-card">
                    <h3>Selected → Joined</h3>
                    <p>Candidate joined the company</p>
                    <div className="timeline-meta">
                      <span><span className="material-symbols-outlined">calendar_today</span> Aug 8, 2025 • 08:31 PM</span>
                      <span className="emp-badge"><span className="material-symbols-outlined">person</span> EMP008</span>
                    </div>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot blue"></div>
                  <div className="timeline-card">
                    <h3>Interview Scheduled → Selected</h3>
                    <p>Candidate selected</p>
                    <div className="timeline-meta">
                      <span><span className="material-symbols-outlined">calendar_today</span> Aug 8, 2025 • 08:24 PM</span>
                      <span className="emp-badge"><span className="material-symbols-outlined">person</span> EMP008</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Matching Scores Modal */}
      {showMatchingModal && (
        <div className="modal-overlay" onClick={() => setShowMatchingModal(false)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Matching Scores</h2>
                <div className="modal-subtitle">
                  <div className="modal-avatar">SS</div>
                  <span>Sanket Salve</span>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowMatchingModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="match-cards">
                <div className="match-card">
                  <div className="match-card-header">
                    <div>
                      <h3>Aditya Birla VRM Process for Relationships Managers (RM)</h3>
                      <p>Eureka Outsourcing Pvt. Ltd</p>
                    </div>
                    <div className="match-score">
                      <span className="score-number">100%</span>
                      <span className="score-label">Match Score</span>
                    </div>
                  </div>
                  <div className="match-tags">
                    <span className="match-tag green">Skills: 2</span>
                    <span className="match-tag green">Languages: 2</span>
                    <span className="match-tag green">Education: 1</span>
                    <span className="match-tag green">Location: 1</span>
                    <span className="match-tag green">Type: 1</span>
                  </div>
                  <div className="match-card-footer">
                    <span>Updated: Jul 24, 2025</span>
                    <button className="link-btn">
                      Click for Details
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                  </div>
                </div>
                <div className="match-card">
                  <div className="match-card-header">
                    <div>
                      <h3>RGI Sales</h3>
                      <p>Eureka Outsourcing Pvt. Ltd</p>
                    </div>
                    <div className="match-score">
                      <span className="score-number">90%</span>
                      <span className="score-label">Match Score</span>
                    </div>
                  </div>
                  <div className="match-tags">
                    <span className="match-tag green">Skills: 2</span>
                    <span className="match-tag green">Languages: 2</span>
                    <span className="match-tag green">Education: 1</span>
                    <span className="match-tag yellow">Location: 0</span>
                    <span className="match-tag green">Type: 1</span>
                  </div>
                  <div className="match-card-footer">
                    <span>Updated: Jul 24, 2025</span>
                    <button className="link-btn">
                      Click for Details
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

