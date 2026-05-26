// ============================================
// NEW HIERARCHICAL LMS DATA MODEL
// ============================================

// Users - simplified (no enrolledCourses or courses arrays)
export const mockUsers = [
  {
    id: 1,
    username: 'student1',
    email: 'student1@example.com',
    name: 'John Doe',
    role: 'student',
    createdAt: '2024-01-01',
    createdBy: 3,
  },
  {
    id: 4,
    username: 'student2',
    email: 'student2@example.com',
    name: 'Alice Johnson',
    role: 'student',
    createdAt: '2024-01-05',
    createdBy: 3,
  },
  {
    id: 2,
    username: 'teacher1',
    email: 'teacher1@example.com',
    name: 'Jane Smith',
    role: 'teacher',
    createdAt: '2023-12-15',
    createdBy: 3,
  },
  {
    id: 5,
    username: 'teacher2',
    email: 'teacher2@example.com',
    name: 'John Doe',
    role: 'teacher',
    createdAt: '2023-12-20',
    createdBy: 3,
  },
  {
    id: 3,
    username: 'admin',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    createdAt: '2023-01-01',
    createdBy: 3,
  },
];

// Courses - created and owned by admin
export const mockCourses = [
  {
    id: 1,
    title: 'Introduction to React.js',
    code: 'CS101',
    description: 'Learn the basics of React including components, hooks, and state management.',
    createdBy: 3, // admin creates courses
    createdAt: '2024-01-15',
    archived: false,
  },
  {
    id: 2,
    title: 'Advanced JavaScript Patterns',
    code: 'CS201',
    description: 'Master advanced JavaScript concepts including async/await, closures, and design patterns.',
    createdBy: 3,
    createdAt: '2024-02-01',
    archived: false,
  },
  {
    id: 3,
    title: 'Web Development Fundamentals',
    code: 'CS102',
    description: 'Complete guide to HTML, CSS, and JavaScript for building responsive websites.',
    createdBy: 3,
    createdAt: '2024-01-20',
    archived: false,
  },
];

// CourseTeachers - Maps teachers to courses they teach
export const mockCourseTeachers = [
  {
    id: 1,
    courseId: 1,
    teacherId: 2, // Jane Smith teaches CS101
    assignedAt: '2024-01-15',
    removedAt: null,
  },
  {
    id: 2,
    courseId: 2,
    teacherId: 2, // Jane Smith teaches CS201
    assignedAt: '2024-02-01',
    removedAt: null,
  },
  {
    id: 3,
    courseId: 3,
    teacherId: 5, // John Doe teaches CS102
    assignedAt: '2024-01-20',
    removedAt: null,
  },
];

// StudentEnrollments - Maps students to courses they're enrolled in
export const mockStudentEnrollments = [
  {
    id: 1,
    courseId: 1,
    studentId: 1, // John Doe enrolled in CS101
    enrolledAt: '2024-01-20',
    removedAt: null,
  },
  {
    id: 2,
    courseId: 1,
    studentId: 4, // Alice Johnson enrolled in CS101
    enrolledAt: '2024-01-22',
    removedAt: null,
  },
  {
    id: 3,
    courseId: 2,
    studentId: 1, // John Doe enrolled in CS201
    enrolledAt: '2024-02-05',
    removedAt: null,
  },
  {
    id: 4,
    courseId: 3,
    studentId: 4, // Alice Johnson enrolled in CS102
    enrolledAt: '2024-01-25',
    removedAt: null,
  },
];

