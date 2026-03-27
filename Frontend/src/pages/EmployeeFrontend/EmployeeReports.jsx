import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  Users,
  BarChart2,
  TrendingUp,
  Download,
  Filter,
  RefreshCw,
  Activity,
  Target,
  Award,
  Users2,
  CalendarDays,
  ArrowUpRight,
  FileText,
  ChevronRight,
  Loader2,
} from "lucide-react";
import "./EmployeeReports.css";
import EmployeeNavbar from "../../components/EmployeeNavbar.jsx";
import { axiosInstance } from "../../lib/axios.js";

// ─── SVG Chart Components (unchanged visual) ────────────────────────────────

const LineChart = ({ data, dataKey, label, color }) => {
  if (!data || data.length === 0) return <p className="no-data">No data available</p>;
  const maxValue = Math.max(...data.map((d) => d[dataKey]), 1);
  const width = 800; const height = 300;
  const padding = { top: 30, right: 30, bottom: 50, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const points = data.map((d, i) => {
    const x = padding.left + (chartWidth / (data.length - 1)) * i;
    const y = padding.top + chartHeight - (d[dataKey] / maxValue) * chartHeight;
    return `${x},${y}`;
  }).join(" ");
  const areaPoints = [
    `M ${padding.left} ${padding.top + chartHeight}`,
    ...data.map((d, i) => {
      const x = padding.left + (chartWidth / (data.length - 1)) * i;
      const y = padding.top + chartHeight - (d[dataKey] / maxValue) * chartHeight;
      return `L ${x} ${y}`;
    }),
    `L ${padding.left + chartWidth} ${padding.top + chartHeight}`, "Z",
  ].join(" ");
  const gradientId = `gradient-${dataKey}`;
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="line-chart">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dx="0" dy="2" result="offsetblur" />
          <feComponentTransfer><feFuncA type="linear" slope="0.2" /></feComponentTransfer>
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {[0, 25, 50, 75, 100].map((percent) => {
        const y = padding.top + chartHeight - (chartHeight * percent) / 100;
        return (
          <g key={percent}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
            <text x={padding.left - 10} y={y + 5} fontSize="12" fill="#64748b" textAnchor="end" fontWeight="600">
              {Math.round((maxValue * percent) / 100)}
            </text>
          </g>
        );
      })}
      <path d={areaPoints} fill={`url(#${gradientId})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" filter="url(#shadow)" className="chart-line" />
      {data.map((d, i) => {
        const x = padding.left + (chartWidth / (data.length - 1)) * i;
        const y = padding.top + chartHeight - (d[dataKey] / maxValue) * chartHeight;
        return (
          <g key={i} className="chart-point">
            <circle cx={x} cy={y} r="10" fill={color} opacity="0.2" className="point-outer" />
            <circle cx={x} cy={y} r="6" fill="white" stroke={color} strokeWidth="3" className="point-inner" />
            <text x={x} y={y - 15} fontSize="11" fill={color} textAnchor="middle" fontWeight="700" className="point-value">{d[dataKey]}</text>
            <text x={x} y={height - padding.bottom + 25} fontSize="12" fill="#64748b" textAnchor="middle" fontWeight="600">{d.month}</text>
          </g>
        );
      })}
      <text x={width / 2} y={20} fontSize="14" fill="#0f172a" fontWeight="700" textAnchor="middle">{label}</text>
    </svg>
  );
};

const BarChart = ({ data, labelKey, valueKey, label }) => {
  if (!data || data.length === 0) return <p className="no-data">No data available</p>;
  const maxValue = Math.max(...data.map((d) => d[valueKey]), 1);
  const width = 600; const height = 300;
  const padding = { top: 30, right: 30, bottom: 80, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const barWidth = chartWidth / data.length - 10;
  const colorPairs = [
    { start: "#3b82f6", end: "#2563eb" }, { start: "#10b981", end: "#059669" },
    { start: "#8b5cf6", end: "#7c3aed" }, { start: "#f59e0b", end: "#d97706" },
    { start: "#ef4444", end: "#dc2626" },
  ];
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="bar-chart">
      <defs>
        {data.map((d, i) => {
          const gradientId = `bar-gradient-${i}`;
          const colors = colorPairs[i % colorPairs.length];
          return (
            <linearGradient key={gradientId} id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colors.start} />
              <stop offset="100%" stopColor={colors.end} />
            </linearGradient>
          );
        })}
        <filter id="glow"><feGaussianBlur stdDeviation="2" result="coloredBlur" /><feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      {[0, 25, 50, 75, 100].map((percent) => {
        const y = padding.top + chartHeight - (chartHeight * percent) / 100;
        return (
          <g key={percent}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
            <text x={padding.left - 10} y={y + 5} fontSize="12" fill="#64748b" textAnchor="end" fontWeight="600">{Math.round((maxValue * percent) / 100)}</text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const x = padding.left + (chartWidth / data.length) * i + 5;
        const barHeight = (d[valueKey] / maxValue) * chartHeight;
        const y = padding.top + chartHeight - barHeight;
        return (
          <g key={i} className="bar-group">
            <rect x={x + 4} y={y + 4} width={barWidth} height={barHeight} fill="#000" opacity="0.1" rx="6" />
            <rect x={x} y={y} width={barWidth} height={barHeight} fill={`url(#bar-gradient-${i})`} rx="6" filter="url(#glow)" className="bar-rect" />
            <rect x={x} y={y} width={barWidth} height={Math.min(barHeight, 20)} fill="white" opacity="0.2" rx="6" />
            <g>
              <rect x={x + barWidth / 2 - 18} y={y - 28} width="36" height="20" fill="#0f172a" rx="10" opacity="0.8" />
              <text x={x + barWidth / 2} y={y - 14} fontSize="12" fill="white" fontWeight="700" textAnchor="middle">{d[valueKey]}</text>
            </g>
            <text x={x + barWidth / 2} y={height - padding.bottom + 20} fontSize="11" fill="#475569" textAnchor="middle" fontWeight="600" transform={`rotate(-45 ${x + barWidth / 2} ${height - padding.bottom + 20})`}>
              {d[labelKey].length > 15 ? d[labelKey].substring(0, 12) + "..." : d[labelKey]}
            </text>
          </g>
        );
      })}
      <text x={width / 2} y={20} fontSize="14" fill="#0f172a" fontWeight="700" textAnchor="middle">{label}</text>
    </svg>
  );
};

