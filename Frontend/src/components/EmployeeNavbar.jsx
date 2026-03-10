import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Database,
  Briefcase,
  BarChart2,
  Calendar,
  Menu,
} from "lucide-react";
import logo from "../assets/OHS.jpg";
import "./EmployeeNavbar.css";

export default function EmployeeNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [trackerSubmenuOpen, setTrackerSubmenuOpen] = useState(
    location.pathname.includes("joining") ||
    location.pathname.includes("lineup")
  );


  // Close sidebar on route change (mobile)
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    navigate("/employee-login");
  };

  const SidebarContent = (
    <>
      <div className="emp-nav-brand">
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <img src={logo} alt="logo" className="emp-nav-logo" />
          <div className="emp-nav-brand-name">Owh HR Solutions</div>
        </div>
        <button className="emp-mobile-close-btn" onClick={() => setMobileOpen(false)}>
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* <div className="emp-nav-summary">
        <p className="emp-summary-label">Today overview</p>
        <p className="emp-summary-main">3 meetings • 2 interviews</p>
        <p className="emp-summary-sub">Keep your tracker updated.</p>
      </div> */}

      <nav className="emp-nav">
        <Link
          to="/employee-dashboard"
          className={`emp-nav-item ${
            location.pathname === "/employee-dashboard" ? "active" : ""
          }`}
        >
          <LayoutDashboard size={18} /> <span>Dashboard</span>
        </Link>
        <Link
          to="/employee-clients"
          className={`emp-nav-item ${
            location.pathname === "/employee-clients" ? "active" : ""
          }`}
        >
          <Users size={18} /> <span>Clients</span>
        </Link>
        <div className={`emp-nav-with-submenu ${location.pathname.includes("joining") || location.pathname.includes("lineup") ? "active" : ""}`} onClick={() => setTrackerSubmenuOpen(!trackerSubmenuOpen)}>
          <div className={`emp-nav-item ${location.pathname.includes("joining") || location.pathname.includes("lineup") ? "active" : ""}`}>
            <UserCheck size={18} /> <span>Tracker</span>
          </div>

          {trackerSubmenuOpen && (
          <div className="emp-submenu">
            <Link
              to="/employee-joining-tracker"
              className={`emp-submenu-item ${
                location.pathname.includes("joining") ? "active" : ""
              }`}
            >
              Joining
            </Link>
            <Link
              to="/employee-lineup-tracker"
              className={`emp-submenu-item ${
                location.pathname.includes("lineup") ? "active" : ""
              }`}
            >
              Line Up
            </Link>
          </div>
          )}
        </div>

        <Link
          to="/employee-data"
          className={`emp-nav-item ${
            location.pathname.includes("/employee-data") ? "active" : ""
          }`}
        >
          <Database size={18} /> <span>Data</span>
        </Link>
        <Link
          to="/employee-payout"
          className={`emp-nav-item ${
            location.pathname === "/employee-payout" ? "active" : ""
          }`}
        >
          <Briefcase size={18} /> <span>Payout</span>
        </Link>
        <Link
          to="/employee-reports"
          className={`emp-nav-item ${
            location.pathname === "/employee-reports" ? "active" : ""
          }`}
        >
          <BarChart2 size={18} /> <span>Reports</span>
        </Link>
        <Link
          to="/employee-meetings"
          className={`emp-nav-item ${
            location.pathname === "/employee-meetings" ? "active" : ""
          }`}
        >
          <Calendar size={18} /> <span>Meetings</span>
        </Link>
      </nav>

      <div className="emp-nav-footer">
        {/* <div className="emp-sidebar-tip">
          <p className="emp-tip-title">Pro tip</p>
          <p className="emp-tip-text">
            Move candidates to Joining Tracker as soon as they join.
          </p>
        </div> */}
        <button className="emp-nav-logout" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="emp-mobile-topbar">
        <button onClick={() => setMobileOpen(true)}>
          <Menu size={24} />
        </button>
        <span className="emp-mobile-title">Employee Dashboard</span>
      </div>

      {/* Desktop Sidebar */}
      <aside className="emp-sidebar desktop-only">{SidebarContent}</aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="emp-sidebar mobile"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3 }}
            >
              {SidebarContent}
            </motion.div>

            <div
              className="emp-sidebar-overlay"
              onClick={() => setMobileOpen(false)}
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
}

