// src/components/AddAssignmentPopup.js

import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./AddAssignmentPopup.css";
import {
  faCalendarDays,
  faChevronUp,
  faChevronDown,
  faXmark,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "../../services/api";

function AddAssignmentPopup({
  setShowAssignmentPopup,
  courseId,
  onCreated,
  assignment,
}) {
  const timePopupRef = useRef(null);

  /* =====================
     STATE
  ===================== */

  const [referenceType, setReferenceType] = useState("text");

  const [referenceText, setReferenceText] = useState(assignment?.reference_text ||""); 
  const [selectedFile, setSelectedFile] = useState(null);

  const [title, setTitle] = useState(assignment?.title || "");
  const [description, setDescription] = useState(
    assignment?.description || ""
  );

  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  /* DATE */
  const today = new Date();
  const minDate = today.toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(
    assignment?.deadline
      ? assignment.deadline.slice(0, 10)
      : minDate
  );

  /* TIME */
  const [showTimePopup, setShowTimePopup] = useState(false);
  const [hour, setHour] = useState(11);
  const [minute, setMinute] = useState(59);
  const [period, setPeriod] = useState("PM");

  /* CLOSE TIME POPUP */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        timePopupRef.current &&
        !timePopupRef.current.contains(e.target)
      ) {
        setShowTimePopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* =====================
     TIME HELPERS
  ===================== */

  const increaseHour = () =>
    setHour((prev) => (prev === 12 ? 1 : prev + 1));

  const decreaseHour = () =>
    setHour((prev) => (prev === 1 ? 12 : prev - 1));

  const increaseMinute = () =>
    setMinute((prev) => (prev === 59 ? 0 : prev + 1));

  const decreaseMinute = () =>
    setMinute((prev) => (prev === 0 ? 59 : prev - 1));

  const handleHourInput = (e) => {
    let value = e.target.value;
    if (value === "") return setHour("");
    value = Number(value);
    if (value >= 1 && value <= 12) setHour(value);
  };

  const handleMinuteInput = (e) => {
    let value = e.target.value;
    if (value === "") return setMinute("");
    value = Number(value);
    if (value >= 0 && value <= 59) setMinute(value);
  };

  const toIsoDeadline = () => {
    let normalizedHour = Number(hour);

    if (period === "PM" && normalizedHour !== 12)
      normalizedHour += 12;

    if (period === "AM" && normalizedHour === 12)
      normalizedHour = 0;

    const date = new Date(selectedDate);
    date.setHours(normalizedHour, Number(minute), 0, 0);

    return date.toISOString();
  };

  /* =====================
     CREATE / UPDATE
  ===================== */

 const handleCreate = async () => {
  setBusy(true);
  setMessage("");

  try {
    const formData = new FormData();

    formData.append("course", Number(courseId));
    formData.append("title", title);
    formData.append("description", description);
    formData.append("deadline", toIsoDeadline());

    // formData.append("reference_text", referenceText || "");
    formData.append("reference_text", referenceText);

    if (selectedFile) {
      formData.append("reference_file", selectedFile);
    }

    if (assignment?.id) {
      await api.updateAssignment(assignment.id, formData); // ✅ FIXED
    } else {
      await api.createAssignment(formData);
    }

    onCreated?.();
    setShowAssignmentPopup(false);

  } catch (err) {
    setMessage(err.message);
  } finally {
    setBusy(false);
  }
};

  return (
    <div className="assignment-popup-overlay">
      <div className="assignment-popup">

        {/* HEADER */}
        <div className="popup-header">
          <h1>
            {assignment?.id
              ? "Edit Assignment"
              : "Create Assignment"}
          </h1>

          <button
            className="close-popup-btn"
            onClick={() => setShowAssignmentPopup(false)}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* TITLE */}
        <div className="popup-section">
          <label>
            <h3>Assignment Title</h3>
          </label>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., C programming"
          />
        </div>

        {/* INSTRUCTIONS */}
        <div className="popup-section">
          <label>
            <h3>Detailed Instructions</h3>
          </label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide handwritten notes"
            rows="4"
          />
        </div>

        {/* REFERENCE */}
        <div className="popup-section">
          <h3>Reference Materials</h3>

          <div className="reference-tabs">
            <button
              className={
                referenceType === "text" ? "active-tab" : ""
              }
              onClick={() => setReferenceType("text")}
            >
              Text Reference
            </button>

            <button
              className={
                referenceType === "file" ? "active-tab" : ""
              }
              onClick={() => setReferenceType("file")}
            >
              File Reference
            </button>
          </div>

          {referenceType === "text" ? (
            <textarea
              className="reference-textarea"
              placeholder="Type or paste reference material..."
              value={referenceText}
              onChange={(e) =>
                setReferenceText(e.target.value)
              }
            />
          ) : (
            <div className="file-upload-box">
              <input
                type="file"
                id="fileUpload"
                hidden
                onChange={(e) =>
                  setSelectedFile(e.target.files[0])
                }
              />

              <label
                htmlFor="fileUpload"
                className="upload-btn"
              >
                Upload File
              </label>

              {selectedFile && (
                <p className="file-name">
                  {selectedFile.name}
                </p>
              )}
            </div>
          )}
        </div>

        {/* SCHEDULING */}
        <div className="popup-section">
          <h3>Scheduling</h3>

          <div className="popup-box">
            <div className="date-time-row">

{/* DATE */}
<div className="date-time-field">
  <label>Due Date</label>

  <div
    className="input-icon-box date-click"
    onClick={() =>
      document
        .getElementById("assignmentDateInput")
        .showPicker()
    }
  >
    <FontAwesomeIcon
      icon={faCalendarDays}
      className="input-icon"
    />

    <input
      id="assignmentDateInput"
      type="date"
      min={minDate}
      value={selectedDate}
      onChange={(e) =>
        setSelectedDate(e.target.value)
      }
      className="styled-input hide-calendar-icon"
    />
  </div>
</div>
              {/* TIME */}
              <div className="date-time-field">
                <label>Time</label>

                <div
                  className="input-icon-box time-click"
                  onClick={() =>
                    setShowTimePopup((prev) => !prev)
                  }
                >
                  <FontAwesomeIcon
                    icon={faClock}
                    className="input-icon"
                  />

                  <span className="time-display">
                    {String(hour).padStart(2, "0")}:
                    {String(minute).padStart(2, "0")}{" "}
                    {period}
                  </span>
                </div>

                {/* POPUP */}
                {showTimePopup && (
                  <div
                    className="time-popup"
                    ref={timePopupRef}
                  >
                    <div className="time-control">
                      <button onClick={increaseHour}>
                        <FontAwesomeIcon
                          icon={faChevronUp}
                        />
                      </button>

                      <input
                        type="number"
                        value={hour}
                        onChange={handleHourInput}
                      />

                      <button onClick={decreaseHour}>
                        <FontAwesomeIcon
                          icon={faChevronDown}
                        />
                      </button>
                    </div>

                    <span className="time-separator">
                      :
                    </span>

                    <div className="time-control">
                      <button onClick={increaseMinute}>
                        <FontAwesomeIcon
                          icon={faChevronUp}
                        />
                      </button>

                      <input
                        type="number"
                        value={minute}
                        onChange={handleMinuteInput}
                      />

                      <button onClick={decreaseMinute}>
                        <FontAwesomeIcon
                          icon={faChevronDown}
                        />
                      </button>
                    </div>

                    <div className="ampm-toggle">
                      <button
                        className={
                          period === "AM"
                            ? "active-period"
                            : ""
                        }
                        onClick={() => setPeriod("AM")}
                      >
                        AM
                      </button>

                      <button
                        className={
                          period === "PM"
                            ? "active-period"
                            : ""
                        }
                        onClick={() => setPeriod("PM")}
                      >
                        PM
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="popup-actions">
          <button
            className="cancel-btn"
            onClick={() => setShowAssignmentPopup(false)}
          >
            Cancel
          </button>

          <button
            className="create-btn"
            onClick={handleCreate}
            disabled={busy || !title.trim()}
          >
            {busy
              ? "Saving..."
              : assignment?.id
              ? "Save Assignment"
              : "Create Assignment"}
          </button>
        </div>

        {message && (
          <div className="form-message error">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default AddAssignmentPopup;