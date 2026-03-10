import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useAdminMeetingStore = create((set, get) => ({
    meetings: [],
    members: [],
    selectedMeeting: null,
    loading: false,
    error: null,

    fetchAllMeetings: async () => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.get("/admin/meetings/getAllMeetings");
            set({ meetings: res.data, loading: false });
        } catch (error) {
             set({
                error: error.response?.data?.message || "Failed to fetch meetings",
                loading: false,
            });
        }
    },

    fetchMeetingById: async (id) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.get(`/admin/meetings/getMeetingById?meetingId=${id}`);
            set({ selectedMeeting: res.data, loading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to fetch meeting",
                loading: false,
            });
        }
    },

    addMeeting: async (meetingData) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post("/admin/meetings/addNewMeeting", meetingData);   
            await get().fetchAllMeetings();
            set({ loading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to add meeting",
                loading: false,
            });
        }
    },

    updateMeeting: async (id, meetingData) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.post(`/admin/meetings/updateMeeting?meetingId=${id}`, meetingData);
            await get().fetchAllMeetings();
            set({ loading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to update meeting",
                loading: false,
            });
        }
    },

    deleteMeeting: async (meetingId) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.delete(`/admin/meetings/deleteMeeting?meetingId=${meetingId}`);
            set({
                meetings: get().meetings.filter((m) => m.id !== meetingId),
                loading: false,
            });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to delete meeting",
                loading: false,
            });
        }
    },

    fetchMembers: async () => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.get("/admin/meetings/getMembers");
            set({ members: res.data, loading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to fetch members",
                loading: false,
            });
        }
    },

    getEmployeeNamesByIds: async (employeeIds) => {
        try {
            if (!employeeIds || employeeIds.length === 0) {
                return {};
            }
            const idsString = Array.isArray(employeeIds) ? employeeIds.join(',') : employeeIds;
            const res = await axiosInstance.get(`/admin/meetings/getEmployeeNamesByIds?employeeIds=${idsString}`);
            return res.data;
        } catch (error) {
            console.error("Error fetching employee names:", error);
            return {};
        }
    },
}));