import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useAdminDashboardStore = create((set, get) => ({
  loading: false,
  error: null,

  stats: {
    totalClients: 0,
    totalCandidates: 0,
    totalEmployees: 0,
    totalProcesses: 0,
    total_assignments: 0,
    success_rate: 0,
    conversion_rate: 0,
    dropout_rate: 0,
    revenue: 0,
    completelyJoined: 0,
    joined: 0,
    clawback: 0,
    selected: 0,
    interviewScheduled: 0,
    available: 0,
    dropout: 0,
    topPerformers: [],
  },

  monthlySuccessData: [],

  fetchDashboardStats: async () => {
    try {
      set({ loading: true, error: null });

      const res = await axiosInstance.get(`/admin/dashboard/dashboardStatistics`);
      
      set((state) => ({
        stats: {
          ...state.stats,
          totalClients: res.data.totalClients,
          totalCandidates: res.data.totalCandidates,
          totalEmployees: res.data.totalEmployees,
          totalProcesses: res.data.totalProcesses,
          total_assignments: res.data.total_assignments,
          success_rate: res.data.success_rate,
          conversion_rate: res.data.conversion_rate,
          dropout_rate: res.data.dropout_rate,
          revenue: res.data.totalActualRevenue,

          completelyJoined: res.data.completely_joined,
          joined: res.data.joined_count,
          clawback: res.data.clawback_count,
          selected: res.data.selected_count,
          interviewScheduled: res.data.interview_count,
          available: res.data.available_count,
          dropout: res.data.dropout_count,
          // expenses: res.data.expenses,
        },
        loading: false,
      }));

    } catch (err) {
      set({
        error: err.message || "Failed to load dashboard data",
        loading: false,
      });
    }
  },

  fetchTopPerformers: async () => {
    try {
      set({ loading: true, error: null });

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);
      const formatDate = (date) => date.toISOString().split('T')[0];
      const res = await axiosInstance.post(`/admin/dashboard/getTopPerformers`, 
                                            {start_date: formatDate(startDate), end_date: formatDate(endDate),});

      set((state) => ({
        stats: {
          ...state.stats,
          topPerformers: res.data.topPerformers,
        },
        loading: false,
      }));
    } catch (error) {
      set({
        error: error.message || "Failed to load top performers",
        loading: false,
      });
    }
  },

  fetchMonthlySuccessLogs: async () => {
    try {
      set({ loading: true, error: null });

      const res = await axiosInstance.get(`/admin/dashboard/monthlyOverallSuccessLogs`);

      set({
        monthlySuccessData: res.data.months || [],
        loading: false,
      });
    } catch (error) {
      set({
        error: error.message || "Failed to load monthly success logs",
        loading: false,
      });
    }
  },
}));
