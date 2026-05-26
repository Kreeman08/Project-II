import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/api';

const STORAGE_KEY = 'lms_saas_state';
const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';

const createJwtLikeToken = (user) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: user.id,
    email: user.email,
    name: user.name,
    iat: Math.floor(Date.now() / 1000),
  }));
  return `${header}.${payload}.demo-signature`;
};

const makeCourseCode = (prefix = 'CLS') => {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const random = Array.from({ length: 5 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
  return `${prefix.slice(0, 4).toUpperCase()}-${random}`;
};

const initialUser = {
  id: 'u-1',
  name: 'Aarav Sharma',
  email: 'student@lms.dev',
  password: 'password123',
  avatar: '',
};

const initialCourses = [
  {
    id: 'c-physics',
    name: 'Physics XI: Mechanics Lab',
    shortCode: 'PHY-X92KQ',
    courseCode: 'PHY-X92KQ',
    teacherId: 'u-2',
    teacherName: 'Dr. Meera Karki',
    studentIds: ['u-1', 'u-3', 'u-4', 'u-5'],
    settings: { comments: true, fileSharing: true },
    createdAt: '2026-05-01T08:00:00.000Z',
    posts: [
      {
        id: 'p-1',
        author: 'Dr. Meera Karki',
        role: 'Teacher',
        text: 'Welcome to the mechanics workspace. Share lab questions here before Friday.',
        time: 'Today, 9:10 AM',
        likes: 12,
        replies: [
          { id: 'r-1', author: 'Aarav Sharma', text: 'Will the pendulum readings use the same format as last week?' },
        ],
      },
      {
        id: 'p-2',
        author: 'Nisha Rana',
        role: 'Student',
        text: 'I uploaded my rough notes in the materials tab for anyone revising rotational dynamics.',
        time: 'Yesterday, 6:42 PM',
        likes: 7,
        replies: [],
      },
    ],
    files: [
      { id: 'f-1', title: 'Rotational Dynamics Notes', type: 'PDF', size: '3.8 MB', uploadedBy: 'Dr. Meera Karki' },
      { id: 'f-2', title: 'Lab Observation Template', type: 'DOCX', size: '820 KB', uploadedBy: 'Dr. Meera Karki' },
      { id: 'f-3', title: 'Simulation Reference Link', type: 'LINK', size: 'Open', uploadedBy: 'Nisha Rana' },
    ],
    assignments: [
      {
        id: 'a-1',
        title: 'Pendulum Error Analysis',
        description: 'Upload your calculation sheet and one paragraph explaining measurement uncertainty.',
        deadline: '2026-05-22T17:00:00.000Z',
        submitted: false,
      },
      {
        id: 'a-2',
        title: 'Torque Worksheet',
        description: 'Solve problems 1-12 and attach a scanned PDF.',
        deadline: '2026-05-25T10:00:00.000Z',
        submitted: true,
      },
    ],
    tests: [
      {
        id: 't-1',
        title: 'Mechanics Checkpoint',
        description: 'Short MCQ assessment for motion, force, and torque.',
        duration: 20,
        result: null,
        questions: [
          {
            id: 'q-1',
            question: 'Which quantity is conserved in an isolated collision?',
            options: ['Momentum', 'Velocity', 'Acceleration', 'Friction'],
            answer: 0,
          },
          {
            id: 'q-2',
            question: 'Torque depends on force and which other factor?',
            options: ['Mass only', 'Lever arm distance', 'Temperature', 'Density'],
            answer: 1,
          },
          {
            id: 'q-3',
            question: 'The SI unit of angular velocity is:',
            options: ['Newton', 'Joule', 'Radian per second', 'Pascal'],
            answer: 2,
          },
        ],
      },
    ],
  },
  {
    id: 'c-design',
    name: 'Human Computer Interaction',
    shortCode: 'HCI-204',
    courseCode: 'HCI-204',
    teacherId: 'u-1',
    teacherName: 'Aarav Sharma',
    studentIds: ['u-6', 'u-7', 'u-8', 'u-9', 'u-10', 'u-11'],
    settings: { comments: true, fileSharing: true },
    createdAt: '2026-05-03T11:30:00.000Z',
    posts: [
      {
        id: 'p-3',
        author: 'Aarav Sharma',
        role: 'Teacher',
        text: 'This week we are critiquing onboarding flows. Bring screenshots from one real product.',
        time: 'Today, 8:35 AM',
        likes: 18,
        replies: [],
      },
    ],
    files: [
      { id: 'f-4', title: 'Usability Heuristics Brief', type: 'PDF', size: '2.1 MB', uploadedBy: 'Aarav Sharma' },
      { id: 'f-5', title: 'Persona Canvas', type: 'FIG', size: 'Template', uploadedBy: 'Aarav Sharma' },
    ],
    assignments: [
      {
        id: 'a-3',
        title: 'Heuristic Review Report',
        description: 'Evaluate an LMS feature using Nielsen heuristics and upload a two-page review.',
        deadline: '2026-05-24T23:59:00.000Z',
        submitted: false,
      },
    ],
    tests: [
      {
        id: 't-2',
        title: 'UX Foundations Quiz',
        description: 'Covers affordance, feedback, consistency, and error recovery.',
        duration: 15,
        result: null,
        questions: [
          {
            id: 'q-4',
            question: 'Which heuristic is most related to predictable interface patterns?',
            options: ['Consistency', 'Mystery', 'Latency', 'Novelty'],
            answer: 0,
          },
          {
            id: 'q-5',
            question: 'Good error messages should be:',
            options: ['Vague', 'Blaming', 'Actionable', 'Hidden'],
            answer: 2,
          },
        ],
      },
    ],
  },
];

const initialState = {
  users: [
    initialUser,
    { id: 'u-2', name: 'Dr. Meera Karki', email: 'teacher@lms.dev', password: 'password123', avatar: '' },
  ],
  courses: initialCourses,
};

const readState = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialState;
  } catch {
    return initialState;
  }
};