const PieChartComponent = ({ data }) => {
  if (!data || data.length === 0) return <p className="no-data">No data available</p>;
  const total = data.reduce((sum, d) => sum + d.count, 0);
  if (total === 0) return <p className="no-data">No candidates assigned yet</p>;
  const outerRadius = 100; const innerRadius = 60; const cx = 120; const cy = 120;
  let currentAngle = -90;
  const colorPairs = [
    { main: "#3b82f6", light: "#60a5fa", dark: "#2563eb" },
    { main: "#10b981", light: "#34d399", dark: "#059669" },
    { main: "#8b5cf6", light: "#a78bfa", dark: "#7c3aed" },
    { main: "#f59e0b", light: "#fbbf24", dark: "#d97706" },
    { main: "#ef4444", light: "#f87171", dark: "#dc2626" },
    { main: "#06b6d4", light: "#67e8f9", dark: "#0891b2" },
    { main: "#84cc16", light: "#bef264", dark: "#65a30d" },
    { main: "#f97316", light: "#fdba74", dark: "#ea580c" },
  ];
  return (
    <svg width="100%" height="300" viewBox="0 0 420 300" className="pie-chart">
      <defs>
        {data.map((d, i) => {
          const gradientId = `pie-gradient-${i}`;
          const colors = colorPairs[i % colorPairs.length];
          return (
            <radialGradient key={gradientId} id={gradientId}>
              <stop offset="0%" stopColor={colors.light} />
              <stop offset="70%" stopColor={colors.main} />
              <stop offset="100%" stopColor={colors.dark} />
            </radialGradient>
          );
        })}
        <filter id="pie-glow"><feGaussianBlur stdDeviation="3" result="coloredBlur" /><feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <circle cx={cx} cy={cy + 3} r={innerRadius} fill="#000" opacity="0.1" />
      {data.map((d, i) => {
        const percentage = (d.count / total) * 100;
        const angle = (percentage / 100) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        const startXOuter = cx + outerRadius * Math.cos((startAngle * Math.PI) / 180);
        const startYOuter = cy + outerRadius * Math.sin((startAngle * Math.PI) / 180);
        const endXOuter = cx + outerRadius * Math.cos((endAngle * Math.PI) / 180);
        const endYOuter = cy + outerRadius * Math.sin((endAngle * Math.PI) / 180);
        const startXInner = cx + innerRadius * Math.cos((startAngle * Math.PI) / 180);
        const startYInner = cy + innerRadius * Math.sin((startAngle * Math.PI) / 180);
        const endXInner = cx + innerRadius * Math.cos((endAngle * Math.PI) / 180);
        const endYInner = cy + innerRadius * Math.sin((endAngle * Math.PI) / 180);
        const largeArc = angle > 180 ? 1 : 0;
        const pathData = [`M ${startXOuter} ${startYOuter}`, `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${endXOuter} ${endYOuter}`, `L ${endXInner} ${endYInner}`, `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${startXInner} ${startYInner}`, "Z"].join(" ");
        const midAngle = startAngle + angle / 2;
        const labelRadius = (outerRadius + innerRadius) / 2;
        const labelX = cx + labelRadius * Math.cos((midAngle * Math.PI) / 180);
        const labelY = cy + labelRadius * Math.sin((midAngle * Math.PI) / 180);
        currentAngle += angle;
        return (
          <g key={i} className="pie-segment">
            <path d={pathData} fill="#000" opacity="0.1" transform="translate(2, 2)" />
            <path d={pathData} fill={`url(#pie-gradient-${i})`} stroke="white" strokeWidth="3" filter="url(#pie-glow)" className="segment-path" />
            {angle > 15 && (
              <text x={labelX} y={labelY} fontSize="13" fill="white" fontWeight="700" textAnchor="middle" dominantBaseline="middle">{d.percentage}%</text>
            )}
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={innerRadius} fill="white" stroke="#e2e8f0" strokeWidth="2" />
      <text x={cx} y={cy - 10} fontSize="14" fill="#64748b" textAnchor="middle" fontWeight="600">Total</text>
      <text x={cx} y={cy + 15} fontSize="24" fill="#0f172a" textAnchor="middle" fontWeight="800">{total}</text>
      {data.map((d, i) => {
        const colors = colorPairs[i % colorPairs.length];
        return (
          <g key={i} transform={`translate(270, ${40 + i * 45})`} className="legend-item">
            <defs>
              <linearGradient id={`legend-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={colors.light} />
                <stop offset="100%" stopColor={colors.dark} />
              </linearGradient>
            </defs>
            <rect width="24" height="24" fill={`url(#legend-grad-${i})`} rx="6" stroke={colors.dark} strokeWidth="2" />
            <text x="35" y="14" fontSize="13" fill="#0f172a" fontWeight="600">{d.process.length > 18 ? d.process.substring(0, 16) + "..." : d.process}</text>
            <text x="35" y="28" fontSize="11" fill="#64748b" fontWeight="500">{d.count} candidates ({d.percentage}%)</text>
          </g>
        );
      })}
    </svg>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

export default function EmployeeReports() {
  const location = useLocation();

  // ── State ───────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("overview");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedClient, setSelectedClient] = useState("All");
  const [selectedProcess, setSelectedProcess] = useState("All");

  // Real data state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);
  const [clientWiseData, setClientWiseData] = useState([]);
  const [processWiseData, setProcessWiseData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [apiStats, setApiStats] = useState({
    totalJoins: 0,
    totalInterviews: 0,
    totalCVs: 0,
    conversionRate: 0,
    targetAchievement: 0,
    totalAssignments: 0,
  });
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // ── Filter options state ───────────────────────────────────────────────
  const [clientOptions, setClientOptions] = useState([]);
  const [processOptions, setProcessOptions] = useState([]);

  // ── Fetch data ──────────────────────────────────────────────────────────
  const fetchReports = useCallback(async () => {
    const empId = sessionStorage.getItem("userId");
    if (!empId) { setError("Employee ID not found in session."); setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const qs = `empId=${empId}&client=${encodeURIComponent(selectedClient)}&process=${encodeURIComponent(selectedProcess)}`;
      const res = await axiosInstance.get(`/employee/reports/summary?${qs}`);
      const d = res.data;
      setPerformanceData(d.performanceData || []);
      setClientWiseData(d.clientWiseData || []);
      setProcessWiseData(d.processWiseData || []);
      setRecentActivities(d.recentActivities || []);
      setApiStats(d.stats || {});
      setLastRefreshed(new Date());

      setClientOptions(prev => prev.length === 0 ? ["All", ...(d.clientWiseData || []).map(c => c.client)] : prev);
      setProcessOptions(prev => prev.length === 0 ? ["All", ...(d.processWiseData || []).map(p => p.process)] : prev);
    } catch (err) {
      console.error(err);
      setError("Failed to load report data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [selectedClient, selectedProcess]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  // ── Filtered data ───────────────────────────────────────────────────────
  const filteredClientData = clientWiseData;
  const filteredProcessData = processWiseData;

  const handleExportReport = () => {
    const rows = [
      ["Month", "Joins", "Interviews", "CVs Worked", "Target"],
      ...performanceData.map(d => [d.month, d.joins, d.interviews, d.cvs, d.target]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `performance_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  // ── Loading / Error skeleton ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="emp-reports-root">
        <EmployeeNavbar />
        <main className="emp-reports-main">
          <div className="reports-loading">
            <Loader2 size={40} className="loading-spinner" />
            <p>Loading report data…</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="emp-reports-root">
        <EmployeeNavbar />
        <main className="emp-reports-main">
          <div className="reports-error">
            <p>{error}</p>
            <button className="btn-primary" onClick={fetchReports}><RefreshCw size={16} /> Retry</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="emp-reports-root">
      <EmployeeNavbar />
      <main className="emp-reports-main">
        {/* Header */}
        <header className="emp-reports-header">
          <div className="header-left">
            <h1 className="header-title">Performance Reports</h1>
            <p className="header-subtitle">
              Real-time insights from your recruitment activity
              {lastRefreshed && <span className="last-refreshed"> · Last updated: {lastRefreshed.toLocaleTimeString()}</span>}
            </p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={() => setShowFilters(!showFilters)}>
              <Filter size={16} /> {showFilters ? "Hide" : "Show"} Filters
            </button>
            <button className="btn-secondary" onClick={handleExportReport}>
              <Download size={16} /> Export CSV
            </button>
            <button className="btn-primary" onClick={fetchReports}>
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </header>

        <div className="emp-reports-content">
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card blue">
              <div className="stat-icon"><Users2 size={24} /></div>
              <div className="stat-info">
                <p className="stat-label">Total Joins</p>
                <h3 className="stat-value">{apiStats.totalJoins}</h3>
                <p className="stat-trend positive"><ArrowUpRight size={14} /> All time</p>
              </div>
            </div>
            <div className="stat-card green">
              <div className="stat-icon"><CalendarDays size={24} /></div>
              <div className="stat-info">
                <p className="stat-label">Interviews</p>
                <h3 className="stat-value">{apiStats.totalInterviews}</h3>
                <p className="stat-trend positive"><ArrowUpRight size={14} /> All time</p>
              </div>
            </div>
            <div className="stat-card purple">
              <div className="stat-icon"><FileText size={24} /></div>
              <div className="stat-info">
                <p className="stat-label">CVs Worked</p>
                <h3 className="stat-value">{apiStats.totalCVs}</h3>
                <p className="stat-trend positive"><ArrowUpRight size={14} /> Last 12 months</p>
              </div>
            </div>
            <div className="stat-card orange">
              <div className="stat-icon"><Target size={24} /></div>
              <div className="stat-info">
                <p className="stat-label">Conversion Rate</p>
                <h3 className="stat-value">{apiStats.conversionRate}%</h3>
                <p className="stat-trend positive"><ArrowUpRight size={14} /> Interviews → Joins</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="filters-section">
              <div className="filters-header"><h3>Filters</h3></div>
              <div className="filters-grid">
                <div className="filter-group">
                  <label>Client</label>
                  <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)} className="filter-select">
                    {clientOptions.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="filter-group">
                  <label>Process</label>
                  <select value={selectedProcess} onChange={e => setSelectedProcess(e.target.value)} className="filter-select">
                    {processOptions.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="reports-tabs">
            {[
              { id: "overview",     icon: <BarChart2 size={16} />,  label: "Overview" },
              { id: "performance",  icon: <TrendingUp size={16} />, label: "Performance" },
              { id: "clients",      icon: <Users size={16} />,      label: "Client Wise" },
              { id: "detailed",     icon: <FileText size={16} />,   label: "Detailed Report" },
              { id: "activities",   icon: <Activity size={16} />,   label: "Recent Activities" },
            ].map(tab => (
              <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? "active" : ""}`} onClick={() => setActiveTab(tab.id)}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* ── Overview Tab ─────────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <div className="tab-content">
              <div className="charts-grid">
                <div className="chart-card full-width">
                  <h3 className="chart-title">Monthly Performance Trend</h3>
                  <LineChart data={performanceData} dataKey="joins" label="Joins Over Time" color="#3b82f6" />
                </div>
                <div className="chart-card">
                  <h3 className="chart-title">Process Distribution</h3>
                  <PieChartComponent data={filteredProcessData} />
                </div>
                <div className="chart-card">
                  <h3 className="chart-title">Top Performing Clients</h3>
                  <BarChart data={filteredClientData} labelKey="client" valueKey="joins" label="Joins by Client" />
                </div>
              </div>
              {/* Recent Activities summary */}
              <div className="activities-section">
                <h3 className="section-title">Recent Activities</h3>
                <div className="activities-list">
                  {recentActivities.slice(0, 6).map((activity, index) => (
                    <div key={index} className="activity-item">
                      <div className={`activity-icon ${activity.type}`}><Activity size={16} /></div>
                      <div className="activity-content">
                        <p className="activity-text">{activity.activity}</p>
                        <p className="activity-date">{activity.date}</p>
                      </div>
                      <ChevronRight size={16} className="activity-arrow" />
                    </div>
                  ))}
                  {recentActivities.length === 0 && <p className="no-data">No recent activities found.</p>}
                </div>
              </div>
            </div>
          )}

          {/* ── Performance Tab ──────────────────────────────────────────── */}
          {activeTab === "performance" && (
            <div className="tab-content">
              <div className="performance-grid">
                <div className="chart-card full-width">
                  <h3 className="chart-title">Joins vs Target</h3>
                  <LineChart data={performanceData} dataKey="joins" label="Monthly Joins Performance" color="#10b981" />
                </div>
                <div className="chart-card full-width">
                  <h3 className="chart-title">Interview Activity</h3>
                  <LineChart data={performanceData} dataKey="interviews" label="Monthly Interview Trend" color="#8b5cf6" />
                </div>
                <div className="chart-card full-width">
                  <h3 className="chart-title">CV / Candidates Worked</h3>
                  <LineChart data={performanceData} dataKey="cvs" label="Monthly Candidates Worked" color="#f59e0b" />
                </div>
              </div>
            </div>
          )}

          {/* ── Client Wise Tab ──────────────────────────────────────────── */}
          {activeTab === "clients" && (
            <div className="tab-content">
              <div className="chart-card full-width">
                <h3 className="chart-title">Client-Wise Performance</h3>
                <BarChart data={filteredClientData} labelKey="client" valueKey="joins" label="Joins by Client" />
              </div>
              <div className="client-table-section">
                <h3 className="section-title">Detailed Client Analysis</h3>
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>Client Name</th>
                      <th>Total Joins</th>
                      <th>Candidates Worked</th>
                      <th>Success Rate</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClientData.length === 0 ? (
                      <tr><td colSpan={5} style={{ textAlign: "center", color: "#94a3b8" }}>No client data available</td></tr>
                    ) : filteredClientData.map((client, index) => (
                      <tr key={index}>
                        <td className="client-name">{client.client}</td>
                        <td className="joins-count">{client.joins}</td>
                        <td>{client.cvs}</td>
                        <td>
                          <div className="success-bar">
                            <div className="success-fill" style={{ width: `${client.success}%` }} />
                            <span className="success-text">{client.success}%</span>
                          </div>
                        </td>
                        <td><span className="status-badge active">Active</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Detailed Tab ─────────────────────────────────────────────── */}
          {activeTab === "detailed" && (
            <div className="tab-content">
              <div className="detailed-report-grid">
                <div className="report-section">
                  <h3 className="section-title"><Award size={20} /> Achievement Summary</h3>
                  <div className="achievement-cards">
                    <div className="achievement-card">
                      <div className="achievement-label">Target Achievement</div>
                      <div className="achievement-value">{apiStats.targetAchievement}%</div>
                      <div className="achievement-progress">
                        <div className="progress-fill" style={{ width: `${Math.min(apiStats.targetAchievement, 100)}%` }} />
                      </div>
                    </div>
                    <div className="achievement-card">
                      <div className="achievement-label">Conversion Rate</div>
                      <div className="achievement-value">{apiStats.conversionRate}%</div>
                      <div className="achievement-progress">
                        <div className="progress-fill" style={{ width: `${Math.min(apiStats.conversionRate, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="report-section">
                  <h3 className="section-title"><TrendingUp size={20} /> Monthly Breakdown</h3>
                  <table className="reports-table">
                    <thead>
                      <tr><th>Month</th><th>Joins</th><th>Interviews</th><th>CVs Worked</th><th>Target</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {performanceData.slice(-6).map((data, index) => (
                        <tr key={index}>
                          <td className="month-cell">{data.month}</td>
                          <td className="joins-cell">{data.joins}</td>
                          <td>{data.interviews}</td>
                          <td>{data.cvs}</td>
                          <td>{data.target}</td>
                          <td>
                            <span className={`status-badge ${data.target > 0 && data.joins >= data.target ? "success" : "warning"}`}>
                              {data.target > 0 && data.joins >= data.target ? "Achieved" : "In Progress"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Activities Tab ───────────────────────────────────────────── */}
          {activeTab === "activities" && (
            <div className="tab-content">
              <div className="recent-activities-section">
                <div className="activities-header">
                  <div className="activities-title-bar" />
                  <h2 className="activities-title">Recent Activities</h2>
                </div>
                <div className="activities-list-container">
                  {recentActivities.length === 0 ? (
                    <p className="no-data">No activity history found.</p>
                  ) : recentActivities.map((activity) => (
                    <div key={activity.id} className="activity-card">
                      <div className="activity-icon-square" style={{ backgroundColor: activity.color }}>
                        <Activity size={20} />
                      </div>
                      <div className="activity-content-wrapper">
                        <p className="activity-description">{activity.activity}</p>
                        <p className="activity-date">{activity.date}</p>
                      </div>
                      <ChevronRight size={20} className="activity-arrow-icon" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
