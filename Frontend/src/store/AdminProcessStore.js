import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from 'react-hot-toast';

export const useAdminProcessStore = create((set, get) => ({
    processes: [],
    selectedProcess: null,
    spocs: [],
    clientNames: [],
    loading: false,
    error: null,

    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    fetchAllProcesses: async () => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.get("/admin/process/getAllProcesses");
            if (Array.isArray(res.data)) {
                const mappedProcesses = res.data.map((process) => ({
                    id: process.id,
                    processName: process.process_name,
                    clientName: process.client_name,
                    hiringType: process.hiring_type,
                    displayPayout: process.display_amount ? process.display_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0",
                    realPayout: process.real_amount ? process.real_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0",
                    candidateAssigned: process.total_assigned_candidates || 0,
                    salary: process.salary || "",
                    status: process.status,
                    spocs: process.spoc_names ? process.spoc_names.split(',').filter(name => name.trim()) : [],
                }));
                set({ processes: mappedProcesses, loading: false });
            }
        } catch (err) {
            set({
                error: err.response?.data?.message || "Failed to fetch processes",
                loading: false,
            });
        }
    },

    fetchProcessDetails: async (processId) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.get(`/admin/process/viewProcessDetails?processId=${processId}`);
            set({ selectedProcess: res.data, loading: false });
        } catch (err) {
            set({
                error: err.response?.data?.message || "Failed to fetch process details",
                loading: false,
            });
        }
    },

    fetchProcessSpocs: async (processId) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.get(`/admin/process/getProcessSpocs?processId=${processId}`);
            set({ spocs: res.data, loading: false });
        } catch (err) {
            set({
                error: err.response?.data?.message || "Failed to fetch process spocs",
                loading: false,
            });
        }
    },

    addProcess: async (processData) => {
        set({ loading: true, error: null });
        try {
            const data = await axiosInstance.post("/admin/process/addProcess", processData);
            set({ loading: false });
            toast.success(data.data.message);
            await get().fetchAllProcesses();
        } catch (err) {
            const message = err.response?.data?.message || "Failed to add process";
            toast.error(message);
            set({ error: message, loading: false });
        }
    },

    updateProcess: async (processId, processData) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post(`/admin/process/updateProcess?processId=${processId}`, processData);
            set({ loading: false });
            toast.success(res.data.message);
            await get().fetchAllProcesses();
        } catch (err) {
            const message = err.response?.data?.message || "Failed to update process";
            toast.error(message);
            set({ error: message, loading: false });
        }
    },

    deleteProcess: async (processId) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.delete(`/admin/process/deleteProcess?processId=${processId}`);
            set({ loading: false });
            toast.success(res.data.message);
            await get().fetchAllProcesses();
        } catch (err) {
            const message = err.response?.data?.message || "Failed to delete process";
            toast.error(message);
            set({ error: message, loading: false });
        }
    },

    resetProcessState: () =>
        set({
          selectedProcess: null,
          spocs: [],
          error: null,
          loading: false,
        }),

    setSelectedProcess: (process) => set({ selectedProcess: process }),
    setSpocs: (spocs) => set({ spocs }),

    fetchClientNames: async () => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.get("/admin/process/getClientNames");
            set({ clientNames: res.data || [], loading: false });
        } catch (err) {
            set({
                error: err.response?.data?.message || "Failed to fetch client names",
                loading: false,
            });
        }
    },
}));