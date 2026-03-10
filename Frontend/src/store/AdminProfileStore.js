import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useAdminProfileStore = create((set, get) => ({
    adminProfile: null,
    loading: false,
    error: null,

    fetchAdminProfile: async (adminId) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.get(`/admin/profile/getProfile?admin_id=${adminId}`);
            set({ adminProfile: res.data, loading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to fetch admin profile",
                loading: false,
              });
        }
    }, 

    updateAdminProfile: async (adminId, profileData) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post(`/admin/profile/updateProfile?admin_id=${adminId}`, profileData);
            set({ adminProfile: res.data, loading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to update admin profile",
                loading: false,
            });
        }
    },

    updateAdminPassword: async (adminId, newPassword) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post(`/admin/profile/updatePassword?adminId=${adminId}`, newPassword);
            set({ adminProfile: res.data, loading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to update admin password",
                loading: false,
            });
        }
    },
    
    clearProfile: () => set({ adminProfile: null, error: null }),
}));