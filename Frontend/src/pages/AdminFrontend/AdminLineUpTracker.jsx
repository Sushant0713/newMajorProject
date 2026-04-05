import { useState } from "react";
import LineUpTracker from "../../components/LineupTracker.jsx";
import AdminNavbar from "../../components/AdminNavbar.jsx";
import AdminHeader from "../../components/AdminHeader.jsx";

export default function AdminLineUpTracker(){
    const admin_id = sessionStorage.getItem("userId");

  return (
    <div className={`admin-lineup-root ${darkMode ? "dark" : ""}`}>
       {/* Sidebar */}
        <AdminNavbar />

        <main className="admin-main">
          <AdminHeader
            title="Line Up Tracker"
            
          />

          <LineUpTracker
            role="admin"
            employee_id={admin_id}
          />
        </main>
    </div>

  );
}
