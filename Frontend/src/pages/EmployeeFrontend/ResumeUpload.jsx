import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, ShieldCheck, FileText, XCircle, CheckCircle } from "lucide-react";
import "./ResumeUpload.css";
import { useEmployeeResumeStore } from "../../store/EmployeeResumeStore.js";

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [secure, setSecure] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [progress, setProgress] = useState(0);
  const dropRef = useRef();
  const navigate = useNavigate();
  const { uploadResume } = useEmployeeResumeStore();

  const empId = sessionStorage.getItem("userId");

  const handleFile = (selectedFile) => {
    setSuccess("");
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png"
    ];
    if (
      selectedFile &&
      allowedTypes.includes(selectedFile.type) &&
      selectedFile.size <= 5 * 1024 * 1024
    ) {
      setFile(selectedFile);
      setError("");
    } else {
      setError("Please upload a valid file (PDF, Word, JPG, PNG) under 5MB.");
      setFile(null);
    }
  };

  const handleFileChange = (e) => handleFile(e.target.files[0]);

  const handleDragOver = (e) => {
    e.preventDefault();
    dropRef.current.classList.add("drag-over");
  };

  const handleDragLeave = () => dropRef.current.classList.remove("drag-over");

  const handleDrop = (e) => {
    e.preventDefault();
    dropRef.current.classList.remove("drag-over");
    const droppedFile = e.dataTransfer.files[0];
    handleFile(droppedFile);
  };

  const removeFile = () => setFile(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !secure) {
      setError("Please upload a file and confirm data security.");
      return;
    }

    setProgress(0);
    setError("");
    setSuccess("");

    try {
      const uploadProgressHandler = (progressEvent) => {
        const progressPercentage = Math.round(
          (progressEvent.loaded / progressEvent.total) * 100
        );
        setProgress(progressPercentage);
      };

      const response = await uploadResume(file, uploadProgressHandler);

      if (response.message === "Resume uploaded successfully") {
        setSuccess("Resume uploaded successfully!");
        setTimeout(() => {
          navigate("/employee-review-resume"); // ✅ Redirect to ReviewResumeData page
        }, 1000);
      } else {
        setError("Failed to upload resume");
      }
    } catch (err) {
      setError("An error occurred during the upload.");
    }
  };

  return (
    <div className="resume-container">
      <div className="resume-card animate-fade-in">
        <h2>
          <FileText size={28} className="resume-title-icon" /> Resume Upload System
        </h2>
        <p className="resume-description">
          Upload PDF resumes for automatic parsing and candidate extraction.
        </p>

        <div className="resume-note animate-slide-up">
          <ShieldCheck size={18} /> <strong>Note:</strong> All resumes uploaded will be tracked
          and associated with your employee ID ({empId}).
        </div>

        <form onSubmit={handleSubmit} className="resume-form">
          <div
            ref={dropRef}
            className={`resume-drop-area ${file ? "has-file" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById("resumeInput").click()}
          >
            {file ? (
              <div className="resume-file-preview">
                <CheckCircle size={20} /> {file.name}
                <XCircle size={20} className="remove-file" onClick={removeFile} />
              </div>
            ) : (
              <span>
                <UploadCloud size={20} /> Drag & Drop or Click to Select File
              </span>
            )}
            <input
              type="file"
              id="resumeInput"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="resume-input-hidden"
            />
          </div>

          <div className="resume-checkbox">
            <input
              type="checkbox"
              id="secure"
              checked={secure}
              onChange={() => setSecure(!secure)}
            />
            <label htmlFor="secure">Your data is secure and encrypted</label>
          </div>

          {progress > 0 && (
            <div className="resume-progress-bar">
              <div className="resume-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          )}

          {error && (
            <p className="resume-error">
              <XCircle size={16} /> {error}
            </p>
          )}

          {success && (
            <p className="resume-success">
              <CheckCircle size={16} /> {success}
            </p>
          )}

          <button type="submit" className="resume-btn animate-hover">
            Upload & Parse Resume
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResumeUpload;
