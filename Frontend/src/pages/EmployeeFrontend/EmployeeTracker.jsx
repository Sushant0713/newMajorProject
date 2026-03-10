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
  ChevronDown,
  Edit,
  FileText,
  MessageCircle,
  Phone,
  Download,
  Filter,
  ChevronUp,
  Eye,
  FileCheck,
} from "lucide-react";
import "./EmployeeTracker.css";
import logo from "../../assets/OHS.jpg";

const initialJoiningData = [
  {
    id: 1,
    name: "Mahesh Gupta",
    mobileNo: "1682739270",
    location: "Mumbai",
    company: "Pace Setter",
    process: "Business loan process",
    doj: "10-12-2025",
    status: "Joined",
    revenue: 5000,
  },
  {
    id: 2,
    name: "Priya Singh",
    mobileNo: "9876543210",
    location: "Delhi",
    company: "Tech Solutions",
    process: "Sales Executive",
    doj: "15-12-2025",
    status: "Joined",
    revenue: 7500,
    resume: {
      fileName: "Priya_Singh_Resume.pdf",
      uploadDate: "2025-01-12",
      size: "312 KB",
      url: "#",
    },
  },
  {
    id: 3,
    name: "Rahul Verma",
    mobileNo: "8765432109",
    location: "Bangalore",
    company: "Global Corp",
    process: "Customer Support",
    doj: "20-12-2025",
    status: "Pending",
    revenue: 6000,
    resume: {
      fileName: "Rahul_Verma_Resume.pdf",
      uploadDate: "2025-01-15",
      size: "198 KB",
      url: "#",
    },
  },
  {
    id: 4,
    name: "Anita Desai",
    mobileNo: "7654321098",
    location: "Pune",
    company: "Innovate Inc",
    process: "Telesales",
    doj: "25-12-2025",
    status: "On-hold",
    revenue: 8000,
    resume: {
      fileName: "Anita_Desai_Resume.pdf",
      uploadDate: "2025-01-18",
      size: "267 KB",
      url: "#",
    },
  },
  {
    id: 5,
    name: "Karan Mehta",
    mobileNo: "6543210987",
    location: "Chennai",
    company: "Pace Setter",
    process: "Business loan process",
    doj: "28-12-2025",
    status: "Drop",
    revenue: 0,
    resume: {
      fileName: "Karan_Mehta_Resume.pdf",
      uploadDate: "2025-01-20",
      size: "289 KB",
      url: "#",
    },
  },
];

const initialLineUpData = [
  {
    id: 1,
    name: "Mahesh Gupta",
    mobileNo: "3682738270",
    company: "Pace Setter",
    date: "30-12-2025",
    status: "Pipeline",
    resume: {
      fileName: "Mahesh_Gupta_Resume.pdf",
      uploadDate: "2025-01-10",
      size: "245 KB",
      url: "#",
    },
  },
  {
    id: 2,
    name: "Sneha Patel",
    mobileNo: "9876543211",
    company: "Tech Solutions",
    date: "28-12-2025",
    status: "Pipeline",
    resume: {
      fileName: "Sneha_Patel_Resume.pdf",
      uploadDate: "2025-01-14",
      size: "278 KB",
      url: "#",
    },
  },
  {
    id: 3,
    name: "Vikram Singh",
    mobileNo: "8765432112",
    company: "Global Corp",
    date: "25-12-2025",
    status: "Hold",
    resume: {
      fileName: "Vikram_Singh_Resume.pdf",
      uploadDate: "2025-01-16",
      size: "234 KB",
      url: "#",
    },
  },
  {
    id: 4,
    name: "Riya Sharma",
    mobileNo: "7654321113",
    company: "Innovate Inc",
    date: "22-12-2025",
    status: "Pipeline",
    resume: {
      fileName: "Riya_Sharma_Resume.pdf",
      uploadDate: "2025-01-17",
      size: "301 KB",
      url: "#",
    },
  },
  {
    id: 5,
    name: "Amit Kumar",
    mobileNo: "6543211114",
    company: "Pace Setter",
    date: "20-12-2025",
    status: "Hold",
    resume: {
      fileName: "Amit_Kumar_Resume.pdf",
      uploadDate: "2025-01-19",
      size: "256 KB",
      url: "#",
    },
  },
];