// CourseTimeline - Chronological feed of posts, files, and assignments
export const mockCourseTimeline = [
  // CS101 Timeline
  {
    id: 1,
    courseId: 1,
    type: 'post', // 'post' | 'file' | 'assignment'
    postedBy: 2, // Jane Smith
    timestamp: new Date(2024, 0, 20, 9, 30).toISOString(),
    content: 'Welcome to Introduction to React.js! Looking forward to a great semester.',
  },
  {
    id: 2,
    courseId: 1,
    type: 'file',
    postedBy: 2,
    timestamp: new Date(2024, 0, 21, 10, 0).toISOString(),
    content: 'Lecture 1: React Fundamentals',
    details: {
      filename: 'lecture1.pdf',
      url: '/files/lecture1.pdf',
      size: '5.2 MB',
    },
  },
  {
    id: 3,
    courseId: 1,
    type: 'assignment',
    postedBy: 2,
    timestamp: new Date(2024, 0, 22, 14, 0).toISOString(),
    content: 'Assignment 1: Build a Todo App',
    assignmentId: 1, // reference to assignments table
    details: {
      description: 'Create a simple todo application using React with add, delete, and mark as complete features.',
      deadline: '2024-04-01T23:59:59Z',
      totalPoints: 100,
    },
  },
  {
    id: 4,
    courseId: 1,
    type: 'file',
    postedBy: 2,
    timestamp: new Date(2024, 0, 25, 9, 0).toISOString(),
    content: 'Lecture 2: Components and Props',
    details: {
      filename: 'lecture2.pdf',
      url: '/files/lecture2.pdf',
      size: '4.1 MB',
    },
  },
  {
    id: 5,
    courseId: 1,
    type: 'assignment',
    postedBy: 2,
    timestamp: new Date(2024, 0, 28, 13, 30).toISOString(),
    content: 'Assignment 2: Component Composition',
    assignmentId: 2,
    details: {
      description: 'Build a reusable component library with at least 5 different components.',
      deadline: '2024-04-15T23:59:59Z',
      totalPoints: 150,
    },
  },
  // CS102 Timeline
  {
    id: 6,
    courseId: 3,
    type: 'post',
    postedBy: 5, // John Doe
    timestamp: new Date(2024, 0, 22, 10, 0).toISOString(),
    content: 'Welcome to Web Development Fundamentals! This course will cover HTML, CSS, and JavaScript.',
  },
  {
    id: 7,
    courseId: 3,
    type: 'file',
    postedBy: 5,
    timestamp: new Date(2024, 0, 23, 11, 0).toISOString(),
    content: 'HTML Basics Guide',
    details: {
      filename: 'html-basics.pdf',
      url: '/files/html-basics.pdf',
      size: '3.5 MB',
    },
  },
];

// Assignments - Linked to timeline posts
export const mockAssignments = [
  {
    id: 1,
    timelinePostId: 3,
    courseId: 1,
    postedBy: 2, // Jane Smith
    title: 'Build a Todo App',
    description: 'Create a simple todo application using React with add, delete, and mark as complete features.',
    deadline: '2024-04-01T23:59:59Z',
    totalPoints: 100,
    createdAt: '2024-01-22T14:00:00Z',
  },
  {
    id: 2,
    timelinePostId: 5,
    courseId: 1,
    postedBy: 2,
    title: 'Component Composition',
    description: 'Build a reusable component library with at least 5 different components.',
    deadline: '2024-04-15T23:59:59Z',
    totalPoints: 150,
    createdAt: '2024-01-28T13:30:00Z',
  },
];

// Submissions - Students submitting assignments
export const mockSubmissions = [
  {
    id: 1,
    assignmentId: 1,
    studentId: 1, // John Doe
    fileUrl: '/submissions/student1-assignment1.zip',
    submittedAt: '2024-03-25T18:30:00Z',
    grade: 95,
    feedback: 'Excellent work! Your code is clean and well-organized. Good use of React hooks.',
    status: 'graded',
  },
  {
    id: 2,
    assignmentId: 1,
    studentId: 4, // Alice Johnson
    fileUrl: '/submissions/student4-assignment1.zip',
    submittedAt: '2024-03-28T15:45:00Z',
    grade: 88,
    feedback: 'Good implementation. Consider adding comments to explain complex logic.',
    status: 'graded',
  },
  {
    id: 3,
    assignmentId: 2,
    studentId: 1,
    fileUrl: '/submissions/student1-assignment2.zip',
    submittedAt: null, // Not yet submitted
    grade: null,
    feedback: null,
    status: 'pending',
  },
];

// Test Results (keeping for compatibility with TestPage)
export const mockResults = {
  1: [
    {
      id: 1,
      testId: 1,
      studentId: 1,
      score: 85,
      totalScore: 100,
      percentage: 85,
      status: 'passed',
      submittedAt: '2024-03-15',
      timeSpent: '25 mins',
      answers: [0, 1, 1, 0, 1],
    },
  ],
};

