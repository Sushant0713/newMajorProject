import { useState } from "react";
import LineUpTracker from "../../components/LineupTracker.jsx";
import AdminNavbar from "../../components/AdminNavbar.jsx";
import AdminHeader from "../../components/AdminHeader.jsx";

export default function AdminLineUpTracker(){
  const [darkMode, setDarkMode] = useState(false);
  const admin_id = sessionStorage.getItem("userId");

  return (
    <div className={`admin-lineup-root ${darkMode ? "dark" : ""}`}>
       {/* Sidebar */}
        <AdminNavbar />

        <main className="admin-main">
          <AdminHeader
            title="Line Up Tracker"
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />

          <LineUpTracker
            role="admin"
            employee_id={admin_id}
          />
        </main>
    </div>

  );
}
