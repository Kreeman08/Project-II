import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { testApi } from '../../services/api';

const TestPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    testApi
      .retrieve(id)
      .then(({ data }) => setTest(data))
      .catch(() => setMessage('Test could not be loaded from the backend.'));
  }, [id]);

  const questions = useMemo(() => test?.questions || [], [test]);
  const answeredCount = Object.keys(answers).length;

  const handleSubmit = async () => {
    setSubmitting(true);
    setMessage('');
    const payload = {
      test: Number(id),
      answers: Object.entries(answers).map(([questionId, selectedOption]) => ({
        question: Number(questionId),
        selected_option: selectedOption,
      })),
    };

    try {
      const { data } = await testApi.submit(payload);
      navigate(`/results/${data.id}`);
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Could not submit test.');
      setSubmitting(false);
    }
  };

  if (!test) {
    return (
      <MainLayout>
        <Card>
          <p className="text-center text-gray-600 py-12">{message || 'Loading test...'}</p>
          <div className="flex justify-center">
            <Button variant="primary" onClick={() => navigate('/tests')}>Back to Tests</Button>
          </div>
        </Card>
      </MainLayout>
    );
  }

  if (!questions.length) {
    return (
      <MainLayout>
        <Card>
          <p className="text-center text-gray-600 py-12">This test has no questions yet.</p>
          <div className="flex justify-center">
            <Button variant="primary" onClick={() => navigate('/tests')}>Back to Tests</Button>
          </div>
        </Card>
      </MainLayout>
    );
  }

  const question = questions[currentQuestion];
  const selectedAnswer = answers[question.id];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {message && <p className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded p-3">{message}</p>}

        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{test.title}</h1>
              <p className="text-gray-600 text-sm mt-1">Question {currentQuestion + 1} of {questions.length}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Answered</p>
              <p className="text-3xl font-bold text-blue-600">{answeredCount}/{questions.length}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} />
            </div>
          </div>
        </Card>

        <Card className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">{question.text}</h2>
          <div className="space-y-3">
            {question.options.map((option) => (
              <label
                key={option.id}
                className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  selectedAnswer === option.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  checked={selectedAnswer === option.id}
                  onChange={() => setAnswers({ ...answers, [question.id]: option.id })}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="flex-1 text-gray-800">{option.text}</span>
              </label>
            ))}
          </div>
        </Card>

        <div className="flex gap-4 justify-between">
          <Button variant="secondary" onClick={() => setCurrentQuestion(currentQuestion - 1)} disabled={currentQuestion === 0}>
            Previous
          </Button>
          {currentQuestion < questions.length - 1 ? (
            <Button variant="primary" onClick={() => setCurrentQuestion(currentQuestion + 1)}>Next</Button>
          ) : (
            <Button variant="primary" onClick={handleSubmit} disabled={submitting || answeredCount === 0}>
              {submitting ? 'Submitting...' : 'Submit Test'}
            </Button>
          )}
        </div>

        <Card className="mt-6">
          <h3 className="font-bold text-gray-800 mb-3">Questions</h3>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setCurrentQuestion(index)}
                className={`aspect-square rounded font-semibold text-sm ${
                  currentQuestion === index
                    ? 'bg-blue-600 text-white'
                    : answers[item.id] !== undefined
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default TestPage;
