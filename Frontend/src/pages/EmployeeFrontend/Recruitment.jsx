import React, { useState } from "react";
import "./Recruitment.css";

const pipeline = [
  { label: "Completely Joined", value: 1500, color: "#60a5fa" },
  { label: "Joined", value: 750, color: "#a78bfa" },
  { label: "Clawback", value: 225, color: "#34d399" },
  { label: "Selected", value: 120, color: "#f472b6" },
  { label: "Interview Scheduled", value: 120, color: "#fb923c" },
];

// Sample candidate data
const candidates = [
  { id: 1, name: "Alice Johnson", status: "Selected", process: "Interview" },
  { id: 2, name: "Bob Smith", status: "Joined", process: "Orientation" },
  { id: 3, name: "Charlie Brown", status: "Clawback", process: "Training" },
];

// Sample client data
const clients = [
  { id: 1, name: "XYZ Corp", activeProjects: 5 },
  { id: 2, name: "ABC Ltd", activeProjects: 3 },
  { id: 3, name: "Tech Solutions", activeProjects: 4 },
];

// Simple chart component
function SimpleAreaChart({
  width = 560,
  height = 180,
  points = [20, 80, 40, 120, 60, 140, 80],
}) {
  const max = Math.max(...points);
  const stepX = width / (points.length - 1);
  const coords = points
    .map((p, i) => `${i * stepX},${height - (p / max) * height}`)
    .join(" ");
  const d = `M0,${height} L${coords} L${width},${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
      <defs>
        <linearGradient id="grad1" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path d={d} fill="url(#grad1)" />
      <polyline
        points={coords}
        fill="none"
        stroke="#2563eb"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function RecruitmentReport() {
  const [activeTab, setActiveTab] = useState("pipeline");

  return (
    <div className="report-container">
      <h2 className="report-header-title">Recruitment Dashboard</h2>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === "pipeline" ? "tab active" : "tab"}
          onClick={() => setActiveTab("pipeline")}
        >
          Recruitment Pipeline
        </button>
        <button
          className={activeTab === "candidates" ? "tab active" : "tab"}
          onClick={() => setActiveTab("candidates")}
        >
          Candidate Details
        </button>
        <button
          className={activeTab === "clients" ? "tab active" : "tab"}
          onClick={() => setActiveTab("clients")}
        >
          Client Details
        </button>
        <button
          className={activeTab === "revenue" ? "tab active" : "tab"}
          onClick={() => setActiveTab("revenue")}
        >
          Revenue & Success
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "pipeline" && (
        <div className="report-card">
          <h3 className="report-title">Recruitment Pipeline</h3>
          <div className="pipeline">
            {pipeline.map((p) => {
              const pct = Math.round((p.value / pipeline[0].value) * 100);
              return (
                <div className="pipeline-row" key={p.label}>
                  <div className="pipeline-label">{p.label}</div>
                  <div className="pipeline-bar">
                    <div
                      className="pipeline-fill"
                      style={{ width: `${pct}%`, background: p.color }}
                    />
                  </div>
                  <div className="pipeline-value">{p.value}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "candidates" && (
        <div className="report-card">
          <h3 className="report-title">Candidate Details</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Status</th>
                <th>Process</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.name}</td>
                  <td>{c.status}</td>
                  <td>{c.process}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "clients" && (
        <div className="report-card">
          <h3 className="report-title">Client Details</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Active Projects</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.name}</td>
                  <td>{c.activeProjects}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "revenue" && (
        <div className="report-card">
          <div className="report-header">
            <h3 className="report-title">Revenue & Success Rate</h3>
            <div className="report-date">Jan 1, 2023 - Dec 31, 2023</div>
          </div>
          <div className="chart-container">
            <SimpleAreaChart />
          </div>
        </div>
      )}
    </div>
  );
}
