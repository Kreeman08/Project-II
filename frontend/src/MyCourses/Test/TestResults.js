import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faCircleXmark, faUsers } from "@fortawesome/free-solid-svg-icons";
import {  useOutletContext, useParams } from "react-router-dom";
import { api, apiRequest } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./Test.css";

function TestResults() {
  const { testId } = useParams();
  const { courseId, course } = useOutletContext();
  const { user } = useAuth();
  const [test, setTest] = useState(null);
  const [members, setMembers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");
  const isTeacher = String(course?.teacher) === String(user?.id);

  const load = useCallback(async () => {
    try {
      setMessage("");
      const [testData, submissionData] = await Promise.all([
        apiRequest(`/tests/${testId}/`),
        api.testSubmissions(),
      ]);
      const testSubmissions = submissionData.filter((item) => item.test === Number(testId));
      setTest(testData);
      setSubmissions(testSubmissions);

      if (isTeacher) {
        const enrollmentData = await api.enrollments();
        setMembers(enrollmentData.filter((entry) => String(entry.course) === String(courseId)));
        setResult(null);
        return;
      }

      const ownSubmission = testSubmissions.find((item) => String(item.student) === String(user?.id)) || testSubmissions[0];
      if (!ownSubmission) {
        setResult(null);
        setMessage("You have not submitted this test yet.");
        return;
      }
      const resultData = await api.testSubmissionResult(ownSubmission.id);
      setResult({ ...resultData, submitted_at: ownSubmission.submitted_at });
    } catch (err) {
      setMessage(err.message);
    }
  }, [courseId, isTeacher, testId, user?.id]);

  useEffect(() => { load(); }, [load]);

  const byStudent = useMemo(() => new Map(submissions.map((item) => [item.student, item])), [submissions]);
  const correctCount = result?.answers?.filter((answer) => answer.is_correct).length || 0;
  const wrongCount = result ? result.answers.length - correctCount : 0;

  if (!test) return <div className="page-state">{message || "Loading test results..."}</div>;

  if (isTeacher) {
    return (
  <section className="test-results-page">
    <p className="test-page__eyebrow">
      Student Results
    </p>

    <h1>{test.title}</h1>

    <div className="results-summary">
      <span>
        <FontAwesomeIcon icon={faUsers} />
        {" "}{members.length} students
      </span>

      <span>
        <FontAwesomeIcon icon={faCheckCircle} />
        {" "}{submissions.length} submitted
      </span>

      <span>
        {Math.max(0, members.length - submissions.length)} pending
      </span>
    </div>

    <div className="test-results-table-wrap">
      <table className="test-results-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Email</th>
            <th>Status</th>
            <th>Score</th>
            <th>Submitted</th>
          </tr>
        </thead>

        <tbody>
          {members.map((member) => {
            const submission = byStudent.get(member.student);

            return (
              <tr key={member.id}>
                <td>
                  <strong>
                    {member.student_name || "Unknown User"}
                  </strong>
                </td>

                <td>
                  {member.student_email || "-"}
                </td>

                <td>
                  <span
                    className={`test-submission-status ${
                      submission
                        ? "test-submission-status--submitted"
                        : "test-submission-status--pending"
                    }`}
                  >
                    {submission
                      ? "Submitted"
                      : "Not submitted"}
                  </span>
                </td>

                <td>
                  {submission ? (
                    <span className="test-score-badge">
                      {submission.marks}/{test.question_count}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>

                <td>
                  {submission
                    ? new Date(
                        submission.submitted_at
                      ).toLocaleDateString()
                    : "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    {!members.length && (
      <div className="test-empty-state">
        No students are enrolled in this course.
      </div>
    )}
  </section>
);
  }

  if (!result) return <div className="page-state">{message || "Loading your result..."}</div>;

  return (
    <section className="test-review-page">
  
      <p className="test-page__eyebrow">Test Result</p>

      <div className="test-review-hero">
        <div>
          <h1>{result.test}</h1>
          <p>Review your submitted answers and the correct answers question by question.</p>
        </div>
        <div className="test-review-score">
          <span>Score</span>
          <strong>{result.marks}/{result.total_marks}</strong>
        </div>
      </div>

      <div className="test-review-summary">
        <span><FontAwesomeIcon icon={faCheckCircle} /> {correctCount} correct</span>
        <span><FontAwesomeIcon icon={faCircleXmark} /> {wrongCount} incorrect</span>
        <span>{result.total_questions} questions</span>
        {result.submitted_at && <span>Submitted {new Date(result.submitted_at).toLocaleString()}</span>}
      </div>

      <div className="question-review-list">
        {result.answers.map((answer) => (
          <article className={`question-review-card ${answer.is_correct ? "question-review-card--correct" : "question-review-card--wrong"}`} key={answer.question_id}>
            <div className="question-review-card__header">
              <div>
                <span className="question-review-card__number">Question {answer.question_number}</span>
                <h2>{answer.question_text}</h2>
              </div>
              <div className={`question-review-status ${answer.is_correct ? "question-review-status--correct" : "question-review-status--wrong"}`}>
                <FontAwesomeIcon icon={answer.is_correct ? faCheckCircle : faCircleXmark} />
                <span>{answer.is_correct ? "Correct" : "Incorrect"}</span>
              </div>
            </div>
            <div className="question-review-meta">Marks obtained: <strong>{answer.marks_obtained}</strong></div>
            <div className="answer-review-sections">
              <AnswerBlock label="Your Answer:" value={answer.student_answer || "Not answered"} tone={answer.is_correct ? "correct" : "wrong"} />
              {!answer.is_correct && <AnswerBlock label="Correct Answer:" value={answer.correct_answer || "Not available"} tone="correct" />}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

const AnswerBlock = ({ label, value, tone }) => (
  <div className={`answer-review answer-review--${tone}`}>
    <span>{label}</span>
    <p>{value}</p>
  </div>
);

export default TestResults;
