import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useEmployeeMeetingStore = create((set) => ({
    allMeetings: [],
    upcomingMeetings: [],
    todaysMeetings: [],
    loading: false,
    error: null,

    // Fetch all meetings for employee
    fetchAllMeetings: async (empId) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.get(`employee/meetings/getAllMeetingsForEmployee?empId=${empId}`);
            set({ allMeetings: res.data, loading: false });
        } catch (err) {
            set({
                allMeetings: [],
                loading: false,
                error: err.message,
            });
        }
    },

    // Fetch upcoming meetings (next 7 days)
    fetchUpcomingMeetings: async (empId) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.get(`employee/meetings/getUpcomingMeetings?empId=${empId}`);
            set({ upcomingMeetings: res.data, loading: false });
        } catch (err) {
            set({
                upcomingMeetings: [],
                loading: false,
                error: err.message,
            });
        }
    },

    // Fetch today's meetings
    fetchTodaysMeetings: async (empId) => {
        set({ loading: true, error: null });
        try {
            const res = await axiosInstance.get(`employee/meetings/getTodaysMeetings?empId=${empId}`);
            set({ todaysMeetings: res.data, loading: false });
        } catch (err) {
            set({
                todaysMeetings: [],
                loading: false,
                error: err.message,
            });
        }
    },

    // Optional: clear store
    clearMeetings: () =>
        set({
            allMeetings: [],
            upcomingMeetings: [],
            todaysMeetings: [],
            error: null,
        }),
}));