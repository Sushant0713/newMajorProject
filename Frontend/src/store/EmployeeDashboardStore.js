import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useEmployeeDashboardStore = create((set, get) => ({
    successLogs: [],
    loading: false,
    error: null,

    stats: {
        total_clients: 0,
        total_candidates: 0,
        total_processes: 0,
        conversion_rate: 0,
        success_rate: 0,
        dropout_rate: 0,
        today_assignments: 0,
        week_completed: 0,
        // unread_count: 0,
        commission_rate: 0,
    },

    pipeline: {
        new: 0,
        selected: 0,
        interview: 0,
        joined: 0,
        dropout: 0,
        clawback: 0,
    },

    // ------------ MAIN FUNCTION TO LOAD EVERYTHING ------------
    fetchDashboard: async (empId) => {
        try {
        set({ loading: true, error: null });

        const [
            clients,
            candidates,
            processes,
            conversion,
            success,
            dropout,
            today,
            week,
            // unread,
            commission,
            pipeline
        ] = await Promise.all([
            axiosInstance.get(`/employee/dashboard/totalAssignedClients?empId=${empId}`),
            axiosInstance.get(`/employee/dashboard/totalAssignedCandidates?empId=${empId}`),
            axiosInstance.get(`/employee/dashboard/totalassignedProcesses?empId=${empId}`),
            axiosInstance.get(`/employee/dashboard/conversionRate?empId=${empId}`),
            axiosInstance.get(`/employee/dashboard/successRate?empId=${empId}`),
            axiosInstance.get(`/employee/dashboard/dropoutRate?empId=${empId}`),
            axiosInstance.get(`/employee/dashboard/todaysAssignment?empId=${empId}`),
            axiosInstance.get(`/employee/dashboard/completedThisWeek?empId=${empId}`),
            // axiosInstance.get(`/employee/dashboard/unreadMessages?empId=${empId}`),
            axiosInstance.get(`/employee/dashboard/commissionRate?empId=${empId}`),
            axiosInstance.get(`/employee/dashboard/recruitmentPipeline?empId=${empId}`)
        ]);

        set({
            stats: {
            total_clients: clients.data.total_clients,
            total_candidates: candidates.data.total_candidates,
            total_processes: processes.data.total_processes,
            conversion_rate: conversion.data.conversion_rate,
            success_rate: success.data.success_rate,
            dropout_rate: dropout.data.dropout_rate,
            today_assignments: today.data.today_assignments,
            week_completed: week.data.week_completed,
            // unread_count: unread.data.unread_count,
            commission_rate: commission.data[0]?.commission_rate || 0,
            },
            pipeline: pipeline.data.pipeline,
            loading: false,
        });
        } catch (err) {
        console.error("Dashboard Load Error:", err);
        set({ error: "Failed to load dashboard", loading: false });
        }
    },

    fetchMonthlySuccess: async (empId) => {
        set({ loading: true, error: null });
        try {
        const res = await axiosInstance.get(`/employee/dashboard/monthlySuccessLogs?empId=${empId}`);
        set({ successLogs: res.data.months, loading: false });
        } catch (err) {
        console.error("Error fetching success logs", err);
        set({ error: "Failed to load success logs", loading: false });
        }
    },

    monthlyTargets: null,
    fetchMonthlyTargets: async (empId) => {
        try {
            const res = await axiosInstance.post('/employee/dashboard/getMonthlyTargetAchievement', { employee_id: empId });
            set({ monthlyTargets: res.data });
        } catch (err) {
            console.error("Error fetching monthly targets", err);
        }
    },

    // Employee Profile functions
    employeeProfile: null,
    profileLoading: false,
    profileError: null,

    fetchEmployeeProfile: async (empId) => {
        set({ profileLoading: true, profileError: null });
        try {
            const res = await axiosInstance.get(`/employee/dashboard/employeeProfile?empId=${empId}`);
            set({ employeeProfile: res.data, profileLoading: false });
            return res.data;
        } catch (err) {
            console.error("Error fetching employee profile", err);
            set({ profileError: err.response?.data?.message || "Failed to load profile", profileLoading: false });
            throw err;
        }
    },

    updateEmployeeProfile: async (empId, profileData) => {
        set({ profileLoading: true, profileError: null });
        try {
            const res = await axiosInstance.put(`/employee/dashboard/updateEmployeeProfile?empId=${empId}`, {
                email: profileData.email,
                phone: profileData.phone,
                aadhar_address: profileData.address,
            });
            set({ profileLoading: false });
            return res.data;
        } catch (err) {
            console.error("Error updating employee profile", err);
            set({ profileError: err.response?.data?.message || "Failed to update profile", profileLoading: false });
            throw err;
        }
    },
}));
