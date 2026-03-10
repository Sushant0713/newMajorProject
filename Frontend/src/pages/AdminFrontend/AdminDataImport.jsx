import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDataImport.css";
import {
  FaBriefcase,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaPauseCircle,
  FaHourglassHalf,
  FaDatabase,
  FaTasks,
  FaCloudUploadAlt,
  FaPlus,
  FaEye,
  FaChevronDown,
  FaArrowRight,
  FaDownload,
  FaInfoCircle,
  FaEdit,
  FaListUl,
} from "react-icons/fa";
import AdminNavbar from "../../components/AdminNavbar";
import AdminHeader from "../../components/AdminHeader";
import { useAdminDataStore } from "../../store/AdminDataStore";
import { useEffect } from "react";

const AdminDataImport = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showNewTypeModal, setShowNewTypeModal] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeDescription, setNewTypeDescription] = useState('');
  const [employeeViewLimit, setEmployeeViewLimit] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [search, setSearch] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editform, setEditForm] = useState({
    type_id : "",
    type_name: "",
    description: "",
    is_active: true,
    employee_view_limit: ""
  });
  const [openDropdown, setOpenDropdown] = useState(null);

  const { importCandidates, loading, error, insertedRecords, duplicateCandidates, invalidCandidates, dataTypes, fetchDataTypes, 
    addNewDataType, stats, fetchStats, employeeWorkload, dataTypeOverview, fetchDataTypeOverview, dataTypeDetails, fetchDataTypeDetails, 
    updateDataType, fetchEmployeeWorkload, exportCandidateCSV } = useAdminDataStore();

  useEffect(() => {
    fetchDataTypes();
    fetchStats();
    fetchEmployeeWorkload();
    fetchDataTypeOverview();
  }, []);
  const admin_id = sessionStorage.getItem('userId');
  const admin_name = sessionStorage.getItem('username');

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }

    await importCandidates({
      file: selectedFile,
      employee_id: admin_id,
      data_type_id: selectedTypeId,
    });
  };

  const openNewTypeModal = () => {
    setShowNewTypeModal(true);
  };

  const closeNewTypeModal = () => {
    setShowNewTypeModal(false);
    setNewTypeName('');
    setNewTypeDescription('');
    setEmployeeViewLimit('');
  };

  const handleAddNewType = async () => {
    if (!newTypeName.trim() || !employeeViewLimit) return;
    await addNewDataType({
      type_name: newTypeName.trim(),
      description: newTypeDescription.trim(),
      employee_view_limit: Number(employeeViewLimit),
      created_by: admin_name,
    });
    await fetchDataTypes();
    closeNewTypeModal();
  };

  const handleViewUploadFormat = () => {
    window.open(
      "http://localhost:5000/uploads/UploadFormat.xlsx",
      "_blank"
    );
  };

  const handleFilter = () => {
    fetchEmployeeWorkload(search);
  };

  const handleClearFilter = () => {
    fetchEmployeeWorkload();
    setSearch("");
  }

  const openViewModal = async(dt) => {
    await fetchDataTypeDetails({data_type_id: dt.data_type_id});
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
  };

  const openEditModal = async (dt) => {
    console.log(dt);
    const details = await fetchDataTypeDetails({data_type_id: dt.data_type_id});
    console.log(dataTypeDetails);
    setEditForm({
      type_id: details.id,
      type_name: details.type_name || "",
      description: details.description || "",
      is_active: details.is_active ?? true,
      employee_view_limit: details.employee_view_limit || ""
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditForm({
      type_id: "",
      type_name: "",
      description: "",
      is_active: true,
      employee_view_limit: ""
    });
  };

  const handleEdiDataType = async() => {
    if (!editform.type_name.trim() || !editform.employee_view_limit){
      alert('Please fill in required fields');
      return; 
    }
    await updateDataType({
      data_type_id: editform.type_id,
      type_name: editform.type_name,
      description: editform.description,
      is_active: editform.is_active,
      employee_view_limit: editform.employee_view_limit,
    });
    setShowEditModal(false);
    setEditForm({
      type_id: "",
      type_name: "",
      description: "",
      is_active: true,
      employee_view_limit: ""
    });
    fetchDataTypes();
  };

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const handleViewLineupTracker = (emp) => {
    navigate("/admin-lineup-tracker", {
      state: {
        employeeName: emp.full_name
      }
    });
  };

  const handleViewJoiningTracker = (emp) => {
    navigate("/admin-joining-tracker", {
      state: {
        employeeName: emp.full_name
      }
    });
  };

  const handleExportCSV = async () => {
    const result = await exportCandidateCSV({data_type_id: selectedTypeId});
    if (result?.success) {
      showToast("success", "CSV exported successfully!");
    }
    setShowExportModal(false);
    setSelectedTypeId("");
  };

  return (
    <div className="admin-container">
      {/* SIDEBAR */}
      <AdminNavbar/>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* Header */}
        <AdminHeader
          title="Data Import"
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        <div className="data-content">
            <div className="dataType-export-btn">
              <button className="btn-secondary" onClick={() => setShowExportModal(true)}>
                <span className="material-symbols-outlined">download</span>
                Export CSV
              </button>
            </div>

            {/* KPI */}
            <h4 className="section-title">Key Performance Indicators</h4>
            <div className="kpi-row">
              <div className="kpi blue" onClick={() => navigate('/admin-pass-candidates')}><FaCheckCircle /> Current pass candidate – {stats?.passedCandidates || 0}</div>
              <div className="kpi red" onClick={() => navigate('/admin-drop-candidates')}><FaTimesCircle /> Dropout – {stats?.droppedCandidates || 0}</div>
              <div className="kpi yellow"><FaPauseCircle /> Hold – {stats?.holdCandidates || 0}</div>
              <div className="kpi purple"><FaHourglassHalf /> Pipeline – {stats?.pipelinedCandidates || 0}</div>
              <div className="kpi green"><FaUsers /> Total Candidates – {stats?.totalCandidates || 0}</div>
              <div className="kpi indigo"><FaDatabase /> Available Data – {stats?.availableCandidates || 0}</div>
              <div className="kpi cyan"><FaTasks /> Assigned – {stats?.assignedCandidates || 0}</div>
            </div>

            {/* CONTENT ROW */}
            <div className="content-row">
              {/* UPLOAD */}
              <div className="card">
                <h3><FaCloudUploadAlt /> Upload Excel Data</h3>

                <div className="btn-row">
                  <button className="btn-primary" onClick={openNewTypeModal}><FaPlus /> New Type</button>
                  <select
                    className="btn-outline"
                    value={selectedTypeId}
                    onChange={(e) => setSelectedTypeId(e.target.value)}
                  >
                    <option value="">-- Choose a type --</option>
                    {dataTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.type_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="upload-box">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden-file-input"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                  />

                  <i className="fas fa-file-excel upload-icon"></i>

                  <p className="title">
                    {selectedFile ? selectedFile.name : 'No file selected'}
                  </p>

                  <p
                    className="link"
                    onClick={handleFileClick}
                    style={{ cursor: 'pointer' }}
                  >
                    Choose File
                  </p>

                  <button
                    className="btn-primary"
                    onClick={handleUpload}
                    disabled={loading || !selectedFile}
                  >
                    {loading ? 'Uploading...' : 'Upload File'}
                  </button>
                </div>

                {/* RESULTS */}
                {insertedRecords > 0 && (
                  <div className="import-summary success">
                    ✅ {insertedRecords} candidates imported successfully
                  </div>
                )}
                {duplicateCandidates.length > 0 && (
                  <div className="import-summary warning">
                    <h4>⚠️ Duplicate Candidates ({duplicateCandidates.length})</h4>
                    <ul>
                      {duplicateCandidates.map((item, index) => (
                        <li key={index}>
                          <strong>Email:</strong> {item.email} |{' '}
                          <strong>Phone:</strong> {item.phone}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {invalidCandidates.length > 0 && (
                  <div className="import-summary error">
                    <h4>❌ Invalid Rows ({invalidCandidates.length})</h4>
                    <ul>
                      {invalidCandidates.map((item, index) => (
                        <li key={index}>
                          <strong>Row:</strong> {item.rowNumber} <br />
                          <strong>Missing Fields:</strong>{' '}
                          {item.missingFields.join(', ')}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {error && (
                  <div className="import-summary error">
                    ❌ {error}
                  </div>
                )}

                <div className="info-box">
                  <p><FaInfoCircle /> Important Guidelines</p>
                  <ul>
                    <li>Ensure file is .xlsx, .xls or .csv format</li>
                    <li>Column names must match expected format</li>
                    <li>Name, Mobile Number, Email ID and Address are required fields</li>
                  </ul>
                </div>

                <button className="btn-dark" onClick={handleViewUploadFormat}>
                  <FaDownload /> View Upload Format Template
                </button>
              </div>

              {/* EMPLOYEE WORKLOAD */}
              <div className="card">
                <div className="card-header">
                  <h3><FaBriefcase /> Employee Workload</h3>
                  <span className="badge">
                    {employeeWorkload.length} Employees
                  </span>
                </div>

                <div className="filter-row">
                  <input
                    placeholder="Search Employee ID / Name"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button onClick={handleFilter}>Filter</button>
                  <button onClick={handleClearFilter}>Clear</button>
                </div>

                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Employee</th>
                          <th>Assigned</th>
                          <th>Pipeline</th>
                          <th>Pass</th>
                          <th>Hold</th>
                          <th>Drop</th>
                          <th>Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {employeeWorkload.length === 0 ? (
                          <tr>
                            <td colSpan="7">No Data Found</td>
                          </tr>
                        ) : (
                          employeeWorkload.map((emp) => (
                            <tr key={emp.employee_id}>
                              <td>
                                {emp.full_name} ({emp.employee_id})
                              </td>
                              <td>{emp.assignedCount}</td>
                              <td>{emp.pipelineCount}</td>
                              <td>{emp.passCount}</td>
                              <td>{emp.holdCount}</td>
                              <td>{emp.dropCount}</td>
                              <td style={{ position: "relative" }}>
                                <button
                                  className="btn-view"
                                  onClick={() => toggleDropdown(emp.employee_id)}
                                >
                                  <FaEye /> View <FaChevronDown />
                                </button>

                                {openDropdown === emp.employee_id && (
                                  <div className="dropdown-menu">
                                    <div className="dropdown-item" onClick={() => handleViewLineupTracker(emp)}>
                                      View Line Up Tracker
                                    </div>
                                    <div className="dropdown-item" onClick={() => handleViewJoiningTracker(emp)}>
                                      View Joining Tracker
                                    </div>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>                  
                )}
              </div>
            </div>

            {/*DATA TYPE OVERVIEW */}
            <h4 className="section-title">Data Type Overview</h4>
            <div className="data-type-grid">
              {dataTypeOverview.map((dt) => (
                <div className="data-type-card enhanced" key={dt.data_type_id}>

                  <div className="data-type-header">
                    <h3>{dt.type_name}</h3>

                    <button
                      className="edit-btn"
                      onClick={() => openEditModal(dt)}
                    >
                      <FaEdit />
                    </button>
                  </div>

                  <div className="data-type-stats">
                    <div className="data-type-row pink">
                      <span>Total</span>
                      <span className="value">
                        <FaUsers /> {dt.totalCandidates}
                      </span>
                    </div>
                    <div className="data-type-row green">
                      <span>Available</span>
                      <span className="value">
                        <FaDatabase /> {dt.availableCandidates}
                      </span>
                    </div>
                    <div className="data-type-row indigo">
                      <span>Assigned</span>
                      <span className="value">
                        <FaListUl /> {dt.assignedCandidates}
                      </span>
                    </div>
                    <div className="data-type-row purple">
                      <span>Pipeline</span>
                      <span className="value">
                        <FaHourglassHalf /> {dt.pipelineCandidates}
                      </span>
                    </div>
                    <div className="data-type-row orange">
                      <span>Hold</span>
                      <span className="value">
                        <FaPauseCircle /> {dt.holdCandidates}
                      </span>
                    </div>
                    <div className="data-type-row green">
                      <span>Pass</span>
                      <span className="value">
                        <FaCheckCircle /> {dt.passCandidates}
                      </span>
                    </div>
                    <div className="data-type-row red">
                      <span>Dropout</span>
                      <span className="value">
                        <FaTimesCircle /> {dt.dropoutCandidates}
                      </span>
                    </div>
                  </div>

                  <button
                    className="btn-gradient"
                    onClick={() => openViewModal(dt)}
                  >
                    <FaArrowRight /> View Details
                  </button>
                </div>
              ))}
            </div>
        </div>
      </main>

      {/* ADD NEW TYPE MODAL */}
      {showNewTypeModal && (
        <div className="adm-data-modal-overlay" onClick={closeNewTypeModal}>
          <div
            className="adm-data-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="adm-data-modal-header">
              <h2>Create New Data Type</h2>
              <button
                className="adm-data-modal-close"
                onClick={closeNewTypeModal}
              >
                ✕
              </button>
            </div>
            <div className="adm-data-modal-body">
              <div className="adm-data-form-group">
                <label>Data Type Name</label>
                <input
                  type="text"
                  className="adm-data-form-input"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder="e.g. Sales Leads"
                  autoFocus
                />
              </div>

              <div className="adm-data-form-group">
                <label>Description</label>
                <textarea
                  className="adm-data-form-textarea"
                  value={newTypeDescription}
                  onChange={(e) => setNewTypeDescription(e.target.value)}
                  placeholder="Short description (optional)"
                  rows={3}
                />
              </div>

              <div className="adm-data-form-group">
                <label>Employee View Limit</label>
                <input
                  type="number"
                  min="1"
                  className="adm-data-form-input"
                  value={employeeViewLimit}
                  onChange={(e) => setEmployeeViewLimit(e.target.value)}
                  placeholder="e.g. 10"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="adm-data-modal-footer">
              <button
                className="adm-data-modal-btn secondary"
                onClick={closeNewTypeModal}
              >
                Cancel
              </button>
              <button
                className="adm-data-modal-btn primary"
                onClick={handleAddNewType}
                disabled={!newTypeName.trim() || !employeeViewLimit}
              >
                Add Type
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {showViewModal && (
        <div className="adm-data-modal-overlay" onClick={closeViewModal}>
          <div
            className="adm-data-modal-content view-data-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="adm-data-modal-header">
              <h2>Data Type Details</h2>
              <button
                className="adm-data-modal-close"
                onClick={closeViewModal}
              >
                ✕
              </button>
            </div>

            <div className="adm-data-modal-body">

              <div className="view-data-row">
                <label>Data Type Name</label>
                <div className="view-data-value">
                  {dataTypeDetails.type_name || "-"}
                </div>
              </div>

              <div className="view-data-row">
                <label>Description</label>
                <div className="view-data-value">
                  {dataTypeDetails.description || "No description"}
                </div>
              </div>

              <div className="view-data-row">
                <label>Employee View Limit</label>
                <div className="view-data-value">
                  {dataTypeDetails.employee_view_limit || "-"}
                </div>
              </div>

              <div className="view-data-row">
                <label>Status</label>
                <div
                  className={`status-badge ${
                    dataTypeDetails.is_active ? "active" : "inactive"
                  }`}
                >
                  {dataTypeDetails.is_active ? "Active" : "Inactive"}
                </div>
              </div>

              <div className="view-data-row">
                <label>Created By</label>
                <div className="view-data-value">
                  {dataTypeDetails.created_by ? dataTypeDetails.created_by : "-"}
                </div>
              </div>

            </div>

            <div className="adm-data-modal-footer">
              <button
                className="adm-data-modal-btn primary"
                onClick={closeViewModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT DETAILS MODAL */}
      {showEditModal && (
        <div className="dt-modal-overlay" onClick={closeEditModal}>
          <div
            className="dt-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dt-modal-header">
              <h3>Edit Data Type</h3>
              <button className="dt-close-btn" onClick={closeEditModal}>
                ✕
              </button>
            </div>
            <div className="dt-modal-body">
              <div className="dt-form-group">
                <label>Type Name *</label>
                <input
                  type="text"
                  value={editform.type_name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, type_name: e.target.value }))}
                />
              </div>

              <div className="dt-form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={editform.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="dt-form-group">
                <label>Employee View Limit</label>
                <input
                  type="number"
                  value={editform.employee_view_limit}
                  onChange={(e) => setEditForm(prev => ({ ...prev, employee_view_limit: e.target.value }))}
                />
              </div>

              <div className="dt-form-group toggle-group">
                <label>Status</label>
                <select
                  value={editform.is_active ? "1" : "0"}
                  onChange={(e) =>
                    setEditForm(prev => ({ ...prev, is_active: e.target.value === "1" }))
                  }
                >
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </div>
            </div>

            <div className="dt-modal-footer">
              <button className="dt-btn-cancel" onClick={closeEditModal}>
                Cancel
              </button>

              <button
                className="dt-btn-save"
                onClick={handleEdiDataType}
                disabled={loading || !editform.type_name.trim()}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT MODAL */}
      {showExportModal && (
        <div
          className="export-overlay"
          onClick={() => setShowExportModal(false)}
        >
          <div
            className="export-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="export-header">
              <span className="material-symbols-outlined">
                download
              </span>
              Export Data as CSV
            </div>

            <div className="export-body">
              {dataTypes.length === 0 ? (
                <p className="no-types">No Data Types Available</p>
              ) : (
                dataTypes.map((type) => (
                  <label key={type.id} className="radio-item">
                    <input
                      type="radio"
                      name="dataType"
                      value={type.id}
                      checked={selectedTypeId === type.id}
                      onChange={() => setSelectedTypeId(type.id)}
                    />
                    <span>{type.type_name}</span>
                  </label>
                ))
              )}
            </div>

            <div className="export-footer">
              <button
                className="export-btn cancel"
                onClick={() => {
                  setSelectedTypeId("");
                  setShowExportModal(false);
                }}
              >
                Cancel
              </button>

              <button
                className="export-btn primary"
                disabled={!selectedTypeId}
                onClick={handleExportCSV}
              >
                Export CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDataImport;
