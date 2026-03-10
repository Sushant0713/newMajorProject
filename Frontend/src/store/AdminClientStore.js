import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useAdminClientStore = create((set, get) => ({
    loading: false,
    error: null,
    clients: [],
    clientDetails: null,
    assignedEmployees: [],
    availableEmployees: [],
    processes: [],

    // Fetch all clients
    fetchAllClients: async () => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.get("/admin/client/getAllClients");

            if (Array.isArray(res.data)) {
                const mappedClients = res.data.map((client) => ({
                id: client.id,
                name: client.client_name,
                status: client.status,
                processes: client.total_processes,
                contactPerson: client.cp_name,
                email: client.cp_email,
                phone: client.cp_phone,
            }));

                set({ clients: mappedClients, loading: false });
            } else {
                set({ clients: [], loading: false });
            }
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to fetch clients",
                loading: false,
            });
        }
    },
    
    // Add new client
    addClient: async (clientData) => {
        set({ loading: true, error: null });

        try {
        await axiosInstance.post("/admin/client/addClient", clientData);
        await get().fetchAllClients(); // refresh list
        set({ loading: false }); // Set loading to false on success
        } catch (err) {
        set({
            error: err.response?.data?.message || "Failed to add client",
            loading: false,
        });
        }
    },

    // Update client
    updateClient: async (clientId, clientData) => {
        set({ loading: true, error: null });

        try {
        await axiosInstance.post(
            `/admin/client/updateClient?clientId=${clientId}`,
            clientData
        );
        await get().fetchAllClients();
        set({ loading: false }); // Set loading to false on success
        } catch (err) {
        set({
            error: err.response?.data?.message || "Failed to update client",
            loading: false,
        });
        }
    },

    // Delete client
    deleteClient: async (clientId) => {
        set({ loading: true, error: null });

        try {
        await axiosInstance.delete(`/admin/client/deletedClient?clientId=${clientId}`);
        await get().fetchAllClients(); // refresh list instead of filtering
        } catch (err) {
        set({
            error: err.response?.data?.message || "Failed to delete client",
            loading: false,
        });
        }
    },

    // Get client details by ID
    fetchClientDetails: async (clientId) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.get(`/admin/client/getClientDetails?clientId=${clientId}`);
            
            // Check if response has message (error case from backend)
            if (res.data?.message) {
                set({ 
                    clientDetails: null, 
                    error: res.data.message,
                    loading: false 
                });
                return;
            }
            
            // Response should be an array
            if (Array.isArray(res.data) && res.data.length > 0) {
                set({ clientDetails: res.data[0], loading: false });
            } else {
                set({ 
                    clientDetails: null, 
                    error: "Client not found",
                    loading: false 
                });
            }
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to fetch client details",
                loading: false,
                clientDetails: null,
            });
        }
    },

    // Fetch assigned employees for a client
    fetchAssignedEmployees: async (clientId) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.get(`/admin/client/assignedEmployees?clientId=${clientId}`);
            
            // Check if response has message (no employees case from backend)
            if (res.data?.message) {
                set({ assignedEmployees: [], loading: false });
                return;
            }
            
            // Response should be an array
            if (Array.isArray(res.data)) {
                const mappedEmployees = res.data.map((emp) => ({
                    id: emp.id,
                    employeeId: emp.employee_id,
                    fullName: `${emp.first_name} ${emp.last_name}`,
                    firstName: emp.first_name,
                    lastName: emp.last_name,
                    assignedAt: emp.assigned_at,
                }));
                set({ assignedEmployees: mappedEmployees, loading: false });
            } else {
                set({ assignedEmployees: [], loading: false });
            }
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to fetch assigned employees",
                loading: false,
                assignedEmployees: [],
            });
        }
    },

    // Fetch processes for a client
    fetchProcessesForClient: async (clientId) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.get(`/admin/client/processesOfClient?clientId=${clientId}`);
            
            // Check if response has message (no processes case from backend)
            if (res.data?.message) {
                set({ processes: [], loading: false });
                return;
            }
            
            // Response should be an array
            if (Array.isArray(res.data)) {
                const mappedProcesses = res.data.map((process) => ({
                    id: process.id,
                    processName: process.process_name,
                    clientName: process.client_name,
                    hiringType: process.hiring_type,
                    displayPayout: process.display_amount ? parseFloat(process.display_amount).toLocaleString('en-IN') : '0',
                    realPayout: process.real_amount ? parseFloat(process.real_amount).toLocaleString('en-IN') : '0',
                    candidateAssigned: process.candidate_assigned || 0,
                    salary: process.salary,
                    status: process.status,
                    totalSpocs: process.total_spocs || 0,
                }));
                set({ processes: mappedProcesses, loading: false });
            } else {
                set({ processes: [], loading: false });
            }
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to fetch processes",
                loading: false,
                processes: [],
            });
        }
    },

    // Fetch all available employees for assignment
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

    // Bulk assign employees to clients
    bulkAssignEmployeesToClients: async (employeeIds, clientIds) => {
        set({ loading: true, error: null });
        const results = { success: 0, failed: 0, errors: [] };
        
        try {
            // Assign each employee to each client
            for (const clientId of clientIds) {
                for (const employeeId of employeeIds) {
                    try {
                        await axiosInstance.post(`/admin/client/assignNewEmployee?clientId=${clientId}`, {
                            employee_id: employeeId
                        });
                        results.success++;
                    } catch (err) {
                        results.failed++;
                        results.errors.push({
                            clientId,
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

    // Remove assigned employee from client
    removeAssignedEmployee: async (clientId, employeeId) => {
        set({ loading: true, error: null });
        try {
            await axiosInstance.delete(`/admin/client/removeAssignedEmployee?clientId=${clientId}`, {
                data: { employee_id: employeeId }
            });
            await get().fetchAssignedEmployees(clientId);
            set({ loading: false });
        } catch (err) {
            set({
                error: err.response?.data?.message || "Failed to remove employee",
                loading: false,
            });
        }
    },

    // Reset error manually
    clearError: () => set({ error: null }),
}));