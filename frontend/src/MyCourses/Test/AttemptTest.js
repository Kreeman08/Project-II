import React, { useEffect, useState } from "react";
import "./AttemptTest.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faXmark, faArrowLeft, faArrowRight, faCircle } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useParams } from "react-router-dom";
import { api, apiRequest } from "../../services/api";

const AttemptTest = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [message, setMessage] = useState("");
  const questions = test?.questions || [];
  const questionsPerPage = 10;
  const currentPage = Math.floor(currentQuestion / questionsPerPage);
  const pageQuestions = questions.slice(
    currentPage * questionsPerPage,
    currentPage * questionsPerPage + questionsPerPage
  );

  useEffect(() => {
    apiRequest(`/tests/${testId}/`).then(setTest).catch((err) => setMessage(err.message));
  }, [testId]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleSelectOption = (questionId, optionId) => {
    setSelectedAnswers((prev) => {
      if (prev[questionId] === optionId) {
        const updated = { ...prev };
        delete updated[questionId];
        return updated;
      }
      return { ...prev, [questionId]: optionId };
    });
  };

  const handleQuestionClick = (index) => {
    setCurrentQuestion(index);
    document.getElementById(`question-${index}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleSubmit = async () => {
    try {
      const answers = Object.entries(selectedAnswers).map(([question, selected_option]) => ({
        question: Number(question),
        selected_option: Number(selected_option),
      }));
      await api.submitTest({ test: Number(testId), answers });
      navigate(-1);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const progress = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;
  const pageCount = Math.max(1, Math.ceil(questions.length / questionsPerPage));

  if (!test) {
    return <div className="page-state">{message || "Loading test..."}</div>;
  }

  return (
    <div className="attempt-test-layout">
      <div className="attempt-header">
        <button className="save-btn" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faXmark} />
          <span>Save & Exit</span>
        </button>
        <h2>{test.title}</h2>
        <div className="timer-box">
          <div className="timer-icon">
            <FontAwesomeIcon icon={faClock} />
          </div>
          <div className="timer-content">
            <span className="timer-label">TIME REMAINING</span>
            <span className="timer-time">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      {message && <div className="form-message error">{message}</div>}

      <div className="attempt-body">
        <div className="question-sidebar">
          <div className="sidebar-header">
            <h3>Question Navigator</h3>
            <div className="progress-row">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <span>{progress}% Complete</span>
            </div>
          </div>

          {Array.from({ length: pageCount }, (_, page) => (
            <div className="page-section" key={page}>
              <p className="page-title">PAGE {page + 1}</p>
              <div className="question-grid">
                {questions.slice(page * questionsPerPage, page * questionsPerPage + questionsPerPage).map((question, index) => (
                  <button
                    key={question.id}
                    className={`question-number-btn ${selectedAnswers[question.id] !== undefined ? "answered" : ""}`}
                    onClick={() => handleQuestionClick(page * questionsPerPage + index)}
                  >
                    <span>{page * questionsPerPage + index + 1}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="question-content">
          <div className="question-top">
            <p>QUESTIONS {currentPage * 10 + 1}-{Math.min(currentPage * 10 + 10, questions.length)} OF {questions.length}</p>
            <span>Page {currentPage + 1}</span>
          </div>

          {pageQuestions.map((question, index) => {
            const actualIndex = currentPage * questionsPerPage + index;
            return (
              <div key={question.id} id={`question-${actualIndex}`} className="question-card">
                <span className="question-label">Question {actualIndex + 1}</span>
                <h3>{question.text}</h3>
                <div className="options-wrapper">
                  {question.options.map((option) => (
                    <div
                      key={option.id}
                      className={`option-item ${selectedAnswers[question.id] === option.id ? "selected" : ""}`}
                      onClick={() => handleSelectOption(question.id, option.id)}
                    >
                      <div className="custom-radio">
                        {selectedAnswers[question.id] === option.id && <FontAwesomeIcon icon={faCircle} />}
                      </div>
                      <input type="radio" checked={selectedAnswers[question.id] === option.id} readOnly />
                      <span>{option.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="pagination-footer">
            <div className="pagination-left">
              <button className="page-btn secondary" onClick={() => setCurrentQuestion(Math.max(0, (currentPage - 1) * questionsPerPage))} disabled={currentPage === 0}>
                <FontAwesomeIcon icon={faArrowLeft} />
                <span>Previous Page</span>
              </button>
              <button className="page-btn primary" onClick={() => setCurrentQuestion((currentPage + 1) * questionsPerPage)} disabled={currentPage >= pageCount - 1}>
                <span>Next Page</span>
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
            <button className="submit-btn" onClick={handleSubmit}>
              Submit Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttemptTest;