const statusOptions = {
  joining: ["Drop", "Joined", "Pending", "On-hold"],
  lineup: ["Hold", "Pipeline"],
};

export default function EmployeeTracker() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("joining");
  const [searchQuery, setSearchQuery] = useState("");
  const [fieldFilter, setFieldFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showStatusDropdown, setShowStatusDropdown] = useState(null);
  const [showAddToTrackerModal, setShowAddToTrackerModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [joiningData, setJoiningData] = useState(initialJoiningData);
  const [lineUpData, setLineUpData] = useState(initialLineUpData);
  const [noteText, setNoteText] = useState("");
  const [addToTrackerForm, setAddToTrackerForm] = useState({
    companyName: "",
    processName: "",
    dateOfJoining: "",
    revenue: "",
    status: "Joined",
    resume: null,
  });

  const filteredJoiningData = useMemo(() => {
    return joiningData.filter((item) => {
      const matchesSearch = searchQuery === "" || 
        Object.values(item).some((val) => 
          String(val).toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [joiningData, searchQuery, statusFilter]);

  const filteredLineUpData = useMemo(() => {
    return lineUpData.filter((item) => {
      const matchesSearch = searchQuery === "" || 
        Object.values(item).some((val) => 
          String(val).toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      
      const matchesDate = dateFilter === "all" || 
        (dateFilter === "custom" && startDate && endDate
          ? item.date >= startDate && item.date <= endDate
          : true);
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [lineUpData, searchQuery, statusFilter, dateFilter, startDate, endDate]);

  const handleStatusChange = (recordId, newStatus) => {
    if (activeTab === "joining") {
      setJoiningData((prev) =>
        prev.map((item) => (item.id === recordId ? { ...item, status: newStatus } : item))
      );
    } else {
      setLineUpData((prev) =>
        prev.map((item) => (item.id === recordId ? { ...item, status: newStatus } : item))
      );
    }
    setShowStatusDropdown(null);
  };

  const handleAddToTracker = (record) => {
    setCurrentRecord(record);
    setAddToTrackerForm({
      companyName: record.company,
      processName: "",
      dateOfJoining: "",
      revenue: "",
      status: "Joined",
      resume: null,
    });
    setShowAddToTrackerModal(true);
  };

  const handleSubmitAddToTracker = () => {
    // Add logic to add to joining tracker
    const newRecord = {
      id: joiningData.length + 1,
      name: currentRecord.name,
      mobileNo: currentRecord.mobileNo,
      location: "Mumbai",
      company: addToTrackerForm.companyName,
      process: addToTrackerForm.processName,
      doj: addToTrackerForm.dateOfJoining,
      status: addToTrackerForm.status,
      revenue: parseInt(addToTrackerForm.revenue) || 0,
    };
    setJoiningData((prev) => [...prev, newRecord]);
    setLineUpData((prev) => prev.filter((item) => item.id !== currentRecord.id));
    setShowAddToTrackerModal(false);
    setActiveTab("joining");
  };

  const handleEdit = (record) => {
    setCurrentRecord(record);
    setShowEditModal(true);
  };

  const handleDrop = (recordId) => {
    if (activeTab === "joining") {
      setJoiningData((prev) => prev.filter((item) => item.id !== recordId));
    } else {
      setLineUpData((prev) => prev.filter((item) => item.id !== recordId));
    }
  };

  const handleNote = (record) => {
    setCurrentRecord(record);
    setNoteText("");
    setShowNoteModal(true);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFieldFilter("all");
    setStatusFilter("all");
    setDateFilter("all");
    setStartDate("");
    setEndDate("");
  };

  const getStatusClass = (status) => {
    const statusMap = {
      Joined: "status-joined",
      Pending: "status-pending",
      "On-hold": "status-onhold",
      Drop: "status-drop",
      Pipeline: "status-pipeline",
      Hold: "status-hold",
    };
    return statusMap[status] || "";
  };

  const openWhatsApp = (mobileNo) => {
    window.open(`https://wa.me/91${mobileNo}`, "_blank");
  };

  return (
    <div className="emp-tracker-root">
      <aside className="dash-sidebar">
        <div className="dash-brand">
          <img src={logo} alt="logo" className="dash-logo" />
          <div className="dash-brand-name">Owh HR Solutions</div>
        </div>

        <div className="dash-sidebar-summary">
          <p className="summary-label">Tracker overview</p>
          <p className="summary-main">
            {activeTab === "joining"
              ? `${joiningData.length} joined • ${joiningData.filter((j) => j.status === "Joined").length} active`
              : `${lineUpData.length} in pipeline • ${lineUpData.filter((l) => l.status === "Pipeline").length} active`}
          </p>
          <p className="summary-sub">Track candidate progress.</p>
        </div>

        <nav className="dash-nav">
          <Link to="/employee-dashboard" className={`dash-nav-item ${location.pathname === "/employee-dashboard" ? "active" : ""}`}>
            <LayoutDashboard size={18} /> <span>Dashboard</span>
          </Link>
          <Link
            to="/employee-clients"
            className={`dash-nav-item ${location.pathname === "/employee-clients" ? "active" : ""}`}
          >
            <Users size={18} /> <span>Clients</span>
          </Link>
          <div className="nav-with-submenu">
            <button
              className={`dash-nav-item with-submenu ${location.pathname.includes("/employee-tracker") ? "active" : ""}`}
              onClick={() => {}}
            >
              <div className="nav-item-left">
                <UserCheck size={18} /> <span>Tracker</span>
              </div>
              <ChevronDown size={16} />
            </button>
            <div className="submenu">
              <Link
                to="/employee-tracker"
                className={`submenu-item ${activeTab === "joining" ? "active" : ""}`}
                onClick={() => setActiveTab("joining")}
              >
                <span>• Joining</span>
              </Link>
              <Link
                to="/employee-tracker"
                className={`submenu-item ${activeTab === "lineup" ? "active" : ""}`}
                onClick={() => setActiveTab("lineup")}
              >
                <span>• Line up</span>
              </Link>
            </div>
          </div>
          <Link
            to="/employee-data"
            className={`dash-nav-item ${location.pathname.includes("/employee-data") ? "active" : ""}`}
          >
            <Database size={18} /> <span>Data</span>
          </Link>
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

      <main className="emp-tracker-main">
        <header className="emp-tracker-header">
          <h1 className="emp-tracker-title">
            {activeTab === "joining" ? "Joining Tracker" : "Line up Tracker"}
          </h1>
        </header>

        <div className="emp-tracker-content">
          {/* Search and Filters */}
          <div className="emp-tracker-filters">
            <div className="emp-tracker-search-wrapper">
              <Search size={18} className="emp-tracker-search-icon" />
              <input
                type="text"
                className="emp-tracker-search-input"
                placeholder="Search across all the fields..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="emp-tracker-search-clear"
                  onClick={() => setSearchQuery("")}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="emp-tracker-filter-group">
              <select
                className="emp-tracker-filter-select"
                value={fieldFilter}
                onChange={(e) => setFieldFilter(e.target.value)}
              >
                <option value="all">Fields all</option>
                <option value="name">Name</option>
                <option value="mobile">Mobile No</option>
                <option value="company">Company</option>
                <option value="process">Process</option>
              </select>
            </div>

            <div className="emp-tracker-filter-group">
              <select
                className="emp-tracker-filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Status</option>
                {activeTab === "joining"
                  ? statusOptions.joining.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))
                  : statusOptions.lineup.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
              </select>
            </div>

            {activeTab === "lineup" && (
              <>
                <div className="emp-tracker-filter-group">
                  <select
                    className="emp-tracker-filter-select"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  >
                    <option value="all">Date</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
                {dateFilter === "custom" && (
                  <div className="emp-tracker-date-range">
                    <input
                      type="date"
                      className="emp-tracker-date-input"
                      placeholder="Start date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                    <input
                      type="date"
                      className="emp-tracker-date-input"
                      placeholder="End date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                )}
              </>
            )}

            <button className="emp-tracker-clear-btn" onClick={clearFilters}>
              Clear
            </button>
          </div>

          {/* Status Options for Line up */}
          {activeTab === "lineup" && (
            <div className="emp-tracker-status-options">
              <button
                className={`emp-tracker-status-btn ${statusFilter === "Hold" ? "active" : ""}`}
                onClick={() => setStatusFilter(statusFilter === "Hold" ? "all" : "Hold")}
              >
                • Hold
              </button>
              <button
                className={`emp-tracker-status-btn ${statusFilter === "Pipeline" ? "active" : ""}`}
                onClick={() => setStatusFilter(statusFilter === "Pipeline" ? "all" : "Pipeline")}
              >
                • Pipeline
              </button>
            </div>
          )}

          {/* Desktop Table View */}
          <div className="emp-tracker-table-wrapper">
            {activeTab === "joining" ? (
              <table className="emp-tracker-table">
                <thead>
                  <tr>
                    <th>Id</th>
                    <th>Name</th>
                    <th>Mobile No</th>
                    <th>Location</th>
                    <th>Company</th>
                    <th>Process</th>
                    <th>DOJ</th>
                    <th>Status</th>
                    <th>Revenue</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJoiningData.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>
                        <div className="name-with-resume">
                          <span>{item.name}</span>
                          {item.resume && (
                            <button
                              className="resume-icon-btn"
                              onClick={() => {
                                setSelectedResume(item.resume);
                                setShowResumeModal(true);
                              }}
                              title="View Resume"
                            >
                              <FileCheck size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="mobile-cell">
                          <span>{item.mobileNo}</span>
                          <button
                            className="whatsapp-btn"
                            onClick={() => openWhatsApp(item.mobileNo)}
                            title="Open WhatsApp"
                          >
                            <MessageCircle size={14} />
                          </button>
                        </div>
                      </td>
                      <td>{item.location}</td>
                      <td>{item.company}</td>
                      <td>{item.process}</td>
                      <td>{item.doj}</td>
                      <td>
                        <span className={`emp-tracker-status-badge ${getStatusClass(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>{item.revenue}</td>
                      <td>
                        <div className="emp-tracker-actions">
                          <button
                            className="emp-tracker-action-btn edit"
                            onClick={() => handleEdit(item)}
                          >
                            EDIT
                          </button>
                          {item.resume && (
                            <button
                              className="emp-tracker-action-btn view-resume"
                              onClick={() => {
                                setSelectedResume(item.resume);
                                setShowResumeModal(true);
                              }}
                            >
                              <FileCheck size={14} />
                              View Resume
                            </button>
                          )}
                          <div className="emp-tracker-dropdown-wrapper">
                            <button
                              className="emp-tracker-action-btn dropdown"
                              onClick={() =>
                                setShowStatusDropdown(
                                  showStatusDropdown === item.id ? null : item.id
                                )
                              }
                            >
                              Change status <ChevronDown size={14} />
                            </button>
                            {showStatusDropdown === item.id && (
                              <div className="emp-tracker-dropdown">
                                {statusOptions.joining.map((status) => (
                                  <button
                                    key={status}
                                    className="emp-tracker-dropdown-item"
                                    onClick={() => handleStatusChange(item.id, status)}
                                  >
                                    • {status}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="emp-tracker-table">
                <thead>
                  <tr>
                    <th>Id</th>
                    <th>Name</th>
                    <th>Mobile No</th>
                    <th>Company</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLineUpData.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>
                        <div className="name-with-resume">
                          <span>{item.name}</span>
                          {item.resume && (
                            <button
                              className="resume-icon-btn"
                              onClick={() => {
                                setSelectedResume(item.resume);
                                setShowResumeModal(true);
                              }}
                              title="View Resume"
                            >
                              <FileCheck size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="mobile-cell">
                          <span>{item.mobileNo}</span>
                          <button
                            className="whatsapp-btn"
                            onClick={() => openWhatsApp(item.mobileNo)}
                            title="Open WhatsApp"
                          >
                            <MessageCircle size={14} />
                          </button>
                        </div>
                      </td>
                      <td>{item.company}</td>
                      <td>{item.date}</td>
                      <td>
                        <div className="emp-tracker-actions">
                          {item.resume && (
                            <button
                              className="emp-tracker-action-btn view-resume"
                              onClick={() => {
                                setSelectedResume(item.resume);
                                setShowResumeModal(true);
                              }}
                            >
                              <FileCheck size={14} />
                              Resume
                            </button>
                          )}
                          <button
                            className="emp-tracker-action-btn drop"
                            onClick={() => handleDrop(item.id)}
                          >
                            Drop
                          </button>
                          <button
                            className="emp-tracker-action-btn add-tracker"
                            onClick={() => handleAddToTracker(item)}
                          >
                            Add to Tracker
                          </button>
                          <button
                            className="emp-tracker-action-btn note"
                            onClick={() => handleNote(item)}
                          >
                            NOTE
                          </button>
                          <button
                            className="emp-tracker-action-btn hold"
                            onClick={() => handleStatusChange(item.id, "Hold")}
                          >
                            Hold
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Mobile Card View */}
          <div className="emp-tracker-mobile-cards">
            {activeTab === "joining"
              ? filteredJoiningData.map((item) => (
                  <div key={item.id} className="emp-tracker-card">
                    <div className="emp-tracker-card-header">
                      <h3>{item.name}</h3>
                      <span className={`emp-tracker-status-badge ${getStatusClass(item.status)}`}>
                        Status: {item.status}
                      </span>
                    </div>
                    <div className="emp-tracker-card-body">
                      <div className="emp-tracker-card-item">
                        <span className="label">Id:</span>
                        <span className="value">#{item.id}</span>
                      </div>
                      <div className="emp-tracker-card-item">
                        <span className="label">Mobile:</span>
                        <div className="mobile-cell">
                          <span className="value">{item.mobileNo}</span>
                          <button
                            className="whatsapp-btn"
                            onClick={() => openWhatsApp(item.mobileNo)}
                          >
                            <MessageCircle size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="emp-tracker-card-item">
                        <span className="label">Location:</span>
                        <span className="value">{item.location}</span>
                      </div>
                      <div className="emp-tracker-card-item">
                        <span className="label">Company:</span>
                        <span className="value">{item.company}</span>
                      </div>
                      <div className="emp-tracker-card-item">
                        <span className="label">Process:</span>
                        <span className="value">{item.process}</span>
                      </div>
                      <div className="emp-tracker-card-item">
                        <span className="label">DOJ:</span>
                        <span className="value">{item.doj}</span>
                      </div>
                      <div className="emp-tracker-card-item">
                        <span className="label">Revenue:</span>
                        <span className="value">{item.revenue}</span>
                      </div>
                    </div>
                    <div className="emp-tracker-card-actions">
                      <div className="emp-tracker-dropdown-wrapper">
                        <button
                          className="emp-tracker-card-btn"
                          onClick={() =>
                            setShowStatusDropdown(
                              showStatusDropdown === item.id ? null : item.id
                            )
                          }
                        >
                          Change status
                        </button>
                        {showStatusDropdown === item.id && (
                          <div className="emp-tracker-dropdown">
                            {statusOptions.joining.map((status) => (
                              <button
                                key={status}
                                className="emp-tracker-dropdown-item"
                                onClick={() => handleStatusChange(item.id, status)}
                              >
                                • {status}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {item.resume && (
                        <button
                          className="emp-tracker-card-btn"
                          onClick={() => {
                            setSelectedResume(item.resume);
                            setShowResumeModal(true);
                          }}
                        >
                          <FileCheck size={16} />
                          View Resume
                        </button>
                      )}
                      <button
                        className="emp-tracker-card-btn"
                        onClick={() => handleEdit(item)}
                      >
                        EDIT
                      </button>
                    </div>
                  </div>
                ))
              : filteredLineUpData.map((item) => (
                  <div key={item.id} className="emp-tracker-card">
                    <div className="emp-tracker-card-header">
                      <h3>{item.name}</h3>
                      <span className={`emp-tracker-status-badge ${getStatusClass(item.status)}`}>
                        Status: {item.status}
                      </span>
                    </div>
                    <div className="emp-tracker-card-body">
                      <div className="emp-tracker-card-item">
                        <span className="label">Id:</span>
                        <span className="value">#{item.id}</span>
                      </div>
                      <div className="emp-tracker-card-item">
                        <span className="label">Mobile:</span>
                        <div className="mobile-cell">
                          <span className="value">{item.mobileNo}</span>
                          <button
                            className="whatsapp-btn"
                            onClick={() => openWhatsApp(item.mobileNo)}
                          >
                            <MessageCircle size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="emp-tracker-card-item">
                        <span className="label">Company:</span>
                        <span className="value">{item.company}</span>
                      </div>
                      <div className="emp-tracker-card-item">
                        <span className="label">Date:</span>
                        <span className="value">{item.date}</span>
                      </div>
                    </div>
                    <div className="emp-tracker-card-actions">
                      <button
                        className="emp-tracker-card-btn"
                        onClick={() => handleEdit(item)}
                      >
                        EDIT
                      </button>
                      <button
                        className="emp-tracker-card-btn"
                        onClick={() => handleStatusChange(item.id, "Hold")}
                      >
                        Hold
                      </button>
                      <button
                        className="emp-tracker-card-btn"
                        onClick={() => handleDrop(item.id)}
                      >
                        Drop
                      </button>
                      <button
                        className="emp-tracker-card-btn"
                        onClick={() => handleAddToTracker(item)}
                      >
                        Add to tracker
                      </button>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </main>

      {/* Add to Tracker Modal */}
      {showAddToTrackerModal && (
        <div className="emp-tracker-modal-overlay" onClick={() => setShowAddToTrackerModal(false)}>
          <div className="emp-tracker-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="emp-tracker-modal-header">
              <h2>Add to Joining Tracker</h2>
              <button
                className="emp-tracker-modal-close"
                onClick={() => setShowAddToTrackerModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="emp-tracker-modal-body">
              <p className="emp-tracker-modal-info">
                This page will help to be added to the joining tracker page.
              </p>
              <div className="emp-tracker-form-group">
                <label>Company Name *</label>
                <input
                  type="text"
                  value={addToTrackerForm.companyName}
                  onChange={(e) =>
                    setAddToTrackerForm({ ...addToTrackerForm, companyName: e.target.value })
                  }
                  className="emp-tracker-form-input"
                />
              </div>
              <div className="emp-tracker-form-group">
                <label>Process Name *</label>
                <input
                  type="text"
                  value={addToTrackerForm.processName}
                  onChange={(e) =>
                    setAddToTrackerForm({ ...addToTrackerForm, processName: e.target.value })
                  }
                  className="emp-tracker-form-input"
                />
              </div>
              <div className="emp-tracker-form-group">
                <label>Date of Joining *</label>
                <input
                  type="date"
                  value={addToTrackerForm.dateOfJoining}
                  onChange={(e) =>
                    setAddToTrackerForm({ ...addToTrackerForm, dateOfJoining: e.target.value })
                  }
                  className="emp-tracker-form-input"
                />
              </div>
              <div className="emp-tracker-form-group">
                <label>Revenue *</label>
                <input
                  type="number"
                  value={addToTrackerForm.revenue}
                  onChange={(e) =>
                    setAddToTrackerForm({ ...addToTrackerForm, revenue: e.target.value })
                  }
                  className="emp-tracker-form-input"
                />
              </div>
              <div className="emp-tracker-form-group">
                <label>Status *</label>
                <select
                  value={addToTrackerForm.status}
                  onChange={(e) =>
                    setAddToTrackerForm({ ...addToTrackerForm, status: e.target.value })
                  }
                  className="emp-tracker-form-input"
                >
                  <option value="Joined">Joined</option>
                  <option value="Pending">Pending</option>
                  <option value="On-hold">On-hold</option>
                  <option value="Drop">Drop</option>
                </select>
              </div>
              <div className="emp-tracker-form-group">
                <label>Add Resume (Optional)</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) =>
                    setAddToTrackerForm({ ...addToTrackerForm, resume: e.target.files[0] })
                  }
                  className="emp-tracker-form-input"
                />
              </div>
            </div>
            <div className="emp-tracker-modal-footer">
              <button
                className="emp-tracker-modal-btn secondary"
                onClick={() => setShowAddToTrackerModal(false)}
              >
                Cancel
              </button>
              <button
                className="emp-tracker-modal-btn primary"
                onClick={handleSubmitAddToTracker}
              >
                Add to Tracker
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && currentRecord && (
        <div className="emp-tracker-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="emp-tracker-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="emp-tracker-modal-header">
              <h2>Edit Record</h2>
              <button
                className="emp-tracker-modal-close"
                onClick={() => setShowEditModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="emp-tracker-modal-body">
              <p>Edit functionality will be implemented here.</p>
            </div>
            <div className="emp-tracker-modal-footer">
              <button
                className="emp-tracker-modal-btn primary"
                onClick={() => setShowEditModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && currentRecord && (
        <div className="emp-tracker-modal-overlay" onClick={() => setShowNoteModal(false)}>
          <div className="emp-tracker-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="emp-tracker-modal-header">
              <h2>Add Note - {currentRecord.name}</h2>
              <button
                className="emp-tracker-modal-close"
                onClick={() => setShowNoteModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="emp-tracker-modal-body">
              <div className="emp-tracker-form-group">
                <label>Note</label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="emp-tracker-form-textarea"
                  rows="5"
                  placeholder="Enter your note here..."
                />
              </div>
            </div>
            <div className="emp-tracker-modal-footer">
              <button
                className="emp-tracker-modal-btn secondary"
                onClick={() => setShowNoteModal(false)}
              >
                Cancel
              </button>
              <button
                className="emp-tracker-modal-btn primary"
                onClick={() => {
                  // Save note logic
                  setShowNoteModal(false);
                }}
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resume Modal */}
      {showResumeModal && selectedResume && (
        <div className="emp-tracker-modal-overlay" onClick={() => setShowResumeModal(false)}>
          <div className="emp-tracker-modal-content resume-modal" onClick={(e) => e.stopPropagation()}>
            <div className="emp-tracker-modal-header">
              <h2>
                <FileCheck size={20} />
                Resume Details
              </h2>
              <button
                className="emp-tracker-modal-close"
                onClick={() => setShowResumeModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="emp-tracker-modal-body">
              <div className="resume-preview-section">
                <div className="resume-file-icon">
                  <FileText size={48} />
                </div>
                <div className="resume-details">
                  <h3>{selectedResume.fileName}</h3>
                  <div className="resume-meta">
                    <div className="resume-meta-item">
                      <FileCheck size={16} />
                      <span>Uploaded: {selectedResume.uploadDate}</span>
                    </div>
                    <div className="resume-meta-item">
                      <FileText size={16} />
                      <span>Size: {selectedResume.size}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="resume-actions">
                <button
                  className="emp-tracker-modal-btn primary"
                  onClick={() => {
                    window.open(selectedResume.url, "_blank");
                  }}
                >
                  <Eye size={16} />
                  View Resume
                </button>
                <button
                  className="emp-tracker-modal-btn"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = selectedResume.url;
                    link.download = selectedResume.fileName;
                    link.click();
                  }}
                >
                  <Download size={16} />
                  Download Resume
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

