import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faDoorOpen, faUserPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import "./LeaveCourseRequests.css";

const nameFor = (item) => item.student_name?.trim() || item.student_email || "Unknown student";
const statusLabel = (status) => status === "declined" ? "Rejected" : status;

function LeaveCourseRequests() {
  const { courseId, course } = useOutletContext();
  const { user } = useAuth();
  const isTeacher = String(course?.teacher) === String(user?.id);
  const [activeTab, setActiveTab] = useState("join");
  const [joinRequests, setJoinRequests] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [approvalRequired, setApprovalRequired] = useState(true);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [savingMode, setSavingMode] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (course) setApprovalRequired(course.enrollment_requires_approval !== false);
  }, [course]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [joinData, leaveData] = await Promise.all([
        api.joinCourseRequests(courseId),
        api.leaveCourseRequests(courseId),
      ]);
      setJoinRequests(joinData);
      setLeaveRequests(leaveData);
      setMessage("");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { if (isTeacher) load(); }, [isTeacher, load]);

  const pendingJoin = useMemo(() => joinRequests.filter((item) => item.status === "pending"), [joinRequests]);
  const pendingLeave = useMemo(() => leaveRequests.filter((item) => item.status === "pending"), [leaveRequests]);

  const changeMode = async (requiresApproval) => {
    if (approvalRequired === requiresApproval) return;
    setSavingMode(true);
    setMessage("");
    try {
      const updated = await api.updateCourse(courseId, { enrollment_requires_approval: requiresApproval });
      setApprovalRequired(updated.enrollment_requires_approval !== false);
      setMessage("Enrollment mode updated.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSavingMode(false);
    }
  };

  const decideJoin = async (item, status) => {
    const action = status === "approved" ? "Approve" : "Reject";
    if (!window.confirm(`${action} ${nameFor(item)}'s request to join ${item.course_name}?`)) return;
    setBusyId(`join-${item.id}`);
    setMessage("");
    try {
      const updated = await api.decideJoinCourseRequest(item.id, status);
      setJoinRequests((items) => items.map((request) => request.id === item.id ? updated : request));
      setMessage(`Join request ${status}.`);
      window.dispatchEvent(new Event("notifications:changed"));
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const decideLeave = async (item, status) => {
    const action = status === "approved" ? "Approve" : "Reject";
    if (!window.confirm(`${action} ${nameFor(item)}'s request to leave ${item.course_name}?`)) return;
    setBusyId(`leave-${item.id}`);
    setMessage("");
    try {
      const updated = await api.decideLeaveCourseRequest(item.id, status === "rejected" ? "declined" : status);
      setLeaveRequests((items) => items.map((request) => request.id === item.id ? updated : request));
      setMessage(`Leave request ${status}.`);
      window.dispatchEvent(new Event("notifications:changed"));
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusyId(null);
    }
  };

  if (!isTeacher) return <div className="page-state">Only this course's teacher can view enrollment requests.</div>;

  return (
    <section className="enrollment-requests-page">
      <div className="enrollment-requests-page__heading">
        <div>
          <p>Course access</p>
          <h1>Enrollment Requests</h1>
          <span>Review students joining or leaving this class.</span>
        </div>
        <strong>{pendingJoin.length + pendingLeave.length} pending</strong>
      </div>

      {message && <div className={message.includes("updated") || message.includes("approved") || message.includes("rejected") ? "form-message success" : "form-message error"}>{message}</div>}

      <div className="enrollment-tabs">
        <button className={activeTab === "join" ? "active" : ""} onClick={() => setActiveTab("join")}><FontAwesomeIcon icon={faUserPlus} /> Join Requests</button>
        <button className={activeTab === "leave" ? "active" : ""} onClick={() => setActiveTab("leave")}><FontAwesomeIcon icon={faDoorOpen} /> Leave Requests</button>
      </div>

      {activeTab === "join" && (
        <>
          <div className="enrollment-mode-card">
            <div>
              <h2>Enrollment Mode</h2>
              <p>Choose whether students join immediately or wait for teacher approval after entering the course code.</p>
            </div>
            <div className="enrollment-mode-options">
              <button className={approvalRequired ? "active" : ""} disabled={savingMode} onClick={() => changeMode(true)}>Approval Required</button>
              <button className={!approvalRequired ? "active" : ""} disabled={savingMode} onClick={() => changeMode(false)}>Allow All to Join Automatically</button>
            </div>
          </div>
          <RequestTable
            loading={loading}
            requests={pendingJoin}
            emptyText="There are no pending join requests."
            busyPrefix="join"
            busyId={busyId}
            onApprove={(item) => decideJoin(item, "approved")}
            onReject={(item) => decideJoin(item, "rejected")}
          />
        </>
      )}

      {activeTab === "leave" && (
        <RequestTable
          loading={loading}
          requests={pendingLeave}
          emptyText="There are no pending leave requests."
          busyPrefix="leave"
          busyId={busyId}
          onApprove={(item) => decideLeave(item, "approved")}
          onReject={(item) => decideLeave(item, "rejected")}
        />
      )}
    </section>
  );
}

const RequestTable = ({ loading, requests, emptyText, busyPrefix, busyId, onApprove, onReject }) => {
  if (loading) return <div className="page-state">Loading requests...</div>;
  if (!requests.length) return <div className="page-state">{emptyText}</div>;

  return (
    <div className="enrollment-table-wrap">
      <table className="enrollment-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Request date and time</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((item) => (
            <tr key={item.id}>
              <td><strong>{nameFor(item)}</strong><small>{item.student_email || "-"}</small></td>
              <td>{new Date(item.created_at).toLocaleString()}</td>
              <td><span className={`enrollment-status enrollment-status--${item.status}`}>{statusLabel(item.status)}</span></td>
              <td>
                <div className="enrollment-actions">
                  <button disabled={busyId === `${busyPrefix}-${item.id}`} onClick={() => onApprove(item)}><FontAwesomeIcon icon={faCheck} /> Approve</button>
                  <button className="enrollment-actions__reject" disabled={busyId === `${busyPrefix}-${item.id}`} onClick={() => onReject(item)}><FontAwesomeIcon icon={faXmark} /> Reject</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaveCourseRequests;
