import axios from "axios";

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://hchsjobs.space" || "http://localhost:5173";

export const axiosInstance = axios.create({
    baseURL: `${BASE_URL}/api`,
    withCredentials: true,
})



