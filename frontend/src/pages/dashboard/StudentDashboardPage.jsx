import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { courseApi, assignmentApi, testApi } from '../../services/api';

const StudentDashboardPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [tests, setTests] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([
      courseApi.list(),
      assignmentApi.list(),
      testApi.list(),
    ])
      .then(([courseResponse, assignmentResponse, testResponse]) => {
        setCourses(courseResponse.data.results || courseResponse.data);
        setAssignments(assignmentResponse.data.results || assignmentResponse.data);
        setTests(testResponse.data.results || testResponse.data);
      })
      .catch(() => setMessage('Connect/login to the backend to see your live enrolled courses.'));
  }, []);

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back, {user.name || user.username}
        </h1>
        <p className="text-gray-600">You have {courses.length} enrolled courses</p>
      </div>

      {message && <p className="mb-4 text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded p-3">{message}</p>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card><div className="text-center"><p className="text-3xl font-bold text-blue-600">{courses.length}</p><p className="text-gray-600 text-sm mt-1">Enrolled Courses</p></div></Card>
        <Card><div className="text-center"><p className="text-3xl font-bold text-green-600">{assignments.length}</p><p className="text-gray-600 text-sm mt-1">Assignments</p></div></Card>
        <Card><div className="text-center"><p className="text-3xl font-bold text-purple-600">{tests.length}</p><p className="text-gray-600 text-sm mt-1">Tests</p></div></Card>
        <Card><div className="text-center"><p className="text-3xl font-bold text-orange-600">Live</p><p className="text-gray-600 text-sm mt-1">API Status</p></div></Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Courses</h2>
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} hover onClick={() => navigate(`/courses/${course.id}`)}>
                <div className="w-full h-40 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg mb-4 flex items-center justify-center text-white text-5xl">
                  LMS
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{course.name || course.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>
                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <div className="flex justify-between"><span>Teacher:</span><span className="font-semibold">{course.teacher_name || 'Teacher'}</span></div>
                  <div className="flex justify-between"><span>Course Code:</span><span className="font-mono font-semibold">{course.course_code}</span></div>
                </div>
                <Button variant="primary" size="sm" fullWidth onClick={() => navigate(`/courses/${course.id}`)}>
                  View Course
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No courses enrolled yet</p>
              <Button variant="primary" onClick={() => navigate('/courses')}>Join With Course Code</Button>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default StudentDashboardPage;
