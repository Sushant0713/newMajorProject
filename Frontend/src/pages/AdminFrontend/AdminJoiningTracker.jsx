import { useState } from "react";
import AdminNavbar from "../../components/AdminNavbar.jsx";
import AdminHeader from "../../components/AdminHeader.jsx";
import JoiningTracker from "../../components/JoiningTracker.jsx";

export default function AdminJoiningTracker(){
    const admin_id = sessionStorage.getItem("userId");
  return (
      <div className="joining-tracker-root">
         {/* Sidebar */}
          <AdminNavbar />
  
          <main className="admin-main">
            <AdminHeader
              title="Joining Tracker"
              
            />
  
            <JoiningTracker
              role="admin"
              employee_id={admin_id}
            />
          </main>
      </div>
  
    );
  }