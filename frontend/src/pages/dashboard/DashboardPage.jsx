import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import AcademyLayout from '../../components/layout/AcademyLayout';
import { useAuth } from '../../context/AuthContext';

const DashboardPage = () => {
  const { user, userCourses, getCourseRole } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');

  const filteredCourses = useMemo(() => (
    [...userCourses]
      .filter((course) => (
        course.name.toLowerCase().includes(search.toLowerCase())
        || course.courseCode.toLowerCase().includes(search.toLowerCase())
      ))
      .sort((a, b) => {
        if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
        if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
        return a.name.localeCompare(b.name);
      })
  ), [search, sortBy, userCourses]);

  return (
    <AcademyLayout active="courses" search={search} onSearchChange={setSearch}>
      <section className="welcome-section">
        <h2>Welcome back, {user?.name?.split(' ')[0] || 'Student'}.</h2>
        <p>Here are your active classes.</p>
      </section>

      <section id="courses" className="courses-section">
        <div className="section-row">
          <h2>Your Classes</h2>
          <label className="sort-control">
            <span>Sort by:-</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="name-asc">Name(A-Z)</option>
              <option value="name-desc">Name(Z-A)</option>
              <option value="newest">Newest</option>
            </select>
          </label>
        </div>

        <div className="course-grid">
          {filteredCourses.map((course) => {
            const role = getCourseRole(course);
            const initials = (course.name || '').split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();
            return (
              <button className="course-card" key={course.id} onClick={() => navigate(`/courses/${course.id}`)}>
                <div className="course-card-top">
                  <div className="course-initials">{initials}</div>
                  <span className={`role-badge ${role.toLowerCase()}`}>{role}</span>
                </div>
                <h3>{course.name}</h3>
                <p>{course.teacherName}</p>
                <div className="course-card-footer">
                  <span><UserGroupIcon className="h-4 w-4" />{course.studentIds.length} students</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </AcademyLayout>
  );
};

export default DashboardPage;
