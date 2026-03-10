import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useAdminJoiningStore = create((set, get) => ({
    joinings: [],
    loading: false,
    error: null,

    fetchJoinings: async (filters = {}) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post("/admin/joining/getJoinings", filters);
            set({ joinings: res.data, loading: false });
        } catch (err) {
            console.error(err);
            set({
                error: err.response?.data?.message || "Failed to fetch joinings",
                loading: false,
            });
        }
    },

    editJoining: async (payload) => {
        debugger;
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post("/admin/joining/editJoining", payload);
            set({ loading: false });
        } catch (err) {
            console.error(err);
            set({
                error: err.response?.data?.message || "Failed to edit joining",
                loading: false,
        });
        }
    },

    exportJoiningUpCSV: async () => {
      set({ loading: true, error: null });
      try {
          const res = await axiosInstance.get("/admin/joining/exportJoiningUpCSV", {
              responseType: "blob",
          });

          // Extract filename from backend header
          let filename = "joining_data.csv"; // fallback
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

          toast.success("Joining data exported successfully");
          set({ loading: false });
          return { success: true };
      } catch (error) {
          const errorMessage =
              error.response?.data?.message ||
              error.message ||
              "Failed to export joining data";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
      }
  },
}));