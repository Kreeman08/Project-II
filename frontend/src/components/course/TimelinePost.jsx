import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import { getRelativeTime, getAssignmentDetails } from '../../data/mockData';

const TimelinePost = ({ post, isTeacher, teacherName }) => {
  const navigate = useNavigate();

  const getTypeIcon = () => {
    switch (post.type) {
      case 'file':
        return '📄';
      case 'assignment':
        return '📋';
      case 'post':
        return '💬';
      default:
        return '📌';
    }
  };

  const getTypeLabel = () => {
    switch (post.type) {
      case 'file':
        return 'File';
      case 'assignment':
        return 'Assignment';
      case 'post':
        return 'Post';
      default:
        return 'Update';
    }
  };

  const isOverdue = (deadline) => {
    return new Date(deadline) < new Date();
  };

  const formatDeadline = (deadline) => {
    const date = new Date(deadline);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md border-l-4 border-blue-500 p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-2xl">{getTypeIcon()}</span>
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase">
              {getTypeLabel()}
            </p>
            <p className="text-xs text-gray-500">
              {teacherName} • {getRelativeTime(post.timestamp)}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">{post.content}</h3>

        {/* Post Content */}
        {post.type === 'post' && (
          <p className="text-gray-700">{post.details?.text || ''}</p>
        )}

        {/* File Details */}
        {post.type === 'file' && post.details && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">
                  📎 {post.details.filename}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Size: {post.details.size}
                </p>
              </div>
              <Button variant="primary" size="sm">
                ⬇️ Download
              </Button>
            </div>
          </div>
        )}

        {/* Assignment Details */}
        {post.type === 'assignment' && post.details && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-gray-800 mb-3">{post.details.description}</p>
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span className="text-gray-600">Due Date:</span>
                <p
                  className={`font-semibold ${
                    isOverdue(post.details.deadline)
                      ? 'text-red-600'
                      : 'text-green-600'
                  }`}
                >
                  {formatDeadline(post.details.deadline)}
                  {isOverdue(post.details.deadline) && (
                    <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                      Overdue
                    </span>
                  )}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Points:</span>
                <p className="font-semibold text-gray-800">
                  {post.details.totalPoints}
                </p>
              </div>
            </div>
            <Button variant="primary" size="sm" fullWidth>
              View Assignment →
            </Button>
          </div>
        )}
      </div>

      {/* Timestamp */}
      <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-200">
        Posted {getRelativeTime(post.timestamp)}
      </p>
    </div>
  );
};

export default TimelinePost;
