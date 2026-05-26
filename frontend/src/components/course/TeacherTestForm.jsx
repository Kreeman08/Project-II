import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

const TeacherTestForm = ({ courseId }) => {
  const [testTitle, setTestTitle] = useState('');
  const [testDesc, setTestDesc] = useState('');
  const [passingScore, setPassingScore] = useState('70');
  const [duration, setDuration] = useState('30');
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState(['', '', '', '']);
  const [correctOption, setCorrectOption] = useState(0);
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  const handleAddQuestion = () => {
    if (!newQuestion || newOptions.some(opt => !opt)) {
      alert('Please fill in all fields');
      return;
    }

    const question = {
      id: questions.length + 1,
      text: newQuestion,
      options: newOptions,
      correctOption: parseInt(correctOption),
    };

    setQuestions([...questions, question]);
    setNewQuestion('');
    setNewOptions(['', '', '', '']);
    setCorrectOption(0);
    setShowQuestionForm(false);
  };

  const handleRemoveQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleCreateTest = (e) => {
    e.preventDefault();
    if (!testTitle || questions.length === 0) {
      alert('Please fill in test details and add at least one question');
      return;
    }

    alert(
      `Test "${testTitle}" created with ${questions.length} questions! (This would call the backend)`
    );

    setTestTitle('');
    setTestDesc('');
    setPassingScore('70');
    setDuration('30');
    setQuestions([]);
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-600">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📝 Create New Test</h3>

        <form onSubmit={handleCreateTest} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Title
            </label>
            <input
              type="text"
              value={testTitle}
              onChange={(e) => setTestTitle(e.target.value)}
              placeholder="e.g., React Fundamentals Quiz"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={testDesc}
              onChange={(e) => setTestDesc(e.target.value)}
              placeholder="Test description and instructions..."
              className="input-field resize-none"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="input-field"
                min="1"
                max="180"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Passing Score (%)
              </label>
              <input
                type="number"
                value={passingScore}
                onChange={(e) => setPassingScore(e.target.value)}
                className="input-field"
                min="0"
                max="100"
              />
            </div>
          </div>

          {/* Questions List */}
          {questions.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">
                Questions ({questions.length})
              </h4>
              <div className="space-y-3">
                {questions.map((q) => (
                  <div key={q.id} className="p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 mb-2">
                          Q{q.id}: {q.text}
                        </p>
                        <div className="space-y-1 text-sm text-gray-600">
                          {q.options.map((opt, idx) => (
                            <p key={idx} className={idx === q.correctOption ? 'text-green-600 font-semibold' : ''}>
                              {String.fromCharCode(65 + idx)}. {opt} {idx === q.correctOption && '✓'}
                            </p>
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(q.id)}
                        className="text-red-600 hover:text-red-700 font-semibold ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Question Form */}
          {showQuestionForm && (
            <div className="mt-6 p-4 bg-white border-2 border-purple-300 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">Add Question</h4>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Text
                  </label>
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Enter question..."
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options (Select correct answer)
                  </label>
                  <div className="space-y-2">
                    {newOptions.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          id={`correct-${idx}`}
                          name="correctOption"
                          checked={correctOption === idx}
                          onChange={() => setCorrectOption(idx)}
                          className="w-4 h-4"
                        />
                        <label htmlFor={`correct-${idx}`} className="font-medium text-sm text-gray-600">
                          {String.fromCharCode(65 + idx)}.
                        </label>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const updated = [...newOptions];
                            updated[idx] = e.target.value;
                            setNewOptions(updated);
                          }}
                          placeholder={`Option ${idx + 1}`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    type="button"
                    onClick={handleAddQuestion}
                  >
                    Add Question
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    type="button"
                    onClick={() => {
                      setShowQuestionForm(false);
                      setNewQuestion('');
                      setNewOptions(['', '', '', '']);
                      setCorrectOption(0);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Add Question Button */}
          {!showQuestionForm && (
            <Button
              variant="secondary"
              type="button"
              fullWidth
              onClick={() => setShowQuestionForm(true)}
            >
              ➕ Add Question
            </Button>
          )}

          {/* Create Test Button */}
          <Button
            variant="primary"
            type="submit"
            fullWidth
            disabled={questions.length === 0}
          >
            Create Test
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default TeacherTestForm;