// Tests (keeping for TestPage compatibility)
export const mockTests = {
  1: [
    {
      id: 1,
      courseId: 1,
      title: 'React Basics Quiz',
      description: 'Test your knowledge on React fundamentals',
      totalQuestions: 3,
      passingScore: 70,
      duration: 30,
      attempts: 1,
      published: true,
    },
  ],
};

// Test Questions (keeping for TestPage)
export const mockQuestions = {
  1: [
    {
      id: 1,
      testId: 1,
      question: 'What is a React component?',
      options: [
        'A reusable piece of UI',
        'A CSS file',
        'A database schema',
        'A server endpoint',
      ],
      correctOption: 0,
    },
    {
      id: 2,
      testId: 1,
      question: 'Which hook is used to manage state in functional components?',
      options: [
        'useEffect',
        'useState',
        'useContext',
        'useReducer',
      ],
      correctOption: 1,
    },
    {
      id: 3,
      testId: 1,
      question: 'What does JSX stand for?',
      options: [
        'JavaScript Extra',
        'JavaScript XML',
        'JavaScript Extension',
        'Java Syntax Extension',
      ],
      correctOption: 1,
    },
  ],
};

// ============================================
// HELPER FUNCTIONS FOR DATA ACCESS
// ============================================

/**
 * Get all courses for a student
 */
export const getStudentCourses = (studentId) => {
  const enrollments = mockStudentEnrollments.filter(
    (e) => e.studentId === studentId && !e.removedAt
  );
  return enrollments.map((e) =>
    mockCourses.find((c) => c.id === e.courseId)
  );
};

/**
 * Get all students enrolled in a course
 */
export const getCourseStudents = (courseId) => {
  const enrollments = mockStudentEnrollments.filter(
    (e) => e.courseId === courseId && !e.removedAt
  );
  return enrollments.map((e) =>
    mockUsers.find((u) => u.id === e.studentId)
  );
};

/**
 * Get all courses taught by a teacher
 */
export const getTeacherCourses = (teacherId) => {
  const assignments = mockCourseTeachers.filter(
    (ct) => ct.teacherId === teacherId && !ct.removedAt
  );
  return assignments.map((a) =>
    mockCourses.find((c) => c.id === a.courseId)
  );
};

/**
 * Get all teachers assigned to a course
 */
export const getCourseTeachers = (courseId) => {
  const assignments = mockCourseTeachers.filter(
    (ct) => ct.courseId === courseId && !ct.removedAt
  );
  return assignments.map((a) =>
    mockUsers.find((u) => u.id === a.teacherId)
  );
};

/**
 * Check if teacher teaches a specific course
 */
export const isTeacherOfCourse = (teacherId, courseId) => {
  return mockCourseTeachers.some(
    (ct) =>
      ct.teacherId === teacherId &&
      ct.courseId === courseId &&
      !ct.removedAt
  );
};

/**
 * Check if student is enrolled in a specific course
 */
export const isStudentEnrolledInCourse = (studentId, courseId) => {
  return mockStudentEnrollments.some(
    (e) =>
      e.studentId === studentId &&
      e.courseId === courseId &&
      !e.removedAt
  );
};

/**
 * Get course timeline (posts, files, assignments) sorted by newest first
 */
export const getCourseTimeline = (courseId) => {
  return mockCourseTimeline
    .filter((post) => post.courseId === courseId)
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
};

/**
 * Get assignment with full details
 */
export const getAssignmentDetails = (assignmentId) => {
  return mockAssignments.find((a) => a.id === assignmentId);
};

/**
 * Get student submissions for an assignment
 */
export const getAssignmentSubmissions = (assignmentId) => {
  return mockSubmissions.filter((s) => s.assignmentId === assignmentId);
};

/**
 * Get student submission for specific assignment
 */
export const getStudentSubmission = (assignmentId, studentId) => {
  return mockSubmissions.find(
    (s) => s.assignmentId === assignmentId && s.studentId === studentId
  );
};

/**
 * Format relative timestamp (e.g., "2 hours ago")
 */
export const getRelativeTime = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};
