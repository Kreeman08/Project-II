import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { assignmentApi } from '../../services/api';

const TeacherSubmissionsPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    assignmentApi
      .submissions()
      .then(({ data }) => setSubmissions(data.results || data))
      .catch(() => setMessage('No submissions loaded yet. Start the backend to review live submissions.'));
  }, []);

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Submissions</h1>
      <p className="text-gray-600 mb-8">Review assignment submissions and record marks.</p>
      {message && <p className="mb-4 text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded p-3">{message}</p>}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-gray-500 border-b">
              <tr>
                <th className="py-3 pr-4">Student</th>
                <th className="py-3 pr-4">Assignment</th>
                <th className="py-3 pr-4">Submitted</th>
                <th className="py-3 pr-4">Marks</th>
                <th className="py-3 pr-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission.id} className="border-b last:border-b-0">
                  <td className="py-3 pr-4">{submission.student}</td>
                  <td className="py-3 pr-4">{submission.assignment}</td>
                  <td className="py-3 pr-4">{submission.submitted_at}</td>
                  <td className="py-3 pr-4">{submission.marks ?? 'Pending'}</td>
                  <td className="py-3 pr-4"><Button size="sm">Grade</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </MainLayout>
  );
};

export default TeacherSubmissionsPage;
