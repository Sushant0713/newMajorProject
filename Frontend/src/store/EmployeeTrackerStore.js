import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useEmployeeTrackerStore = create((set, get) => ({
    lineupsEmployee: [],
    joiningsEmployee: [],
    processesEmployee: [],
    clientsEmployee: [],
    loading: false,
    error: null,

    fetchLineUpsEmployee: async (employee_id, filters = {}) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post(`/employee/tracker/getLineupsEmployee?employee_id=${employee_id}`, filters);
            set({ lineupsEmployee: res.data, loading: false });
        } catch (err) {
            console.error(err);
            set({
            error: err.response?.data?.message || "Failed to fetch line-ups",
            loading: false,
            });
        }
    },

    fetchJoiningEmployee: async (employee_id, filters = {}) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post(`/employee/tracker/getJoiningsEmployee?employee_id=${employee_id}`, filters);
            set({ joiningsEmployee: res.data, loading: false });
        } catch (err) {
            console.error(err);
            set({
            error: err.response?.data?.message || "Failed to fetch line-ups",
            loading: false,
            });
        }
    },

    fetchProcessesForEmployee: async (employee_id) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.get(`/employee/tracker/getProcessForEmployee?employee_id=${employee_id}`);
            if (Array.isArray(res.data)) {
                set({ processesEmployee: res.data, loading: false });
            } else {
                set({ processesEmployee: [], loading: false });
            }
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to fetch process names",
                loading: false,
                processesEmployee: [],
            });
        }
    },

    fetchClientsForEmployee: async (employee_id) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.get(`/employee/tracker/getClientsForEmployee?employee_id=${employee_id}`);
            if (Array.isArray(res.data)) {
                set({ clientsEmployee: res.data, loading: false });
            } else {
                set({ clientsEmployee: [], loading: false });
            }
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to fetch client names",
                loading: false,
                clientsEmployee: [],
            });
        }
    },
}));