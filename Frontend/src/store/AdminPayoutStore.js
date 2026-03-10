import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useAdminPayoutStore = create((set, get) => ({
    loading: false,
    error: null,
    payouts: [],
    processNames: [],
    statusOptions: [],
    filters: {
        search: "",
        candidate_name: "",
        employee_name: "",
        process: "",
        status: "",
    },
    ids: {
        candidate_id: "",
        employee_id: "",
        process_id: "",
        payout_id: "",
        employee_table_id: "",
    },
    candidateHistory: [],

    // Fetch all payouts with filters
    fetchPayouts: async () => {
        const { filters } = get();
        try {
            set({ loading: true, error: null });
            const res = await axiosInstance.post(`/admin/payout/getPayouts`, filters);

            set({payouts: res.data, loading: false});
        } catch (error) {
            set({error: error.response?.data?.message || "Failed to fetch payouts", loading: false});
        }
    },

    // Fetch process names for filter dropdown
    fetchProcessNames: async () => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.get("/admin/payout/getProcessNames");

            if (Array.isArray(res.data)) {
                set({ processNames: res.data, loading: false });
            } else {
                set({ processNames: [], loading: false });
            }
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to fetch process names",
                loading: false,
                processNames: [],
            });
        }
    },

    // Fetch status options
    fetchStatusOptions: async () => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.get("/admin/payout/getStatusOptions");

            if (Array.isArray(res.data)) {
                set({ statusOptions: res.data, loading: false });
            } else {
                set({ statusOptions: [], loading: false });
            }
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to fetch status options",
                loading: false,
                statusOptions: [],
            });
        }
    },

    // Update filters
    setFilters: (newFilters) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters },
        }));
    },

    // Update IDs
    setIds: (newIds) => {
        set((state) => ({
            ids: { ...state.ids, ...newIds },
        }));
    },

    // Clear filters
    clearFilters: () => {
        set({
            filters: {
                search: "",
                candidate_name: "",
                employee_name: "",
                process: "",
                status: "",
            },
            ids: {
                candidate_id: "",
                employee_id: "",
                process_id: "",
                payout_id: "",
                employee_table_id: "",
            },
        });
    },

    // Generate payout for a candidate
    generatePayout: async (candidateId) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post("/admin/payout/generatePayout", { candidate_id: candidateId });
            toast.success(res.data.message || "Payout generated successfully");
            set({ loading: false });
            return { success: true, message: res.data.message };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to generate payout";
            set({ error: errorMessage, loading: false });
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    // Start clawback
    startClawback: async (candidateId) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post("/admin/payout/startClawback", {candidate_id: candidateId});
            toast.success(res.data.message || "Clawback started successfully");
            set({ loading: false });
            return { success: true, message: res.data.message };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to start clawback";
            set({ error: errorMessage, loading: false });
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    // Mark clawback
    markClawback: async (candidateId, reason) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post("/admin/payout/markClawback", {
                candidate_id: candidateId,
                reason: reason,
            });
            toast.success(res.data.message || "Clawback marked successfully");
            set({ loading: false });
            return { success: true, message: res.data.message };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to mark clawback";
            set({ error: errorMessage, loading: false });
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    // Mark invoice clear
    markInvoiceClear: async (candidateId) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post("/admin/payout/markInvoiceClear", { candidate_id: candidateId });
            toast.success(res.data.message || "Invoice marked clear");
            set({ loading: false });
            return { success: true, message: res.data.message };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to mark invoice clear";
            set({ error: errorMessage, loading: false });
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    // Mark approved
    markApproved: async (adminId, candidateId) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post("/admin/payout/markApproved", { admin_id: adminId, candidate_id: candidateId });
            toast.success(res.data.message || "Payout approved");
            set({ loading: false });
            return { success: true, message: res.data.message };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to approve payout";
            set({ error: errorMessage, loading: false });
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    // Approve payout (with invoice check)
    approvePayout: async (candidateId, adminId) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post(`/admin/payout/approvePayout?adminId=${adminId}`, {
                candidate_id: candidateId,
            });
            toast.success(res.data.message || "Payout approved");
            set({ loading: false });
            return { success: true, message: res.data.message };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to approve payout";
            set({ error: errorMessage, loading: false });
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    // Reject payout
    rejectPayout: async (candidateId, rejectReason, adminId) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post(`/admin/payout/rejectPayout?adminId=${adminId}`, {
                candidate_id: candidateId,
                reason: rejectReason,
            });
            toast.success(res.data.message || "Payout rejected");
            set({ loading: false });
            return { success: true, message: res.data.message };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to reject payout";
            set({ error: errorMessage, loading: false });
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    // Mark completely joined
    markCompletelyJoined: async (candidateId) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post("/admin/payout/markCompletelyJoined", {
                candidate_id: candidateId,
            });
            toast.success(res.data.message || "Candidate marked completely joined");
            set({ loading: false });
            return { success: true, message: res.data.message };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to mark completely joined";
            set({ error: errorMessage, loading: false });
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    // Emergency clawback
    emergencyClawback: async (candidateId, reason) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post("/admin/payout/emergencyClawback", {
                candidate_id: candidateId,
                reason: reason,
            });
            toast.success(res.data.message || "Emergency clawback applied");
            set({ loading: false });
            return { success: true, message: res.data.message };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to apply emergency clawback";
            set({ error: errorMessage, loading: false });
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    // Mark dropout
    markDropout: async (candidateId, reason) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post("/admin/payout/markDropout", {
                candidate_id: candidateId,
                reason: reason,
            });
            toast.success(res.data.message || "Candidate marked dropout");
            set({ loading: false });
            return { success: true, message: res.data.message };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to mark dropout";
            set({ error: errorMessage, loading: false });
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    batchApprove: async (candidateIds, adminId) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post(`/admin/payout/batchApprove`, {
                candidateIds: candidateIds,
                adminId: adminId  
            });
            toast.success(res.data.message || `${candidateIds.length} payout(s) approved`);
            set({ loading: false });
            return { success: true, message: res.data.message };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to approve payouts";
            set({ error: errorMessage, loading: false });
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    // Export CSV
    exportCSV: async () => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.get("/admin/payout/exportCSV", {
                responseType: "blob",
            });

            // Extract filename from backend header
            let filename = "payout_report.csv"; // fallback
            const disposition = res.headers["content-disposition"];

            if (disposition) {
                const match = disposition.match(/filename="?([^"]+)"?/);
                if (match && match[1]) {
                    filename = match[1];
                }
            }

            // Download file
            const blob = new Blob([res.data], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = filename; // ✅ backend-controlled filename
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("CSV exported successfully");
            set({ loading: false });
            return { success: true };

        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Failed to export CSV";

            set({ error: errorMessage, loading: false });
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    fetchCandidateHistory: async (candidateId) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.get(`/admin/payout/getCandidateStatusHistory?candidate_id=${candidateId}`);
            if(res.data.length === 0) {
                set({ candidateHistory: [], loading: false });
                return;
            }
            set({ candidateHistory: res.data, loading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to fetch candidate history",
                loading: false,
                candidateHistory: [],
            });
            toast.error(error.response?.data?.message || "Failed to fetch candidate history");
        }
    },

    // Reset error manually
    clearError: () => set({ error: null }),
}));

