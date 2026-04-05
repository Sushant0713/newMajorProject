import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  ArrowLeft,
  Download,
  Calendar,
  Phone,
  UserCheck,
  TrendingUp,
  DollarSign,
  PieChart as PieChartIcon,
  Activity,
  History,
  Target,
  BarChart3
} from "lucide-react";
import AdminNavbar from "../../components/AdminNavbar";
import AdminHeader from "../../components/AdminHeader";
import useAdminEmployeeStore from "../../store/AdminEmployeeStore";
import "./AdminEmployeePortfolio.css";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AdminEmployeePortfolio() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const empId = searchParams.get("empId");

  const {
    selectedEmployee,
    employeePortfolio,
    employeeCallHistory,
    completedCandidates,
    dashboardStats,
    recruitmentPipeline,
    monthlyTargetAchievement,
    successLogs,
    loading,
    fetchSelectedEmployee,
    fetchEmployeePortfolio,
    fetchEmployeeCallHistory,
    fetchCompletedCandidates,
    fetchDashboardStats,
    fetchRecruitmentPipeline,
    fetchMonthlyTargetAchievement,
    fetchMonthlySuccessLogs,
    clearPortfolio
  } = useAdminEmployeeStore();

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // First day of current month
    return d.toISOString().split("T")[0];
  });

  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);

  
  useEffect(() => {
    if (empId) {
      fetchSelectedEmployee(empId);
      loadRealtimeData();
      loadDateFilteredData();
    }
    return () => clearPortfolio();
  }, [empId]);

  const loadRealtimeData = () => {
    fetchDashboardStats(empId, startDate, endDate);
    fetchRecruitmentPipeline(empId, startDate, endDate);
    fetchMonthlyTargetAchievement(empId, startDate, endDate);
    fetchMonthlySuccessLogs(empId);
  };

  const loadDateFilteredData = () => {
    fetchEmployeePortfolio(empId, startDate, endDate);
    fetchEmployeeCallHistory(empId, startDate, endDate);
    fetchCompletedCandidates(empId, startDate, endDate);
  };

  const handleApplyFilter = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
  };

  useEffect(() => {
    if (empId) {
      loadRealtimeData();
      loadDateFilteredData();
    }
  }, [startDate, endDate]);

  // Chart Data Preparation
  const statusChartData = useMemo(() => {
    if (!recruitmentPipeline || Object.keys(recruitmentPipeline).length === 0) return null;

    const labels = ["New", "Selected", "Interview", "Joined", "Dropout", "Clawback"];
    const data = [
      recruitmentPipeline.new || 0,
      recruitmentPipeline.selected || 0,
      recruitmentPipeline.interview || 0,
      recruitmentPipeline.joined || 0,
      recruitmentPipeline.dropout || 0,
      recruitmentPipeline.clawback || 0,
    ];

    const total = data.reduce((a, b) => a + b, 0);

    return {
      total,
      labels,
      datasets: [
        {
          label: "Candidates",
          data,
          backgroundColor: [
            "#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"
          ],
          hoverOffset: 10,
          borderWidth: 0,
        },
      ],
    };
  }, [recruitmentPipeline]);

  const targetComparisonData = useMemo(() => {
    if (!monthlyTargetAchievement) return null;

    return {
      labels: ["Revenue (₹)", "Candidates"],
      datasets: [
        {
          label: "Target",
          data: [monthlyTargetAchievement.revenueTarget || 0, monthlyTargetAchievement.candidateTarget || 0],
          backgroundColor: "rgba(107, 114, 128, 0.2)",
          borderRadius: 6,
        },
        {
          label: "Actual",
          data: [monthlyTargetAchievement.generatedRevenue || 0, monthlyTargetAchievement.completelyJoined || 0],
          backgroundColor: ["#4F46E5", "#10B981"],
          borderRadius: 6,
        }
      ]
    };
  }, [monthlyTargetAchievement]);

  const performanceTrendData = useMemo(() => {
    if (!successLogs || successLogs.length === 0) return null;

    const labels = successLogs.map(log => log.month);

    return {
      labels,
      datasets: [
        {
          label: "Success Rate (%)",
          data: successLogs.map(log => log.successRate),
          borderColor: "#4F46E5",
          backgroundColor: "rgba(79, 70, 229, 0.1)",
          fill: true,
          tension: 0.4,
          yAxisID: 'y',
        },
        {
          label: "Conversion Rate (%)",
          data: successLogs.map(log => log.conversionRate || 0),
          borderColor: "#10B981",
          borderDash: [5, 5],
          backgroundColor: "transparent",
          fill: false,
          tension: 0.4,
          yAxisID: 'y1',
        }
      ],
    };
  }, [successLogs]);

  const handleBack = () => navigate("/admin-employee");

  const employeeName = selectedEmployee?.[0]?.full_name || "Employee";

  // Achievement Calculations
  const revenuePercent = Math.min(100, (monthlyTargetAchievement.generatedRevenue / (monthlyTargetAchievement.revenueTarget || 1)) * 100);
  const candidatePercent = Math.min(100, (monthlyTargetAchievement.completelyJoined / (monthlyTargetAchievement.candidateTarget || 1)) * 100);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isSmallMobile = windowWidth < 480;

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          boxWidth: 8,
          padding: isSmallMobile ? 6 : 12,
          font: { size: isSmallMobile ? 9 : 10, weight: '600' }
        }
      },
      tooltip: { enabled: true }
    }
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: {
        ticks: {
          maxRotation: isMobile ? 45 : 0,
          minRotation: isMobile ? 45 : 0,
          font: { size: isSmallMobile ? 8 : 10 },
          autoSkip: true,
          maxTicksLimit: isSmallMobile ? 5 : isMobile ? 8 : 12
        },
        grid: { display: false }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        min: 0,
        max: 100,
        ticks: { font: { size: 9 }, stepSize: 25 }
      },
      y1: {
        type: 'linear',
        display: !isSmallMobile,
        position: 'right',
        min: 0,
        max: 100,
        grid: { drawOnChartArea: false },
        ticks: { font: { size: 9 }, stepSize: 25 }
      },
    },
    plugins: {
      legend: {
        position: 'top',
        labels: { boxWidth: 10, font: { size: isSmallMobile ? 9 : 10 }, padding: 10 }
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: { boxWidth: 10, font: { size: isSmallMobile ? 9 : 10 } }
      }
    },
    scales: {
      x: {
        ticks: { font: { size: isSmallMobile ? 9 : 11 } },
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        ticks: { font: { size: 9 } }
      }
    }
  };

  return (
    <div className="admin-employee-root">
      <AdminNavbar />
      <main className="admin-main">
        <AdminHeader
          title={`Portfolio: ${employeeName}`}
          
        />

        <div className="portfolio-root">
          {/* Top Actions & Filters */}
          <div className="portfolio-header-actions" style={{ justifyContent: 'flex-end' }}>
            <div className="portfolio-filters">
              <div className="date-input-group">
                <label>FROM</label>
                <input
                  type="date"
                  value={tempStartDate}
                  onChange={(e) => setTempStartDate(e.target.value)}
                />
              </div>
              <div className="date-input-group">
                <label>TO</label>
                <input
                  type="date"
                  value={tempEndDate}
                  onChange={(e) => setTempEndDate(e.target.value)}
                />
              </div>
              <button className="apply-filter-btn" onClick={handleApplyFilter}>
                Apply
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="portfolio-stats-grid">
            <div className="portfolio-stat-card">
              <span className="stat-card-label">Overall Performance</span>
              <span className="stat-card-value">{dashboardStats.successRate || 0}%</span>
              <span className="stat-card-subtitle">Success Rate</span>
              <div className="target-container">
                <div className="target-header">
                  <span>Target: 85%</span>
                  <span className="achievement-pill pill-success">ON TRACK</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill success" style={{ width: `${Math.min(100, (dashboardStats.successRate / 85) * 100)}%` }}></div>
                </div>
              </div>
            </div>

            <div className="portfolio-stat-card">
              <span className="stat-card-label">Monthly Revenue</span>
              <span className="stat-card-value">₹{new Intl.NumberFormat("en-IN").format(monthlyTargetAchievement.generatedRevenue || 0)}</span>
              <span className="stat-card-subtitle">Generated in period</span>
              <div className="target-container">
                <div className="target-header">
                  <span>Goal: ₹{new Intl.NumberFormat("en-IN").format(monthlyTargetAchievement.revenueTarget || 0)}</span>
                  <span className={`achievement-pill ${revenuePercent > 80 ? 'pill-success' : 'pill-warning'}`}>
                    {Math.round(revenuePercent)}%
                  </span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${revenuePercent}%` }}></div>
                </div>
              </div>
            </div>

            <div className="portfolio-stat-card">
              <span className="stat-card-label">Candidate Placements</span>
              <span className="stat-card-value">{monthlyTargetAchievement.completelyJoined || 0}</span>
              <span className="stat-card-subtitle">Joined in period</span>
              <div className="target-container">
                <div className="target-header">
                  <span>Target: {monthlyTargetAchievement.candidateTarget || 0}</span>
                  <span className={`achievement-pill ${candidatePercent > 80 ? 'pill-success' : 'pill-warning'}`}>
                    {Math.round(candidatePercent)}%
                  </span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill warning" style={{ width: `${candidatePercent}%` }}></div>
                </div>
              </div>
            </div>

            <div className="portfolio-stat-card">
              <span className="stat-card-label">Incentives / Commission</span>
              <span className="stat-card-value">{selectedEmployee?.[0]?.commission_rate || 0}%</span>
              <span className="stat-card-subtitle">Revenue Share Rate</span>
              <div className="target-container" style={{ marginTop: '24px' }}>
                <span className={`text-xs font-bold uppercase tracking-tighter ${dashboardStats.successRate > 80 ? 'text-primary' : 'text-gray-500'}`}>
                  {dashboardStats.successRate > 80 ? "Gold Performer Status" : "Standard Performer"}
                </span>
              </div>
            </div>
          </div>

          <div className="portfolio-stats-grid portfolio-mini-stats">
            <div className="portfolio-stat-card">
              <span className="stat-card-label">TODAY'S WORK</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span className="stat-card-value">{dashboardStats.todaysAssignment || 0}</span>
                <TrendingUp size={14} color="#10B981" />
              </div>
              <span className="stat-card-subtitle">Assigned Candidates</span>
            </div>
            <div className="portfolio-stat-card">
              <span className="stat-card-label">WEEKLY SUCCESS</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span className="stat-card-value">{dashboardStats.completedThisWeek || 0}</span>
                <UserCheck size={14} color="#3B82F6" />
              </div>
              <span className="stat-card-subtitle">Joined this week</span>
            </div>
            <div className="portfolio-stat-card">
              <span className="stat-card-label">INTERVIEWS</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span className="stat-card-value">{monthlyTargetAchievement.interviewCount || 0}</span>
                <Activity size={14} color="#F59E0B" />
              </div>
              <span className="stat-card-subtitle">Month-to-date</span>
            </div>
            <div className="portfolio-stat-card">
              <span className="stat-card-label">CONVERSION</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span className="stat-card-value">{dashboardStats.conversionRate || 0}%</span>
                <Target size={14} color="#8B5CF6" />
              </div>
              <span className="stat-card-subtitle">Sales Efficiency</span>
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-grid">
            {/* Recruitment Pipeline */}
            <div className="portfolio-card" style={{ padding: '20px', overflow: 'hidden' }}>
              <div className="card-header" style={{ marginBottom: '16px' }}>
                <h3 className="card-title">Recruitment Pipeline</h3>
                <PieChartIcon size={20} className="text-secondary" />
              </div>
              <div style={{ position: 'relative', height: isMobile ? '240px' : '300px', width: '100%' }}>
                {statusChartData && statusChartData.total > 0 ? (
                  <>
                    <Doughnut data={statusChartData} options={doughnutOptions} />
                    <div className="chart-center-label">
                      <span className="chart-center-value">{statusChartData.total}</span>
                      <span className="chart-center-text">Total</span>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', fontStyle: 'italic', fontSize: '0.875rem' }}>
                    No pipeline data recorded
                  </div>
                )}
              </div>
            </div>

            {/* Target vs Actual */}
            <div className="portfolio-card" style={{ padding: '20px', overflow: 'hidden' }}>
              <div className="card-header" style={{ marginBottom: '16px' }}>
                <h3 className="card-title">Target vs Actual</h3>
                <BarChart3 size={20} className="text-secondary" />
              </div>
              <div style={{ position: 'relative', height: isMobile ? '220px' : '280px', width: '100%' }}>
                {targetComparisonData ? (
                  <Bar data={targetComparisonData} options={barOptions} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', fontStyle: 'italic', fontSize: '0.875rem' }}>
                    No target data
                  </div>
                )}
              </div>
            </div>

            {/* Performance Trends - spans full width on desktop */}
            <div className="portfolio-card" style={{ gridColumn: isMobile ? 'span 1' : 'span 2', padding: '20px', overflow: 'hidden' }}>
              <div className="card-header" style={{ marginBottom: '16px' }}>
                <h3 className="card-title">Performance Trends (Last 12 Months)</h3>
                <TrendingUp size={20} className="text-secondary" />
              </div>
              <div style={{ position: 'relative', height: isMobile ? '220px' : '280px', width: '100%' }}>
                {performanceTrendData ? (
                  <Line data={performanceTrendData} options={lineOptions} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', fontStyle: 'italic', fontSize: '0.875rem' }}>
                    No trend data
                  </div>
                )}
              </div>
            </div>
          </div>


          {/* Main Content Areas */}
          <div className="portfolio-content-grid">
            {/* Left Column: Metrics and Trends */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

              {/* Success Candidates Table */}
              <div className="portfolio-card">
                <div className="card-header">
                  <h3 className="card-title">Successful Placements</h3>
                  <UserCheck size={20} className="text-secondary" />
                </div>
                <div className="history-table-container">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Candidate</th>
                        <th>Process/Client</th>
                        <th>Payout</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedCandidates?.length > 0 ? (
                        completedCandidates.map((c, i) => (
                          <tr key={i}>
                            <td>{c.candidate_name}</td>
                            <td>{c.process_name} / {c.client_name}</td>
                            <td>₹{new Intl.NumberFormat("en-IN").format(c.real_payout_amount)}</td>
                            <td>
                              <span className={`status-${c.assignment_status === "completely_joined" ? "joined" : "dropout"}`}>
                                {c.assignment_status.replace("_", " ")}
                              </span>
                            </td>
                            <td>{new Date(c.updated_at).toLocaleDateString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="5" className="text-center py-8 text-gray-400 italic">No successful placements recorded in this period.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column: Work Actions & History */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="portfolio-card profile-enhanced-card">
                <div className="card-header">
                  <h3 className="card-title">Comprehensive Profile</h3>
                  <div className={`status-pill ${selectedEmployee?.[0]?.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                    {selectedEmployee?.[0]?.status}
                  </div>
                </div>

                <div className="profile-header-premium">
                  <div className="avatar-container">
                    <div className="avatar-main">
                      {employeeName.charAt(0)}
                    </div>
                    <div className="avatar-ring"></div>
                  </div>
                  <div className="profile-info-main">
                    <h4 className="profile-name">{employeeName}</h4>
                    <p className="profile-id-tag">{selectedEmployee?.[0]?.employee_id}</p>
                    <p className="profile-designation">{selectedEmployee?.[0]?.designation}</p>
                  </div>
                </div>

                <div className="profile-details-grid">
                  <div className="detail-section">
                    <h5 className="section-label">Contact Information</h5>
                    <div className="detail-item">
                      <div className="detail-icon"><Phone size={14} /></div>
                      <div className="detail-content">
                        <span className="label">Primary Phone</span>
                        <span className="value">{selectedEmployee?.[0]?.phone}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-icon"><Activity size={14} /></div>
                      <div className="detail-content">
                        <span className="label">Official Email</span>
                        <span className="value">{selectedEmployee?.[0]?.email}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-icon"><Download size={14} /></div>
                      <div className="detail-content">
                        <span className="label">Aadhar Address</span>
                        <span className="value address-text">{selectedEmployee?.[0]?.aadhar_address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h5 className="section-label">Professional Info</h5>
                    <div className="detail-item">
                      <div className="detail-icon"><Calendar size={14} /></div>
                      <div className="detail-content">
                        <span className="label">Joining Date</span>
                        <span className="value">{new Date(selectedEmployee?.[0]?.joining_date).toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-icon"><TrendingUp size={14} /></div>
                      <div className="detail-content">
                        <span className="label">Commission</span>
                        <span className="value highlight">{selectedEmployee?.[0]?.commission_rate}% Revenue Share</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-icon"><Target size={14} /></div>
                      <div className="detail-content">
                        <span className="label">Identification</span>
                        <span className="value uppercase">PAN: {selectedEmployee?.[0]?.pan_number}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="portfolio-card">
                <div className="card-header">
                  <h3 className="card-title">Active Work Logs</h3>
                  <Activity size={18} className="text-indigo-600" />
                </div>
                <div className="action-list">
                  <div className="action-item">
                    <div className="action-info">
                      <div className="action-icon icon-blue"><Phone size={16} /></div>
                      <span className="action-name">Total Phone Calls</span>
                    </div>
                    <span className="action-count">{employeePortfolio?.phoneCallCount || 0}</span>
                  </div>
                  <div className="action-item">
                    <div className="action-info">
                      <div className="action-icon icon-green"><UserCheck size={16} /></div>
                      <span className="action-name">Database Updates</span>
                    </div>
                    <span className="action-count">{employeePortfolio?.totalActions || 0}</span>
                  </div>
                </div>
              </div>

              <div className="portfolio-card">
                <div className="card-header">
                  <h3 className="card-title">Recent Interactions</h3>
                  <Download size={16} className="text-gray-400 cursor-pointer" title="Export Logs" />
                </div>
                <div className="action-list">
                  {employeeCallHistory?.length > 0 ? (
                    employeeCallHistory.slice(0, 5).map((call, i) => (
                      <div key={i} className="action-item interaction-item">
                        <div className="interaction-info">
                          <span className="interaction-name">{call.candidate_name || "Anonymous Candidate"}</span>
                          <span className="interaction-date">{new Date(call.call_date).toLocaleString()}</span>
                        </div>
                        <span className={`status-badge ${call.call_status === 'connected' ? 'status-connected' : 'status-failed'}`}>
                          {call.call_status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-gray-400 italic">No recent call interactions found.</div>
                  )}
                </div>
              </div>

              <div className="portfolio-card">
                <div className="card-header">
                  <h3 className="card-title">Attendance & Compliance</h3>
                  <History size={18} className="text-amber-500" />
                </div>
                <div className="grid gap-4 mt-2">
                  <div className="p-3 bg-red-50 rounded-xl flex justify-between items-center attendance-flex">
                    <div>
                      <p className="text-[10px] text-red-600 font-bold uppercase">Total LOP Marks</p>
                      <p className="text-lg font-bold text-red-700">{employeePortfolio?.lopData?.[0]?.count || 0}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-red-600 font-bold uppercase">Deduction</p>
                      <p className="text-lg font-bold text-red-700">₹{new Intl.NumberFormat("en-IN").format(employeePortfolio?.lopData?.[0]?.total_amount || 0)}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl flex justify-between items-center attendance-flex">
                    <span className="text-xs font-semibold text-gray-600">Compliance Standing</span>
                    {(employeePortfolio?.lopData?.[0]?.count || 0) >= 3 ? (
                      <span className="achievement-pill pill-warning bg-red-100 text-red-700">NEEDS REVIEW</span>
                    ) : (
                      <span className="achievement-pill pill-success">EXCELLENT</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

  );
}
