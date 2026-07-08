import React, { useEffect, useState } from "react";
import "./Test.css";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faHistory,
  faCircleCheck,
  faTriangleExclamation,
  faPlus,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const Test = () => {
  const [tests, setTests] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { courseId, course } = useOutletContext();
  const { user } = useAuth();
  const isTeacherForCourse = course?.teacher === user?.id;

  useEffect(() => {
    const loadTests = async () => {
      try {
        const [testData, submissionData] = await Promise.all([
          api.tests(),
          apiRequestSafe("/test-submissions/"),
        ]);
        setTests(testData.filter((item) => String(item.course) === String(courseId)));
        setSubmissions(submissionData);
      } catch (err) {
        setMessage(err.message);
      }
    };

    loadTests();
  }, [courseId]);

  const attemptedIds = new Set(submissions.map((item) => item.test));
  const upcomingTests = tests.filter((item) => !attemptedIds.has(item.id));
  const pastTests = tests.filter((item) => attemptedIds.has(item.id));

  return (
    <div className="test-page">
      {message && <div className="form-message error">{message}</div>}

      <div className="section-heading">
        <FontAwesomeIcon icon={faClipboardList} />
        <span>Available Tests</span>
      </div>

      {upcomingTests.map((test) => (
        <div className="test-card upcoming-card" key={test.id}>
          <h2>{test.title}</h2>
          <p>{test.description || "No description provided."}</p>
          <div className="detail-item duration">
            <FontAwesomeIcon icon={faClock} />
            <span>{test.questions?.length || 0} Questions</span>
          </div>
          {!isTeacherForCourse && (
            <button className="primary-btn" onClick={() => navigate(`/myclass/${courseId}/tests/${test.id}/attempt`)}>
              Start Assessment
            </button>
          )}
        </div>
      ))}

      {upcomingTests.length === 0 && <div className="page-state">No available tests.</div>}

      <div className="section-heading">
        <FontAwesomeIcon icon={faHistory} />
        <span>Past Tests</span>
      </div>

      {pastTests.map((test) => (
        <div className="test-card completed-card" key={test.id}>
          <h2>{test.title}</h2>
          <p>{test.description}</p>
          <div className="result success-text">
            <FontAwesomeIcon icon={faCircleCheck} />
            <span>Submitted</span>
          </div>
        </div>
      ))}

      {pastTests.length === 0 && (
        <div className="result danger-text">
          <FontAwesomeIcon icon={faTriangleExclamation} />
          <span>No completed tests.</span>
        </div>
      )}

      {isTeacherForCourse && (
        <button className="floating-btn" onClick={() => navigate(`/myclass/${courseId}/add-test`)}>
          <FontAwesomeIcon icon={faPlus} />
        </button>
      )}
    </div>
  );
};

async function apiRequestSafe(path) {
  const { apiRequest } = await import("../../services/api");
  try {
    return await apiRequest(path);
  } catch {
    return [];
  }
}

export default Test;
