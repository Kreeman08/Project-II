import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { adminApi } from '../../services/api';

const AdminCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    adminApi
      .courses()
      .then(({ data }) => setCourses(data.results || data))
      .catch(() => setMessage('Login as admin to view all live courses.'));
  }, []);

  const copyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setMessage(`Copied course code ${code}`);
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">All Courses</h1>
        <p className="text-gray-600">View every course created across the university.</p>
      </div>

      {message && <p className="mb-4 text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded p-3">{message}</p>}

      <Card>
        {courses.length > 0 ? (
          <div className="space-y-3">
            {courses.map((course) => (
              <div key={course.id} className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800">{course.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                    <span>Teacher: {course.teacher_name || course.teacher}</span>
                    <span>Students: {course.enrollment_count || 0}</span>
                    <span>Created: {course.created_at ? new Date(course.created_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => copyCode(course.course_code)}>
                    {course.course_code}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No courses created yet</p>
        )}
      </Card>
    </MainLayout>
  );
};

export default AdminCoursesPage;
