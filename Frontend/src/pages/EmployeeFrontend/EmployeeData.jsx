import React, { useState, useMemo, useEffect } from "react";
import {
  Phone,
  MessageCircle,
  Layers,
  PauseCircle,
  CheckCircle,
  StickyNote,
} from "lucide-react";
import "./EmployeeData.css";
import EmployeeNavbar from "../../components/EmployeeNavbar";
import EmployeeHeader from "../../components/EmployeeHeader";
import { useEmployeeDataStore } from "../../store/EmployeeDataStore";
import { useAdminLineUpStore } from "../../store/AdminLineUpStore";
import { useEmployeeTrackerStore } from "../../store/EmployeeTrackerStore";


export default function EmployeeData() {
  const [expandedId, setExpandedId] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null); 
  const [showAddToTrackerModal, setShowAddToTrackerModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [actionReason, setActionReason] = useState("");
  const [noteText, setNoteText] = useState("");
  const [selectedDataTypeId, setSelectedDataTypeId] = useState(null);

  const {loading, error, dataTypes, fetchEmployeeDataTypes, candidates, fetchCandidates, assignCandidate} = useEmployeeDataStore();
  const {holdCandidate, passCandidate, addNote, addToTracker, addCallLog} = useAdminLineUpStore();
  const { fetchProcessesForEmployee, processesEmployee } = useEmployeeTrackerStore();
  const employee_id = sessionStorage.getItem('userId');
  const [trackerForm, setTrackerForm] = useState({
      process_id: "",
      resume: null,
  });

  useEffect(() => {
    fetchEmployeeDataTypes(employee_id);
    fetchProcessesForEmployee(employee_id);
  }, []);

  const handleRowClick = (candidate) => {
    setSelectedRow(candidate);
    setSelectedCandidateId(candidate.id);
  };

  const handleCall = async(mobile) => {
    await addCallLog({candidate_id: selectedCandidateId, employee_id: employee_id});
    window.location.href = `tel:${mobile}`;
  };

  const handleWhatsApp = (mobile) => {
    const formatted = mobile.replace(/\D/g, "");
    window.open(`https://wa.me/${formatted}`, "_blank");
  };

  const handleHold = async (reason) => {
      await holdCandidate({candidateId: selectedRow.id, employee_id: employee_id, reason});
      setShowHoldModal(false);
      setActionReason("");
  };

  const handlePass = async (reason) => {
      await passCandidate({candidateId: selectedRow.id, employee_id: employee_id, reason});
      setShowPassModal(false);
      setActionReason("");
  };

  const openAddToTrackerModal = (candidate) => {
      setSelectedRow(candidate);
      setTrackerForm({
          process_id: "",
          resume: null,
      });
      setShowAddToTrackerModal(true);
  };

  const handleAddToTracker = async() =>{
      await addToTracker({
          candidate_id: selectedRow.id,
          employee_id: employee_id,
          process_id: trackerForm.process_id,
          resume: trackerForm.resume,
      });
      setShowAddToTrackerModal(false);
      setTrackerForm({
          process_id: "",
          resume: null,
      });
  };

  return (
    <div className="emp-data-root">
      <EmployeeNavbar />

      <main className="emp-data-main">
        <EmployeeHeader 
          title="Data Management"
          subtitle="Track and manage your candidate progress"
        />

        <div className="emp-data-container">
          <div className="data-type-row">
          {dataTypes?.map((type) => (
            <button
              key={type.id}
              className={`data-type-btn ${
                selectedDataTypeId === type.id ? "active" : ""
              }`}
              onClick={() => setSelectedDataTypeId(type.id)}
            >
              {type.type_name}
            </button>
          ))}
          </div>

          <div className="new-data">
            <button
              className="btn-primary"
              onClick={() => fetchCandidates(employee_id, selectedDataTypeId)}
              disabled={loading}
            >
              <span className="material-symbols-outlined">add</span>
              {loading ? 'Loading...' : 'New Data'}
            </button>
          </div>

          {error && <p className="error-text">{error}</p>}

          {candidates.map((c) => {
            const isExpanded = selectedCandidateId === c.id;
            return (
              <div key={c.id} className="row-wrapper">
                {/* COLLAPSED ROW */}
                {!isExpanded && (
                  <div className="candidate-row">
                    <span className="candidate-name">{c.name}</span>
                    <button
                      className="view-btn"
                      onClick={() => {
                        assignCandidate(employee_id, c.id, c.data_type_id);
                        // setSelectedCandidateId(c.id);
                        handleRowClick(c);
                      }}
                    >
                      View details
                    </button>
                  </div>
                )}

                {/* EXPANDED DETAIL ROW */}
                {isExpanded && (
                  <div className="detail-panel">
                    <div className="detail-top">
                      <div>
                        <h3>{c.name}</h3>
                        <p className="phone">{c.phone}</p>
                        {/* <p className="ring">Ring {c.ring}</p> */}
                      </div>

                      <span className="status-badge">
                        Status : Assigned
                      </span>
                    </div>

                    <div className="action-bar">
                      <button className="icon-btn call" onClick={() => handleCall(c.phone)}>
                        <Phone size={18} /> Call
                      </button>

                      <button className="icon-btn whatsapp" onClick={() => handleWhatsApp(c.phone)}>
                        <MessageCircle size={18} /> WhatsApp
                      </button>

                      <button className="icon-btn primary" onClick={() => openAddToTrackerModal(c)}>
                        <Layers size={18} /> Add to Tracker
                      </button>

                      <button className="icon-btn hold" onClick={() => setShowHoldModal(true)}>
                        <PauseCircle size={18} /> Hold
                      </button>

                      <button className="icon-btn success" onClick={() => setShowPassModal(true)}>
                        <CheckCircle size={18} /> Pass
                      </button>

                      <button className="icon-btn note" onClick={() => setShowNoteModal(true)}>
                        <StickyNote size={18} /> Note
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Note modal */}
      {showNoteModal && selectedRow && (
      <div className="modal-overlay" onClick={() => setShowNoteModal(false)}>
          <div className="modal-content modal-sm note-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header note-header">
              <h3>
              <span className="material-symbols-outlined">note_add</span>
              Add Note
              </h3>
              <button className="modal-close" onClick={() => setShowNoteModal(false)}>&times;</button>
          </div>

          <div className="modal-body">
              <div className="tracker-info">
              <p>Candidate: <strong>{selectedRow.name}</strong> </p> 
              <p className="tracker-candidate-id">
                  ID: {selectedRow.id}
              </p>
              </div>

              <textarea
              className="form-textarea"
              placeholder="Write note..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              />

              <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowNoteModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => {addNote({ candidate_id: selectedRow.candidate_id, note: noteText }); setShowNoteModal(false);}}>
                  Save Note
              </button>
              </div>
          </div>
          </div>
      </div>
      )}

      {/* Hold modal */}
      {showHoldModal && selectedRow && (
      <div className="modal-overlay" onClick={() => setShowHoldModal(false)}>
          <div className="modal-content modal-sm hold-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header hold-header">
              <h3>
              <span className="material-symbols-outlined">pause_circle</span>
              Put Candidate on Hold
              </h3>
              <button className="modal-close" onClick={() => setShowHoldModal(false)}>&times;</button>
          </div>

          <div className="modal-body">
              <div className="tracker-info">
              <p>Candidate: <strong>{selectedRow.name}</strong> </p> 
              <p className="tracker-candidate-id">
                  ID: {selectedRow.id}
              </p>
              </div>
              <textarea
              className="form-textarea"
              placeholder="Reason for hold"
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              />

              <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowHoldModal(false)}>Cancel</button>
              <button className="btn-warning" onClick={() => handleHold(actionReason)}>Confirm</button>
              </div>
          </div>
          </div>
      </div>
      )}

      {/* Pass modal */}
      {showPassModal && selectedRow && (
      <div className="modal-overlay" onClick={() => setShowPassModal(false)}>
          <div className="modal-content modal-sm pass-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header pass-header">
              <h3>
              <span className="material-symbols-outlined">check_circle</span>
              Mark as Pass
              </h3>
              <button className="modal-close" onClick={() => setShowPassModal(false)}>&times;</button>
          </div>

          <div className="modal-body">
              <div className="tracker-info">
              <p>Candidate: <strong>{selectedRow.name}</strong> </p> 
              <p className="tracker-candidate-id">
                  ID: {selectedRow.id}
              </p>
              </div>
              <textarea
              className="form-textarea"
              placeholder="Reason for pass"
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              />

              <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowPassModal(false)}>Cancel</button>
              <button className="btn-success" onClick={() => handlePass(actionReason)}>Confirm</button>
              </div>
          </div>
          </div>
      </div>
      )}

      {/* Add to tracker */}
      {showAddToTrackerModal && selectedRow && (
      <div
          className="modal-overlay"
          onClick={() => setShowAddToTrackerModal(false)}
      >
          <div
          className="modal-content modal-sm tracker-modal"
          onClick={(e) => e.stopPropagation()}
          >
          <div className="modal-header tracker-header">
              <h3 className="modal-title">
              <span className="material-symbols-outlined">playlist_add</span>
              Add Candidate to Tracker
              </h3>
              <button
              className="modal-close"
              onClick={() => setShowAddToTrackerModal(false)}
              >
              &times;
              </button>
          </div>

          <div className="modal-body">
              <div className="tracker-info">
              <p>
                  Candidate: <strong>{selectedRow.name}</strong>
              </p>
              <p>ID: {selectedRow.id}</p>
              </div>

              {/* PROCESS SELECT */}
              <div className="form-group">
              <label className="form-label">
                  Select Process <span className="required">*</span>
              </label>
              <select
                  className="form-input"
                  value={trackerForm.process_id}
                  onChange={(e) =>
                  setTrackerForm({
                      ...trackerForm,
                      process_id: e.target.value,
                  })
                  }
              >
                  <option value="">Select process</option>
                  {processesEmployee.map((p) => (
                  <option key={p.id} value={p.process_id}>
                      {p.process_name}
                  </option>
                  ))}
              </select>
              </div>

              {/* RESUME UPLOAD */}
              <div className="form-group">
              <label className="form-label">Upload Resume (optional)</label>
              <input
                  type="file"
                  className="form-input"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) =>
                  setTrackerForm({
                      ...trackerForm,
                      resume: e.target.files[0],
                  })
                  }
              />
              </div>

              <div className="modal-actions">
              <button
                  className="btn-cancel"
                  onClick={() => setShowAddToTrackerModal(false)}
              >
                  Cancel
              </button>

              <button
                  className="btn-success"
                  disabled={!trackerForm.process_id || loading}
                  onClick={handleAddToTracker}
              >
                  <span className="material-symbols-outlined">playlist_add</span>
                  {loading ? "Processing..." : "Confirm"}
              </button>
              </div>
          </div>
          </div>
      </div>
      )}
    </div>
  );
}
