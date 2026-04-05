import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from 'react-hot-toast';

export const useAdminTeamStore = create((set, get) => ({
    teams: [],
    revenue: { total_revenue: 0, total_actual_revenue: 0 },
    teamDetails: null,
    teamMembers: [],
    employees: [],
    loading: false,
    error: null,

    getTeams: async (filterData) => {
        set({ loading: true, error: null });
        try {
            const cleanFilterData = Object.fromEntries(
                Object.entries(filterData).filter(([_, v]) => v !== undefined && v !== "")
            );
            const response = await axiosInstance.post("/admin/team/getAllTeams", cleanFilterData);
            const total_revenue = response.data.reduce((sum, t) => sum + Number(t.total_revenue || 0), 0);
            const total_actual_revenue = response.data.reduce((sum, t) => sum + Number(t.total_actual_revenue || 0), 0);

            set({
                teams: response.data,
                revenue: { total_revenue, total_actual_revenue },
                loading: false
            });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to fetch teams",
                loading: false,
              });
        }
    },

    getTeamMembers: async (teamId, fromDate, toDate) => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.post(`/admin/team/getTeamMembers?teamId=${teamId}`, {fromDate, toDate});
            set({ teamMembers: response.data, loading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to fetch team members",
                loading: false,
              });
        }
    },

    getAllEmployees: async () => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.get("/admin/team/getAllEmployees");
            set({ employees: response.data, loading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to fetch employees",
                loading: false,
              });
        }
    },

    addTeam: async (teamData) => {
        console.log(teamData);
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post("/admin/team/addteam", teamData);
            toast.success(res.data.message);
            set({ loading: false });
        } catch (error) {
            const message = error.response?.data?.message || "Failed to add team";
            toast.error(message);
            set({ error: message,  loading: false });
        }
    },

    getTeamDetails: async (teamId) => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.get(`/admin/team/getTeamDetails?teamId=${teamId}`);
            set({ teamDetails: response.data[0] || response.data, loading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to fetch team details",
                loading: false,
              });
        }
    },

    updateTeam: async (teamId, teamData) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post(`/admin/team/updateTeam?teamId=${teamId}`, teamData);
            toast.success(res.data.message);
            set({ loading: false });
        } catch (error) {
            const message = error.response?.data?.message || "Failed to update team";
            toast.error(message);
            set({ error: message,  loading: false });
        }
    },

    deleteTeam: async (teamId) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.delete(`/admin/team/deleteTeam?teamId=${teamId}`);
            toast.success(res.data.message);
            set({ teams: get().teams.filter(team => team.id !== teamId), loading: false });
        } catch (error) {
            const message =  error.response?.data?.message || "Failed to delete team";
            toast.error(message);
            set({ error: message,  loading: false });
        }
    },

    setError: (error) => {
        set({ error });
    },
}));