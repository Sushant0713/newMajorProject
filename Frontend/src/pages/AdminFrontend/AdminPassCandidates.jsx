import React, { useEffect, useState } from "react";
import "./AdminPassCandidates.css";
import AdminNavbar from "../../components/AdminNavbar";
import AdminHeader from "../../components/AdminHeader";
import AdminCandidateData from "../../components/AdminCandidateData";
import { useAdminCadidateStore } from "../../store/AdminCandidateStore";


const AdminPassCandidates = () => {
        const { fetchCandidatesByStatus } = useAdminCadidateStore();
    useEffect(() => {
        fetchCandidatesByStatus({ status: "pass" });
    }, []);

    return (
        <div className="admin-container">
        {/* Sidebar */}
        <AdminNavbar/>

        {/* Main Content */}
        <main className="pass-candidate-main">
            {/* Header */}
            <AdminHeader
                title="Passed Candidates"
                
            />

            <div className="pass-content">
                <AdminCandidateData status="pass"/>
            </div>
            
        </main>
        </div>
    );
};

export default AdminPassCandidates;
