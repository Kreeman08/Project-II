import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { adminApi } from '../../services/api';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'student' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    adminApi
      .users()
      .then(({ data }) => setUsers(data.results || data))
      .catch(() => setMessage('Start the backend to manage live users.'));
  }, []);

  const createUser = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      const { data } = await adminApi.createUser(form);
      setUsers([data, ...users]);
      setForm({ username: '', email: '', password: '', role: 'student' });
      setMessage('User account created.');
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Could not create user.');
    }
  };

  const toggleUser = async (user) => {
    const nextActive = !user.is_active;
    await adminApi.updateUser(user.id, { is_active: nextActive });
    setUsers(users.map((item) => (item.id === user.id ? { ...item, is_active: nextActive } : item)));
  };

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Users</h1>
      <p className="text-gray-600 mb-8">Create teacher and student accounts and control access.</p>

      <Card className="mb-8">
        <form onSubmit={createUser} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_160px_auto] gap-4">
          <input className="input-field" placeholder="Username" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} required />
          <input className="input-field" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <input className="input-field" placeholder="Password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
          <select className="input-field" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
          <Button type="submit">Create</Button>
        </form>
        {message && <p className="mt-4 text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded p-3">{message}</p>}
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-gray-500 border-b">
              <tr>
                <th className="py-3 pr-4">Username</th>
                <th className="py-3 pr-4">Email</th>
                <th className="py-3 pr-4">Role</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b last:border-b-0">
                  <td className="py-3 pr-4 font-semibold">{user.username}</td>
                  <td className="py-3 pr-4">{user.email}</td>
                  <td className="py-3 pr-4 capitalize">{user.role}</td>
                  <td className="py-3 pr-4">{user.is_active ? 'Active' : 'Disabled'}</td>
                  <td className="py-3 pr-4">
                    <Button size="sm" variant="secondary" onClick={() => toggleUser(user)}>
                      {user.is_active ? 'Disable' : 'Enable'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </MainLayout>
  );
};

export default AdminUsersPage;
