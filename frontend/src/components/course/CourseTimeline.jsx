import React from 'react';
import {getCourseTimeline, getCourseTeachers, getRelativeTime} from '../../data/mockData';
import TimelinePost from './TimelinePost';
import TeacherPostForm from './TeacherPostForm';

const CourseTimeline = ({ courseId, isTeacher }) => {
  const timeline = getCourseTimeline(courseId);
  const teachers = getCourseTeachers(courseId);
  const teacherName = teachers.length > 0 ? teachers[0].name : 'Unknown';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Teacher Post Form - Only visible to assigned teacher */}
      {isTeacher && (
        <TeacherPostForm courseId={courseId} />
      )}

      {/* Timeline Posts */}
      {timeline.length > 0 ? (
        <div className="space-y-4 mt-8">
          {timeline.map((post) => (
            <TimelinePost
              key={post.id}
              post={post}
              isTeacher={isTeacher}
              teacherName={teacherName}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 mb-4">No posts yet</p>
          {isTeacher && (
            <p className="text-sm text-gray-400">
              Be the first to post! Use the form above.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseTimeline;
