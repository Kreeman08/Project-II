import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

const TeacherPostForm = ({ courseId }) => {
  const [activeTab, setActiveTab] = useState('post'); // 'post' | 'file' | 'assignment' | 'test'
  const [postText, setPostText] = useState('');
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDesc, setAssignmentDesc] = useState('');
  const [deadline, setDeadline] = useState('');
  const [points, setPoints] = useState('100');
  const [photoPreview, setPhotoPreview] = useState('');

  // Test creation state
  const [testTitle, setTestTitle] = useState('');
  const [testDesc, setTestDesc] = useState('');
  const [passingScore, setPassingScore] = useState('70');
  const [duration, setDuration] = useState('30');
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState(['', '', '', '']);
  const [correctOption, setCorrectOption] = useState(0);
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  const handlePostSubmit = (e) => {
    e.preventDefault();
    // TODO: Add API call to create post
    alert('Post created! (This would call the backend)');
    setPostText('');
  };

  const handleFileUpload = (e) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (file) {
      alert(`File "${file.name}" uploaded! (This would call the backend)`);
    }
  };

  const handleAssignmentSubmit = (e) => {
    e.preventDefault();
    if (!assignmentTitle || !deadline) {
      alert('Please fill in all fields');
      return;
    }
    alert(
      `Assignment "${assignmentTitle}" created! (This would call the backend)`
    );
    setAssignmentTitle('');
    setAssignmentDesc('');
    setDeadline('');
    setPoints('100');
    setPhotoPreview('');
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoPreview('');
  };

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
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600">
      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-600 mb-3">
          ✏️ Post in Channel
        </p>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-300 mb-6">
          <button
            onClick={() => setActiveTab('post')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'post'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Post
          </button>
          <button
            onClick={() => setActiveTab('file')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'file'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Upload File
          </button>
          <button
            onClick={() => setActiveTab('assignment')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'assignment'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Create Assignment
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'test'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Create Test
          </button>
        </div>

        {/* Post Tab */}
        {activeTab === 'post' && (
          <form onSubmit={handlePostSubmit}>
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="What would you like to share with your class?"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 resize-none"
              rows="4"
              required
            />
            <Button variant="primary" type="submit">
              Post to Channel
            </Button>
          </form>
        )}

        {/* File Upload Tab */}
        {activeTab === 'file' && (
          <form>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
              <p className="text-gray-600 mb-3">📁 Drag and drop file or click to browse</p>
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input">
                <Button variant="secondary" size="sm" as="span">
                  Select File
                </Button>
              </label>
            </div>
          </form>
        )}

        {/* Assignment Tab */}
        {activeTab === 'assignment' && (
          <form onSubmit={handleAssignmentSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assignment Title
                </label>
                <input
                  type="text"
                  value={assignmentTitle}
                  onChange={(e) => setAssignmentTitle(e.target.value)}
                  placeholder="e.g., Assignment 1: React Basics"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={assignmentDesc}
                  onChange={(e) => setAssignmentDesc(e.target.value)}
                  placeholder="Assignment instructions..."
                  className="input-field resize-none"
                  rows="4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📸 Attach Photo (Questions/Instructions)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {photoPreview ? (
                    <div className="space-y-4">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <div className="flex gap-2 justify-center">
                        <button
                          type="button"
                          onClick={() => document.getElementById('photo-input').click()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                        >
                          Change Photo
                        </button>
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                        >
                          Remove Photo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-600 mb-3">📁 Drag and drop image or click to browse</p>
                      <input
                        type="file"
                        id="photo-input"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                      <label htmlFor="photo-input">
                        <button
                          type="button"
                          onClick={() => document.getElementById('photo-input').click()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                          Select Image
                        </button>
                      </label>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Points
                  </label>
                  <input
                    type="number"
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                    className="input-field"
                    min="0"
                  />
                </div>
              </div>

              <Button variant="primary" type="submit" fullWidth>
                Create Assignment
              </Button>
            </div>
          </form>
        )}

        {/* Test Tab */}
        {activeTab === 'test' && (
          <form onSubmit={handleCreateTest}>
            <div className="space-y-4">
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
                  placeholder="Test instructions and guidelines..."
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
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Questions ({questions.length})
                  </h4>
                  <div className="space-y-3">
                    {questions.map((q) => (
                      <div key={q.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
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
                <div className="mt-4 p-4 bg-gray-50 border-2 border-gray-300 rounded-lg">
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
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
            </div>
          </form>
        )}
      </div>
    </Card>
  );
};

export default TeacherPostForm;
