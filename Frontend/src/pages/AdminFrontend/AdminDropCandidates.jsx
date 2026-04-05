import React, { useEffect, useState } from "react";
import "./AdminDropCandidates.css";
import AdminNavbar from "../../components/AdminNavbar";
import AdminHeader from "../../components/AdminHeader";
import AdminCandidateData from "../../components/AdminCandidateData";
import { useAdminCadidateStore } from "../../store/AdminCandidateStore";

const AdminDropCandidates = () => {
        const { fetchCandidatesByStatus } = useAdminCadidateStore();
    useEffect(() => {
        fetchCandidatesByStatus({ status: "dropout" });
    }, []);

    return (
        <div className="admin-container">
        {/* Sidebar */}
        <AdminNavbar/>

        {/* Main Content */}
        <main className="drop-candidate-main">
            {/* Header */}
            <AdminHeader
                title="Dropped Candidates"
                
            />

            <div className="drop-content">
                <AdminCandidateData status="dropout"/>
            </div>
            
        </main>
        </div>
    );
}

export default AdminDropCandidates