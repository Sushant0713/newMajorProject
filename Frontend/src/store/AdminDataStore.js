import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from "react-hot-toast";

export const useAdminDataStore = create((set, get) => ({
    loading: false,
    error: null,
    result: null, // backend response
    duplicateCandidates: [],
    invalidCandidates: [],
    insertedRecords: 0,
    availableEmployees: [],
    dataTypes: [],
    stats: [],
    employeeWorkload: [],
    dataTypeOverview: [],
    dataTypeDetails: [],

    importCandidates: async ({ file, employee_id, data_type_id }) => {
        set({
            loading: true,
            error: null,
            result: null,
            duplicateCandidates: [],
            invalidCandidates: [],
            insertedRecords: 0,
        });

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('employee_id', employee_id);
            formData.append('data_type_id', data_type_id);

            const res = await axiosInstance.post('/admin/data/importData', formData);
            const data = await res.data;
            set({
                loading: false,
                result: data,
                insertedRecords: data.insertedRecords || 0,
                duplicateCandidates: data.duplicateCandidates || [],
                invalidCandidates: data.invalidCandidates || [],
            });
            return data;
        } catch (error) {
            console.error(error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to import candidate data";
            set({
                loading: false,
                error: errorMessage,
            });
            return null;
        }
    },

    fetchDataTypes: async () => {
        set({loading: true, error: null});
        try {
            const res = await axiosInstance.get('/admin/data/getDataTypes');
            set({dataTypes: res.data, loading: false,});
        } catch (error) {
            console.error(error);
            set({loading: false, error: error.message, dataTypes: []});
        }
    },

    addNewDataType: async ({type_name, description, created_by, employee_view_limit}) => {
        set({loading: true, error: null});
        try {
            const res = await axiosInstance.post('/admin/data/createDataType', {type_name, description, created_by, employee_view_limit });
            set({loading: false, error: null});
            return res.data;
        } catch (error) {
            console.error(error);
            set({loading: false, error: error.message});
        }
    },

    fetchStats: async () => {
        set({loading: true, error: null});
        try {
             const res = await axiosInstance.get('/admin/data/getStats');
            set({stats: res.data, loading: false, error: null});
        } catch (error) {
            console.error(error);
            set({loading: false, error: error.message});
        }
    },

    fetchEmployeeWorkload: async (search) => {
        set({loading: true, error: null});
        try {
             const res = await axiosInstance.post('/admin/data/getEmployeeWorkload', {search});
            set({employeeWorkload: res.data, loading: false, error: null});
        } catch (error) {
            console.error(error);
            set({loading: false, error: error.message});
        }
    },

    fetchDataTypeOverview: async () => {
        set({loading: true, error: null});
        try {
             const res = await axiosInstance.get('/admin/data/getDataTypeOverview');
            set({dataTypeOverview: res.data, loading: false, error: null});
        } catch (error) {
            console.error(error);
            set({loading: false, error: error.message});
        }
    },

    fetchDataTypeDetails: async ({data_type_id}) => {
        set({loading: true, error: null});
        try {
             const res = await axiosInstance.get(`/admin/data/getDataTypesDetails?data_type_id=${data_type_id}`);
             console.log(res.data);
            set({dataTypeDetails: res.data, loading: false, error: null});
            return res.data;
        } catch (error) {
            console.error(error);
            set({loading: false, error: error.message});
        }
    },

    updateDataType: async ({data_type_id, type_name, description, is_active, employee_view_limit}) => {
        set({loading: true, error: null});
        try {
            const res = await axiosInstance.put('/admin/data/updateDataType', {data_type_id, type_name, description, is_active, employee_view_limit});
            set({loading: false, error: null});
        } catch (error) {
            console.error(error);
            set({loading: false, error: error.message});
        }
    },

    exportCandidateCSV: async ({data_type_id}) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post("/admin/data/exportCandidatesCSV", { data_type_id }, { responseType: "blob" });

            // Extract filename from backend header
            let filename = "candidate_data.csv"; // fallback
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

            toast.success("Candidate data exported successfully");
            set({ loading: false });
            return { success: true };
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Failed to export candidate data";
            set({ error: errorMessage, loading: false });
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    fetchAvailableEmployees: async () => {
        set({ loading: true, error: null });

        try {
            const res = await axiosInstance.get(`/admin/client/getAllEmployeesForAssignment`);

            set({
                availableEmployees: Array.isArray(res.data) ? res.data : [],
                loading: false,
            });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to fetch employees",
                loading: false,
                availableEmployees: [],
            });
        }
    },

    bulkAssignDataTypesToEmployees: async (employeeIds, dataTypeIds) => {
        set({ loading: true, error: null });
        const results = { success: 0, failed: 0, errors: [] };
        
        try {
            // Assign each employee to each client
            for (const dataTypeId of dataTypeIds) {
                for (const employeeId of employeeIds) {
                    try {
                        await axiosInstance.post(`/admin/data/assignDataTypes`, {employee_id: employeeId, data_type_id: dataTypeId});
                        results.success++;
                    } catch (err) {
                        results.failed++;
                        results.errors.push({
                            dataTypeId,
                            employeeId,
                            error: err.response?.data?.message || "Failed to assign employee"
                        });
                    }
                }
            }
            
            set({ loading: false });
            return results;
        } catch (err) {
            set({
                error: err.response?.data?.message || "Failed to assign employees",
                loading: false,
            });
            return results;
        }
    },

    clearImportState: () =>
    set({
      loading: false,
      error: null,
      result: null,
      duplicateCandidates: [],
      invalidCandidates: [],
      insertedRecords: 0,
    }),
}));