import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import AcademyLayout from '../../components/layout/AcademyLayout';
import { useAuth } from '../../context/AuthContext';

const TestsPage = () => {
  const { userCourses } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const tests = useMemo(() => (
    userCourses.flatMap((course) => (
      course.tests.map((test) => ({
        ...test,
        courseId: course.id,
        courseName: course.name,
      }))
    ))
  ), [userCourses]);

  const filteredTests = useMemo(() => (
    tests.filter((test) => (
      test.title.toLowerCase().includes(search.toLowerCase())
      || test.courseName.toLowerCase().includes(search.toLowerCase())
    ))
  ), [search, tests]);

  return (
    <AcademyLayout active="tests" search={search} onSearchChange={setSearch} searchPlaceholder="Search tests">
      <section className="welcome-section">
        <h2>Test</h2>
        <p>Take exams and quizzes without leaving the Academy dashboard.</p>
      </section>

      <section className="courses-section">
        <div className="section-row">
          <h2>Your Tests</h2>
          <span>{filteredTests.length} visible</span>
        </div>

        <div className="course-grid">
          {filteredTests.map((test) => (
            <article className="course-card academy-task-card" key={`${test.courseId}-${test.id}`}>
              <div className="course-card-top">
                <div className="course-initials"><ClipboardDocumentCheckIcon className="h-7 w-7" /></div>
                <span className="status done">Published</span>
              </div>
              <h3>{test.title}</h3>
              <p>{test.courseName}</p>
              <p>{test.description}</p>
              <div className="course-card-footer">
                <span>{test.questions?.length || 0} questions</span>
                <button className="primary-action compact" type="button" onClick={() => navigate(`/tests/${test.id}`)}>
                  Start
                </button>
              </div>
            </article>
          ))}

          {filteredTests.length === 0 && (
            <div className="workspace-card empty-state">
              <p>No tests available yet.</p>
            </div>
          )}
        </div>
      </section>
    </AcademyLayout>
  );
};

export default TestsPage;
