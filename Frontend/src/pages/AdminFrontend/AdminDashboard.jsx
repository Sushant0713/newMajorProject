import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./AdminDashboard.css";
import { useAdminDashboardStore } from "../../store/AdminDashboardStore.js";
import AdminNavbar from "../../components/AdminNavbar.jsx";
import AdminHeader from "../../components/AdminHeader.jsx";
import MonthlySuccessChart from "../../components/MonthlySuccessChart.jsx";

const notifications = [
  { id: 1, icon: "videocam", iconBg: "bg-blue-100", iconColor: "text-blue-600", title: "Interview with Alex Turner", time: "Today, 2:00 PM", unread: true },
  { id: 2, icon: "paid", iconBg: "bg-yellow-100", iconColor: "text-yellow-600", title: "Payout for Project Alpha", time: "Due: Tomorrow", unread: true },
  { id: 3, icon: "notification_important", iconBg: "bg-red-100", iconColor: "text-red-600", title: "Candidate Application Review", time: "3 new applications", unread: false },
  { id: 4, icon: "task_alt", iconBg: "bg-green-100", iconColor: "text-green-600", title: "Finalize Q3 report", time: "Due: In 3 days", unread: false },
];

const assignmentStatus = [
  { label: "Completely Joined", value: 1, color: "green" },
  { label: "Joined", value: 2, color: "blue" },
  { label: "Selected", value: 0, color: "purple" },
  { label: "Interview Scheduled", value: 5, color: "cyan" },
  { label: "In Process", value: 10, color: "yellow" },
  { label: "Dropout", value: 0, color: "red" },
];

const timePeriodOptions = ["This Month", "Last Month", "This Quarter", "This Year", "All Time"];



