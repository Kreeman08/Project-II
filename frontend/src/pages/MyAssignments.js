import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardList, faHistory } from "@fortawesome/free-solid-svg-icons";
import { api } from "../services/api";
import "../MyCourses/Assignment/Assignment.css";
import "./MyClasses.css";

function MyAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [assignmentData, courseData] = await Promise.all([
          api.assignments(),
          api.courses(),
        ]);
        setAssignments(assignmentData);
        setCourses(courseData);
      } catch (err) {
        setError(err.message);
      }
    }
    loadData();
  }, []);

  const courseById = useMemo(() => {
    return courses.reduce((map, course) => {
      map[course.id] = course;
      return map;
    }, {});
  }, [courses]);

  const [upcomingAssignments, pastAssignments] = useMemo(() => {
    const now = Date.now();
    return assignments.reduce(
      (groups, item) => {
        groups[new Date(item.deadline).getTime() >= now ? 0 : 1].push(item);
        return groups;
      },
      [[], []]
    );
  }, [assignments]);

  const renderCard = (assignment) => {
    const course = courseById[assignment.course];
    return (
      <Link
        className="assignment-link"
        to={`/myclass/${assignment.course}/assignment/${assignment.id}`}
        key={assignment.id}
      >
        <div className="assignment-card">
          <h3>{assignment.title}</h3>
          <p>{course?.name || "Course"}</p>
          <div className="assignment-info-row">
            <p>Uploaded on {new Date(assignment.created_at).toLocaleDateString()}</p>
            <span className="deadline">{new Date(assignment.deadline).toLocaleString()}</span>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="myclasses-page assignments-page">
      <div className="myclasses-header">
        <h1 className="myclasses-heading">My Assignments</h1>
        <p className="myclasses-subtitle">Assignments from all of your classes.</p>
      </div>

      {error && <div className="form-message error">{error}</div>}

      <div className="assignment-section">
        <div className="section-title">
          <FontAwesomeIcon icon={faClipboardList} className="section-icon" />
          <h2>Upcoming</h2>
        </div>
        {upcomingAssignments.length ? upcomingAssignments.map(renderCard) : <div className="page-state">No upcoming assignments.</div>}
      </div>

      <div className="assignment-section">
        <div className="section-title">
          <FontAwesomeIcon icon={faHistory} className="section-icon" />
          <h2>Past</h2>
        </div>
        {pastAssignments.length ? pastAssignments.map(renderCard) : <div className="page-state">No past assignments.</div>}
      </div>
    </div>
  );
}

export default MyAssignments;
