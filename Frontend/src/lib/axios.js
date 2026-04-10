import axios from "axios";

export const axiosInstance = axios.create({
    //baseURL: "http://localhost:5000/api",
    // baseURL: "http://187.127.148.45:5000/api",
    baseURL: "http://187.127.148.45:5000/api",  // VPS deployment
    // baseURL: "http://192.168.1.12:5000/api",
    baseURL: "https://hchsjobs.space/api",
    withCredentials: true,
})