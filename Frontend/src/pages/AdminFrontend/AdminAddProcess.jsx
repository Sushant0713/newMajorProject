import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar.jsx";
import { useAdminProcessStore } from "../../store/AdminProcessStore";
import { useAdminClientStore } from "../../store/AdminClientStore";
import "./AdminAddProcess.css";
import AdminHeader from "../../components/AdminHeader.jsx";

export default function AdminAddProcess() {
  const navigate = useNavigate();
  const { addProcess, loading, error } = useAdminProcessStore();
  const { clients, fetchAllClients, loading: clientsLoading } = useAdminClientStore();
  
  const [form, setForm] = useState({
    client_name: "",
    process_name: "",
    hiring_type: "Fresher",
    openings: "",
    salary: "",
    locations: "",
    interview_dates: "",
    clawback_duration: "",
    invoice_clear_time: "",
    payout_type: "Fix",
    payout_amount: "",
    real_payout_amount: "",
    process_description: "",
    requirements: ""
  });

  const [spocs, setSpocs] = useState([
    { spoc_name: "", spoc_role: "", spoc_email: "", spoc_phone: "", spoc_note: "" }
  ]);

  useEffect(() => {
    fetchAllClients();
  }, [fetchAllClients]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSpocChange = (index, field, value) => {
    const updated = [...spocs];
    updated[index][field] = value;
    setSpocs(updated);
  };

  const addSpoc = () => {
    setSpocs([...spocs, { spoc_name: "", spoc_role: "", spoc_email: "", spoc_phone: "", spoc_note: "" }]);
  };

  const removeSpoc = (index) => {
    if (spocs.length > 1) {
      setSpocs(spocs.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare payload matching backend expectations
    const payload = {
      client_name: form.client_name,
      process_name: form.process_name,
      process_description: form.process_description || "",
      hiring_type: form.hiring_type,
      openings: parseInt(form.openings) || 0,
      locations: form.locations || "",
      requirements: form.requirements || "",
      salary: form.salary || "",
      interview_dates: form.interview_dates || "",
      clawback_duration: parseInt(form.clawback_duration) || 0,
      invoice_clear_time: parseInt(form.invoice_clear_time) || 0,
      payout_type: form.payout_type,
      payout_amount: parseFloat(form.payout_amount) || 0,
      real_payout_amount: parseFloat(form.real_payout_amount) || 0,
      spocs: spocs
        .filter(spoc => spoc.spoc_name && spoc.spoc_email && spoc.spoc_phone)
        .map(spoc => ({
          spoc_name: spoc.spoc_name,
          spoc_role: spoc.spoc_role || "",
          spoc_email: spoc.spoc_email,
          spoc_phone: spoc.spoc_phone,
          spoc_note: spoc.spoc_note || ""
        }))
    };

    try {
      await addProcess(payload);
      navigate("/admin-process");
    } catch (err) {
      console.error("Error adding process:", err);
    }
  };

  return (
    <div className="admin-process-root">
      <AdminNavbar />

      <main className="admin-main">
        <AdminHeader
          title="Add New Process"
          
        />

        {/* Content */}
        <div className="add-process-content">
          <div className="add-process-card">
            {/* Process Information Section */}
            <div className="form-section">
              <div className="section-header">
                <h3 className="section-title">Process Information</h3>
              </div>

              <form className="add-process-form" onSubmit={handleSubmit}>
                {/* Client Selection */}
                <div className="form-group">
                  <label htmlFor="client_name" className="form-label">
                    Client Name <span className="required">*</span>
                  </label>
                  <select
                    id="client_name"
                    name="client_name"
                    value={form.client_name}
                    onChange={handleChange}
                    required
                    className="form-select"
                    disabled={clientsLoading}
                  >
                    <option value="">Select a Client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.name}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Process Details */}
                <div className="form-section-inner">
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="process_name" className="form-label">
                        Process Name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="process_name"
                        name="process_name"
                        value={form.process_name}
                        onChange={handleChange}
                        required
                        className="form-input"
                        placeholder="Enter process name"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="hiring_type" className="form-label">
                        Hiring Type <span className="required">*</span>
                      </label>
                      <select
                        id="hiring_type"
                        name="hiring_type"
                        value={form.hiring_type}
                        onChange={handleChange}
                        required
                        className="form-select"
                      >
                        <option value="Fresher">Fresher</option>
                        <option value="Experienced">Experienced</option>
                        <option value="Combined">Combined</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="openings" className="form-label">
                        Number of Openings <span className="required">*</span>
                      </label>
                      <input
                        type="number"
                        id="openings"
                        name="openings"
                        value={form.openings}
                        onChange={handleChange}
                        required
                        min="1"
                        className="form-input"
                        placeholder="Enter number of openings"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="salary" className="form-label">Salary <span className="required">*</span> </label>
                      <input
                        type="text"
                        id="salary"
                        name="salary"
                        value={form.salary}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="e.g. 15000 (no commas)"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="locations" className="form-label">Locations <span className="required">*</span> </label>
                      <input
                        type="text"
                        id="locations"
                        name="locations"
                        value={form.locations}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="e.g. Mumbai 400059"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="interview_dates" className="form-label">Interview Dates <span className="required">*</span> </label>
                      <input
                        type="text"
                        id="interview_dates"
                        name="interview_dates"
                        value={form.interview_dates}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="e.g. 1 week, specific dates, or all days"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="clawback_duration" className="form-label">
                        Clawback Duration (days) <span className="required">*</span>
                      </label>
                      <input
                        type="number"
                        id="clawback_duration"
                        name="clawback_duration"
                        value={form.clawback_duration}
                        onChange={handleChange}
                        min="0"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="invoice_clear_time" className="form-label">
                        Invoice Clear Time (days) <span className="required">*</span>
                      </label>
                      <input
                        type="number"
                        id="invoice_clear_time"
                        name="invoice_clear_time"
                        value={form.invoice_clear_time}
                        onChange={handleChange}
                        min="0"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="payout_type" className="form-label">Payout Type <span className="required">*</span> </label>
                      <select
                        id="payout_type"
                        name="payout_type"
                        value={form.payout_type}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="Fix">Fix</option>
                        <option value="Percentage">Percentage</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="payout_amount" className="form-label">Payout Amount</label>
                      <input
                        type="number"
                        id="payout_amount"
                        name="payout_amount"
                        value={form.payout_amount}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="real_payout_amount" className="form-label">Real Payout Amount <span className="required">*</span> </label>
                      <input
                        type="number"
                        id="real_payout_amount"
                        name="real_payout_amount"
                        value={form.real_payout_amount}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group-full">
                    <label htmlFor="process_description" className="form-label">Process Description</label>
                    <textarea
                      id="process_description"
                      name="process_description"
                      value={form.process_description}
                      onChange={handleChange}
                      rows="3"
                      className="form-textarea"
                      placeholder="Enter process description"
                    />
                  </div>

                  <div className="form-group-full">
                    <label htmlFor="requirements" className="form-label">Requirements <span className="required">*</span> </label>
                    <textarea
                      id="requirements"
                      name="requirements"
                      value={form.requirements}
                      onChange={handleChange}
                      rows="3"
                      className="form-textarea"
                      placeholder="Enter requirements"
                    />
                  </div>
                </div>

                <hr className="form-divider" />

                {/* SPOC Section */}
                <div className="form-section-inner">
                  <div className="spoc-header">
                    <h4 className="form-subtitle">SPOCs (Single Point of Contact)</h4>
                    <button
                      type="button"
                      onClick={addSpoc}
                      className="add-spoc-btn"
                    >
                      <span className="material-symbols-outlined">add</span>
                      Add Another SPOC
                    </button>
                  </div>

                  <div className="spoc-container">
                    {spocs.map((spoc, index) => (
                      <div key={index} className="spoc-card">
                        {spocs.length > 1 && (
                          <button
                            type="button"
                            className="remove-spoc-btn"
                            onClick={() => removeSpoc(index)}
                            title="Remove SPOC"
                          >
                            <span className="material-symbols-outlined">close</span>
                          </button>
                        )}
                        <div className="spoc-grid">
                          <div className="form-group">
                            <label className="form-label">Name <span className="required">*</span> </label>
                            <input
                              type="text"
                              value={spoc.spoc_name}
                              onChange={(e) => handleSpocChange(index, "spoc_name", e.target.value)}
                              required
                              className="form-input"
                              placeholder="Enter SPOC name"
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">Role <span className="required">*</span> </label>
                            <input
                              type="text"
                              value={spoc.spoc_role}
                              onChange={(e) => handleSpocChange(index, "spoc_role", e.target.value)}
                              className="form-input"
                              placeholder="Enter role"
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">Email <span className="required">*</span> </label>
                            <input
                              type="email"
                              value={spoc.spoc_email}
                              onChange={(e) => handleSpocChange(index, "spoc_email", e.target.value)}
                              required
                              className="form-input"
                              placeholder="Enter email"
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">Phone <span className="required">*</span> </label>
                            <input
                              type="tel"
                              value={spoc.spoc_phone}
                              onChange={(e) => handleSpocChange(index, "spoc_phone", e.target.value)}
                              required
                              className="form-input"
                              placeholder="Enter phone"
                            />
                          </div>

                          <div className="form-group-full">
                            <label className="form-label">Note</label>
                            <textarea
                              value={spoc.spoc_note}
                              onChange={(e) => handleSpocChange(index, "spoc_note", e.target.value)}
                              rows="2"
                              className="form-textarea"
                              placeholder="Enter note (optional)"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="error-message">
                    <span className="material-symbols-outlined">error</span>
                    {error}
                  </div>
                )}

                {/* Form Actions */}
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => navigate("/admin-process")}
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
