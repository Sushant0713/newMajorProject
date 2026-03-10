import React, { useState, useMemo, useEffect } from "react";
import { useAdminDataStore } from "../../store/AdminDataStore";
import AdminNavbar from "../../components/AdminNavbar";
import AdminHeader from "../../components/AdminHeader";
import "./AdminAssignEmployee.css";


const AdminDataAssign = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [designationFilter, setDesignationFilter] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState(new Set());
  const [selectedDataTypes, setSelectedDataTypes] = useState(new Set());
  const [isAssigning, setIsAssigning] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const {loading, error, availableEmployees, fetchAvailableEmployees, dataTypes, fetchDataTypes, bulkAssignDataTypesToEmployees} = useAdminDataStore();

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchAvailableEmployees();
    fetchDataTypes();
  }, [fetchAvailableEmployees, fetchDataTypes]);

  // Apply dark mode
  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

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
  
  const filteredDataTypes = useMemo(() => {
    if (!Array.isArray(dataTypes)) return [];
    const query = searchQuery.toLowerCase();
    return dataTypes.filter((item) => {
      const matchesName = item.type_name?.toLowerCase().includes(query);
      const matchesId = String(item.id).toLowerCase().includes(query);
      return matchesName || matchesId;
    });
  }, [dataTypes, searchQuery]);

  const toggleEmployeeSelection = (id) => {
    const newSelected = new Set(selectedEmployees);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedEmployees(newSelected);
  };

  const toggleDataTypeSelection = (id) => {
    const newSelected = new Set(selectedDataTypes);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedDataTypes(newSelected);
  };

  const selectAllEmployees = (checked) => {
    if (checked) {
      setSelectedEmployees(new Set(filteredEmployees.map((e) => e.id)));
    } else {
      setSelectedEmployees(new Set());
    }
  };

  const selectAllDataTypes = (checked) => {
    if (checked) {
      setSelectedDataTypes(new Set(filteredDataTypes.map((d) => d.id)));
    } else {
      setSelectedDataTypes(new Set());
    }
  };

  const clearSelection = () => {
    setSelectedEmployees(new Set());
    setSelectedDataTypes(new Set());
  };

  const handleAssign = async () => {
    if (selectedEmployees.size === 0 || selectedDataTypes.size === 0) {
      alert("Please select at least one employee and one client.");
      return;
    }

    setIsAssigning(true);

    const employeeIds = Array.from(selectedEmployees);
    const dataTypeIds = Array.from(selectedDataTypes);

    try {
      const results = await bulkAssignDataTypesToEmployees(employeeIds, dataTypeIds);
      
      if (results.failed === 0) {
        alert(
          `Successfully assigned ${selectedEmployees.size} employee(s) to ${selectedDataTypes.size} data type(s)!`
        );
        // Clear selections after successful assignment
        setSelectedEmployees(new Set());
        setSelectedDataTypes(new Set());
        // Refresh data with current filters
        fetchAvailableEmployees({ status: statusFilter, designation: designationFilter });
        fetchDataTypes();
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

  const allEmployeesSelected = filteredEmployees.length > 0 && filteredEmployees.every((e) => selectedEmployees.has(e.id));
  const allDataTypesSelected = filteredDataTypes.length > 0 && filteredDataTypes.every((d) => selectedDataTypes.has(d.id));

  return (
    <div className={`assign-page-root ${darkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <AdminNavbar />

      {/* Main Content */}
      <div className="assign-main-wrapper">
        {/* Header */}
        <AdminHeader
          title="Assign Employees to Data types"
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        {/* Filter Bar */}
        <div className="assign-filter-bar">
          <div className="assign-search-box">
            <span className="material-symbols-outlined assign-search-icon">search</span>
            <input
              type="text"
              className="assign-search-input"
              placeholder="Search employees or data types..."
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

          {/* Data Types Table */}
          <div className="assign-table-card">
            <div className="assign-table-head">
              <h3 className="assign-table-title">Data Types</h3>
              <span className="assign-select-count">
                {selectedDataTypes.size} selected {loading && dataTypes.length === 0 ? "(Loading...)" : ""}
              </span>
            </div>
            <div className="assign-table-body">
              <table className="assign-table">
                <thead>
                  <tr>
                    <th style={{ width: "50px" }}>
                      <input
                        type="checkbox"
                        checked={allDataTypesSelected}
                        onChange={(e) => selectAllDataTypes(e.target.checked)}
                        disabled={isAssigning || loading}
                      />
                    </th>
                    <th>Data Type ID</th>
                    <th>Data Type Name</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && filteredDataTypes.length === 0 ? (
                    <tr>
                      <td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>
                        Loading data types...
                      </td>
                    </tr>
                  ) : filteredDataTypes.length === 0 ? (
                    <tr>
                      <td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>
                        No data types found
                      </td>
                    </tr>
                  ) : (
                    filteredDataTypes.map((dataType) => (
                      <tr key={dataType.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedDataTypes.has(dataType.id)}
                            onChange={() => toggleDataTypeSelection(dataType.id)}
                            disabled={isAssigning}
                          />
                        </td>
                        <td className="assign-cell-bold">{dataType.id}</td>
                        <td>{dataType.type_name}</td>
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
            disabled={isAssigning || loading || selectedEmployees.size === 0 || selectedDataTypes.size === 0}
          >
            <span className="material-symbols-outlined">assignment_turned_in</span>
            {isAssigning ? "Assigning..." : "Assign Selected"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminDataAssign