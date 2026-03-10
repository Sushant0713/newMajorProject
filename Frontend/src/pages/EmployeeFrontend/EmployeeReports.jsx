import React, { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Database,
  Briefcase,
  BarChart2,
  Calendar,
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  RefreshCw,
  PieChart,
  Activity,
  Target,
  Award,
  Users2,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  FileText,
  ChevronRight,
} from "lucide-react";
import "./EmployeeReports.css";
import EmployeeNavbar from "../../components/EmployeeNavbar.jsx";

// Mock data for reports
const performanceData = [
  { month: "Jan", joins: 5, interviews: 25, cvs: 80, target: 8 },
  { month: "Feb", joins: 7, interviews: 30, cvs: 95, target: 8 },
  { month: "Mar", joins: 6, interviews: 28, cvs: 88, target: 8 },
  { month: "Apr", joins: 8, interviews: 35, cvs: 110, target: 8 },
  { month: "May", joins: 9, interviews: 40, cvs: 120, target: 8 },
  { month: "Jun", joins: 10, interviews: 42, cvs: 125, target: 10 },
  { month: "Jul", joins: 12, interviews: 48, cvs: 135, target: 10 },
  { month: "Aug", joins: 11, interviews: 45, cvs: 130, target: 10 },
  { month: "Sep", joins: 13, interviews: 50, cvs: 140, target: 10 },
  { month: "Oct", joins: 14, interviews: 52, cvs: 145, target: 10 },
  { month: "Nov", joins: 15, interviews: 55, cvs: 150, target: 10 },
  { month: "Dec", joins: 16, interviews: 60, cvs: 160, target: 10 },
];

const clientWiseData = [
  { client: "TWO WINGS LOGITECH", joins: 35, cvs: 120, success: 85 },
  { client: "TECH SOLUTIONS", joins: 28, cvs: 95, success: 78 },
  { client: "GLOBAL CORP", joins: 42, cvs: 150, success: 90 },
  { client: "INNOVATIVE TECH", joins: 22, cvs: 80, success: 72 },
  { client: "PACE SETTER", joins: 18, cvs: 65, success: 68 },
];

const processWiseData = [
  { process: "TELESALES EXECUTIVE", count: 45, percentage: 35 },
  { process: "CUSTOMER SUPPORT", count: 38, percentage: 30 },
  { process: "SALES EXECUTIVE", count: 32, percentage: 25 },
  { process: "OPERATIONS", count: 13, percentage: 10 },
];

const recentActivities = [
  { 
    id: 1,
    date: "2025-12-18", 
    activity: "Submitted 15 CVs for TECH SOLUTIONS", 
    type: "submission",
    color: "#3b82f6" // Blue
  },
  { 
    id: 2,
    date: "2025-12-17", 
    activity: "Interview scheduled for Rahul Verma", 
    type: "interview",
    color: "#8b5cf6" // Purple
  },
  { 
    id: 3,
    date: "2025-12-16", 
    activity: "Candidate joined - Priya Singh", 
    type: "joining",
    color: "#10b981" // Green
  },
  { 
    id: 4,
    date: "2025-12-15", 
    activity: "Follow-up call with GLOBAL CORP", 
    type: "client",
    color: "#f59e0b" // Orange
  },
  { 
    id: 5,
    date: "2025-12-14", 
    activity: "Updated 8 candidate profiles", 
    type: "update",
    color: "#ec4899" // Pink
  },
  { 
    id: 6,
    date: "2025-12-13", 
    activity: "Shortlisted 12 candidates", 
    type: "screening",
    color: "#14b8a6" // Teal
  },
];

export default function EmployeeReports() {
  const location = useLocation();

  // State management
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("thisMonth");
  const [selectedClient, setSelectedClient] = useState("All");
  const [selectedProcess, setSelectedProcess] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalJoins = performanceData.reduce((sum, d) => sum + d.joins, 0);
    const totalInterviews = performanceData.reduce((sum, d) => sum + d.interviews, 0);
    const totalCVs = performanceData.reduce((sum, d) => sum + d.cvs, 0);
    const avgTarget = performanceData.reduce((sum, d) => sum + d.target, 0) / performanceData.length;

    return {
      totalJoins,
      totalInterviews,
      totalCVs,
      conversionRate: ((totalJoins / totalInterviews) * 100).toFixed(1),
      targetAchievement: ((totalJoins / (avgTarget * 12)) * 100).toFixed(1),
    };
  }, []);


  const handleExportReport = () => {
    // Simulate export
    alert("Report exported successfully!");
  };

  const handleQuickDateRange = (range) => {
    setDateRange(range);
  };

  // Enhanced Line Chart with Gradients and Area Fill
  const LineChart = ({ data, dataKey, label, color }) => {
    const maxValue = Math.max(...data.map((d) => d[dataKey]));
    const width = 800;
    const height = 300;
    const padding = { top: 30, right: 30, bottom: 50, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const points = data.map((d, i) => {
      const x = padding.left + (chartWidth / (data.length - 1)) * i;
      const y = padding.top + chartHeight - (d[dataKey] / maxValue) * chartHeight;
      return `${x},${y}`;
    }).join(" ");

    // Create area path for gradient fill
    const areaPoints = [
      `M ${padding.left} ${padding.top + chartHeight}`,
      ...data.map((d, i) => {
        const x = padding.left + (chartWidth / (data.length - 1)) * i;
        const y = padding.top + chartHeight - (d[dataKey] / maxValue) * chartHeight;
        return `L ${x} ${y}`;
      }),
      `L ${padding.left + chartWidth} ${padding.top + chartHeight}`,
      "Z",
    ].join(" ");

    const gradientId = `gradient-${dataKey}-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="line-chart">
        <defs>
          {/* Gradient for area fill */}
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
          {/* Drop shadow filter */}
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="0" dy="2" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.2" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background grid lines */}
        {[0, 25, 50, 75, 100].map((percent) => {
          const y = padding.top + chartHeight - (chartHeight * percent) / 100;
          return (
            <g key={percent}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="5,5"
              />
              <text x={padding.left - 10} y={y + 5} fontSize="12" fill="#64748b" textAnchor="end" fontWeight="600">
                {Math.round((maxValue * percent) / 100)}
              </text>
            </g>
          );
        })}

        {/* Area fill with gradient */}
        <path d={areaPoints} fill={`url(#${gradientId})`} />

        {/* Main line with shadow */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#shadow)"
          className="chart-line"
        />

        {/* Data points with hover effect */}
        {data.map((d, i) => {
          const x = padding.left + (chartWidth / (data.length - 1)) * i;
          const y = padding.top + chartHeight - (d[dataKey] / maxValue) * chartHeight;
          return (
            <g key={i} className="chart-point">
              {/* Outer circle for hover effect */}
              <circle cx={x} cy={y} r="10" fill={color} opacity="0.2" className="point-outer" />
              {/* Inner circle */}
              <circle cx={x} cy={y} r="6" fill="white" stroke={color} strokeWidth="3" className="point-inner" />
              {/* Value label */}
              <text
                x={x}
                y={y - 15}
                fontSize="11"
                fill={color}
                textAnchor="middle"
                fontWeight="700"
                className="point-value"
              >
                {d[dataKey]}
              </text>
              {/* Month label */}
              <text x={x} y={height - padding.bottom + 25} fontSize="12" fill="#64748b" textAnchor="middle" fontWeight="600">
                {d.month}
              </text>
            </g>
          );
        })}

        {/* Chart title with icon */}
        <text x={width / 2} y={20} fontSize="14" fill="#0f172a" fontWeight="700" textAnchor="middle">
          {label}
        </text>
      </svg>
    );
  };

  // Enhanced Bar Chart with 3D Effect and Gradients
  const BarChart = ({ data, labelKey, valueKey, label }) => {
    const maxValue = Math.max(...data.map((d) => d[valueKey]));
    const width = 600;
    const height = 300;
    const padding = { top: 30, right: 30, bottom: 80, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const barWidth = chartWidth / data.length - 10;

    const colorPairs = [
      { start: "#3b82f6", end: "#2563eb" },
      { start: "#10b981", end: "#059669" },
      { start: "#8b5cf6", end: "#7c3aed" },
      { start: "#f59e0b", end: "#d97706" },
      { start: "#ef4444", end: "#dc2626" },
    ];

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="bar-chart">
        <defs>
          {/* Create gradients for each bar */}
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
          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines with dashed style */}
        {[0, 25, 50, 75, 100].map((percent) => {
          const y = padding.top + chartHeight - (chartHeight * percent) / 100;
          return (
            <g key={percent}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="5,5"
              />
              <text x={padding.left - 10} y={y + 5} fontSize="12" fill="#64748b" textAnchor="end" fontWeight="600">
                {Math.round((maxValue * percent) / 100)}
              </text>
            </g>
          );
        })}

        {/* Bars with enhanced visuals */}
        {data.map((d, i) => {
          const x = padding.left + (chartWidth / data.length) * i + 5;
          const barHeight = (d[valueKey] / maxValue) * chartHeight;
          const y = padding.top + chartHeight - barHeight;
          const gradientId = `bar-gradient-${i}`;

          return (
            <g key={i} className="bar-group">
              {/* Shadow/3D effect */}
              <rect
                x={x + 4}
                y={y + 4}
                width={barWidth}
                height={barHeight}
                fill="#000"
                opacity="0.1"
                rx="6"
              />
              {/* Main bar with gradient */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={`url(#${gradientId})`}
                rx="6"
                filter="url(#glow)"
                className="bar-rect"
              />
              {/* Highlight effect on top */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.min(barHeight, 20)}
                fill="white"
                opacity="0.2"
                rx="6"
              />
              {/* Value label with background */}
              <g>
                <rect
                  x={x + barWidth / 2 - 18}
                  y={y - 28}
                  width="36"
                  height="20"
                  fill="#0f172a"
                  rx="10"
                  opacity="0.8"
                />
                <text
                  x={x + barWidth / 2}
                  y={y - 14}
                  fontSize="12"
                  fill="white"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {d[valueKey]}
                </text>
              </g>
              {/* Label with better visibility */}
              <text
                x={x + barWidth / 2}
                y={height - padding.bottom + 20}
                fontSize="11"
                fill="#475569"
                textAnchor="middle"
                fontWeight="600"
                transform={`rotate(-45 ${x + barWidth / 2} ${height - padding.bottom + 20})`}
              >
                {d[labelKey].length > 15 ? d[labelKey].substring(0, 12) + "..." : d[labelKey]}
              </text>
            </g>
          );
        })}

        {/* Title with decorative elements */}
        <text x={width / 2} y={20} fontSize="14" fill="#0f172a" fontWeight="700" textAnchor="middle">
          {label}
        </text>
      </svg>
    );
  };

  // Enhanced Donut Chart with 3D Effect and Animations
  const PieChartComponent = ({ data }) => {
    const total = data.reduce((sum, d) => sum + d.count, 0);
    const outerRadius = 100;
    const innerRadius = 60; // Makes it a donut chart
    const cx = 120;
    const cy = 120;
    let currentAngle = -90;

    const colorPairs = [
      { main: "#3b82f6", light: "#60a5fa", dark: "#2563eb" },
      { main: "#10b981", light: "#34d399", dark: "#059669" },
      { main: "#8b5cf6", light: "#a78bfa", dark: "#7c3aed" },
      { main: "#f59e0b", light: "#fbbf24", dark: "#d97706" },
    ];

    return (
      <svg width="100%" height="300" viewBox="0 0 420 300" className="pie-chart">
        <defs>
          {/* Create gradients for each segment */}
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
          {/* Glow effect */}
          <filter id="pie-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Center circle background shadow */}
        <circle cx={cx} cy={cy + 3} r={innerRadius} fill="#000" opacity="0.1" />
        
        {/* Donut segments */}
        {data.map((d, i) => {
          const percentage = (d.count / total) * 100;
          const angle = (percentage / 100) * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;

          // Outer arc points
          const startXOuter = cx + outerRadius * Math.cos((startAngle * Math.PI) / 180);
          const startYOuter = cy + outerRadius * Math.sin((startAngle * Math.PI) / 180);
          const endXOuter = cx + outerRadius * Math.cos((endAngle * Math.PI) / 180);
          const endYOuter = cy + outerRadius * Math.sin((endAngle * Math.PI) / 180);

          // Inner arc points
          const startXInner = cx + innerRadius * Math.cos((startAngle * Math.PI) / 180);
          const startYInner = cy + innerRadius * Math.sin((startAngle * Math.PI) / 180);
          const endXInner = cx + innerRadius * Math.cos((endAngle * Math.PI) / 180);
          const endYInner = cy + innerRadius * Math.sin((endAngle * Math.PI) / 180);

          const largeArc = angle > 180 ? 1 : 0;

          const pathData = [
            `M ${startXOuter} ${startYOuter}`,
            `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${endXOuter} ${endYOuter}`,
            `L ${endXInner} ${endYInner}`,
            `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${startXInner} ${startYInner}`,
            "Z",
          ].join(" ");

          const gradientId = `pie-gradient-${i}`;
          
          // Calculate middle point for percentage label
          const midAngle = startAngle + angle / 2;
          const labelRadius = (outerRadius + innerRadius) / 2;
          const labelX = cx + labelRadius * Math.cos((midAngle * Math.PI) / 180);
          const labelY = cy + labelRadius * Math.sin((midAngle * Math.PI) / 180);

          currentAngle += angle;

          return (
            <g key={i} className="pie-segment">
              {/* Shadow effect */}
              <path d={pathData} fill="#000" opacity="0.1" transform="translate(2, 2)" />
              {/* Main segment with gradient */}
              <path
                d={pathData}
                fill={`url(#${gradientId})`}
                stroke="white"
                strokeWidth="3"
                filter="url(#pie-glow)"
                className="segment-path"
              />
              {/* Percentage label inside segment */}
              {angle > 15 && (
                <text
                  x={labelX}
                  y={labelY}
                  fontSize="13"
                  fill="white"
                  fontWeight="700"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {d.percentage}%
                </text>
              )}
            </g>
          );
        })}

        {/* Center circle with total */}
        <circle cx={cx} cy={cy} r={innerRadius} fill="white" stroke="#e2e8f0" strokeWidth="2" />
        <text x={cx} y={cy - 10} fontSize="14" fill="#64748b" textAnchor="middle" fontWeight="600">
          Total
        </text>
        <text x={cx} y={cy + 15} fontSize="24" fill="#0f172a" textAnchor="middle" fontWeight="800">
          {total}
        </text>

        {/* Enhanced Legend with icons */}
        {data.map((d, i) => {
          const colors = colorPairs[i % colorPairs.length];
          return (
            <g key={i} transform={`translate(270, ${40 + i * 45})`} className="legend-item">
              {/* Legend box with gradient */}
              <defs>
                <linearGradient id={`legend-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={colors.light} />
                  <stop offset="100%" stopColor={colors.dark} />
                </linearGradient>
              </defs>
              <rect
                width="24"
                height="24"
                fill={`url(#legend-grad-${i})`}
                rx="6"
                stroke={colors.dark}
                strokeWidth="2"
              />
              {/* Process name */}
              <text x="35" y="14" fontSize="13" fill="#0f172a" fontWeight="600">
                {d.process.length > 18 ? d.process.substring(0, 16) + "..." : d.process}
              </text>
              {/* Count and percentage */}
              <text x="35" y="28" fontSize="11" fill="#64748b" fontWeight="500">
                {d.count} candidates ({d.percentage}%)
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="emp-reports-root">
      <EmployeeNavbar />

      {/* Main Content */}
      <main className="emp-reports-main">
        {/* Header */}
        <header className="emp-reports-header">
          <div className="header-left">
            <h1 className="header-title">Performance Reports</h1>
            <p className="header-subtitle">
              Track your performance, analyze trends, and view detailed analytics
            </p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={() => setShowFilters(!showFilters)}>
              <Filter size={16} />
              {showFilters ? "Hide" : "Show"} Filters
            </button>
            <button className="btn-secondary" onClick={handleExportReport}>
              <Download size={16} />
              Export Report
            </button>
            <button className="btn-primary">
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="emp-reports-content">
          {/* Quick Stats */}
          <div className="stats-grid">
            <div className="stat-card blue">
              <div className="stat-icon">
                <Users2 size={24} />
              </div>
              <div className="stat-info">
                <p className="stat-label">Total Joins</p>
                <h3 className="stat-value">{stats.totalJoins}</h3>
                <p className="stat-trend positive">
                  <ArrowUpRight size={14} />
                  12.5% vs last period
                </p>
              </div>
            </div>

            <div className="stat-card green">
              <div className="stat-icon">
                <CalendarDays size={24} />
              </div>
              <div className="stat-info">
                <p className="stat-label">Interviews</p>
                <h3 className="stat-value">{stats.totalInterviews}</h3>
                <p className="stat-trend positive">
                  <ArrowUpRight size={14} />
                  8.3% vs last period
                </p>
              </div>
            </div>

            <div className="stat-card purple">
              <div className="stat-icon">
                <FileText size={24} />
              </div>
              <div className="stat-info">
                <p className="stat-label">CVs Submitted</p>
                <h3 className="stat-value">{stats.totalCVs}</h3>
                <p className="stat-trend positive">
                  <ArrowUpRight size={14} />
                  15.2% vs last period
                </p>
              </div>
            </div>

            <div className="stat-card orange">
              <div className="stat-icon">
                <Target size={24} />
              </div>
              <div className="stat-info">
                <p className="stat-label">Conversion Rate</p>
                <h3 className="stat-value">{stats.conversionRate}%</h3>
                <p className="stat-trend positive">
                  <ArrowUpRight size={14} />
                  5.1% vs last period
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="filters-section">
              <div className="filters-header">
                <h3>Filters</h3>
              </div>
              <div className="filters-grid">
                <div className="filter-group">
                  <label>Date Range</label>
                  <div className="quick-date-filters">
                    <button
                      className={dateRange === "today" ? "active" : ""}
                      onClick={() => handleQuickDateRange("today")}
                    >
                      Today
                    </button>
                    <button
                      className={dateRange === "thisWeek" ? "active" : ""}
                      onClick={() => handleQuickDateRange("thisWeek")}
                    >
                      This Week
                    </button>
                    <button
                      className={dateRange === "thisMonth" ? "active" : ""}
                      onClick={() => handleQuickDateRange("thisMonth")}
                    >
                      This Month
                    </button>
                    <button
                      className={dateRange === "thisQuarter" ? "active" : ""}
                      onClick={() => handleQuickDateRange("thisQuarter")}
                    >
                      This Quarter
                    </button>
                    <button
                      className={dateRange === "thisYear" ? "active" : ""}
                      onClick={() => handleQuickDateRange("thisYear")}
                    >
                      This Year
                    </button>
                  </div>
                </div>
                <div className="filter-group">
                  <label>Client</label>
                  <select
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="filter-select"
                  >
                    <option>All</option>
                    {clientWiseData.map((c) => (
                      <option key={c.client}>{c.client}</option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <label>Process</label>
                  <select
                    value={selectedProcess}
                    onChange={(e) => setSelectedProcess(e.target.value)}
                    className="filter-select"
                  >
                    <option>All</option>
                    {processWiseData.map((p) => (
                      <option key={p.process}>{p.process}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="reports-tabs">
            <button
              className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <Activity size={16} />
              Overview
            </button>
            <button
              className={`tab-btn ${activeTab === "performance" ? "active" : ""}`}
              onClick={() => setActiveTab("performance")}
            >
              <TrendingUp size={16} />
              Performance
            </button>
            <button
              className={`tab-btn ${activeTab === "clients" ? "active" : ""}`}
              onClick={() => setActiveTab("clients")}
            >
              <Users size={16} />
              Client Wise
            </button>
            <button
              className={`tab-btn ${activeTab === "detailed" ? "active" : ""}`}
              onClick={() => setActiveTab("detailed")}
            >
              <FileText size={16} />
              Detailed Report
            </button>
            <button
              className={`tab-btn ${activeTab === "activities" ? "active" : ""}`}
              onClick={() => setActiveTab("activities")}
            >
              <Activity size={16} />
              Recent Activities
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="tab-content">
              <div className="charts-grid">
                <div className="chart-card full-width">
                  <h3 className="chart-title">Monthly Performance Trend</h3>
                  <LineChart
                    data={performanceData}
                    dataKey="joins"
                    label="Joins Over Time"
                    color="#3b82f6"
                  />
                </div>

                <div className="chart-card">
                  <h3 className="chart-title">Process Distribution</h3>
                  <PieChartComponent data={processWiseData} />
                </div>

                <div className="chart-card">
                  <h3 className="chart-title">Top Performing Clients</h3>
                  <BarChart
                    data={clientWiseData}
                    labelKey="client"
                    valueKey="joins"
                    label="Joins by Client"
                  />
                </div>
              </div>

              {/* Recent Activities */}
              <div className="activities-section">
                <h3 className="section-title">Recent Activities</h3>
                <div className="activities-list">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="activity-item">
                      <div className={`activity-icon ${activity.type}`}>
                        <Activity size={16} />
                      </div>
                      <div className="activity-content">
                        <p className="activity-text">{activity.activity}</p>
                        <p className="activity-date">{activity.date}</p>
                      </div>
                      <ChevronRight size={16} className="activity-arrow" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "performance" && (
            <div className="tab-content">
              <div className="performance-grid">
                <div className="chart-card full-width">
                  <h3 className="chart-title">Joins vs Target</h3>
                  <LineChart
                    data={performanceData}
                    dataKey="joins"
                    label="Monthly Joins Performance"
                    color="#10b981"
                  />
                </div>

                <div className="chart-card full-width">
                  <h3 className="chart-title">Interview Activity</h3>
                  <LineChart
                    data={performanceData}
                    dataKey="interviews"
                    label="Monthly Interview Trend"
                    color="#8b5cf6"
                  />
                </div>

                <div className="chart-card full-width">
                  <h3 className="chart-title">CV Submission Trend</h3>
                  <LineChart
                    data={performanceData}
                    dataKey="cvs"
                    label="Monthly CV Submissions"
                    color="#f59e0b"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "clients" && (
            <div className="tab-content">
              <div className="chart-card full-width">
                <h3 className="chart-title">Client-Wise Performance</h3>
                <BarChart
                  data={clientWiseData}
                  labelKey="client"
                  valueKey="joins"
                  label="Joins by Client"
                />
              </div>

              <div className="client-table-section">
                <h3 className="section-title">Detailed Client Analysis</h3>
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>Client Name</th>
                      <th>Total Joins</th>
                      <th>CVs Submitted</th>
                      <th>Success Rate</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientWiseData.map((client, index) => (
                      <tr key={index}>
                        <td className="client-name">{client.client}</td>
                        <td className="joins-count">{client.joins}</td>
                        <td>{client.cvs}</td>
                        <td>
                          <div className="success-bar">
                            <div
                              className="success-fill"
                              style={{ width: `${client.success}%` }}
                            ></div>
                            <span className="success-text">{client.success}%</span>
                          </div>
                        </td>
                        <td>
                          <span className="status-badge active">Active</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "detailed" && (
            <div className="tab-content">
              <div className="detailed-report-grid">
                <div className="report-section">
                  <h3 className="section-title">
                    <Award size={20} />
                    Achievement Summary
                  </h3>
                  <div className="achievement-cards">
                    <div className="achievement-card">
                      <div className="achievement-label">Target Achievement</div>
                      <div className="achievement-value">{stats.targetAchievement}%</div>
                      <div className="achievement-progress">
                        <div
                          className="progress-fill"
                          style={{ width: `${stats.targetAchievement}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="achievement-card">
                      <div className="achievement-label">Conversion Rate</div>
                      <div className="achievement-value">{stats.conversionRate}%</div>
                      <div className="achievement-progress">
                        <div
                          className="progress-fill"
                          style={{ width: `${stats.conversionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="report-section">
                  <h3 className="section-title">
                    <TrendingUp size={20} />
                    Monthly Breakdown
                  </h3>
                  <table className="reports-table">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Joins</th>
                        <th>Interviews</th>
                        <th>CVs</th>
                        <th>Target</th>
                        <th>Status</th>
                      </tr>
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
                            <span
                              className={`status-badge ${
                                data.joins >= data.target ? "success" : "warning"
                              }`}
                            >
                              {data.joins >= data.target ? "Achieved" : "In Progress"}
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

          {activeTab === "activities" && (
            <div className="tab-content">
              <div className="recent-activities-section">
                <div className="activities-header">
                  <div className="activities-title-bar"></div>
                  <h2 className="activities-title">Recent Activities</h2>
                </div>
                <div className="activities-list-container">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="activity-card"
                      onClick={() => {
                        // Handle activity click - could show details or navigate
                        console.log("Activity clicked:", activity);
                      }}
                    >
                      <div
                        className="activity-icon-square"
                        style={{ backgroundColor: activity.color }}
                      >
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

