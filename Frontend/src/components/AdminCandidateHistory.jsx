import React from 'react';
import "./AdminCandidateHistory.css";

const AdminCandidateHistory = ({open, onClose, currentPayout, candidateHistory = []}) => {
    if (!open || !currentPayout) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content history-modal"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="modal-header">
                <h3 className="modal-title">
                    <span className="material-symbols-outlined">history</span>
                    Status History
                </h3>
                <button className="modal-close" onClick={onClose}>
                    &times;
                </button>
                </div>

                {/* Body */}
                <div className="modal-body">
                {/* Candidate Info */}
                <div className="history-header">
                    <div className="history-candidate-info">
                    <h4>{currentPayout.candidate_name}</h4>
                    <p className="history-candidate-id">
                        ID: {currentPayout.candidate_id}
                    </p>
                    </div>
                </div>

                {/* Empty State */}
                {candidateHistory.length === 0 ? (
                    <div className="empty-history">
                    <span className="material-symbols-outlined">info</span>
                    <p>No status history available.</p>
                    </div>
                ) : (
                    <div className="history-timeline">
                    {candidateHistory.map((history, index) => (
                        <div key={index} className="history-timeline-item">
                        <div className="history-timeline-marker" />

                        <div className="history-timeline-content">
                            <div className="history-timeline-header">
                            <span className="history-status-badge">
                                {history.old_status} →{" "}
                                <strong>{history.new_status}</strong>
                            </span>

                            <span className="history-date">
                                {new Date(history.changed_at).toLocaleString("en-IN", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                                })}
                            </span>
                            </div>

                            {history.change_reason && (
                            <div className="history-reason">
                                <span className="history-reason-label">Reason:</span>
                                <span className="history-reason-text">
                                {history.change_reason}
                                </span>
                            </div>
                            )}

                            {history.first_name && history.last_name && (
                            <div className="history-changed-by">
                                <span className="material-symbols-outlined">
                                person
                                </span>
                                Changed by: {history.first_name}{" "}
                                {history.last_name}
                            </div>
                            )}
                        </div>
                        </div>
                    ))}
                    </div>
                )}
                </div>
            </div>
        </div>
    )
}

export default AdminCandidateHistory