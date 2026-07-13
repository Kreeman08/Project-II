import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCheckCircle, faUsers } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { api, apiRequest } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./Test.css";

function TestResults() {
  const { testId } = useParams();
  const { courseId, course } = useOutletContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [members, setMembers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [message, setMessage] = useState("");
  const isTeacher = String(course?.teacher) === String(user?.id);
  const load = useCallback(async () => { try { const [testData, enrollmentData, submissionData] = await Promise.all([apiRequest(`/tests/${testId}/`), api.enrollments(), apiRequest("/test-submissions/")]); setTest(testData); setMembers(enrollmentData.filter((entry) => String(entry.course) === String(courseId))); setSubmissions(submissionData.filter((item) => item.test === Number(testId))); } catch (err) { setMessage(err.message); } }, [courseId, testId]);
  useEffect(() => { load(); }, [load]);
  const byStudent = useMemo(() => new Map(submissions.map((item) => [item.student, item])), [submissions]);
  if (!isTeacher) return <div className="page-state">Only the course teacher can view test results.</div>;
  if (!test) return <div className="page-state">{message || "Loading test results..."}</div>;
  return <section className="test-results-page"><button className="results-back" onClick={() => navigate(`/myclass/${courseId}/tests`)}><FontAwesomeIcon icon={faArrowLeft} /> Tests</button><p className="test-page__eyebrow">Student Results</p><h1>{test.title}</h1><div className="results-summary"><span><FontAwesomeIcon icon={faUsers} /> {members.length} students</span><span><FontAwesomeIcon icon={faCheckCircle} /> {submissions.length} submitted</span><span>{Math.max(0, members.length - submissions.length)} pending</span></div><div className="test-results-table-wrap"><table className="test-results-table"><thead><tr><th>Student</th><th>Email</th><th>Status</th><th>Score</th><th>Submitted</th></tr></thead><tbody>{members.map((member) => { const submission = byStudent.get(member.student); return <tr key={member.id}><td><strong>{member.student_name || "Unknown User"}</strong></td><td>{member.student_email || "-"}</td><td><span className={`test-submission-status ${submission ? "test-submission-status--submitted" : "test-submission-status--pending"}`}>{submission ? "Submitted" : "Not submitted"}</span></td><td>{submission ? <span className="test-score-badge">{submission.marks}/{test.question_count}</span> : "-"}</td><td>{submission ? new Date(submission.submitted_at).toLocaleDateString() : "-"}</td></tr>; })}</tbody></table></div>{!members.length && <div className="test-empty-state">No students are enrolled in this course.</div>}</section>;
}

export default TestResults;
