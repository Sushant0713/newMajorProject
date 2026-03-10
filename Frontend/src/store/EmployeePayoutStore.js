import {create} from 'zustand';
import { axiosInstance } from '../lib/axios';

export const useEmployeePayoutStore = create((set, get) => ({
    payouts: [],
    processNames: [],
    clientNames: [],
    statusOptions: [],
    payoutHistory: [],
    statusCounts: [],
    filters: {
        search: '',
        process_name: '',
        client_name: '',
        status: '',
        fromDate: '',
        toDate: '',
    },
    loading: false,
    error: null,

    setFilters: (newFilters) => set(() => ({filters: newFilters})),

    fetchPayouts: async (empId) => {
        set({ loading: true, error: null });
        try {
            const { filters } = get();
            const response = await axiosInstance.post(`/employee/payout/getPayouts?empId=${empId}`, filters);
            set({ payouts: response.data, loading: false });
        } catch (error) {
            console.error('Error fetching payouts:', error);
            set({
                error: error.response?.data || 'Failed to fetch payouts',
                loading: false
            });
        }
    },

    fetchPayoutHistory: async (candidateId, empId) => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.post(`/employee/payout/payoutHistory?empId=${empId}`, {candidateId});
            set({ payoutHistory: response.data, loading: false });
        } catch (error) {
            set({
                error: error.response?.data || 'Failed to fetch payout history',
                loading: false,
              });
        }
    },

    fetchProcessNames: async (empId) => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.get(`/employee/payout/getProcessNames?empId=${empId}`);
            set({ processNames: response.data, loading: false });
        } catch (error) {
            set({
                error: error.response?.data || 'Failed to fetch process names',
                loading: false,
              });
        }
    },

    fetchClientNames: async (empId) => {
    set({ loading: true, error: null });
        try {
            const response = await axiosInstance.get(`/employee/payout/getClientNames?empId=${empId}`);
            set({ clientNames: response.data, loading: false });
        } catch (error) {
            set({
                error: error.response?.data || 'Failed to fetch client names',
                loading: false,
              });
        }
    },

    fetchStatusOptions: async (empId) => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.get(`/employee/payout/getStatusOptions?empId=${empId}`);
            set({ statusOptions: response.data, loading: false });
        } catch (error) {
            set({
                error: error.response?.data || 'Failed to fetch status options',
                loading: false,
              });
        }
    },

    fetchStatusCounts: async (empId) => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.get(`/employee/payout/getCountByStatus?empId=${empId}`);
            set({ statusCounts: response.data, loading: false });
        } catch (error) {
            set({
                error: error.response?.data || 'Failed to fetch status counts',
                loading: false,
              });
        }
    }
}));