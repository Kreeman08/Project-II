import React, { useMemo, useState } from 'react';
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import AcademyLayout from '../../components/layout/AcademyLayout';
import { useAuth } from '../../context/AuthContext';

const AssignmentsPage = () => {
  const { userCourses, updateCourse } = useAuth();
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  const assignments = useMemo(() => (
    userCourses.flatMap((course) => (
      course.assignments.map((assignment) => ({
        ...assignment,
        courseId: course.id,
        courseName: course.name,
        teacherName: course.teacherName,
      }))
    ))
  ), [userCourses]);

  const filteredAssignments = useMemo(() => (
    assignments.filter((assignment) => (
      assignment.title.toLowerCase().includes(search.toLowerCase())
      || assignment.courseName.toLowerCase().includes(search.toLowerCase())
    ))
  ), [assignments, search]);

  const submitAssignment = (assignment) => {
    updateCourse(assignment.courseId, (course) => ({
      ...course,
      assignments: course.assignments.map((item) => (
        item.id === assignment.id ? { ...item, submitted: true } : item
      )),
    }));
    setMessage(`Submitted "${assignment.title}" successfully.`);
  };

  return (
    <AcademyLayout active="assignments" search={search} onSearchChange={setSearch} searchPlaceholder="Search assignments">
      <section className="welcome-section">
        <h2>Assignment</h2>
        <p>View and submit your coursework without leaving the Academy dashboard.</p>
      </section>

      {message && (
        <div className="toast-inline">
          {message}
          <button onClick={() => setMessage('')}>Dismiss</button>
        </div>
      )}

      <section className="courses-section">
        <div className="section-row">
          <h2>Your Assignments</h2>
          <span>{filteredAssignments.length} visible</span>
        </div>

        <div className="course-grid">
          {filteredAssignments.map((assignment) => {
            const past = new Date(assignment.deadline) < new Date();
            return (
              <article className="course-card academy-task-card" key={`${assignment.courseId}-${assignment.id}`}>
                <div className="course-card-top">
                  <div className="course-initials"><ClipboardDocumentIcon className="h-7 w-7" /></div>
                  <span className={`status ${assignment.submitted ? 'done' : past ? 'danger' : 'open'}`}>
                    {assignment.submitted ? 'Submitted' : past ? 'Closed' : 'Open'}
                  </span>
                </div>
                <h3>{assignment.title}</h3>
                <p>{assignment.courseName}</p>
                <p>{assignment.description}</p>
                <div className="course-card-footer">
                  <span>Due: {new Date(assignment.deadline).toLocaleDateString()}</span>
                  {!assignment.submitted && !past && (
                    <button className="primary-action compact" type="button" onClick={() => submitAssignment(assignment)}>
                      Submit
                    </button>
                  )}
                </div>
              </article>
            );
          })}

          {filteredAssignments.length === 0 && (
            <div className="workspace-card empty-state">
              <p>No assignments assigned yet.</p>
            </div>
          )}
        </div>
      </section>
    </AcademyLayout>
  );
};

export default AssignmentsPage;
