import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { courseApi } from '../../services/api';

const ManageCoursesPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    courseApi
      .list()
      .then(({ data }) => setCourses(data.results || data))
      .catch(() => setMessage('Courses will appear here once the backend is running.'));
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      const { data } = await courseApi.create(form);
      setCourses([data, ...courses]);
      setForm({ name: '', description: '' });
      setMessage(`Course created. Share this code with students: ${data.course_code}`);
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Could not create course.');
    }
  };

  const copyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setMessage(`Copied course code ${code}`);
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Courses</h1>
        <p className="text-gray-600">
          Create courses and share the generated course code with your students.
        </p>
      </div>

      <Card className="mb-8">
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-4">
          <input
            className="input-field"
            placeholder="Course name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
          <input
            className="input-field"
            placeholder="Course description"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />
          <Button type="submit">Create Course</Button>
        </form>
        {message && <p className="mt-4 text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded p-3">{message}</p>}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <Card key={course.id}>
            <div className="flex justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{course.name}</h2>
                <p className="text-sm text-gray-600 mt-2">{course.description}</p>
              </div>
              <button
                type="button"
                onClick={() => copyCode(course.course_code)}
                className="h-fit rounded border border-blue-200 bg-blue-50 px-3 py-2 font-mono text-sm font-bold text-blue-700"
              >
                {course.course_code}
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>{course.enrollment_count || 0} enrolled students</span>
              <Button size="sm" onClick={() => navigate(`/teacher/courses/${course.id}`)}>
                Open Course
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </MainLayout>
  );
};

export default ManageCoursesPage;
