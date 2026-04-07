import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar.jsx";
import AdminHeader from "../../components/AdminHeader.jsx";
import { useAdminProcessStore } from "../../store/AdminProcessStore";
import "./AdminProcessView.css";

/* ── Relative time helper ───────────────────────────────── */
function relativeTime(dateStr) {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  const weeks = Math.floor(days / 7);
  if (mins  < 1)  return "Just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 7)  return `${days}d ago`;
  return `${weeks}w ago`;
}

/* ── Candidate status badge colour ─────────────────────── */
function getCandidateStatusClass(status) {
  const map = {
    interviewing  : "pv-badge yellow",
    offered       : "pv-badge blue",
    "in review"   : "pv-badge indigo",
    rejected      : "pv-badge red",
    dropout       : "pv-badge red",
    screening     : "pv-badge gray",
    joined        : "pv-badge green",
    assigned      : "pv-badge blue",
    available     : "pv-badge gray",
  };
  return map[status?.toLowerCase()] || "pv-badge gray";
}

function getMatchColor(score) {
  if (score >= 85) return "#16a34a";
  if (score >= 70) return "#d97706";
  return "#dc2626";
}

export default function AdminProcessView() {
  const { processId } = useParams();
  const navigate      = useNavigate();

  /* local search input (debounced before API call) */
  const [searchInput, setSearchInput]       = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const {
    selectedProcess,
    spocs,
    processCandidates,
    fetchProcessDetails,
    fetchProcessSpocs,
    fetchProcessCandidates,
    loading,
    error,
  } = useAdminProcessStore();

  /* ── Initial data fetch ─────────────────────────────── */
  useEffect(() => {
    if (!processId) return;
    fetchProcessDetails(processId);
    fetchProcessSpocs(processId);
    fetchProcessCandidates(processId);
  }, [processId]);

  /* ── Debounce search input (400 ms) ─────────────────── */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  /* ── Re-fetch candidates when debounced search changes ─ */
  useEffect(() => {
    if (!processId) return;
    fetchProcessCandidates(processId, debouncedSearch);
  }, [debouncedSearch, processId]);

  const p = selectedProcess;

  /* ── Number formatter ───────────────────────────────── */
  const fmt = (n) => (n != null ? Number(n).toLocaleString("en-IN") : "—");

  /* ── Stat cards ─────────────────────────────────────── */
  const statCards = [
    { icon: "work_outline",  label: "Openings",     value: p?.openings ?? "—" },
    { icon: "attach_money",  label: "Salary",        value: p?.salary ? `₹${p.salary}` : "—" },
    { icon: "update",        label: "Clawback",      value: p?.clawback_duration  ? `${p.clawback_duration} Days` : "—" },
    { icon: "receipt",       label: "Invoice Time",  value: p?.invoice_clear_time ? `${p.invoice_clear_time} Days` : "—" },
    { icon: "event",         label: "Interviews",    value: p?.interview_dates || "—" },
    { icon: "category",      label: "Hiring Type",   value: p?.hiring_type || "—" },
  ];

  const getStatusClass = (s) =>
    s?.toLowerCase() === "active" ? "pv-status active" : "pv-status inactive";

  /* ── Loading state ──────────────────────────────────── */
  if (loading && !p) {
    return (
      <div className="pv-root">
        <AdminNavbar />
        <main className="admin-main">
          <AdminHeader title="Process Details" />
          <div className="pv-loading">
            <span className="material-symbols-outlined pv-spin">autorenew</span>
            Loading process details…
          </div>
        </main>
      </div>
    );
  }

  /* ── Error state ────────────────────────────────────── */
  if (error && !p) {
    return (
      <div className="pv-root">
        <AdminNavbar />
        <main className="admin-main">
          <AdminHeader title="Process Details" />
          <div className="pv-error">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        </main>
      </div>
    );
  }

  /* ── Main render ────────────────────────────────────── */
  return (
    <div className="pv-root">
      <AdminNavbar />

      <main className="admin-main">
        <AdminHeader title="Process Details" />

        <div className="pv-content">

          {/* ── Title row ─────────────────────────────── */}
          <div className="pv-title-row">
            <div className="pv-title-info">
              <h1 className="pv-process-name">
                {p?.process_name || "Process Details"}
              </h1>
              {p?.client_name && (
                <span className="pv-client-name">{p.client_name}</span>
              )}
            </div>
            <span className={getStatusClass(p?.status)}>
              {p?.status || "Active"}
            </span>
          </div>

          {/* ── Stat cards ────────────────────────────── */}
          <div className="pv-stats-grid">
            {statCards.map((card, i) => (
              <div key={i} className="pv-stat-card">
                <div className="pv-stat-icon">
                  <span className="material-symbols-outlined">{card.icon}</span>
                </div>
                <div>
                  <p className="pv-stat-label">{card.label}</p>
                  <p className="pv-stat-value">{card.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Main two-column grid ──────────────────── */}
          <div className="pv-main-grid">

            {/* Left column */}
            <div className="pv-left-col">

              {/* Process Information */}
              <div className="pv-card">
                <h2 className="pv-card-title">Process Information</h2>
                <p className="pv-description">
                  {p?.process_description || "No description available."}
                </p>
                {p?.requirements && (
                  <div className="pv-requirements">
                    <h4 className="pv-req-heading">Requirements</h4>
                    <p className="pv-req-text">{p.requirements}</p>
                  </div>
                )}
              </div>

              {/* Location */}
              {p?.locations && (
                <div className="pv-card">
                  <h2 className="pv-card-title">Location</h2>
                  <div className="pv-tags-row">
                    <span className="pv-tag green">
                      <span className="material-symbols-outlined">location_on</span>
                      {p.locations}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="pv-right-col">

              {/* SPOCs */}
              <div className="pv-card">
                <h2 className="pv-card-title">
                  SPOCs
                  {spocs?.length > 0 && (
                    <span className="pv-count-badge">{spocs.length}</span>
                  )}
                </h2>
                {spocs && spocs.length > 0 ? (
                  <div className="pv-spoc-list">
                    {spocs.map((spoc, i) => (
                      <div key={i} className="pv-spoc-item">
                        <div className="pv-spoc-avatar">
                          {(spoc.name || "?")[0].toUpperCase()}
                        </div>
                        <div className="pv-spoc-info">
                          <p className="pv-spoc-name">{spoc.name}</p>
                          <p className="pv-spoc-role">
                            {spoc.role || "SPOC"}
                          </p>
                          {spoc.email && (
                            <p className="pv-spoc-contact">
                              <span className="material-symbols-outlined">
                                mail
                              </span>
                              {spoc.email}
                            </p>
                          )}
                          {spoc.phone && (
                            <p className="pv-spoc-contact">
                              <span className="material-symbols-outlined">
                                call
                              </span>
                              {spoc.phone}
                            </p>
                          )}
                          {spoc.note && (
                            <p className="pv-spoc-note">{spoc.note}</p>
                          )}
                        </div>
                        <span className="pv-badge green pv-spoc-badge">
                          {spoc.status || "Active"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="pv-no-data">No SPOCs assigned.</p>
                )}
              </div>

              {/* Payout Details */}
              <div className="pv-card">
                <h2 className="pv-card-title">Payout Details</h2>
                <span
                  className={`pv-payout-type-badge ${
                    p?.payout_type === "Percentage" ? "orange" : "green"
                  }`}
                >
                  Type: {p?.payout_type || "Fix"}
                </span>
                <div className="pv-payout-rows">
                  <div className="pv-payout-row">
                    <span className="pv-payout-label">Display Amount:</span>
                    <span className="pv-payout-value">
                      ₹{fmt(p?.payout_amount)}
                    </span>
                  </div>
                  <div className="pv-payout-row">
                    <span className="pv-payout-label">Real Amount:</span>
                    <span className="pv-payout-value">
                      ₹{fmt(p?.real_payout_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Related Candidates ────────────────────── */}
          <div className="pv-card pv-candidates-card">
            <h2 className="pv-card-title">
              Related Candidates
              {processCandidates.length > 0 && (
                <span className="pv-count-badge">{processCandidates.length}</span>
              )}
            </h2>

            <div className="pv-candidates-search">
              <div className="pv-search-box">
                <span className="material-symbols-outlined">search</span>
                <input
                  type="text"
                  placeholder="Search candidates…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                {searchInput && (
                  <button
                    className="pv-clear-search"
                    onClick={() => setSearchInput("")}
                    aria-label="Clear search"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                )}
              </div>
              <button
                className="pv-view-all-btn"
                onClick={() =>
                  navigate("/admin-candidates", { state: { processId } })
                }
              >
                <span className="material-symbols-outlined">open_in_new</span>
                View All
              </button>
            </div>

            {processCandidates.length === 0 ? (
              <div className="pv-empty-candidates">
                <span className="material-symbols-outlined pv-empty-icon">
                  person_search
                </span>
                <p>
                  {debouncedSearch
                    ? `No candidates match "${debouncedSearch}"`
                    : "No candidates assigned to this process yet."}
                </p>
              </div>
            ) : (
              <div className="pv-table-wrapper">
                <table className="pv-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Candidate Name</th>
                      <th>Employee</th>
                      <th>Employee ID</th>
                      <th>Status</th>
                      <th>Last Contacted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processCandidates.map((c, i) => (
                      <tr key={c.candidate_id}>
                        <td className="pv-td-muted">{i + 1}</td>
                        <td className="pv-td-bold">{c.candidate_name}</td>
                        <td>{c.full_name || "—"}</td>
                        <td className="pv-td-muted">{c.employee_id || "—"}</td>
                        <td>
                          <span
                            className={getCandidateStatusClass(
                              c.assignment_status
                            )}
                          >
                            {c.assignment_status || "—"}
                          </span>
                        </td>
                        <td className="pv-td-muted">
                          {relativeTime(c.last_contacted_date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
