import React, { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Users,
  BarChart2,
  Search,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MapPin,
  Users as UsersIcon,
  TrendingUp,
  FileText,
  Building2,
  Phone,
  Mail,
} from "lucide-react";
import "./EmployeeClient.css";
import { useEmployeeClientStore } from "../../store/EmployeeClientStore";
import EmployeeNavbar from "../../components/EmployeeNavbar.jsx";
import EmployeeHeader from "../../components/EmployeeHeader.jsx";

export default function EmployeeClient() {
  const empId = sessionStorage.getItem("userId");
  
  // Zustand store
  const {
    loading,
    error,
    processes,
    processDetails,
    contactPersonDetails,
    clientNames,
    locations,
    stats,
    fetchAllProcesses,
    fetchClientNames,
    fetchLocations,
    fetchStats,
    fetchProcessDetails,
    fetchContactPersonDetails,
  } = useEmployeeClientStore();

  const [selectedClient, setSelectedClient] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [hiringTypeFilter, setHiringTypeFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("processes"); 

  // Fetch data on component mount
  useEffect(() => {
    if (empId) {
      fetchAllProcesses(empId);
      fetchClientNames(empId);
      fetchLocations();
      fetchStats({employee_id: empId});
    }
  }, [empId]);

  const mappedProcesses = useMemo(() => {
    if (!processes || processes.length === 0) return [];
    
    return processes.map((p) => {
      const locationArray = p.locations ? p.locations.split(',').map(loc => loc.trim()) : [];
      const primaryLocation = locationArray[0] || '';
      
      return {
        id: p.id,
        processName: p.process_name || '',
        clientName: p.client_name || '',
        hiringType: p.hiring_type || '',
        openings: p.openings?.toString() || '0',
        salary: p.salary || '',
        approxRevenue: p.approx_revenue,
        location: primaryLocation,
        locations: locationArray, // Keep full array for filtering and display
      };
    });
  }, [processes]);

  // Fetch contact person details when contacts tab is active
  useEffect(() => {
    if (activeTab === "contacts" && contactPersonDetails.length === 0 && !loading) {
      fetchContactPersonDetails({employee_id: empId});
    }
  }, [activeTab]);

  const filteredAndSortedProcesses = useMemo(() => {
    let filtered = mappedProcesses.filter((process) => {
      const matchesSearch = process.processName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClient = selectedClient === "All" || process.clientName === selectedClient;
      const matchesHiringType = hiringTypeFilter === "All" || process.hiringType === hiringTypeFilter;
      const matchesLocation = locationFilter === "All" || 
        (process.locations && process.locations.includes(locationFilter));
      return matchesSearch && matchesClient && matchesHiringType && matchesLocation;
    });

    if (sortColumn) {
      filtered.sort((a, b) => {
        let aVal = a[sortColumn];
        let bVal = b[sortColumn];

        if (sortColumn === "openings") {
          aVal = parseInt(aVal);
          bVal = parseInt(bVal);
        } else {
          aVal = String(aVal).toLowerCase();
          bVal = String(bVal).toLowerCase();
        }

        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [mappedProcesses, searchQuery, selectedClient, hiringTypeFilter, locationFilter, sortColumn, sortDirection]);

  const paginatedProcesses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedProcesses.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedProcesses, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedProcesses.length / itemsPerPage);

  const displayStats = useMemo(() => {
    if (stats && stats.total_processes !== undefined) {
      return {
        total: stats.total_processes || 0,
        totalOpenings: stats.total_openings || 0,
        totalFilled: stats.filled_positions || 0,
        avgFillRate: stats.fill_rate ? parseFloat(stats.fill_rate).toFixed(1) : 0,
      };
    }
    // Fallback to calculated stats from filtered processes
    const total = filteredAndSortedProcesses.length;
    const totalOpenings = filteredAndSortedProcesses.reduce((sum, p) => sum + parseInt(p.openings || 0), 0);
    return { total, totalOpenings, totalFilled: 0, avgFillRate: 0 };
  }, [stats, filteredAndSortedProcesses]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleViewDetails = async (processId) => {
    setDetailsLoading(true);
    setShowDetailsModal(true);
    setSelectedProcess(processId);
    
    try {
      await fetchProcessDetails(processId);
    } catch (error) {
      console.error("Error fetching process details:", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const getSortIcon = (column) => {
    if (sortColumn !== column) return <ArrowUpDown size={14} />;
    return sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedClient("All");
    setHiringTypeFilter("All");
    setLocationFilter("All");
    setSortColumn(null);
    setSortDirection("asc");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || selectedClient !== "All" || hiringTypeFilter !== "All" || locationFilter !== "All";

  return (
    <div className="emp-client-root">
      <EmployeeNavbar />

      <main className="emp-client-main">
        <EmployeeHeader 
          title="Clients"
          subtitle="Manage your client processes, contacts, and hiring requirements"
        />

        <div className="emp-client-content">
          {/* Tabs */}
          <div className="emp-client-tabs">
            <button
              className={`emp-client-tab ${activeTab === "processes" ? "active" : ""}`}
              onClick={() => setActiveTab("processes")}
            >
              <FileText size={16} />
              Processes
            </button>
            <button
              className={`emp-client-tab ${activeTab === "clients" ? "active" : ""}`}
              onClick={() => setActiveTab("clients")}
            >
              <Building2 size={16} />
              Clients List
            </button>
            <button
              className={`emp-client-tab ${activeTab === "contacts" ? "active" : ""}`}
              onClick={() => setActiveTab("contacts")}
            >
              <Users size={16} />
              Contacts
            </button>
          </div>
          {/* Tab Content */}
          {activeTab === "processes" && (
            <>
              {/* Loading State */}
              {loading && (
                <div className="emp-client-loading">
                  <p>Loading processes...</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="emp-client-error">
                  <p>Error: {error}</p>
                </div>
              )}

              {/* Stats Cards */}
              {!loading && !error && (
                <div className="emp-client-stats">
                  <div className="emp-client-stat-card">
                    <div className="emp-client-stat-icon blue">
                      <FileText size={20} />
                    </div>
                    <div className="emp-client-stat-content">
                      <p className="emp-client-stat-label">Total Processes</p>
                      <p className="emp-client-stat-value">{displayStats.total}</p>
                    </div>
                  </div>
                  <div className="emp-client-stat-card">
                    <div className="emp-client-stat-icon green">
                      <UsersIcon size={20} />
                    </div>
                    <div className="emp-client-stat-content">
                      <p className="emp-client-stat-label">Total Openings</p>
                      <p className="emp-client-stat-value">{displayStats.totalOpenings}</p>
                    </div>
                  </div>
                  <div className="emp-client-stat-card">
                    <div className="emp-client-stat-icon purple">
                      <TrendingUp size={20} />
                    </div>
                    <div className="emp-client-stat-content">
                      <p className="emp-client-stat-label">Filled Positions</p>
                      <p className="emp-client-stat-value">{displayStats.totalFilled}</p>
                    </div>
                  </div>
                  <div className="emp-client-stat-card">
                    <div className="emp-client-stat-icon orange">
                      <BarChart2 size={20} />
                    </div>
                    <div className="emp-client-stat-content">
                      <p className="emp-client-stat-label">Fill Rate</p>
                      <p className="emp-client-stat-value">{displayStats.avgFillRate}%</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Filters Section - All in one row */}
              {!loading && !error && (
              <div className="emp-client-filters-row">
                <div className="emp-client-search-container">
                  <Search size={18} className="emp-client-search-icon" />
                  <input
                    type="text"
                    className="emp-client-search-input"
                    placeholder="Search process name..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                  {searchQuery && (
                    <button
                      className="emp-client-search-clear"
                      onClick={() => setSearchQuery("")}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                
                <select
                  className="emp-client-filter-select"
                  value={selectedClient}
                  onChange={(e) => {
                    setSelectedClient(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="All">All Clients</option>
                  {clientNames && clientNames.map((client) => (
                    <option
                      key={client.client_name}
                      value={client.client_name}
                    >
                      {client.client_name}
                    </option>
                  ))}
                </select>

                <select
                  className="emp-client-filter-select"
                  value={hiringTypeFilter}
                  onChange={(e) => {
                    setHiringTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="All">All Hiring Types</option>
                  <option value="Fresher">Fresher</option>
                  <option value="Experienced">Experienced</option>
                </select>

                <select
                  className="emp-client-filter-select"
                  value={locationFilter}
                  onChange={(e) => {
                    setLocationFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="All">All Locations</option>
                  {locations && locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>

                {hasActiveFilters && (
                  <button className="emp-client-clear-filters" onClick={clearFilters}>
                    <X size={16} />
                    Clear All
                  </button>
                )}
              </div>
              )}

              {/* Results Info */}
              {!loading && !error && filteredAndSortedProcesses.length > 0 && (
                <div className="emp-client-results-info">
                  <span>
                    Showing {paginatedProcesses.length} of {filteredAndSortedProcesses.length} processes
                  </span>
                </div>
              )}

              {!loading && !error && <div className="emp-client-divider"></div>}

              {/* Table */}
              {!loading && !error && filteredAndSortedProcesses.length > 0 ? (
                <>
                  <div className="emp-client-table-wrapper">
                    <table className="emp-client-table">
                      <thead>
                        <tr>
                          <th onClick={() => handleSort("processName")} className="sortable">
                            <div className="th-content">
                              Process Name {getSortIcon("processName")}
                            </div>
                          </th>
                          <th onClick={() => handleSort("clientName")} className="sortable">
                            <div className="th-content">
                              Client Name {getSortIcon("clientName")}
                            </div>
                          </th>
                          <th onClick={() => handleSort("hiringType")} className="sortable">
                            <div className="th-content">
                              Hiring Type {getSortIcon("hiringType")}
                            </div>
                          </th>
                          <th onClick={() => handleSort("openings")} className="sortable">
                            <div className="th-content">
                              No. of Openings {getSortIcon("openings")}
                            </div>
                          </th>
                          <th onClick={() => handleSort("salary")} className="sortable">
                            <div className="th-content">
                              Salary {getSortIcon("salary")}
                            </div>
                          </th>
                          <th onClick={() => handleSort("revenue")} className="sortable">
                            <div className="th-content">
                              Revenue {getSortIcon("revenue")}
                            </div>
                          </th>
                          <th onClick={() => handleSort("location")} className="sortable">
                            <div className="th-content">
                              Location(s) {getSortIcon("location")}
                            </div>
                          </th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedProcesses.map((process) => (
                          <tr key={process.id}>
                            <td className="process-name-cell">{process.processName}</td>
                            <td>{process.clientName}</td>
                            <td>
                              <span className={`emp-client-badge ${process.hiringType.toLowerCase()}`}>
                                {process.hiringType}
                              </span>
                            </td>
                            <td>{process.openings}</td>
                            <td>₹{process.salary}</td>
                            <td>₹{process.approxRevenue.toLocaleString()}</td>
                            <td>
                              <div className="location-cell">
                                <MapPin size={14} />
                                {process.locations && process.locations.length > 0 
                                  ? process.locations.join(", ")
                                  : process.location || "N/A"}
                              </div>
                            </td>
                            <td>
                              <button
                                className="emp-client-view-btn"
                                onClick={() => handleViewDetails(process.id)}
                              >
                                View details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="emp-client-pagination">
                      <div className="emp-client-pagination-info">
                        <span>
                          Page {currentPage} of {totalPages}
                        </span>
                        <select
                          className="emp-client-page-size"
                          value={itemsPerPage}
                          onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                        >
                          <option value={5}>5 per page</option>
                          <option value={10}>10 per page</option>
                          <option value={20}>20 per page</option>
                          <option value={50}>50 per page</option>
                        </select>
                      </div>
                      <div className="emp-client-pagination-buttons">
                        <button
                          className="emp-client-pagination-btn"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            className={`emp-client-pagination-btn ${currentPage === page ? "active" : ""}`}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          className="emp-client-pagination-btn"
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="emp-client-empty">
                  <FileText size={48} />
                  <h3>No processes found</h3>
                  <p>Try adjusting your filters or search query</p>
                  {hasActiveFilters && (
                    <button className="emp-client-clear-filters-btn" onClick={clearFilters}>
                      Clear Filters
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === "clients" && (
            <div className="emp-client-tab-content">
              <div className="emp-client-list-header">
                <h3>All Clients ({clientNames?.length || 0})</h3>
              </div>
              <div className="emp-client-list-grid">
                {clientNames && clientNames.map((client, index) => {
                  return (
                    <div key={index} className="emp-client-card">
                      <div className="emp-client-card-header">
                        <div className="emp-client-card-icon">
                          <Building2 size={24} />
                        </div>
                        <h4>{client.client_name}</h4>
                        <p>₹{Number(client.approx_revenue).toLocaleString()}</p>
                      </div>
                      <div className="emp-client-card-body">
                        <div className="emp-client-card-stat">
                          <span className="emp-client-card-stat-label">Processes</span>
                          <span className="emp-client-card-stat-value">
                            {client.processCount}
                          </span>
                        </div>
                        <div className="emp-client-card-stat">
                          <span className="emp-client-card-stat-label">Status</span>
                          <span className="emp-client-card-badge active">Active</span>
                        </div>
                      </div>
                      <div className="emp-client-card-footer">
                        <button
                          className="emp-client-card-btn"
                          onClick={() => {
                            setSelectedClient(client.client_name);
                            setActiveTab("processes");
                          }}
                        >
                          View Processes
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "contacts" && (
            <div className="emp-client-tab-content">
              <div className="emp-client-list-header">
                <h3>Client Contacts</h3>
              </div>
              {loading ? (
                <div className="emp-client-loading">
                  <p>Loading contacts...</p>
                </div>
              ) : error ? (
                <div className="emp-client-error">
                  <p>Error: {error}</p>
                </div>
              ) : (
                <div className="emp-client-contacts-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Client Name</th>
                        <th>Contact Person</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contactPersonDetails && contactPersonDetails.length > 0 ? (
                        contactPersonDetails.map((contact, index) => (
                          <tr key={index}>
                            <td>{contact.client_name || "N/A"}</td>
                            <td>{contact.cp_name || "N/A"}</td>
                            <td>{contact.cp_email || "N/A"}</td>
                            <td>{contact.cp_phone || "N/A"}</td>
                            <td>
                              <div className="emp-client-contact-actions">
                                {contact.cp_email && (
                                  <a
                                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${contact.cp_email}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="emp-client-contact-action"
                                  >
                                    <Mail size={16} />
                                  </a>
                                )}
                                {contact.cp_phone && (
                                  <a href={`tel:${contact.cp_phone}`} className="emp-client-contact-action">
                                    <Phone size={16} />
                                  </a>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                            No contacts available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>


      {/* Details Modal */}
      {showDetailsModal && selectedProcess && (
        <div className="emp-client-modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="emp-client-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="emp-client-modal-header">
              <h2>Process Details</h2>
              {/* <button
                className="emp-client-modal-close"
                onClick={() => setShowDetailsModal(false)}
              >
                <X size={20} />
              </button> */}
            </div>
            <div className="emp-client-modal-body">
              {detailsLoading ? (
                <div className="emp-client-loading">
                  <p>Loading process details...</p>
                </div>
              ) : processDetails ? (
                <>
                  <div className="emp-client-detail-section">
                    <h3>
                      <FileText size={18} style={{ marginRight: "8px" }} />
                      {processDetails.process_name}
                    </h3>
                    <div className="emp-client-detail-description">
                      <label>Description</label>
                      <p>{processDetails.process_description}</p>
                    </div>
                    <div className="emp-client-detail-grid">
                      <div className="emp-client-detail-item">
                        <label>Client Name</label>
                        <span>{processDetails.client_name}</span>
                      </div>
                      <div className="emp-client-detail-item">
                        <label>Hiring Type</label>
                        <span className={`emp-client-badge ${(processDetails.hiring_type).toLowerCase()}`}>
                          {processDetails.hiring_type}
                        </span>
                      </div>
                      <div className="emp-client-detail-item">
                        <label>Total Openings</label>
                        <span>{processDetails.openings}</span>
                      </div>
                      <div className="emp-client-detail-item">
                        <label>Salary</label>
                        <span>{processDetails.salary}</span>
                      </div>
                      <div className="emp-client-detail-item">
                        <label>Locations</label>
                        <span>
                          <MapPin size={14} style={{ marginRight: "4px" }} />
                          {processDetails.locations ? processDetails.locations.split(',').map(loc => loc.trim()).join(", ") : "N/A"}
                        </span>
                      </div>
                      <div className="emp-client-detail-item">
                        <label>Payout Type</label>
                        <span>{processDetails.payout_type}</span>
                      </div>
                      <div className="emp-client-detail-item">
                        <label>Status</label>
                        <span className={`emp-client-status-badge ${(processDetails.status).toLowerCase()}`}>
                          {processDetails.status}
                        </span>
                      </div>
                      <div className="emp-client-detail-item">
                        <label>Interview Dates</label>
                        <span>{processDetails.interview_dates}</span>
                      </div>
                      <div className="emp-client-detail-item">
                        <label>Clawback Duration</label>
                        <span>{processDetails.clawback_duration}</span>
                      </div>
                      <div className="emp-client-detail-item">
                        <label>Invoice Clear Time</label>
                        <span>{processDetails.invoice_clear_time}</span>
                      </div>
                      <div className="emp-client-detail-item">
                        <label>Created At</label>
                        <span>{new Date(processDetails.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="emp-client-detail-item">
                        <label>Updated At</label>
                        <span>{new Date(processDetails.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {processDetails.requirements && (
                      <div className="emp-client-detail-item full-width" style={{ background: "transparent", border: "none", padding: "0" }}>
                        <label style={{ marginBottom: "12px" }}>Requirements</label>
                        <div style={{ 
                          whiteSpace: "pre-wrap", 
                          padding: "16px", 
                          background: "#f9fafb", 
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          lineHeight: "1.7",
                          fontSize: "14px",
                          color: "#374151"
                        }}>
                          {processDetails.requirements}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="emp-client-detail-section">
                    <h3>
                      <Building2 size={18} style={{ marginRight: "8px" }} />
                      Client Information
                    </h3>
                    <div className="emp-client-detail-grid">
                      <div className="emp-client-detail-item">
                        <label>Contact Person</label>
                        <span>{processDetails.cp_name ? processDetails.cp_name : "N/A"}</span>
                      </div>
                      <div className="emp-client-detail-item">
                        <label>Email</label>
                        <span>{processDetails.cp_email ? processDetails.cp_email : "N/A"}</span>
                      </div>
                      <div className="emp-client-detail-item">
                        <label>Phone</label>
                        <span>{processDetails.cp_phone ? processDetails.cp_phone : "N/A"}</span>
                      </div>
                      <div className="emp-client-detail-item full-width">
                        <label>Address</label>
                        <span>{processDetails.address ? processDetails.address : "N/A"}</span>
                      </div>
                      <div className="emp-client-detail-item">
                        <label>Website</label>
                        <a href={processDetails.website} target="_blank" rel="noopener noreferrer" style={{ color: "#7c3aed" }}>
                          {processDetails.website ? processDetails.website : "N/A"}
                        </a>
                      </div>
                    </div>
                  </div>
                  {processDetails.spocs && Array.isArray(processDetails.spocs) && processDetails.spocs.length > 0 && (
                    <div className="emp-client-detail-section">
                      <h3>
                        <Users size={18} style={{ marginRight: "8px" }} />
                        SPOCs (Single Point of Contacts)
                      </h3>
                      <div className="emp-client-spocs-list">
                        {processDetails.spocs.map((spoc, index) => (
                          <div key={index} className="emp-client-spoc-item">
                            <div className="emp-client-detail-grid">
                              <div className="emp-client-detail-item">
                                <label>Name</label>
                                <span>{spoc.name}</span>
                              </div>
                              <div className="emp-client-detail-item">
                                <label>Role</label>
                                <span>{spoc.role}</span>
                              </div>
                              <div className="emp-client-detail-item">
                                <label>Email</label>
                                <span>{spoc.email}</span>
                              </div>
                              <div className="emp-client-detail-item">
                                <label>Phone</label>
                                <span>{spoc.phone}</span>
                              </div>
                              {spoc.note && (
                                <div className="emp-client-detail-item full-width">
                                  <label>Note</label>
                                  <span>{spoc.note}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="emp-client-error">
                  <p>Failed to load process details</p>
                </div>
              )}
            </div>
            <div className="emp-client-modal-footer">
              <button
                className="emp-client-modal-btn secondary"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedProcess(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

