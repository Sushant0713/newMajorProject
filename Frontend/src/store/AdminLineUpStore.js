import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from 'react-hot-toast';

export const useAdminLineUpStore = create((set, get) => ({
  lineups: [],
  allClientNames: [],
  allProcessNames: [],
  employees: [],
  selectedLineUp: null,
  loading: false,
  error: null,

  fetchLineUps: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.post("/admin/lineup/getLineups", filters);
      set({ lineups: res.data, loading: false });
    } catch (err) {
      console.error(err);
      set({
        error: err.response?.data?.message || "Failed to fetch line-ups",
        loading: false,
      });
    }
  },

  fetchLineUpById: async (assignment_id) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get("/admin/lineup/getLineUpById", {
        params: { assignment_id },
      });
      set({ selectedLineUp: res.data[0], loading: false });
    } catch (err) {
      console.error(err);
      set({
        error: err.response?.data?.message || "Failed to fetch line-up",
        loading: false,
      });
    }
  },

  addCallLog: async ({ candidate_id, employee_id }) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.post("/admin/lineup/addCallLog", {candidate_id, employee_id});
      set({ loading: false });
    } catch (err) {
      console.error(err);
      set({
        error: err.response?.data?.message || "Failed to log call",
        loading: false,
      });
    }
  },

  addToTracker: async ({ candidate_id, employee_id, process_id, resume }) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append("candidate_id", candidate_id);
      formData.append("employee_id", employee_id);
      formData.append("process_id", process_id);
      formData.append("resume", resume);

      await axiosInstance.post("/admin/lineup/addToTracker", formData);
      set({ loading: false });
    } catch (err) {
      console.error(err);
      set({
        error: err.response?.data?.message || "Failed to add to tracker",
        loading: false,
      });
    }
  },

  dropCandidate: async ({ candidateId, employee_id, reason }) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.post("/admin/lineup/dropCandidate", { employee_id, reason }, { params: { candidateId } });
      set({ loading: false });
    } catch (err) {
      console.error(err);
      set({
        error: err.response?.data?.message || "Failed to drop candidate",
        loading: false,
      });
    }
  },

  holdCandidate: async ({ candidateId, employee_id, reason }) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.post("/admin/lineup/holdCandidate", { employee_id, reason }, { params: { candidateId } });
      set({ loading: false });
    } catch (err) {
      console.error(err);
      set({
        error: err.response?.data?.message || "Failed to hold candidate",
        loading: false,
      });
    }
  },

  passCandidate: async ({ candidateId, employee_id, reason }) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.post("/admin/lineup/passCandidate", { employee_id, reason }, { params: { candidateId } });
      set({ loading: false });
    } catch (err) {
      console.error(err);
      set({
        error: err.response?.data?.message || "Failed to pass candidate",
        loading: false,
      });
    }
  },

  addNote: async ({ candidate_id, note }) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.post("/admin/lineup/addNote", {candidate_id, note});
      set({ loading: false });
    } catch (err) {
      console.error(err);
      set({
        error: err.response?.data?.message || "Failed to add note",
        loading: false,
      });
    }
  },

  fetchEmployee: async() => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get("/admin/lineup/getEmployees");
      set({ employees: res.data, loading: false });
    } catch (err) {
      console.error(err);
      set({
        error: err.response?.data?.message || "Failed to edit line-up",
        loading: false,
      });
    }
  },

  editLineUp: async (payload) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.post("/admin/lineup/editLineUp", payload);
      set({ loading: false });
    } catch (err) {
      console.error(err);
      set({
        error: err.response?.data?.message || "Failed to edit line-up",
        loading: false,
      });
    }
  },

  addResume: async ({ candidate_id, file }) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append("candidate_id", candidate_id);
      formData.append("resume", file);

      await axiosInstance.post("/admin/lineup/addResume", formData);

      set({ loading: false });
    } catch (err) {
      console.error(err);
      set({
        error: err.response?.data?.message || "Failed to upload resume",
        loading: false,
      });
    }
  },

  fetchClientNames: async () => {
      set({ loading: true, error: null });
      try {
          const res = await axiosInstance.get("/admin/process/getClientNames");
          set({ allClientNames: res.data || [], loading: false });
      } catch (err) {
          set({
              error: err.response?.data?.message || "Failed to fetch client names",
              loading: false,
          });
      }
  },

  fetchProcessNames: async () => {
    set({ loading: true, error: null });
    try {
        const res = await axiosInstance.get("/admin/lineup/getProcess");
        if (Array.isArray(res.data)) {
            set({ allProcessNames: res.data, loading: false });
        } else {
            set({ allProcessNames: [], loading: false });
        }
    } catch (error) {
        set({
            error: error.response?.data?.message || "Failed to fetch process names",
            loading: false,
            allProcessNames: [],
        });
    }
  },

  addCandidate: async ({name, email, gender, phone, address, experience_level, employee_id, resume}) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("gender", gender);
      formData.append("phone", phone);
      formData.append("address", address);
      formData.append("experience_level", experience_level);
      formData.append("employee_id", employee_id);
      formData.append("resume", resume);

      const res = await axiosInstance.post("/admin/lineup/addCandidate", formData);
        
      toast.success(res.data.message);
      set({ loading: false });
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add candidate");
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to add candidate",
      });
      return false;
    }
  },

  updateCandidateStatus: async (data) => {
    set({ loading: true, error: null });
    try {
      const { candidate_id, employee_id, status, reason } = data;
      await axiosInstance.post(`/admin/lineup/updateCandidateStatus?candidate_id=${candidate_id}`,{employee_id, reason, status});
      set({ loading: false, error: null });
      return true;
    } catch (error) {
      console.error(error);
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to update candidate status",
      });
      return false;
    }
  },

  exportLineUpCSV: async () => {
      set({ loading: true, error: null });
      try {
          const res = await axiosInstance.get("/admin/lineup/exportLineUpCSV", {
              responseType: "blob",
          });

          // Extract filename from backend header
          let filename = "lineup_data.csv"; // fallback
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

          toast.success("Lineup data exported successfully");
          set({ loading: false });
          return { success: true };
      } catch (error) {
          const errorMessage =
              error.response?.data?.message ||
              error.message ||
              "Failed to export lineup data";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
      }
  },

  clearError: () => set({ error: null }),
}));
