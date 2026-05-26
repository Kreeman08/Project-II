import axios from 'axios';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API_BASE_API_URL = `${API_BASE_URL}/api`;

const api = axios.create({
  baseURL: API_BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const authApi = {
  login: (credentials) => api.post('/token/', credentials),
  register: (payload) => api.post('/register/', payload),
  me: () => api.get('/users/me/'),
};

export const courseApi = {
  list: () => api.get('/courses/'),
  create: (payload) => api.post('/courses/', payload),
  retrieve: (id) => api.get(`/courses/${id}/`),
  join: (courseCode) => api.post('/enrollments/join/', { course_code: courseCode }),
};

export const materialApi = {
  list: (params) => api.get('/materials/', { params }),
  create: (payload) =>
    api.post('/materials/', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const assignmentApi = {
  list: (params) => api.get('/assignments/', { params }),
  create: (payload) => api.post('/assignments/', payload),
  submit: (payload) =>
    api.post('/submissions/', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  submissions: (params) => api.get('/submissions/', { params }),
  grade: (id, payload) => api.patch(`/submissions/${id}/`, payload),
};

export const testApi = {
  list: (params) => api.get('/tests/', { params }),
  create: (payload) => api.post('/tests/', payload),
  createQuestion: (payload) => api.post('/questions/', payload),
  createOption: (payload) => api.post('/options/', payload),
  retrieve: (id) => api.get(`/tests/${id}/`),
  submit: (payload) => api.post('/test-submissions/', payload),
  result: (submissionId) => api.get(`/test-submissions/${submissionId}/result/`),
};

export const adminApi = {
  users: () => api.get('/users/'),
  createUser: (payload) => api.post('/users/', payload),
  updateUser: (id, payload) => api.patch(`/users/${id}/`, payload),
  courses: () => api.get('/courses/'),
};
