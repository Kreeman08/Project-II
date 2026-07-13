import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./MyClass.css";

function MyClass() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const { user } = useAuth();
  const isTeacher = String(course?.teacher) === String(user?.id);

  useEffect(() => {
    apiRequest(`/courses/${courseId}/`).then(setCourse).catch(() => setCourse(null));
  }, [courseId]);

  return (
    <div className="myclass">
      <div className="course-header">
        <button className="back-btn" onClick={() => window.history.back()}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h1 className="course-title">{course?.name || "Class"}</h1>
      </div>

      <div className="course-nav">
        <NavLink to={`/myclass/${courseId}`} end>
          General
        </NavLink>
        <NavLink to={`/myclass/${courseId}/files`}>Files</NavLink>
        <NavLink to={`/myclass/${courseId}/assignment`}>Assignment</NavLink>
        <NavLink to={`/myclass/${courseId}/tests`}>Tests</NavLink>
        {isTeacher && <NavLink to={`/myclass/${courseId}/members`}>Members</NavLink>}
        {isTeacher && <NavLink to={`/myclass/${courseId}/leave-requests`}>Leave Requests</NavLink>}
      </div>

      <div className="course-content">
        <Outlet context={{ course, courseId }} />
      </div>
    </div>
  );
}

export default MyClass;
