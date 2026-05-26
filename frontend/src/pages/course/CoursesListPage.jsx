import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { mockCourses } from '../../data/mockData';
import { courseApi } from '../../services/api';

const CoursesListPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [courseCode, setCourseCode] = useState('');
  const [courses, setCourses] = useState(mockCourses);
  const [message, setMessage] = useState('');

  React.useEffect(() => {
    courseApi
      .list()
      .then(({ data }) => setCourses(data.results || data))
      .catch(() => setMessage('Showing demo courses until the backend is running.'));
  }, []);

  // Filter courses based on search and level
  let filteredCourses = courses.filter((course) => {
    const title = course.title || course.name || '';
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || course.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const handleJoinByCode = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      const { data } = await courseApi.join(courseCode);
      setCourses([data.course, ...courses.filter((course) => course.id !== data.course.id)]);
      setCourseCode('');
      setMessage('Course joined successfully.');
      navigate(`/courses/${data.course.id}`);
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Could not join course. Check the code and try again.');
    }
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Available Courses</h1>
        <p className="text-gray-600">
          Enter the course code shared by your teacher to enroll.
        </p>
      </div>

      <Card className="mb-8">
        <form onSubmit={handleJoinByCode} className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
          <input
            type="text"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
            placeholder="Enter course code"
            className="input-field uppercase"
            required
          />
          <Button type="submit">Join Course</Button>
        </form>
        {message && <p className="mt-4 text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded p-3">{message}</p>}
      </Card>

      {/* Filter Section */}
      <Card className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Courses
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by course title..."
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Level
            </label>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="input-field"
            >
              <option value="all">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button variant="secondary" fullWidth>
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Courses Grid */}
      <div>
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const isEnrolled = true;
              return (
                <Card key={course.id}>
                  {/* Course Image */}
                  <div className="w-full h-40 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg mb-4 flex items-center justify-center text-white text-5xl">
                    📚
                  </div>

                  {/* Course Info */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {course.title || course.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {course.description}
                  </p>

                  {/* Course Details */}
                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Instructor:</span>
                      <span className="font-semibold">{course.instructor || course.teacher_name || 'Teacher'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-semibold">{course.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Level:</span>
                      <span className="font-semibold">{course.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Students:</span>
                      <span className="font-semibold">{course.enrollmentCount || course.enrollment_count || 0}</span>
                    </div>
                  </div>

                  {/* Enrollment Status Badge */}
                  {isEnrolled && (
                    <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded text-green-700 text-xs font-semibold text-center">
                      ✓ Enrolled
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    variant={isEnrolled ? 'secondary' : 'primary'}
                    size="sm"
                    fullWidth
                    onClick={() => {
                      if (isEnrolled) {
                        navigate(`/courses/${course.id}`);
                      } else {
                        setMessage('Use the course code from your teacher to enroll.');
                      }
                    }}
                  >
                    {isEnrolled ? 'View Course' : 'Enroll Now'}
                  </Button>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No courses found matching your criteria</p>
              <Button variant="primary" onClick={() => setSearchTerm('')}>
                Clear Search
              </Button>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default CoursesListPage;
