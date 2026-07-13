import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./Test.css";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen, faCheckCircle, faClipboardList, faClockRotateLeft, faPenToSquare, faPlus, faTrashCan, faUsers } from "@fortawesome/free-solid-svg-icons";
import { api, apiRequest } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const deadlineHasPassed = (deadline) => deadline && new Date(deadline) <= new Date();
const formatDeadline = (deadline) => deadline ? new Date(deadline).toLocaleString() : null;

const SectionHeading = ({ icon, title, text }) => <div className="test-section-heading"><FontAwesomeIcon icon={icon} /><div><h2>{title}</h2><p>{text}</p></div></div>;
const EmptyState = ({ text }) => <div className="test-empty-state"><FontAwesomeIcon icon={faClipboardList} /><p>{text}</p></div>;

const Test = () => {
  const [tests, setTests] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [sort, setSort] = useState("newest");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState(null);
  const navigate = useNavigate();
  const { courseId, course } = useOutletContext();
  const { user } = useAuth();
  const isTeacher = String(course?.teacher) === String(user?.id);

  const load = useCallback(async () => {
    try {
      const [testData, submissionData, enrollmentData] = await Promise.all([api.tests(), apiRequest("/test-submissions/"), api.enrollments()]);
      setTests(testData.filter((item) => String(item.course) === String(courseId)));
      setSubmissions(submissionData);
      setEnrollments(enrollmentData.filter((item) => String(item.course) === String(courseId)));
    } catch (err) { setMessage(err.message); }
  }, [courseId]);
  useEffect(() => { load(); }, [load]);

  const submissionByTest = useMemo(() => new Map(submissions.map((item) => [item.test, item])), [submissions]);
  const publishedTests = useMemo(() => tests.filter((test) => test.published), [tests]);
  const availableTests = publishedTests.filter((test) => !submissionByTest.has(test.id) && !deadlineHasPassed(test.deadline));
  const completedTests = publishedTests.filter((test) => submissionByTest.has(test.id));
  const teacherTests = useMemo(() => [...tests].sort((left, right) => sort === "newest" ? new Date(right.created_at) - new Date(left.created_at) : new Date(left.created_at) - new Date(right.created_at)), [sort, tests]);

  const updatePublication = async (test, published) => { setBusyId(test.id); try { await api.updateTest(test.id, { published }); await load(); } catch (err) { setMessage(err.message); } finally { setBusyId(null); } };
  const deleteTest = async (test) => { if (!window.confirm(`Delete "${test.title}"? This cannot be undone.`)) return; setBusyId(test.id); try { await api.deleteTest(test.id); await load(); } catch (err) { setMessage(err.message); } finally { setBusyId(null); } };

  const studentCard = (test, completed = false) => <article className="test-card" key={test.id}><div className="test-card__topline"><span className={`test-status ${completed ? "test-status--complete" : "test-status--open"}`}><FontAwesomeIcon icon={completed ? faCheckCircle : faClipboardList} />{completed ? "Completed" : "Published"}</span><span className="test-count">{test.question_count} questions</span></div><h2>{test.title}</h2><p>{test.description || "No description provided for this test."}</p>{test.deadline && <span className="test-deadline"><FontAwesomeIcon icon={faClockRotateLeft} /> Deadline: {formatDeadline(test.deadline)}</span>}{completed ? <div className="test-card__footer"><span className="test-score">Score: {submissionByTest.get(test.id)?.marks}/{test.question_count}</span><span className="test-muted">Submitted</span></div> : <button className="test-action test-action--primary" onClick={() => navigate(`/myclass/${courseId}/tests/${test.id}/attempt`)}>Start test</button>}</article>;

  return <section className="test-page"><div className="test-page__hero"><div><p className="test-page__eyebrow">Course assessments</p><h1>Tests</h1><p>{isTeacher ? "Create tests and review each test's results." : "Multiple-choice tests are ready when your teacher publishes them."}</p></div>{isTeacher && <button className="test-action test-action--primary" onClick={() => navigate(`/myclass/${courseId}/add-test`)}><FontAwesomeIcon icon={faPlus} /> Create test</button>}</div>{message && <div className="form-message error">{message}</div>}{isTeacher ? <><div className="test-list-toolbar"><SectionHeading icon={faBookOpen} title="Created Tests" text="Select a test to view only that test's student results." /><label>Sort <select value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Newest</option><option value="oldest">Oldest</option></select></label></div><div className="test-grid">{teacherTests.map((test) => { const testSubmissions = submissions.filter((item) => item.test === test.id); const average = testSubmissions.length ? (testSubmissions.reduce((sum, item) => sum + item.marks, 0) / testSubmissions.length).toFixed(1) : null; return <article className="test-card test-card--teacher" key={test.id}><div className="test-card__topline"><span className={`test-status ${test.published ? "test-status--open" : "test-status--draft"}`}>{test.published ? "Published" : "Draft"}</span><span className="test-count">Created {new Date(test.created_at).toLocaleDateString()}</span></div><h2>{test.title}</h2><div className="test-metrics"><span><strong>{test.question_count}</strong> Questions</span><span><strong>{enrollments.length}</strong> Students</span><span><strong>{testSubmissions.length}</strong> Submitted</span><span><strong>{Math.max(0, enrollments.length - testSubmissions.length)}</strong> Pending</span>{average !== null && <span><strong>{average}/{test.question_count}</strong> Average</span>}</div><div className="test-card__actions"><button className="test-action test-action--primary" onClick={() => navigate(`/myclass/${courseId}/tests/${test.id}/results`)}><FontAwesomeIcon icon={faUsers} /> View Results</button>{test.published ? <button className="test-action test-action--secondary" disabled={busyId === test.id} onClick={() => updatePublication(test, false)}>Unpublish</button> : <><button className="test-action test-action--secondary" onClick={() => navigate(`/myclass/${courseId}/tests/${test.id}/edit`)}><FontAwesomeIcon icon={faPenToSquare} /> Edit</button><button className="test-action test-action--primary" disabled={busyId === test.id} onClick={() => updatePublication(test, true)}>Publish</button></>}<button className="test-icon-button test-icon-button--danger" aria-label={`Delete ${test.title}`} disabled={busyId === test.id} onClick={() => deleteTest(test)}><FontAwesomeIcon icon={faTrashCan} /></button></div></article>; })}</div>{!teacherTests.length && <EmptyState text="No tests created yet. Create a test to get started." />}</> : <><SectionHeading icon={faClipboardList} title="Available Tests" text="Each test has one attempt and four choices per question." /><div className="test-grid">{availableTests.map((test) => studentCard(test))}</div>{!availableTests.length && <EmptyState text="There are no tests available right now. Check back after your teacher publishes one." />}<SectionHeading icon={faCheckCircle} title="Completed Tests" text="Your submitted assessments." /><div className="test-grid">{completedTests.map((test) => studentCard(test, true))}</div>{!completedTests.length && <EmptyState text="You have not completed a test yet." />}</>}</section>;
};

export default Test;
