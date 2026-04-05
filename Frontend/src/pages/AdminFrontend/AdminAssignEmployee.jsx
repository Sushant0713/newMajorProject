import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAdminClientStore } from "../../store/AdminClientStore";
import AdminNavbar from "../../components/AdminNavbar";
import AdminHeader from "../../components/AdminHeader";
import "./AdminAssignEmployee.css";


export default function AdminAssignEmployee() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [designationFilter, setDesignationFilter] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState(new Set());
  const [selectedClients, setSelectedClients] = useState(new Set());
  const [isAssigning, setIsAssigning] = useState(false);
  
  const {
    availableEmployees,
    clients,
    fetchAvailableEmployees,
    fetchAllClients,
    bulkAssignEmployeesToClients,
    loading,
    error,
    clearError,
  } = useAdminClientStore();

  // Fetch data on component mount and when filters change
  useEffect(() => {
    clearError();
    fetchAvailableEmployees();
    fetchAllClients();
  }, [fetchAvailableEmployees, fetchAllClients, clearError, statusFilter, designationFilter]);

  // Apply dark mode
  // const filteredEmployees = useMemo(() => {
  //   // Only filter by search query since status and designation are now server-side filtered
  //   return availableEmployees.filter((emp) => {
  //     const matchesSearch =
  //       (emp.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
  //       (emp.employee_id?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
  //     return searchQuery === "" || matchesSearch;
  //   });
  // }, [availableEmployees, searchQuery]);

  // const filteredClients = useMemo(() => {
  //   return clients.filter((client) => {
  //     return (
  //       client.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       client.id?.toLowerCase().includes(searchQuery.toLowerCase())
  //     );
  //   });
  // }, [clients, searchQuery]);

    const filteredEmployees = useMemo(() => {
      if (!Array.isArray(availableEmployees)) return [];
      const query = searchQuery.toLowerCase();
      return availableEmployees.filter((emp) => {
        const matchesSearch =
          emp.full_name?.toLowerCase().includes(query) ||
          String(emp.employee_id)?.toLowerCase().includes(query);
        const matchesStatus = statusFilter === "" || emp.status === statusFilter;
        const matchesDesignation = designationFilter === "" || emp.designation === designationFilter;
        return matchesSearch && matchesStatus && matchesDesignation;
      });
    }, [availableEmployees, searchQuery, statusFilter, designationFilter]);
    
    const filteredClients = useMemo(() => {
      if (!Array.isArray(clients)) return [];
      const query = searchQuery.toLowerCase();
      return clients.filter((item) => {
        const matchesName = item.name?.toLowerCase().includes(query);
        const matchesId = String(item.id).toLowerCase().includes(query);
        return matchesName || matchesId;
      });
    }, [clients, searchQuery]);

  const toggleEmployeeSelection = (id) => {
    const newSelected = new Set(selectedEmployees);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedEmployees(newSelected);
  };

  const toggleClientSelection = (id) => {
    const newSelected = new Set(selectedClients);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedClients(newSelected);
  };

  const selectAllEmployees = (checked) => {
    if (checked) {
      setSelectedEmployees(new Set(filteredEmployees.map((e) => e.id)));
    } else {
      setSelectedEmployees(new Set());
    }
  };

  const selectAllClients = (checked) => {
    if (checked) {
      setSelectedClients(new Set(filteredClients.map((c) => c.id)));
    } else {
      setSelectedClients(new Set());
    }
  };

  const clearSelection = () => {
    setSelectedEmployees(new Set());
    setSelectedClients(new Set());
  };

  const handleAssign = async () => {
    if (selectedEmployees.size === 0 || selectedClients.size === 0) {
      alert("Please select at least one employee and one client.");
      return;
    }

    setIsAssigning(true);
    clearError();

    const employeeIds = Array.from(selectedEmployees);
    const clientIds = Array.from(selectedClients);

    try {
      const results = await bulkAssignEmployeesToClients(employeeIds, clientIds);
      
      if (results.failed === 0) {
        alert(
          `Successfully assigned ${selectedEmployees.size} employee(s) to ${selectedClients.size} client(s)!`
        );
        // Clear selections after successful assignment
        setSelectedEmployees(new Set());
        setSelectedClients(new Set());
        // Refresh data with current filters
        fetchAvailableEmployees();
        fetchAllClients();
      } else {
        alert(
          `Assignment completed with some errors.\nSuccess: ${results.success}\nFailed: ${results.failed}`
        );
      }
    } catch (err) {
      alert("An error occurred during assignment. Please try again.");
    } finally {
      setIsAssigning(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "assign-status-badge assign-status-active";
      case "inactive":
        return "assign-status-badge assign-status-inactive";
      case "pending":
        return "assign-status-badge assign-status-pending";
      default:
        return "assign-status-badge assign-status-active";
    }
  };

  const getStatusDotClass = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "assign-status-dot assign-status-dot-active";
      case "inactive":
        return "assign-status-dot assign-status-dot-inactive";
      case "pending":
        return "assign-status-dot assign-status-dot-pending";
      default:
        return "assign-status-dot assign-status-dot-active";
    }
  };

  const allEmployeesSelected =
    filteredEmployees.length > 0 && filteredEmployees.every((e) => selectedEmployees.has(e.id));
  const allClientsSelected =
    filteredClients.length > 0 && filteredClients.every((c) => selectedClients.has(c.id));

  return (
    <div className={`assign-page-root`}>
      {/* Sidebar */}
      <AdminNavbar />

      {/* Main Content */}
      <div className="assign-main-wrapper">
        {/* Header */}
        <AdminHeader
          title="Assign Employees to Clients"
          
        />

        {/* Filter Bar */}
        <div className="assign-filter-bar">
          <div className="assign-search-box">
            <span className="material-symbols-outlined assign-search-icon">search</span>
            <input
              type="text"
              className="assign-search-input"
              placeholder="Search employees or clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="assign-filter-group">
            <select
              className="assign-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
            <select
              className="assign-filter-select"
              value={designationFilter}
              onChange={(e) => setDesignationFilter(e.target.value)}
            >
              <option value="">All Designations</option>
              <option value="admin">Admin</option>
              <option value="employee">Employee</option>
              <option value="team_leader">Team Leader</option>
              <option value="salaryemp">Employee Salary</option>
              <option value="core">Core</option>
              <option value="manager">Manager</option>
              <option value="freelancer">Freelancer</option>
            </select>
          </div>
        </div>

        {/* Tables Section */}
        <div className="assign-tables-section">
          {/* Employees Table */}
          <div className="assign-table-card">
            <div className="assign-table-head">
              <h3 className="assign-table-title">Employees</h3>
              <span className="assign-select-count">
                {selectedEmployees.size} selected {loading && availableEmployees.length === 0 ? "(Loading...)" : ""}
              </span>
            </div>
            <div className="assign-table-body">
              <table className="assign-table">
                <thead>
                  <tr>
                    <th style={{ width: "50px" }}>
                      <input
                        type="checkbox"
                        checked={allEmployeesSelected}
                        onChange={(e) => selectAllEmployees(e.target.checked)}
                        disabled={isAssigning || loading}
                      />
                    </th>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Designation</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                        Loading employees...
                      </td>
                    </tr>
                  ) : filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                        No employees found
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp) => (
                      <tr key={emp.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedEmployees.has(emp.id)}
                            onChange={() => toggleEmployeeSelection(emp.id)}
                            disabled={isAssigning}
                          />
                        </td>
                        <td className="assign-cell-bold">{emp.employee_id || emp.id}</td>
                        <td>{emp.full_name || "N/A"}</td>
                        <td>
                          <span className={getStatusClass(emp.status)}>
                            <span className={getStatusDotClass(emp.status)}></span>
                            {emp.status || "Active"}
                          </span>
                        </td>
                        <td className="assign-cell-muted">{emp.designation || "N/A"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Clients Table */}
          <div className="assign-table-card">
            <div className="assign-table-head">
              <h3 className="assign-table-title">Clients</h3>
              <span className="assign-select-count">
                {selectedClients.size} selected {loading && clients.length === 0 ? "(Loading...)" : ""}
              </span>
            </div>
            <div className="assign-table-body">
              <table className="assign-table">
                <thead>
                  <tr>
                    <th style={{ width: "50px" }}>
                      <input
                        type="checkbox"
                        checked={allClientsSelected}
                        onChange={(e) => selectAllClients(e.target.checked)}
                        disabled={isAssigning || loading}
                      />
                    </th>
                    <th>Client ID</th>
                    <th>Client Name</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>
                        Loading clients...
                      </td>
                    </tr>
                  ) : filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>
                        No clients found
                      </td>
                    </tr>
                  ) : (
                    filteredClients.map((client) => (
                      <tr key={client.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedClients.has(client.id)}
                            onChange={() => toggleClientSelection(client.id)}
                            disabled={isAssigning}
                          />
                        </td>
                        <td className="assign-cell-bold">{client.id}</td>
                        <td>{client.name}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: "12px 24px",
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>error</span>
            {error}
          </div>
        )}

        {/* Action Footer */}
        <div className="assign-action-bar">
          <button 
            type="button" 
            className="assign-btn-secondary" 
            onClick={clearSelection}
            disabled={isAssigning || loading}
          >
            Clear Selection
          </button>
          <button 
            type="button" 
            className="assign-btn-primary" 
            onClick={handleAssign}
            disabled={isAssigning || loading || selectedEmployees.size === 0 || selectedClients.size === 0}
          >
            <span className="material-symbols-outlined">assignment_turned_in</span>
            {isAssigning ? "Assigning..." : "Assign Selected"}
          </button>
        </div>
      </div>
    </div>
  );
}