const AuthContext = createContext(null);

const normalizeBackendUser = (apiUser) => ({
  id: String(apiUser.id),
  username: apiUser.username,
  name: apiUser.name || apiUser.username || apiUser.email,
  email: apiUser.email,
  role: apiUser.role,
  avatar: '',
});

const splitName = (name) => {
  const parts = name.trim().split(/\s+/);
  return {
    first_name: parts[0] || '',
    last_name: parts.slice(1).join(' '),
  };
};

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState(readState);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const persistSession = (nextUser, providedToken = null, refreshToken = null) => {
    const safeUser = { ...nextUser };
    delete safeUser.password;
    const nextToken = providedToken || createJwtLikeToken(safeUser);
    setUser(safeUser);
    setToken(nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(safeUser));
    localStorage.setItem(TOKEN_KEY, nextToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  };

  const login = async ({ email, password }) => {
    const loginId = email.trim();
    try {
      const { data } = await authApi.login({ username: loginId, password });
      const backendUser = normalizeBackendUser(data.user);
      persistSession(backendUser, data.access, data.refresh);
      return backendUser;
    } catch (err) {
      if (err.response) {
        throw new Error(err.response?.data?.detail || 'Invalid email or password.');
      }
    }

    const account = state.users.find((item) => item.email.toLowerCase() === email.toLowerCase());
    if (!account || account.password !== password) {
      throw new Error('Invalid email or password.');
    }
    persistSession(account);
    return account;
  };

  const signup = async ({ name, email, password }) => {
    try {
      const nameParts = splitName(name);
      await authApi.register({
        username: email,
        email,
        password,
        role: 'student',
        ...nameParts,
      });
      return login({ email, password });
    } catch (err) {
      if (err.response) {
        const data = err.response.data;
        const detail = data?.detail || data?.email?.[0] || data?.username?.[0] || data?.password?.[0];
        throw new Error(detail || 'Signup failed.');
      }
    }

    if (state.users.some((item) => item.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account already exists with this email.');
    }
    const nextUser = { id: `u-${Date.now()}`, name, email, password, avatar: '' };
    setState((current) => ({ ...current, users: [...current.users, nextUser] }));
    persistSession(nextUser);
    return nextUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  };

  const updateProfile = (profile) => {
    const nextUser = { ...user, ...profile };
    setUser(nextUser);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setState((current) => ({
      ...current,
      users: current.users.map((item) => (item.id === user.id ? { ...item, ...profile } : item)),
      courses: current.courses.map((course) => (
        course.teacherId === user.id ? { ...course, teacherName: profile.name || course.teacherName } : course
      )),
    }));
  };

  const changePassword = ({ currentPassword, newPassword }) => {
    const account = state.users.find((item) => item.id === user.id);
    if (!account || account.password !== currentPassword) {
      throw new Error('Current password is incorrect.');
    }
    setState((current) => ({
      ...current,
      users: current.users.map((item) => (item.id === user.id ? { ...item, password: newPassword } : item)),
    }));
  };

  const createCourse = ({ name, shortCode, comments, fileSharing }) => {
    const generatedCode = makeCourseCode(shortCode || name.replace(/[^a-z]/gi, '').slice(0, 4) || 'CLS');
    const nextCourse = {
      id: `c-${Date.now()}`,
      name,
      shortCode: shortCode || generatedCode.split('-')[0],
      courseCode: generatedCode,
      teacherId: user.id,
      teacherName: user.name,
      studentIds: [],
      settings: { comments, fileSharing },
      createdAt: new Date().toISOString(),
      posts: [],
      files: [],
      assignments: [],
      tests: [],
    };
    setState((current) => ({ ...current, courses: [nextCourse, ...current.courses] }));
    return nextCourse;
  };

  const joinCourse = (courseCode) => {
    const normalized = courseCode.trim().toUpperCase();
    const found = state.courses.find((course) => course.courseCode.toUpperCase() === normalized);
    if (!found) {
      throw new Error('No class was found with that course code.');
    }
    if (found.teacherId === user.id || found.studentIds.includes(user.id)) {
      return found;
    }
    setState((current) => ({
      ...current,
      courses: current.courses.map((course) => (
        course.id === found.id ? { ...course, studentIds: [...course.studentIds, user.id] } : course
      )),
    }));
    return found;
  };

  const getCourseRole = useCallback((course) => {
    if (!user || !course) return null;
    if (course.teacherId === user.id) return 'Teacher';
    if (course.studentIds.includes(user.id)) return 'Student';
    return null;
  }, [user]);

  const userCourses = useMemo(() => (
    user ? state.courses.filter((course) => getCourseRole(course)) : []
  ), [state.courses, getCourseRole, user]);

  const updateCourse = (courseId, updater) => {
    setState((current) => ({
      ...current,
      courses: current.courses.map((course) => (course.id === courseId ? updater(course) : course)),
    }));
  };

  const value = {
    user,
    token,
    loading,
    state,
    isAuthenticated: Boolean(token),
    userCourses,
    login,
    signup,
    logout,
    updateProfile,
    changePassword,
    createCourse,
    joinCourse,
    getCourseRole,
    updateCourse,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
