import React, { useState } from 'react';
import Button from '../common/Button';

const AssignmentSubmissionForm = ({ assignment, onSubmit, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [fileName, setFileName] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile && !submissionText) {
      alert('Please upload a file or add text to your submission');
      return;
    }

    const submission = {
      assignmentId: assignment.id,
      file: selectedFile,
      text: submissionText,
      submittedAt: new Date().toISOString(),
    };

    onSubmit(submission);
    setSelectedFile(null);
    setSubmissionText('');
    setFileName('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-blue-600 text-white p-6 flex items-center justify-between border-b">
          <div>
            <h2 className="text-2xl font-bold">📤 Submit Assignment</h2>
            <p className="text-blue-100 text-sm mt-1">{assignment.content}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-700 p-2 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Assignment Details */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-gray-800 mb-3">Assignment Details</h3>
            <p className="text-gray-700 mb-2">{assignment.details.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="text-gray-500">Due Date:</span>
                <p className="font-semibold text-gray-800">
                  {new Date(assignment.details.deadline).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Points:</span>
                <p className="font-semibold text-gray-800">{assignment.details.totalPoints}</p>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              📎 Upload Assignment File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
              onClick={() => document.getElementById('submission-file').click()}
            >
              {fileName ? (
                <div className="space-y-3">
                  <p className="text-green-600 font-semibold">✓ File Selected</p>
                  <p className="text-gray-700 font-medium">{fileName}</p>
                  <div className="flex gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => document.getElementById('submission-file').click()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      Change File
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setFileName('');
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-2 text-lg">📁 Drag and drop your file here</p>
                  <p className="text-gray-500 text-sm mb-3">or click to browse</p>
                  <p className="text-xs text-gray-400">PDF, ZIP, DOC, DOCX, etc.</p>
                </>
              )}
              <input
                type="file"
                id="submission-file"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Additional Comments */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              💬 Additional Comments (Optional)
            </label>
            <textarea
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder="Add any notes about your submission..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="4"
            />
          </div>

          {/* Submission Info */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Note:</strong> Once submitted, you cannot make changes. Make sure your submission is complete and correct before clicking submit.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={onClose}
              type="button"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={!selectedFile && !submissionText}
            >
              📤 Submit Assignment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentSubmissionForm;
