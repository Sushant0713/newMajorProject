import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./AdminClient.css";
import { useAdminClientStore } from "../../store/AdminClientStore.js";
import AdminNavbar from "../../components/AdminNavbar.jsx";
import AdminHeader from "../../components/AdminHeader.jsx";


export default function AdminClient() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("table"); // "table" or "card"
  const [statusFilter, setStatusFilter] = useState("All");
  
  const {
    clients,
    fetchAllClients,
    deleteClient,
    loading,
    error,
    clearError,
  } = useAdminClientStore();

  useEffect(() => {
    fetchAllClients();
  }, []);

  // Apply dark mode
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus =
      statusFilter === "All" ||
      client.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "pill-green";
      case "inactive":
        return "pill-red";
      case "pending":
        return "pill-yellow";
      default:
        return "pill-green";
    }
  };

  const getIconBgClass = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "icon-bg-blue";
      case "inactive":
        return "icon-bg-gray";
      case "pending":
        return "icon-bg-yellow";
      default:
        return "icon-bg-blue";
    }
  };

  const handleDelete = async (clientId, clientName) => {
    if (window.confirm(`Are you sure you want to delete "${clientName}"? This action cannot be undone.`)) {
      clearError();
      await deleteClient(clientId);
    }
  };

  const handleEdit = (clientId) => {
    navigate(`/admin-edit-client/${clientId}`);
  };

  const handleView = (clientId) => {
    navigate(`/admin-client-details/${clientId}`);
  };

  const handleAssign = (clientId) => {
    navigate(`/admin-assign-employee?clientId=${clientId}`);
  };

  const handleViewProcesses = (clientName) => {
    navigate("/admin-process", {
      state: { clientName }
    });
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredClients.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredClients, currentPage]);
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  return (
    <div className={`admin-client-root`}>
      {/* Sidebar */}
      <AdminNavbar />

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <AdminHeader
          title="Clients"
          
        />

        {/* Content */}
        <div className="client-content">
          {/* Error Message */}
          {error && (
            <div style={{
              padding: "12px 16px",
              marginBottom: "16px",
              backgroundColor: "#fee",
              border: "1px solid #fcc",
              borderRadius: "8px",
              color: "#c33"
            }}>
              {error}
            </div>
          )}
          
          <div className="top-section-btn">
            <Link to="/admin-add-client" className="add-client-btn">
              <span className="material-symbols-outlined">add</span>
              Add New Client
            </Link>
          </div>

          {/* Search and Filter Bar */}
          <div className="filter-bar">
            <div className="search-container">
              <span className="material-symbols-outlined search-icon">search</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search by client name, contact, or process..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="filter-actions">
              <div className="status-filters">
                {["All", "Active", "Inactive"].map((status) => (
                  <button
                    key={status}
                    className={`filter-btn ${statusFilter === status ? "active" : ""}`}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <div className="view-toggle">
                <span className="view-label">Table View</span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={viewMode === "card"}
                    onChange={() => setViewMode(viewMode === "table" ? "card" : "table")}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <span className="view-label">Card View</span>
              </div>
            </div>
          </div>

          {/* Table View */}
          {viewMode === "table" && (
            <div className="table-container">
              <table className="clients-table">
                <thead>
                  <tr>
                    <th>Client Name</th>
                    <th>Status</th>
                    <th>Processes</th>
                    <th>Contact Person</th>
                    <th>Contact Info</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((client) => (
                    <tr key={client.id}>
                      <td className="client-name">{client.name}</td>
                      <td>
                        <span className={`pill ${getStatusClass(client.status)}`}>
                          {client.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="process-link"
                          onClick={() => handleViewProcesses(client.name)}
                        >
                          {client.processes} Processes
                        </button>
                      </td>
                      <td>{client.contactPerson}</td>
                      <td>
                        <div className="contact-info">
                          <span className="email" title={client.email}>
                            {client.email}
                          </span>
                          <span className="phone">{client.phone}</span>
                        </div>
                      </td>
                      <td className="actions-cell">
                        <div className="action-buttons">
                          <button 
                            className="action-btn view" 
                            title="View"
                            onClick={() => handleView(client.id)}
                          >
                            <span className="material-symbols-outlined">visibility</span>
                          </button>
                          <button 
                            className="action-btn edit" 
                            title="Edit"
                            onClick={() => handleEdit(client.id)}
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button 
                            className="action-btn delete" 
                            title="Delete"
                            onClick={() => handleDelete(client.id, client.name)}
                            disabled={loading}
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                          <button 
                            className="action-btn assign" 
                            title="Assign"
                            onClick={() => handleAssign(client.id)}
                          >
                            <span className="material-symbols-outlined">assignment_ind</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="pagination">
                <span className="pagination-info">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <div className="pagination-buttons">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`pagination-btn ${currentPage === page ? "active" : ""}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    Next
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Card View */}
          {viewMode === "card" && (
            <div className="cards-grid">
              {filteredClients.map((client) => (
                <div key={client.id} className="client-card">
                  <div className="card-header">
                    <span className={`material-symbols-outlined card-icon ${getIconBgClass(client.status)}`}>
                      business
                    </span>
                    <div className="card-title-section">
                      <h3 className="card-title">{client.name}</h3>
                      <span className={`pill ${getStatusClass(client.status)}`}>
                        {client.status}
                      </span>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="card-info">
                      Processes:{" "}
                      <button 
                        className="process-link"
                        onClick={() => handleViewProcesses(client.name)}
                      >
                        {client.processes} Processes
                      </button>
                    </div>
                    <div className="card-info">
                      Contact: <span className="font-medium">{client.contactPerson}</span>
                    </div>
                    <div className="card-info email" title={client.email}>
                      {client.email}
                    </div>
                    <div className="card-info">{client.phone}</div>
                  </div>
                  <div className="card-actions">
                    <button 
                      className="action-btn view" 
                      title="View Client"
                      onClick={() => handleView(client.id)}
                    >
                      <span className="material-symbols-outlined">visibility</span>
                    </button>
                    <button 
                      className="action-btn edit" 
                      title="Edit Client"
                      onClick={() => handleEdit(client.id)}
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button 
                      className="action-btn delete" 
                      title="Delete Client"
                      onClick={() => handleDelete(client.id, client.name)}
                      disabled={loading}
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