export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
    const [notificationsList, setNotificationsList] = useState(notifications);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("This Month");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { stats, monthlySuccessData, fetchDashboardStats, fetchTopPerformers, fetchMonthlySuccessLogs } = useAdminDashboardStore();
  
  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  useEffect(() => {
    fetchTopPerformers();
  }, [fetchTopPerformers]);

  useEffect(() => {
    fetchMonthlySuccessLogs();
  }, [fetchMonthlySuccessLogs]);

  const statCards = [
    { title: "Active Clients", value: stats.totalClients, color: "blue", icon: "group", path: "/admin-clients" },
    { title: "Total Candidates", value: stats.totalCandidates, color: "purple", icon: "person_search", path: "/admin-joining-tracker" },
    { title: "Active Employees", value: stats.totalEmployees, color: "green", icon: "badge", path: "/admin-employees" },
    { title: "Active Processes", value: stats.totalProcesses, color: "indigo", icon: "work", path: "/admin-process" },
    { title: "Total Assignments", value: stats.total_assignments, color: "pink", icon: "assignment", path: "/admin-assign-employee" },
    { title: "Success Rate", value: stats.success_rate, color: "teal", icon: "trending_up", path: null },
    { title: "Conversion Rate", value: stats.conversion_rate, color: "cyan", icon: "swap_vert", path: null },
    { title: "Dropout Rate", value: stats.dropout_rate, color: "red", icon: "trending_down", path: null },
    { title: "Revenue", value: stats.revenue, color: "yellow", icon: "paid", path: "/admin-payout-management" },
  ];
  
  const pipeline = [
    { label: "Completely Joined", value: stats.completelyJoined, percentage: ((stats.completelyJoined / stats.totalCandidates) * 100), color: "bg-blue-500" },
    { label: "Joined", value: stats.joined, percentage: ((stats.joined / stats.totalCandidates) * 100), color: "bg-purple-500" },
    { label: "Clawback", value: stats.clawback, percentage: ((stats.clawback / stats.totalCandidates) * 100), color: "bg-green-500" },
    { label: "Selected", value: stats.selected, percentage: ((stats.selected / stats.totalCandidates) * 100), color: "bg-indigo-500" },
    { label: "Interview Scheduled", value: stats.interviewScheduled, percentage: ((stats.interviewScheduled / stats.totalCandidates) * 100), color: "bg-orange-500" },
    { label: "Available", value: stats.available, percentage: ((stats.available / stats.totalCandidates) * 100), color: "bg-green-500" },
    { label: "Dropout", value: stats.dropout, percentage: ((stats.dropout / stats.totalCandidates) * 100), color: "bg-red-500" },
  ];

  const notificationRef = useRef(null);
  
  // Get current month date range
  const getCurrentMonthRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      start: firstDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      end: lastDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
  };
  
  const dateRange = getCurrentMonthRange();

  // Close notifications dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Apply dark mode
  const markNotificationRead = (id) => {
    setNotificationsList(prev =>
      prev.map(n => n.id === id ? { ...n, unread: false } : n)
    );
  };

  const unreadCount = notificationsList.filter(n => n.unread).length;

  return (
    <div className={`admin-dash-root`}>
      {/* Sidebar */}
      <AdminNavbar />

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <AdminHeader
          title="Dashboard"
          
        />

        {/* Stats Cards */}
        <div className="admin-content">
          <div className="admin-stats-grid">
            {statCards.map((card, index) => (
              <motion.div
                key={card.title}
                className={`admin-stat-card stat-${card.color} ${card.path ? 'clickable' : ''}`}
                onClick={() => card.path && navigate(card.path)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={card.path ? { scale: 1.02, y: -4 } : {}}
                whileTap={card.path ? { scale: 0.98 } : {}}
              >
                <div className="stat-card-header">
                  <span className="material-symbols-outlined stat-icon">{card.icon}</span>
                  <p className="stat-card-title">{card.title}</p>
                </div>
                <div className="stat-card-body">
                  <p className="stat-card-value">{card.value}</p>
                  {/* <span className={`stat-trend ${card.trendUp ? 'trend-up' : 'trend-down'}`}>
                    <span className="material-symbols-outlined">
                      {card.trendUp ? 'trending_up' : 'trending_down'}
                    </span>
                    {card.trend}
                  </span> */}
                </div>
                {card.path && (
                  <div className="stat-card-arrow">
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pipeline & Chart Section */}
        <div className="admin-section-grid">
          <motion.div
            className="admin-pipeline-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="card-header-with-action">
              <h3 className="admin-card-title">Recruitment Pipeline</h3>
              <button className="card-action-btn">
                <span className="material-symbols-outlined">open_in_new</span>
              </button>
            </div>
            <div className="pipeline-list">
              {pipeline.map((item, index) => (
                <motion.div
                  key={item.label}
                  className="pipeline-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <div className="pipeline-row">
                    <span className="pipeline-label">{item.label}</span>
                    <span className="pipeline-value">{item.value}</span>
                  </div>
                  <div className="pipeline-bar-bg">
                    <motion.div
                      className={`pipeline-bar-fill ${item.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 1, delay: 0.8 + index * 0.1, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="admin-chart-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="chart-header">
              <h3 className="admin-card-title">Monthly Success Rate</h3>
            </div>
            <div className="chart-container">
              {monthlySuccessData.length > 0 ? (
                <MonthlySuccessChart data={monthlySuccessData} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '280px', color: 'var(--text-secondary)' }}>
                  Loading chart data...
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Performers & Notifications Section */}
        <div className="admin-bottom-grid">
          <motion.div
            className="admin-performers-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="card-header-with-action">
              <h3 className="admin-card-title">Top 10 Performers</h3>
              {/* <button className="card-action-btn">View All</button> */}
            </div>
            <div className="performers-table-wrapper">
              <table className="performers-table">
                <thead>
                  <tr >
                    <th>rank</th>
                    <th>Id</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Designation</th>
                    <th>Completely Joined</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topPerformers.map((performer, index) => (
                    <motion.tr
                      key={performer.employee_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      whileHover={{ backgroundColor: "#f9fafb" }}
                    >
                      <td className="rank-cell">
                        <span className={`rank-badge rank-${index + 1}`}>
                          {index + 1}
                        </span>
                      </td>
                      <td>{performer.employee_id}</td>
                      <td>
                        <div className="performer-info">
                          {performer.full_name}
                        </div>
                        {/* <div className="performer-info"> */}
                          {/* <div className="performer-avatar">
                            {getInitials(performer.full_name)}
                          </div> */}
                          {/* {performer.full_name} */}
                        {/* </div> */}
                      </td>
                      <td>{performer.employee_email}</td>
                      <td>
                        <span className="department-tag">{performer.employee_role}</span>
                      </td>
                      {/* <td>
                        <div className="progress-bar-bg">
                          <motion.div
                            className="progress-bar-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${performer.score}%` }}
                            transition={{ duration: 1, delay: 1 + index * 0.1 }}
                          />
                        </div>
                      </td> */}
                      {/* <td className="score-cell">{performer.score}</td> */}
                      <td>
                          {performer.completely_joined_count}
                      </td>
                      <td>
                        <div className="score-cell">
                          ₹{Number(performer.total_revenue).toLocaleString()}
                        </div>
                      </td>

                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div
            className="admin-notifications-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="card-header-with-action">
              <h3 className="admin-card-title">Notifications & Tasks</h3>
              {/* <span className="notification-count">{unreadCount} new</span> */}
            </div>
            <div className="notifications-list">
              {notificationsList.map((notif, index) => (
                <motion.div
                  key={notif.id}
                  className={`notification-item ${notif.unread ? 'unread' : ''}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ x: 5 }}
                  onClick={() => markNotificationRead(notif.id)}
                >
                  <div className={`notification-icon ${notif.iconBg}`}>
                    <span className={`material-symbols-outlined ${notif.iconColor}`}>
                      {notif.icon}
                    </span>
                  </div>
                  <div className="notification-content">
                    <p className="notification-title">{notif.title}</p>
                    <p className="notification-time">{notif.time}</p>
                  </div>
                  {notif.unread && <span className="unread-indicator" />}
                </motion.div>
              ))}
            </div>
            <button className="view-all-btn">
              View All Tasks
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
