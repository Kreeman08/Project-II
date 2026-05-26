import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { adminApi } from '../../services/api';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([adminApi.users(), adminApi.courses()])
      .then(([userResponse, courseResponse]) => {
        setUsers(userResponse.data.results || userResponse.data);
        setCourses(courseResponse.data.results || courseResponse.data);
      })
      .catch(() => setMessage('Login as an admin to load live analytics.'));
  }, []);

  const stats = useMemo(() => ({
    students: users.filter((user) => user.role === 'student').length,
    teachers: users.filter((user) => user.role === 'teacher').length,
    active: users.filter((user) => user.is_active).length,
  }), [users]);

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">System Dashboard</h1>
        <p className="text-gray-600">Administrator panel for users, courses, and platform activity.</p>
      </div>

      {message && <p className="mb-4 text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded p-3">{message}</p>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card><div className="text-center"><p className="text-3xl font-bold text-blue-600">{users.length}</p><p className="text-gray-600 text-sm mt-1">Total Users</p></div></Card>
        <Card><div className="text-center"><p className="text-3xl font-bold text-green-600">{courses.length}</p><p className="text-gray-600 text-sm mt-1">Total Courses</p></div></Card>
        <Card><div className="text-center"><p className="text-3xl font-bold text-purple-600">{stats.students}</p><p className="text-gray-600 text-sm mt-1">Students</p></div></Card>
        <Card><div className="text-center"><p className="text-3xl font-bold text-orange-600">{stats.teachers}</p><p className="text-gray-600 text-sm mt-1">Teachers</p></div></Card>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Administrative Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="primary" fullWidth onClick={() => navigate('/admin/users')}>Manage Users</Button>
          <Button variant="secondary" fullWidth onClick={() => navigate('/admin/courses')}>View Courses</Button>
          <Button variant="secondary" fullWidth onClick={() => navigate('/admin/users?type=new')}>Create User</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Users</h3>
          <div className="space-y-3 text-sm">
            {users.slice(0, 5).map((user) => (
              <div key={user.id} className="flex justify-between items-center pb-2 border-b last:border-b-0">
                <div>
                  <p className="font-semibold">{user.username}</p>
                  <p className="text-gray-500 text-xs capitalize">{user.role}</p>
                </div>
                <span className={user.is_active ? 'text-green-600' : 'text-red-600'}>
                  {user.is_active ? 'Active' : 'Disabled'}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-bold text-gray-800 mb-4">System Health</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="font-semibold">Backend API</span><span className="text-green-600">Connected</span></div>
              <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }} /></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="font-semibold">Active Users</span><span className="text-blue-600">{stats.active}</span></div>
              <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${users.length ? (stats.active / users.length) * 100 : 0}%` }} /></div>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminDashboardPage;
