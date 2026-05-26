import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { testApi } from '../../services/api';

const ResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    testApi
      .result(id)
      .then(({ data }) => setResult(data))
      .catch(() => setMessage('Result could not be loaded from the backend.'));
  }, [id]);

  const correctCount = useMemo(() => result?.answers?.filter((answer) => answer.is_correct).length || 0, [result]);
  const total = result?.total_questions || result?.answers?.length || 0;
  const percentage = total ? Math.round((correctCount / total) * 100) : 0;
  const passed = percentage >= 70;

  if (!result) {
    return (
      <MainLayout>
        <Card>
          <p className="text-center text-gray-600 py-12">{message || 'Loading result...'}</p>
          <div className="flex justify-center">
            <Button variant="primary" onClick={() => navigate('/tests')}>Back to Tests</Button>
          </div>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button onClick={() => navigate('/tests')} className="text-blue-600 hover:text-blue-700 mb-4">
            Back to Tests
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Test Results</h1>
        </div>

        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-gray-600 mb-2">Test Name</p>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">{result.test}</h2>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between"><span>Student:</span><span className="font-semibold text-gray-800">{result.student}</span></div>
                <div className="flex justify-between"><span>Status:</span><span className={`font-semibold px-3 py-1 rounded-full text-xs ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{passed ? 'PASSED' : 'FAILED'}</span></div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="relative w-48 h-48 rounded-full flex items-center justify-center mb-4" style={{ background: `conic-gradient(rgb(59, 130, 246) 0deg ${(percentage / 100) * 360}deg, rgb(229, 231, 235) 0deg)` }}>
                  <div className="w-40 h-40 bg-white rounded-full flex flex-col items-center justify-center">
                    <p className="text-4xl font-bold text-blue-600">{percentage}%</p>
                    <p className="text-sm text-gray-600">Score</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-800">{result.marks}/{total}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Score Breakdown</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg text-center"><p className="text-3xl font-bold text-green-600">{correctCount}</p><p className="text-gray-600 text-sm mt-1">Correct</p></div>
            <div className="bg-red-50 p-4 rounded-lg text-center"><p className="text-3xl font-bold text-red-600">{Math.max(total - correctCount, 0)}</p><p className="text-gray-600 text-sm mt-1">Incorrect</p></div>
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-bold text-gray-800 mb-6">Question-Wise Breakdown</h3>
          <div className="space-y-4">
            {result.answers.map((answer, index) => (
              <div key={`${answer.question}-${index}`} className={`p-4 rounded-lg border-2 ${answer.is_correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-bold text-gray-800 flex-1">Q{index + 1}: {answer.question}</h4>
                  <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded ${answer.is_correct ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'}`}>
                    {answer.is_correct ? 'CORRECT' : 'INCORRECT'}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Your answer:</span> {answer.selected}</p>
                  <p><span className="font-semibold">Correct answer:</span> {answer.correct}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex gap-4 mt-8">
          <Button variant="primary" fullWidth onClick={() => navigate('/tests')}>Back to Tests</Button>
          <Button variant="secondary" fullWidth onClick={() => navigate('/courses')}>Go to Courses</Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default ResultPage;
