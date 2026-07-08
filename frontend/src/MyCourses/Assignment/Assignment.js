import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./Assignment.css";
import "./AddAssignmentPopup.css";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardList, faCircleXmark, faEllipsisVertical, faHistory, faPen, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import AddAssignmentPopup from "./AddAssignmentPopup";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function Assignments() {
  const [showAssignmentPopup, setShowAssignmentPopup] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [error, setError] = useState("");
  const menuRef = useRef(null);
  const { courseId, course } = useOutletContext();
  const { user } = useAuth();
  const isTeacherForCourse = course?.teacher === user?.id;
  const navigate = useNavigate();

  const loadAssignments = useCallback(async () => {
    try {
      const data = await api.assignments();
      setAssignments(data.filter((item) => String(item.course) === String(courseId)));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }, [courseId]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  useEffect(() => {
    function closeMenu(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    }
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  const [upcomingAssignments, pastAssignments] = useMemo(() => {
    const now = Date.now();
    return assignments.reduce(
      (groups, item) => {
        groups[new Date(item.deadline).getTime() >= now ? 0 : 1].push(item);
        return groups;
      },
      [[], []]
    );
  }, [assignments]);

  const openEdit = (assignment) => {
    setEditingAssignment(assignment);
    setShowAssignmentPopup(true);
    setActiveMenu(null);
  };

  const handleDelete = async (assignment) => {
    if (!window.confirm(`Delete "${assignment.title}"?`)) return;
    try {
      await api.deleteAssignment(assignment.id);
      setActiveMenu(null);
      loadAssignments();
    } catch (err) {
      setError(err.message);
    }
  };

  const renderAssignment = (item, past = false) => (
    <div className="assignment-card" key={item.id} onClick={() => navigate(`/myclass/${courseId}/assignment/${item.id}`)}>
      <div className="assignment-card-head">
        <h3>{item.title}</h3>
        {isTeacherForCourse && (
          <div className="assignment-menu" ref={activeMenu === item.id ? menuRef : null} onClick={(event) => event.stopPropagation()}>
            <button onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}>
              <FontAwesomeIcon icon={faEllipsisVertical} />
            </button>
            {activeMenu === item.id && (
              <div className="assignment-popup-menu">
                <button onClick={() => openEdit(item)}>
                  <FontAwesomeIcon icon={faPen} />
                  Edit
                </button>
                <button className="delete-btn" onClick={() => handleDelete(item)}>
                  <FontAwesomeIcon icon={faTrash} />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="assignment-info-row">
        <p>{past ? "Closed" : "Uploaded"} on {new Date(item.created_at).toLocaleDateString()}</p>
        <span className="deadline">{new Date(item.deadline).toLocaleString()}</span>
      </div>
      {past && (
        <div className="status-badge danger">
          <FontAwesomeIcon icon={faCircleXmark} />
          <span>Closed</span>
        </div>
      )}
    </div>
  );

  const closePopup = () => {
    setShowAssignmentPopup(false);
    setEditingAssignment(null);
  };

  return (
    <div className="assignments-page">
      {error && <div className="form-message error">{error}</div>}

      <div className="assignment-section">
        <div className="section-title">
          <FontAwesomeIcon icon={faClipboardList} className="section-icon" />
          <h2>Upcoming</h2>
        </div>
        {upcomingAssignments.length ? upcomingAssignments.map((item) => renderAssignment(item)) : <div className="page-state">No upcoming assignments.</div>}
      </div>

      <div className="assignment-section">
        <div className="section-title">
          <FontAwesomeIcon icon={faHistory} className="section-icon" />
          <h2>Past Assignments</h2>
        </div>
        {pastAssignments.length ? pastAssignments.map((item) => renderAssignment(item, true)) : <div className="page-state">No past assignments.</div>}
      </div>

      {isTeacherForCourse && (
        <button className="floating-btn" onClick={() => setShowAssignmentPopup(true)}>
          <FontAwesomeIcon icon={faPlus} />
        </button>
      )}

      {showAssignmentPopup && (
        <AddAssignmentPopup
          courseId={courseId}
          assignment={editingAssignment}
          setShowAssignmentPopup={closePopup}
          onCreated={loadAssignments}
        />
      )}
    </div>
  );
}

export default Assignments;
