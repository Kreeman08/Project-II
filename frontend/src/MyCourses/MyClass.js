import React, { useEffect, useState } from "react";
import {
  NavLink,
  Outlet,
  useParams,
  useLocation,
} from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./MyClass.css";

function MyClass() {
  const { courseId } = useParams();
  const location = useLocation();

  const [course, setCourse] = useState(null);

  const [notificationCounts, setNotificationCounts] = useState({
    general: 2,
    files: 1,
    assignments: 1,
    tests: 2,
    enrollment: 2,
  });

  const { user } = useAuth();

  const isTeacher = String(course?.teacher) === String(user?.id);

  useEffect(() => {
    apiRequest(`/courses/${courseId}/`)
      .then(setCourse)
      .catch(() => setCourse(null));
  }, [courseId]);

  const currentPage = () => {
    if (location.pathname.includes("/files")) return "Files";
    if (location.pathname.includes("/assignment")) return "Assignment";
    if (location.pathname.includes("/tests")) return "Tests";
    if (location.pathname.includes("/members")) return "Members";
    if (location.pathname.includes("/enrollment-requests"))
      return "Enrollment Requests";

    return "General";
  };

  return (
    <div className="myclass">

      {/* Breadcrumb */}
      <div className="course-breadcrumb">
        My Classes &gt; {course?.name || "Class"} &gt; {currentPage()}
      </div>

      {/* Header */}
      <div className="course-header">
        <button
          className="back-btn"
          onClick={() => window.history.back()}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>

        <h1 className="course-title">
          {course?.name || "Class"}
        </h1>
      </div>

      {/* Navigation */}
      <div className="course-nav">

        <NavLink to={`/myclass/${courseId}`} end>
          General
          {/* {notificationCounts.general > 0 && (
            <span className="course-badge">
              {notificationCounts.general}
            </span>
          )} */}
        </NavLink>

        <NavLink to={`/myclass/${courseId}/files`}>
          Files
          {/* {notificationCounts.files > 0 && (
            <span className="course-badge">
              {notificationCounts.files}
            </span>
          )} */}
        </NavLink>

        <NavLink to={`/myclass/${courseId}/assignment`}>
          Assignment
          {/* {notificationCounts.assignments > 0 && (
            <span className="course-badge">
              {notificationCounts.assignments}
            </span>
          )} */}
        </NavLink>

        <NavLink to={`/myclass/${courseId}/tests`}>
          Tests
          {/* {notificationCounts.tests > 0 && (
            <span className="course-badge">
              {notificationCounts.tests}
            </span>
          )} */}
        </NavLink>

        {isTeacher && (
          <NavLink to={`/myclass/${courseId}/members`}>
            Members
          </NavLink>
        )}

        {isTeacher && (
          <NavLink
            to={`/myclass/${courseId}/enrollment-requests`}
          >
            Requests
            {/* {notificationCounts.enrollment > 0 && (
              <span className="course-badge">
                {notificationCounts.enrollment}
              </span>
            )} */}
          </NavLink>
        )}

      </div>

      {/* Page Content */}
      <div className="course-content">
        <Outlet
          context={{
            course,
            courseId,
          }}
        />
      </div>

    </div>
  );
}

export default MyClass;