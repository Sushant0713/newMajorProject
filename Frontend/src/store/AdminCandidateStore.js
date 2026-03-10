import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';

export const useAdminCadidateStore = create((set, get) => ({
    loading: false,
    error: null,
    candidates: [],
    availableEmployees: [],

    fetchCandidatesByStatus: async (filters) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post(`/admin/candidate/getCandidatesByStatus`, filters);
            set({ candidates: res.data, loading: false, error: null });
        } catch (error) {
            console.error(error);
            set({ loading: false, error: error.message });
        }
    },

    fetchEmployeesForCandidateFilter: async () => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.get(`/admin/candidate/getEmployeesForCandidateFilter`);
            set({ availableEmployees: res.data, loading: false, error: null });
        } catch (error) {
            console.error(error);
            set({ loading: false, error: error.message, availableEmployees: [] });
        }
    },

    reassignCandidateToEmployee: async ({ candidate_ids, employee_id, assigned_employee }) => {
        set({ loading: true, error: null });
        try {
            await axiosInstance.post(`/admin/candidate/reassignCandidateToEmployee`, {candidate_ids, employee_id, assigned_employee});
            set({ loading: false });
        } catch (error) {
            set({ loading: false, error: error.message });
        }
    },

    markAsAvailable: async ({ candidate_ids, employee_id, reason }) => {
        set({ loading: true, error: null });
        try {
            await axiosInstance.post(`/admin/candidate/markAsAvailable`, {candidate_ids, employee_id, reason});
            set({ loading: false });
        } catch (error) {
            set({ loading: false, error: error.message });
        }
    },

    bulkDropCandidate: async ({ candidate_ids, employee_id, reason }) => {
        set({ loading: true, error: null });
        try {
            await axiosInstance.post(`/admin/candidate/bulkDropCandidate`, { candidate_ids, employee_id, reason });
            set({ loading: false });
        } catch (error) {
            set({ loading: false, error: error.message });
        }
    },


}));