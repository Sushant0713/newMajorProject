import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Database,
  Briefcase,
  BarChart2,
  Calendar,
  Video,
  Clock,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PlayCircle,
} from "lucide-react";
import "./EmployeeMeetings.css";
import { useEmployeeMeetingStore } from "../../store/EmployeeMeetingStore.js";
import EmployeeNavbar from "../../components/EmployeeNavbar.jsx";
import EmployeeHeader from "../../components/EmployeeHeader.jsx";

export default function EmployeeMeetings() {
  const {
        allMeetings,
        upcomingMeetings,
        todaysMeetings,
        loading,
        error,
        fetchAllMeetings,
        fetchUpcomingMeetings,
        fetchTodaysMeetings,
  } = useEmployeeMeetingStore();

  const location = useLocation();

  const handleJoinMeeting = (meeting) => {
    window.open(meeting.google_meet_link, "_blank");
  };

  const empId = sessionStorage.getItem("userId");

  useEffect(() => {
    fetchAllMeetings(empId);
    fetchUpcomingMeetings(empId);
    fetchTodaysMeetings(empId);
  }, []);

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "status-scheduled";
      case "ongoing":
        return "status-ongoing";
      case "completed":
        return "status-completed";
      case "cancelled":
        return "status-cancelled";
      default:
        return "status-default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return <Clock size={16} />;
      case "ongoing":
        return <PlayCircle size={16} />;
      case "completed":
        return <CheckCircle2 size={16} />;
      case "cancelled":
        return <XCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const date = (meeting) => {
    return new Date(meeting.meeting_date).toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
  };

  const time = (meeting) => {
    return new Date(meeting.meeting_date).toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
  <div className="emp-meetings-root">
    <EmployeeNavbar />

    <main className="emp-meetings-main">
      <EmployeeHeader 
        title="Meetings"
        subtitle="Manage your meetings, schedules, and attendance"
      />

      {/* Statistics Cards */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Video size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Total Meetings</p>
            <h3 className="stat-value">{allMeetings?.length ?? 0}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Upcoming</p>
            <h3 className="stat-value">{upcomingMeetings?.length ?? 0}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <CalendarCheck size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Today's meetings</p>
            <h3 className="stat-value">{todaysMeetings?.length ?? 0}</h3>
          </div>
        </div>
      </div>

      <div className="meetings-card">
        <div className="card-header">
          <h3>All Meetings</h3>
          <span className="card-count">
            {allMeetings?.length ?? 0} meetings
          </span>
        </div>

        <div className="meetings-list">
          {allMeetings?.length === 0 ? (
            <div className="empty-state">
              <Calendar size={48} />
              <p>No meetings found</p>
            </div>
          ) : (
            allMeetings.map((meeting) => (
              <div key={meeting.id} className="meeting-item">
                <div className="meeting-main">
                  <div className="meeting-header">
                    <div className="meeting-title-section">
                      <h4 className="meeting-title">
                        {meeting.meeting_name}
                      </h4>
                      {/* <span className="meeting-createdBy">Created by: {meeting.created_by}</span> */}
                    </div>

                    <div
                      className={`status-badge ${getStatusClass(meeting.status)}`}
                    >
                      {getStatusIcon(meeting.status)}
                      <span>{meeting.status}</span>
                    </div>
                  </div>

                  <p className="meeting-description">
                    {meeting.description || "No description"}
                  </p>

                  <div className="meeting-meta">
                    <span className="meta-item">
                    <CalendarDays size={14} />
                    {date(meeting)} • <Clock size={14} /> {time(meeting)}
                  </span>

                    {/* <span className="meta-item">
                      <Video size={14} />
                      {meeting.duration_minutes} mins
                    </span> */}
                  </div>
                </div>

                <div className="meeting-actions">
                  <button
                    className="meeting-action-btn primary"
                    onClick={() => handleJoinMeeting(meeting)}
                    disabled={meeting.status === "Completed"}
                  >
                    <PlayCircle size={16} />
                    Join Meeting
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  </div>
  );
}
