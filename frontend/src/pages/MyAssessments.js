import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBookOpen,
  faChartSimple,
  faCircleCheck,
  faClipboardQuestion,
  faClock,
  faHistory,
  faLayerGroup,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { api, apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./MyClasses.css";
import "./MyAssessments.css";

function MyAssessments() {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [courses, setCourses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAssessments() {
      setLoading(true);
      setError("");

      try {
        const [testData, courseData, submissionData] = await Promise.all([
          api.tests(),
          api.courses(),
          apiRequest("/test-submissions/").catch(() => []),
        ]);

        setTests(testData);
        setCourses(courseData);
        setSubmissions(submissionData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadAssessments();
  }, []);

  const courseById = useMemo(() => {
    return courses.reduce((map, course) => {
      map[course.id] = course;
      return map;
    }, {});
  }, [courses]);

  const submittedByTest = useMemo(() => {
    return submissions.reduce((map, submission) => {
      if (!submission.student || submission.student === user?.id) {
        map[submission.test] = submission;
      }
      return map;
    }, {});
  }, [submissions, user?.id]);

  const availableTests = tests.filter((test) => !submittedByTest[test.id]);
  const completedTests = tests.filter((test) => submittedByTest[test.id]);
  const totalQuestions = tests.reduce(
    (sum, test) => sum + (test.questions?.length || 0),
    0
  );

  const getAssessmentLink = (test) => {
    const course = courseById[test.course];
    const isTeacher = course?.teacher === user?.id;

    if (isTeacher) {
      return `/myclass/${test.course}/tests`;
    }

    return `/myclass/${test.course}/tests/${test.id}/attempt`;
  };

  const renderAssessmentCard = (test, completed = false) => {
    const course = courseById[test.course];
    const submission = submittedByTest[test.id];
    const questionCount = test.questions?.length || 0;

    return (
      <Link
        className="assessment-link"
        to={completed ? `/myclass/${test.course}/tests` : getAssessmentLink(test)}
        key={test.id}
      >
        <article className={`assessment-card ${completed ? "completed" : "available"}`}>
          <div className="assessment-card-top">
            <div className="assessment-icon">
              <FontAwesomeIcon icon={completed ? faCircleCheck : faClipboardQuestion} />
            </div>
            <span className="assessment-badge">
              {completed ? "Completed" : "Available"}
            </span>
          </div>

          <h3>{test.title}</h3>
          <p>{test.description || "No description provided."}</p>

          <div className="assessment-meta">
            <span>
              <FontAwesomeIcon icon={faBookOpen} />
              {course?.name || "Course"}
            </span>
            <span>
              <FontAwesomeIcon icon={faLayerGroup} />
              {questionCount} {questionCount === 1 ? "question" : "questions"}
            </span>
          </div>

          <div className="assessment-footer">
            <span>
              {completed && submission
                ? `Score: ${submission.marks}/${questionCount}`
                : `Added ${new Date(test.created_at).toLocaleDateString()}`}
            </span>
            <FontAwesomeIcon icon={faArrowRight} />
          </div>
        </article>
      </Link>
    );
  };

  return (
    <div className="myclasses-page assessments-page">
      <div className="myclasses-header assessments-hero">
        <div>
          <h1 className="myclasses-heading">My Assessments</h1>
          <p className="myclasses-subtitle">
            View tests from every class and continue where you need to act.
          </p>
        </div>
        <div className="assessments-hero-icon">
          <FontAwesomeIcon icon={faChartSimple} />
        </div>
      </div>

      <div className="assessment-stats">
        <div className="assessment-stat">
          <span>{availableTests.length}</span>
          <p>Available</p>
        </div>
        <div className="assessment-stat">
          <span>{completedTests.length}</span>
          <p>Completed</p>
        </div>
        <div className="assessment-stat">
          <span>{totalQuestions}</span>
          <p>Total Questions</p>
        </div>
      </div>

      {loading && <div className="page-state">Loading assessments...</div>}
      {error && <div className="form-message error">{error}</div>}

      {!loading && !error && (
        <>
          <section className="assessment-section">
            <div className="assessment-section-title">
              <FontAwesomeIcon icon={faClock} />
              <h2>Available Assessments</h2>
            </div>
            {availableTests.length ? (
              <div className="assessment-grid">
                {availableTests.map((test) => renderAssessmentCard(test))}
              </div>
            ) : (
              <div className="assessment-empty">
                <FontAwesomeIcon icon={faTriangleExclamation} />
                <span>No available assessments right now.</span>
              </div>
            )}
          </section>

          <section className="assessment-section">
            <div className="assessment-section-title">
              <FontAwesomeIcon icon={faHistory} />
              <h2>Completed Assessments</h2>
            </div>
            {completedTests.length ? (
              <div className="assessment-grid">
                {completedTests.map((test) => renderAssessmentCard(test, true))}
              </div>
            ) : (
              <div className="assessment-empty">
                <FontAwesomeIcon icon={faTriangleExclamation} />
                <span>No completed assessments yet.</span>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default MyAssessments;
