import React, { useEffect, useState } from "react";
import { User, Briefcase, Award, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import "./ReviewResumeData.css";

const ReviewResumeData = ({ onBack }) => {
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulate fetched resume data
  useEffect(() => {
    setTimeout(() => {
      setResumeData({
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+91 98765 43210",
        experience: [
          { role: "Software Engineer", company: "TechCorp", years: "2020 - Present" },
          { role: "Intern", company: "CodeLab", years: "2019 - 2020" },
        ],
        skills: ["React.js", "Node.js", "MongoDB", "AWS", "Docker"],
        education: "B.Tech in Computer Science, MIT 2019",
      });
      setLoading(false);
    }, 1500);
  }, []);

  return (
    <div className="review-container animate-fade-in">
      <div className="review-card">
        <h2>
          <CheckCircle className="review-title-icon" size={28} /> Review Resume Data
        </h2>
        <p className="review-subtitle">
          Verify extracted details before final approval.
        </p>

        {loading ? (
          <div className="review-loading">
            <Loader2 className="spin" size={30} />
            <p>Extracting data from resume...</p>
          </div>
        ) : (
          <>
            <div className="review-section animate-slide-up">
              <h3><User size={20} /> Personal Information</h3>
              <p><strong>Name:</strong> {resumeData.name}</p>
              <p><strong>Email:</strong> {resumeData.email}</p>
              <p><strong>Phone:</strong> {resumeData.phone}</p>
            </div>

            <div className="review-section animate-slide-up">
              <h3><Briefcase size={20} /> Work Experience</h3>
              <ul>
                {resumeData.experience.map((exp, index) => (
                  <li key={index}>
                    <strong>{exp.role}</strong> – {exp.company} ({exp.years})
                  </li>
                ))}
              </ul>
            </div>

            <div className="review-section animate-slide-up">
              <h3><Award size={20} /> Skills</h3>
              <div className="review-skills">
                {resumeData.skills.map((skill, i) => (
                  <span key={i} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>

            <div className="review-section animate-slide-up">
              <h3>Education</h3>
              <p>{resumeData.education}</p>
            </div>

            <div className="review-actions">
              <button className="btn-back" onClick={onBack}>
                <ArrowLeft size={16} /> Back to Upload
              </button>
              <button className="btn-approve">
                <CheckCircle size={16} /> Approve Resume
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewResumeData;
