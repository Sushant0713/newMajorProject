import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

export const useEmployeeDataStore = create((set, get) => ({
    candidates: [],
    dataTypes: [],
    loading: false,
    error: null,

    fetchEmployeeDataTypes: async (employee_id) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.get(`/employee/data/getEmployeeDataTypes?employee_id=${employee_id}`);
            set({ dataTypes: res.data, loading: false });
        } catch (error) {
            console.error(error);
            set({ loading: false, error: error.message, dataTypes: [] });
        }
    },

    fetchCandidates: async (employee_id, data_type_id) => {
        debugger;
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post(`/employee/data/getCandidates`, {employee_id, data_type_id});
            set({ candidates: res.data, loading: false });
        } catch (error) {
            console.error(error);
            set({ loading: false, error: error.message, candidates: [] });
        }
    },

    assignCandidate: async (employee_id, candidate_id, data_type_id) => {
        debugger;
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post(`/employee/data/assignCandidate?candidate_id=${candidate_id}`, {employee_id, data_type_id});
            // set((state) => ({candidates: state.candidates.filter((c) => c.id !== candidate_id), loading: false,}));
            set((state) => ({ loading: false }));
            toast.success(res.data.message);
        } catch (error) {
            console.error(error);
            set({ loading: false, error: error.message, candidates: [] });
        }
    },

    clearCandidates: () => set({ candidates: [] }),
    clearError: () => set({ error: null }),
}));