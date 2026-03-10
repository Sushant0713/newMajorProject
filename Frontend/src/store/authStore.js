import { create } from "zustand";
import { axiosInstance } from '../lib/axios.js';
import toast, { Toaster } from 'react-hot-toast';

export const authStore = create((set, get) => ({
    user: null,
    isLoggingIn: false,
    loading: false,

    loginAsAdmin: async (email, password, navigate) => {
        try {
            const res = await axiosInstance.post("/auth/loginAsAdmin", { email, password });
            if(res.data.message === "Login successful"){
                const userData = res.data;
                set({ user: userData });
                toast.success("logged in successfully"); 
                sessionStorage.setItem("userId", userData.userId);
                sessionStorage.setItem("username", userData.username);
                navigate("/admin-dashboard"); 
            }
            else{
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    loginAsEmployee: async (email, password, navigate) => {
        try {
            const res = await axiosInstance.post("/auth/loginAsEmployee", { email, password });
            if(res.data.message === "Login successful"){
                const userData = res.data;
                set({ user: userData });
                toast.success("logged in successfully"); 
                sessionStorage.setItem("userId", userData.userId);
                sessionStorage.setItem("username", userData.username);
                navigate("/employee-dashboard");
            }
            else{
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    forgotPasswordEmp: async (email, navigate) => {        
        const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
        if (!validEmail(email)) {
        toast.error("Please enter a valid email.");
        return;
        }
        try {
            const res = await axiosInstance.post("/auth/forgotPasswordForEmp", {email});
            if(res.data.message === "OTP has been sent to your email"){
                const tempUser = { email };
                set({ user: tempUser });
                toast.success(res.data.message);
                navigate("/verify-otp"); 
            }
            else{
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response ? error.response.data.message : "An error occurred");
        }
        
    },

    verifyOTPEmp: async(otp, navigate) => {
        try {
            const res = await axiosInstance.post("/auth/verifyOTP", {otp});
            if(res.data.message === "OTP verified"){
                toast.success(res.data.message);
                navigate("/password-reset");
            }
            else{
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(error.response ? error.response.data.message : "An error occurred");
        }
        
    },

    resetPasswordEmp: async(newPassword, navigate) => {
        const { user } = get();
        if (!user) {
            toast.error("User is not registered");
            return;
        }
        const email = user.email;
        try {
            const res = await axiosInstance.post("/auth/resetPasswordForEmp", {email, newPassword});
            if(res.data.message == "Password updated successfully"){
                toast.success(res.data.message);
                navigate("/employee-login"); 
            }
            else{
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(error.response ? error.response.data.message : "An error occurred");
        }
    },

    forgotPasswordAdmin: async (email, navigate) => {
        const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
        if (!validEmail(email)) {
        toast.error("Please enter a valid email.");
        return;
        }

        try {
            const res = await axiosInstance.post("/auth/forgotPasswordForAdmin", {email});
            if(res.data.message === "OTP has been sent to your email"){
                const tempUser = { email };
                set({ user: tempUser });
                toast.success(res.data.message);
                navigate("/admin-verify-otp"); 
            }
            else{
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response ? error.response.data.message : "An error occurred");
        }
        
    },

    verifyOTPAdmin: async(otp, navigate) => {
        try {
            const res = await axiosInstance.post("/auth/verifyOTP", {otp});
            if(res.data.message === "OTP verified"){
                toast.success(res.data.message);
                navigate("/admin-password-reset");
            }
            else{
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(error.response ? error.response.data.message : "An error occurred");
        }
        
    },

    resetPasswordAdmin: async(newPassword, navigate) => {
        const { user } = get();
        if (!user) {
            toast.error("User is not registered");
            return;
        }
        const email = user.email;
        try {
            const res = await axiosInstance.post("/auth/resetPasswordForAdmin", {email, newPassword});
            if(res.data.message == "Password updated successfully"){
                toast.success(res.data.message);
                navigate("/"); 
            }
            else{
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(error.response ? error.response.data.message : "An error occurred");
        }
    },

}));