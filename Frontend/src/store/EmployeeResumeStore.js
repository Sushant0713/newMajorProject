import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useEmployeeResumeStore = create((set, get) => ({
  uploadResume: async (file, onProgress) => {
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await axiosInstance.post(
        "/employee/resume/handleResumeUpload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: onProgress,
        }
      );

      if (res.data.message === "Resume uploaded successfully") {
        toast.success("Resume uploaded successfully");
        return res.data;
      } else {
        toast.error("Failed to upload resume");
        return { message: "Failed to upload resume" };
      }
    } catch (error) {
      toast.error(error.response ? error.response.data.message : "An error occurred");
      throw error;
    }
  },
}));
