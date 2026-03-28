import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useEmployeeClientStore = create((set, get) => ({
    loading: false,
    error: null,
    processes: [],
    processDetails: [],
    contactPersonDetails: [],
    clientNames: [],
    locations: [],
    stats: {
        totalProcesses: 0,
        totalOpenings: 0,
        filledPositions: 0,
        fillRate: 0,
    },

    // Fetch all processes
    fetchAllProcesses: async (empId) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.get(`/employee/client/getAllProcesses?empId=${empId}`);
            set({ processes: res.data, loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Failed to fetch processes", loading: false });
        }
    },

    // Fetch process details
    fetchProcessDetails: async (processId) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.get(`/employee/client/getProcessDetails?processId=${processId}`);
            set({ processDetails: res.data, loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Failed to fetch process details", loading: false });
        }
    },
    
    // Fetch client names
    fetchClientNames: async (empId) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.get(`/employee/client/getClientNames?employee_id=${empId}`);
            set({ clientNames: res.data, loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Failed to fetch client names", loading: false });
        }
    },

    // Fetch locations
    fetchLocations: async () => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.get("/employee/client/getLocations");
            set({ locations: res.data, loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Failed to fetch locations", loading: false });
        }
    },

    // Fetch stats
    fetchStats: async ({employee_id}) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post("/employee/client/getStats", {employee_id});
            set({ stats: res.data, loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Failed to fetch stats", loading: false });
        }
    },  

    // Fetch contact person details
    fetchContactPersonDetails: async ({employee_id}) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.get(`/employee/client/getContactPersonDetails?employee_id=${employee_id}`);
            set({ contactPersonDetails: res.data, loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Failed to fetch contact person details", loading: false });
        }
    },
}));