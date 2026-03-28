import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from 'react-hot-toast';

const adminLopStore = create((set, get) => ({
  records: [],
  employees: [],
  stats: {
    total_records: 0,
    total_amount: 0,
    this_month_count: 0,
    this_month_amount: 0
  },

  filters: {
    search: "",
    employee_id: "",
    date_from: "",
    date_to: ""
  },

  loading: false,
  error: null,


  setFilters: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value }
    })),

  clearFilters: () =>
    set({
      filters: {
        search: "",
        employee_id: "",
        date_from: "",
        date_to: ""
      }
    }),


  fetchSalaryEmployees: async () => {
    set({ loading: true, error: null });

    try {
      const res = await axiosInstance.get(`admin/lop/getSalaryEmployee`);
      set({
        employees: Array.isArray(res.data.employees) ? res.data.employees : [],
        loading: false
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to load employees",
        loading: false
      });
    }
  },


  fetchLops: async () => {
    set({ loading: true, error: null });

    try {
      const res = await axiosInstance.post(`admin/lop/getAllLops`);
      set({
        records: res.data.records || [],
        stats: res.data.stats || {},
        loading: false
      });
    } catch (err) {
      set({
        error: err.response?.data?.error || "Failed to fetch LOP records",
        loading: false
      });
    }
  },


  addLop: async (payload) => {
    set({ loading: true, error: null });

    try {
      const { employee_id, lop_reason, lop_date, lop_amount } = payload;

      const res = await axiosInstance.post(
        `admin/lop/addLop?empId=${employee_id}`,
        { lop_reason, lop_date, lop_amount }
      );
      toast.success(res.data.message);
      await get().fetchLops();
      set({ loading: false });
      return true;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to add LOP";
      toast.error(message);
      set({ error: message,  loading: false });
      return false;
    }
  },


  deleteLop: async (lopId) => {
    set({ loading: true, error: null });

    try {
      const res = await axiosInstance.delete(`admin/lop/deleteLop?lopId=${lopId}`);
      toast.success(res.data.message);
      await get().fetchLops();
      set({ loading: false });
    } catch (err) {
      const message = err.response?.data?.message || "Failed to delete LOP";
      toast.error(message);
      set({ error: message,  loading: false });
    }
  }
}));

export default adminLopStore;