import React, { useCallback, useEffect, useRef, useState } from "react";
import "./AttemptTest.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faXmark, faArrowLeft, faArrowRight, faCircle } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { api, apiRequest } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const AttemptTest = () => {
  const { testId } = useParams();
  const { course } = useOutletContext();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [test, setTest] = useState(null);
  const [started, setStarted] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const autoSubmittedRef = useRef(false);
  const questions = test?.questions || [];
  const answeredCount = Object.keys(selectedAnswers).length;
  const timerActive = Boolean(test?.timer_enabled && test?.time_limit_minutes);
  const deadlinePassed = Boolean(test?.deadline && new Date(test.deadline) <= new Date());
  const questionsPerPage = 10;
  const currentPage = Math.floor(currentQuestion / questionsPerPage);
  const pageQuestions = questions.slice(currentPage * questionsPerPage, currentPage * questionsPerPage + questionsPerPage);

  useEffect(() => {
    apiRequest(`/tests/${testId}/`).then(setTest).catch((err) => setMessage(err.message));
  }, [testId]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const submitAttempt = useCallback(async (automatic = false) => {
    if (submitting) return;
    if (!automatic && answeredCount !== questions.length) {
      setMessage("Choose one answer for every question before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const answers = Object.entries(selectedAnswers).map(([question, selected_option]) => ({ question: Number(question), selected_option: Number(selected_option) }));
      await api.submitTest({ test: Number(testId), answers });
      navigate(`/myclass/${test.course}/tests/${testId}/results`);
    } catch (err) {
      setMessage(err.message);
      setSubmitting(false);
    }
  }, [answeredCount, navigate, questions.length, selectedAnswers, submitting, test, testId]);

  useEffect(() => {
    if (!started || !timerActive || timeLeft === null) return undefined;
    if (timeLeft <= 0) {
      if (!autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        setMessage("Time is up. Saving your answers and submitting the test.");
        submitAttempt(true);
      }
      return undefined;
    }
    const timer = setInterval(() => setTimeLeft((remaining) => Math.max(0, remaining - 1)), 1000);
    return () => clearInterval(timer);
  }, [started, submitAttempt, timeLeft, timerActive]);

  const startTest = () => {
    setStarted(true);
    if (timerActive) setTimeLeft(test.time_limit_minutes * 60);
  };
  const selectOption = (questionId, optionId) => {
    if (!submitting && !(timerActive && timeLeft <= 0)) setSelectedAnswers((previous) => ({ ...previous, [questionId]: optionId }));
  };
  const answeredProgress = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;
  const pageCount = Math.max(1, Math.ceil(questions.length / questionsPerPage));

  if (!test) return <div className="page-state">{message || "Loading test..."}</div>;
  if (String(course?.teacher) === String(user?.id) || !test.published || deadlinePassed) return <div className="page-state">This test is not available to take.</div>;
  if (!started) return <section className="test-information"><p className="test-information__eyebrow">Test information</p><h1>{test.title}</h1><p className="test-information__description">{test.description || "Review the criteria below before you begin."}</p><div className="test-information__grid"><Info label="Course" value={course?.name || "Course"} /><Info label="Total questions" value={test.question_count} /><Info label="Total marks" value={test.question_count} /><Info label="Duration" value={timerActive ? `${test.time_limit_minutes} minutes` : "No time limit"} /><Info label="Deadline" value={test.deadline ? new Date(test.deadline).toLocaleString() : "No deadline"} /><Info label="Attempts allowed" value="1" /></div><div className="test-information__instructions"><h2>Instructions</h2><ul><li>Choose one answer for every question.</li>{timerActive && <li>Once started, the timer cannot be paused and the test submits automatically at zero.</li>}<li>You cannot submit after the deadline.</li><li>Make sure you have a stable internet connection before starting.</li></ul></div><div className="test-information__actions"><button className="page-btn secondary" onClick={() => navigate(-1)}>Back</button><button className="submit-btn" onClick={startTest}>Start Test</button></div></section>;

  return <div className="attempt-test-layout">
    <div className="attempt-header"><button className="save-btn" onClick={() => navigate(-1)} disabled={submitting}><FontAwesomeIcon icon={faXmark} /><span>Exit test</span></button><h2>{test.title}{test.deadline && <small>Deadline: {new Date(test.deadline).toLocaleString()}</small>}</h2><div className="timer-box"><div className="timer-icon"><FontAwesomeIcon icon={faClock} /></div><div className="timer-content"><span className="timer-label">{timerActive ? "TIME REMAINING" : "NO TIME LIMIT"}</span><span className="timer-time">{timerActive ? formatTime(timeLeft) : "No limit"}</span></div></div></div>
    {message && <div className="form-message error">{message}</div>}
    <div className="attempt-body"><div className="question-sidebar"><div className="sidebar-header"><h3>Question Navigator</h3><div className="progress-row"><div className="progress-bar"><div className="progress-fill" style={{ width: `${answeredProgress}%` }} /></div><span>{answeredProgress}% Complete</span></div></div>{Array.from({ length: pageCount }, (_, page) => <div className="page-section" key={page}><p className="page-title">PAGE {page + 1}</p><div className="question-grid">{questions.slice(page * questionsPerPage, page * questionsPerPage + questionsPerPage).map((question, index) => <button key={question.id} className={`question-number-btn ${selectedAnswers[question.id] !== undefined ? "answered" : ""}`} onClick={() => { setCurrentQuestion(page * questionsPerPage + index); document.getElementById(`question-${page * questionsPerPage + index}`)?.scrollIntoView({ behavior: "smooth", block: "center" }); }}><span>{page * questionsPerPage + index + 1}</span></button>)}</div></div>)}</div>
      <div className="question-content"><div className="question-top"><p>QUESTIONS {currentPage * 10 + 1}-{Math.min(currentPage * 10 + 10, questions.length)} OF {questions.length}</p><span>Page {currentPage + 1}</span></div>{pageQuestions.map((question, index) => { const actualIndex = currentPage * questionsPerPage + index; return <div key={question.id} id={`question-${actualIndex}`} className="question-card"><span className="question-label">Question {actualIndex + 1}</span><h3>{question.text}</h3><div className="options-wrapper">{question.options.map((option) => <button type="button" key={option.id} className={`option-item ${selectedAnswers[question.id] === option.id ? "selected" : ""}`} onClick={() => selectOption(question.id, option.id)} disabled={submitting || (timerActive && timeLeft <= 0)}><div className="custom-radio">{selectedAnswers[question.id] === option.id && <FontAwesomeIcon icon={faCircle} />}</div><span>{option.text}</span></button>)}</div></div>; })}<div className="pagination-footer"><div className="pagination-left"><button className="page-btn secondary" onClick={() => setCurrentQuestion(Math.max(0, (currentPage - 1) * questionsPerPage))} disabled={currentPage === 0 || submitting}><FontAwesomeIcon icon={faArrowLeft} /><span>Previous Page</span></button><button className="page-btn primary" onClick={() => setCurrentQuestion((currentPage + 1) * questionsPerPage)} disabled={currentPage >= pageCount - 1 || submitting}><span>Next Page</span><FontAwesomeIcon icon={faArrowRight} /></button></div><button className="submit-btn" onClick={() => submitAttempt(false)} disabled={submitting || answeredCount !== questions.length}>{submitting ? "Submitting..." : "Submit Test"}</button></div></div>
    </div>
  </div>;
};

const Info = ({ label, value }) => <div className="test-information__item"><span>{label}</span><strong>{value}</strong></div>;
export default AttemptTest;
