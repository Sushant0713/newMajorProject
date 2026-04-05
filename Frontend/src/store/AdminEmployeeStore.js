import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

const useAdminEmployeeStore = create((set, get) => ({
    employees: [],
    selectedEmployee: null,
    employeePortfolio: null,
    employeeCallHistory: [],
    completedCandidates: [],
    dashboardStats: {},
    recruitmentPipeline: {},
    monthlyTargetAchievement: {},
    successLogs: [],
    loading: false,
    error: null,

    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    fetchAllEmployees: async () => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.get("/admin/employee/getAllEmployees");
            set({ employees: res.data, loading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to fetch employees",
                loading: false,
            });
        }
    },


    fetchSelectedEmployee: async (employeeId) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.get(`/admin/employee/getEmployeeById?empId=${employeeId}`);
            set({ selectedEmployee: res.data, loading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to fetch employee",
                loading: false,
            });
        }
    },


    fetchEmployeePortfolio: async (employeeId, start_date, end_date) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post(`/admin/employee/getEmployeePortfolio?empId=${employeeId}`, { start_date, end_date });
            set({ employeePortfolio: res.data, loading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to fetch employee portfolio",
                loading: false,
            });
        }
    },


    fetchEmployeeCallHistory: async (employeeId, start_date, end_date) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post(`/admin/employee/employeeCallHistory?empId=${employeeId}`, { start_date, end_date });
            set({ employeeCallHistory: res.data, loading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to fetch employee call history",
                loading: false,
            });
        }
    },


    fetchCompletedCandidates: async (employeeId, start_date, end_date) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post(`/admin/employee/completedCandidates?empId=${employeeId}`, { start_date, end_date });
            set({ completedCandidates: res.data, loading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to fetch completed candidates",
                loading: false,
            });
        }
    },

    fetchDashboardStats: async (empId, start_date, end_date) => {
        set({ loading: true });
        try {
            const params = start_date && end_date ? `&start_date=${start_date}&end_date=${end_date}` : "";
            const [candidates, conversion, success, today, week] = await Promise.all([
                axiosInstance.get(`/employee/dashboard/totalAssignedCandidates?empId=${empId}${params}`),
                axiosInstance.get(`/employee/dashboard/conversionRate?empId=${empId}${params}`),
                axiosInstance.get(`/employee/dashboard/successRate?empId=${empId}${params}`),
                axiosInstance.get(`/employee/dashboard/todaysAssignment?empId=${empId}${params}`),
                axiosInstance.get(`/employee/dashboard/completedThisWeek?empId=${empId}${params}`)
            ]);
            set({
                dashboardStats: {
                    totalCandidates: candidates.data.total_candidates,
                    conversionRate: conversion.data.conversion_rate,
                    successRate: success.data.success_rate,
                    todaysAssignment: today.data.today_assignments,
                    completedThisWeek: week.data.week_completed
                },
                loading: false
            });
        } catch (error) {
            set({ error: "Failed to fetch dashboard stats", loading: false });
        }
    },

    fetchRecruitmentPipeline: async (empId, start_date, end_date) => {
        set({ loading: true });
        try {
            const params = start_date && end_date ? `&start_date=${start_date}&end_date=${end_date}` : "";
            const res = await axiosInstance.get(`/employee/dashboard/recruitmentPipeline?empId=${empId}${params}`);
            set({ recruitmentPipeline: res.data.pipeline, loading: false });
        } catch (error) {
            set({ error: "Failed to fetch recruitment pipeline", loading: false });
        }
    },

    fetchMonthlyTargetAchievement: async (empId, start_date, end_date) => {
        set({ loading: true });
        try {
            const res = await axiosInstance.post(`/employee/dashboard/getMonthlyTargetAchievement`, {
                employee_id: empId,
                start_date,
                end_date
            });
            set({ monthlyTargetAchievement: res.data, loading: false });
        } catch (error) {
            set({ error: "Failed to fetch monthly target achievement", loading: false });
        }
    },

    fetchMonthlySuccessLogs: async (empId) => {
        set({ loading: true });
        try {
            const res = await axiosInstance.get(`/employee/dashboard/monthlySuccessLogs?empId=${empId}`);
            set({ successLogs: res.data.months, loading: false });
        } catch (error) {
            set({ error: "Failed to fetch monthly success logs", loading: false });
        }
    },


    addEmployee: async (employeeData) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post("/admin/employee/addEmployee", employeeData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success(res.data.message);
            set({ loading: false });
            return res.data;
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Failed to add employee";
            toast.error(message);
            set({ error: message, loading: false });
            throw error;
        }
    },


    updateEmployee: async (employeeData) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.put(`/admin/employee/updateEmployee`, employeeData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success(res.data.message);
            set({ loading: false });
            return res.data;
        } catch (error) {
            const message = error.response?.data?.message || error.response?.data?.error || "Failed to update employee";
            toast.error(message);
            set({ error: message,  loading: false });
        }
    },


    deleteEmployee: async (employeeId) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.delete(`/admin/employee/deleteEmployee?empId=${employeeId}`);
            set({ loading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to delete employee",
                loading: false,
            });
        }
    },


    markAsPIP: async (employeeId, pipData) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post(`/admin/employee/markAsPIP?empId=${employeeId}`, pipData);
            set({ loading: false });
        } catch (error) {
            const message = error.response?.data?.message || "Failed to mark employee as PIP";
            toast.error(message);
            set({ error: message,  loading: false });
        }
    },


    endPIP: async (pip_id) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post(`/admin/employee/endPIP`, { pip_id });
            toast.success(res.data.message);
            set({ loading: false });
        } catch (error) {
            const message = error.response?.data?.message || "Failed to end PIP";
            toast.error(message);
            set({ error: message,  loading: false });
        }
    },


    addLOP: async (employeeId, lopData) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post(`admin/employee/addLOP?empId=${employeeId}`, lopData);
            toast.success(res.data.message);
            set({ loading: false });
        } catch (error) {
            const message = error.response?.data?.message || "Failed to add LOP";
            toast.error(message);
            set({ error: message, loading: false });
        }
    },


    registerEmployee: async (formDataToSend) => {
        console.log("formDataToSend: ", formDataToSend);
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post("/admin/employee/registerEmployee", formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            set({ loading: false });
            return res.data;
        } catch (error) {
            set({
                error: error.response?.data?.message || error.response?.data?.error || "Failed to register employee",
                loading: false,
            });
            throw error;
        }
    },

    clearEmployeeDetails: () => set({ employeeDetails: null }),
    clearPortfolio: () => set({
        employeePortfolio: null,
        employeeCallHistory: [],
        completedCandidates: [],
        dashboardStats: {},
        recruitmentPipeline: {},
        monthlyTargetAchievement: {},
        successLogs: []
    }),
}));

export default useAdminEmployeeStore;
