import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/OHS.jpg"; 
import "./AdminNavbar.css";

const navItems = [
  { icon: "dashboard", label: "Dashboard", path: "/admin-dashboard" },

  {
    icon: "group",
    label: "Clients",
    hasSubmenu: true,
    submenu: [
      { label: "Client List", path: "/admin-clients", icon: "list" },
      { label: "Assign Employee", path: "/admin-assign-employee", icon: "person_add" },
    ],
  },

  { icon: "work", label: "Process", path: "/admin-process" },
  { icon: "badge", label: "Employees", path: "/admin-employees" },
  { icon: "groups", label: "Teams", path: "/admin-teams" },

  {
    icon: "person_search",
    label: "Tracker",
    hasSubmenu: true,
    submenu: [
      { label: "Joining", path: "/admin-joining-tracker", icon: "how_to_reg" },
      { label: "Line Up", path: "/admin-lineup-tracker", icon: "format_list_bulleted" },
    ],
  },

  {
    icon: "database",
    label: "Data Management",
    hasSubmenu: true,
    submenu: [
      { label: "Data Import", path: "/admin-data-import", icon: "upload_file" },
      { label: "Data Assign", path: "/admin-data-assign", icon: "assignment" },
    ],
  },

  { icon: "videocam", label: "Meetings", path: "/admin-meetings" },
  { icon: "paid", label: "Payout Management", path: "/admin-payout-management" },
  { icon: "event_busy", label: "LOP Management", path: "/admin-lop-management" },
];

export default function AdminNavbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  
  useEffect(() => {
    navItems.forEach(item => {
      if (item.hasSubmenu) {
        const isActive = item.submenu.some(
          sub => sub.path === location.pathname
        );
        if (isActive) {
          setOpenSubmenu(item.label);
        }
      }
    });
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    navigate("/");
  }
  
  const SidebarContent = (
    <>
      <div className="admin-brand">
        <img src={logo} alt="Logo" className="admin-logo-img" />
        <h2 className="admin-brand-name">Owh HR Solutions</h2>
      </div>

      <nav className="admin-nav">
        {navItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            {item.hasSubmenu ? (
              <div className="nav-with-submenu">
                <button
                  className={`admin-nav-item with-submenu ${
                    item.submenu.some(
                      sub => sub.path === location.pathname
                    )
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setOpenSubmenu(prev =>
                      prev === item.label ? null : item.label
                    )
                  }
                >
                  <div className="nav-item-left">
                    <span className="material-symbols-outlined">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  <span className="material-symbols-outlined submenu-arrow">
                    {openSubmenu === item.label
                      ? "expand_less"
                      : "expand_more"}
                  </span>
                </button>

                <AnimatePresence>
                  {openSubmenu === item.label && (
                    <motion.div
                      className="submenu"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.submenu.map(sub => (
                        <Link
                          key={sub.path}
                          to={sub.path}
                          className={`submenu-item ${
                            location.pathname === sub.path
                              ? "active"
                              : ""
                          }`}
                        >
                          <span className="material-symbols-outlined">
                            {sub.icon}
                          </span>
                          {sub.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to={item.path}
                className={`admin-nav-item ${
                  location.pathname === item.path ? "active" : ""
                }`}
              >
                <span className="material-symbols-outlined">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            )}
          </motion.div>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <button onClick={handleLogout} className="admin-nav-item logout-btn">
          <span className="material-symbols-outlined">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="admin-mobile-topbar">
        <button onClick={() => setMobileOpen(true)}>
          <span className="material-symbols-outlined">menu</span>
        </button>
        <span className="mobile-title">Admin Panel</span>
      </div>

      {/* Desktop Sidebar */}
      <aside className="admin-sidebar desktop-only">{SidebarContent}</aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="admin-sidebar mobile"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3 }}
            >
              {SidebarContent}
            </motion.div>

            <div
              className="sidebar-overlay"
              onClick={() => setMobileOpen(false)}
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
}
