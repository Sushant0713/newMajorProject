import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_MODE==="development" ? "http://localhost:5000/api" : "https://hosting-ojd9.onrender.com/api",
    withCredentials: true,
})