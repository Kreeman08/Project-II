import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { assignmentApi, courseApi, testApi } from '../../services/api';

const TeacherDashboardPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [tests, setTests] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    Promise.all([
      courseApi.list(),
      assignmentApi.list(),
      testApi.list(),
      assignmentApi.submissions(),
    ])
      .then(([courseResponse, assignmentResponse, testResponse, submissionResponse]) => {
        setCourses(courseResponse.data.results || courseResponse.data);
        setAssignments(assignmentResponse.data.results || assignmentResponse.data);
        setTests(testResponse.data.results || testResponse.data);
        setSubmissions(submissionResponse.data.results || submissionResponse.data);
      })
      .catch(() => {});
  }, []);

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome, {user.name || user.username}
        </h1>
        <p className="text-gray-600">You are teaching {courses.length} course(s)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card><div className="text-center"><p className="text-3xl font-bold text-blue-600">{courses.length}</p><p className="text-gray-600 text-sm mt-1">Courses</p></div></Card>
        <Card><div className="text-center"><p className="text-3xl font-bold text-green-600">{assignments.length}</p><p className="text-gray-600 text-sm mt-1">Assignments</p></div></Card>
        <Card><div className="text-center"><p className="text-3xl font-bold text-purple-600">{submissions.length}</p><p className="text-gray-600 text-sm mt-1">Submissions</p></div></Card>
        <Card><div className="text-center"><p className="text-3xl font-bold text-orange-600">{tests.length}</p><p className="text-gray-600 text-sm mt-1">Tests</p></div></Card>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="primary" fullWidth onClick={() => navigate('/teacher/create-course')}>Create Course</Button>
          <Button variant="secondary" fullWidth onClick={() => navigate('/teacher/submissions')}>View Submissions</Button>
          <Button variant="secondary" fullWidth onClick={() => navigate('/teacher/courses')}>Manage Courses</Button>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Courses</h2>
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <Card key={course.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{course.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                  </div>
                  <span className="font-mono text-sm font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded px-3 py-2">{course.course_code}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-4">
                  <span>Enrolled Students</span>
                  <span className="font-semibold">{course.enrollment_count || 0}</span>
                </div>
                <Button variant="primary" size="sm" fullWidth onClick={() => navigate(`/teacher/courses/${course.id}`)}>
                  Manage Course
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No courses created yet</p>
              <Button variant="primary" onClick={() => navigate('/teacher/create-course')}>Create Your First Course</Button>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default TeacherDashboardPage;
