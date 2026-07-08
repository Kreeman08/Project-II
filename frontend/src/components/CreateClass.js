import React, { useState } from "react";
import "./CreateClass.css";
import { api } from "../services/api";

const CreateClassModal = ({ closeModal }) => {
  const [form, setForm] = useState({ name: "" });
  const [commentPermission, setCommentPermission] = useState(true);
  const [fileSharing, setFileSharing] = useState(true);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const updateForm = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async () => {
    setBusy(true);
    setMessage("");

    try {
      const payload = {
        name: form.name,
        description: [
          `Comment permission: ${commentPermission ? "on" : "off"}`,
          `File sharing: ${fileSharing ? "on" : "off"}`,
        ].join("\n"),
      };

      const course = await api.createCourse(payload);
      window.dispatchEvent(new Event("courses:changed"));
      setMessage(`Class created. Course code: ${course.course_code}`);
      setTimeout(closeModal, 900);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container class-modal">
        <div className="modal-header">
          <div>
            <h2>Create class</h2>
            <p>A unique course code is generated after creation.</p>
          </div>

          <button className="close-btn" onClick={closeModal} aria-label="Close">
            x
          </button>
        </div>

        <div className="modal-body">
          <label className="modal-field">
            Class name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={updateForm}
              placeholder="Data Structures"
            />
          </label>

          <div className="permission-card">
            <h4>Comment permission</h4>
            <label className="switch">
              <input
                type="checkbox"
                checked={commentPermission}
                onChange={() => setCommentPermission(!commentPermission)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="permission-card">
            <h4>File sharing</h4>
            <label className="switch">
              <input
                type="checkbox"
                checked={fileSharing}
                onChange={() => setFileSharing(!fileSharing)}
              />
              <span className="slider"></span>
            </label>
          </div>

          {message && <div className="form-message">{message}</div>}
        </div>

        <div className="modal-footer">
          <button className="create-btn modal-primary" onClick={handleSubmit} disabled={busy || !form.name.trim()}>
            {busy ? "Creating..." : "Create class"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateClassModal;
