import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import "./LeaveCourseRequests.css";

const nameFor = (item) => item.student_name?.trim() || item.student_email || "Unknown student";

function LeaveCourseRequests() {
  const { courseId, course } = useOutletContext();
  const { user } = useAuth();
  const isTeacher = String(course?.teacher) === String(user?.id);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    try { setRequests(await api.leaveCourseRequests(courseId)); setMessage(""); }
    catch (err) { setMessage(err.message); }
    finally { setLoading(false); }
  }, [courseId]);
  useEffect(() => { load(); }, [load]);
  const pending = useMemo(() => requests.filter((item) => item.status === "pending"), [requests]);
  const decide = async (item, status) => {
    if (!window.confirm(`${status === "approved" ? "Approve" : "Decline"} ${nameFor(item)}’s request to leave ${item.course_name}?`)) return;
    setBusyId(item.id); setMessage("");
    try {
      await api.decideLeaveCourseRequest(item.id, status);
      setRequests((items) => items.map((request) => request.id === item.id ? { ...request, status } : request));
      setMessage(`Leave request ${status}.`);
      window.dispatchEvent(new Event("notifications:changed"));
    } catch (err) { setMessage(err.message); }
    finally { setBusyId(null); }
  };
  if (!isTeacher) return <div className="page-state">Only this course's teacher can view leave requests.</div>;
  
return (
  <section className="leave-course-page">
    <div className="leave-course-page__heading">
      <div>
        <h1>Leave Requests</h1>
        <span>Review requests to leave this class.</span>
      </div>

      <strong>{pending.length} pending</strong>
    </div>

    {message && (
      <div
        className={
          message.includes("approved") || message.includes("declined")
            ? "form-message success"
            : "form-message error"
        }
      >
        {message}
      </div>
    )}

    {loading ? (
      <div className="page-state">
        Loading requests…
      </div>
    ) : (
      <div className="leave-course-table-wrap">
        <table className="leave-course-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Course</th>
              <th>Request date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {pending.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{nameFor(item)}</strong>
                  <small>{item.student_email}</small>
                </td>

                <td>{item.course_name}</td>

                <td>
                  {new Date(item.created_at).toLocaleString()}
                </td>

                <td>
                  <span
                    className={`leave-course-status leave-course-status--${item.status}`}
                  >
                    {item.status}
                  </span>
                </td>

                <td>
                  <div className="leave-course-actions">
                    <button
                      disabled={busyId === item.id}
                      onClick={() => decide(item, "approved")}
                    >
                      Approve
                    </button>

                    <button
                      className="leave-course-actions__reject"
                      disabled={busyId === item.id}
                      onClick={() => decide(item, "declined")}
                    >
                      Decline
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    {!loading && !pending.length && (
      <div className="page-state">
        There are no pending leave requests.
      </div>
    )}
  </section>
);
}

export default LeaveCourseRequests;
