import React, { useState } from "react";
import "./CreateClass.css";
import { api } from "../services/api";

const JoinClassModal = ({ closeModal }) => {
  const [courseCode, setCourseCode] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const handleJoin = async () => {
    setBusy(true);
    setMessage("");

    try {
      const response = await api.joinCourse(courseCode);
      if (response.join_request) {
        setMessage(response.detail || "Join request submitted. Your teacher will review it.");
      } else {
        window.dispatchEvent(new Event("courses:changed"));
        closeModal();
      }
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container join-modal">
        <div className="modal-header">
          <div>
            <h2>Join class</h2>
            <p>Enter the course code your teacher shared.</p>
          </div>
          <button className="close-btn" onClick={closeModal} aria-label="Close">
            x
          </button>
        </div>

        <div className="modal-body">
          <label className="modal-field">
            Course code
            <input
              type="text"
              value={courseCode}
              onChange={(event) => setCourseCode(event.target.value.toUpperCase())}
              placeholder="PHY-X92KQ"
            />
          </label>

          {message && <div className={message.toLowerCase().includes("submitted") ? "form-message success" : "form-message error"}>{message}</div>}
        </div>

        <div className="modal-footer">
          <button className="join-btn modal-primary" onClick={handleJoin} disabled={busy || !courseCode.trim()}>
            {busy ? "Submitting..." : "Join class"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinClassModal;
