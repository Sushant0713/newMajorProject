import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

const useAdminEmployeeStore = create((set, get) => ({
    employees: [],
    selectedEmployee: null,
    employeePortfolio: null,
    loading: false,
    error: null,

    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    fetchAllEmployees: async () => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.get("/admin/employee/getAllEmployees");
            set({ employees: res.data, loading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to fetch employees",
                loading: false,
              });
        }
    },


    fetchSelectedEmployee: async (employeeId) => {
        debugger;
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.get(`/admin/employee/getEmployeeById?empId=${employeeId}`);
            set({ selectedEmployee: res.data, loading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to fetch employee",
                loading: false,
              });
        }
    },


    fetchEmployeePortfolio: async (employeeId, start_date, end_date) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post(`/admin/employee/getEmployeePortfolio?empId=${employeeId}`, { start_date, end_date });
            set({ employeePortfolio: res.data, loading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to fetch employee portfolio",
                loading: false,
            });
        }
    },


    addEmployee: async (employeeData) => {
        debugger;
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post("/admin/employee/addEmployee", employeeData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success(res.data.message);
            set({ loading: false });
            return res.data;
        } catch (error) {
            const message =
            error.response?.data?.message ||
            error.response?.data?.error ||
            "Failed to add employee";
            toast.error(message);
            set({error: message, loading: false});
            throw error;
        }
    },


    updateEmployee: async (employeeData) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.put(`/admin/employee/updateEmployee`, employeeData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            set({ loading: false });
            return res.data;
        } catch (error) {
            set({
                error: error.response?.data?.message || error.response?.data?.error || "Failed to update employee",
                loading: false,
            });
            throw error;
        }
    },


    deleteEmployee: async (employeeId) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.delete(`/admin/employee/deleteEmployee?empId=${employeeId}`);
            set({ loading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to delete employee",
                loading: false,
            });
        }
    },


    markAsPIP: async (employeeId, pipData) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post(`/admin/employee/markAsPIP?empId=${employeeId}`, pipData);
            set({ loading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to mark employee as PIP",
                loading: false,
            });
        }
    },


    endPIP: async (pip_id) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post(`/admin/employee/endPIP`, { pip_id });
            set({ loading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to end PIP",
                loading: false,
            });
        }
    },


    addLOP: async (employeeId, lopData) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post(`admin/employee/addLOP?empId=${employeeId}`, lopData);
            set({ loading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to add LOP",
                loading: false,
            });
        }
    },


    registerEmployee: async (formDataToSend) => {
        console.log("formDataToSend: ", formDataToSend);
        debugger;
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post("/admin/employee/registerEmployee", formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            set({ loading: false });
            return res.data;
        } catch (error) {
            set({
                error: error.response?.data?.message || error.response?.data?.error || "Failed to register employee",
                loading: false,
            });
            throw error;
        }
    },

    clearEmployeeDetails: () => set({ employeeDetails: null }),
    clearPortfolio: () => set({ portfolio: null }),
}));

export default useAdminEmployeeStore;
