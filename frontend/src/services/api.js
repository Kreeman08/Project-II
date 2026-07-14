const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

export const storageKeys = {
  access: "academy_access_token",
  refresh: "academy_refresh_token",
  user: "academy_user",
};

export function getStoredUser() {
  const raw = localStorage.getItem(storageKeys.user);
  return raw ? JSON.parse(raw) : null;
}

export function saveSession(data) {
  localStorage.setItem(storageKeys.access, data.access);
  localStorage.setItem(storageKeys.refresh, data.refresh);
  localStorage.setItem(storageKeys.user, JSON.stringify(data.user));
}

export function clearSession() {
  localStorage.removeItem(storageKeys.access);
  localStorage.removeItem(storageKeys.refresh);
  localStorage.removeItem(storageKeys.user);
}

function authHeaders(isFormData) {
  const token = localStorage.getItem(storageKeys.access);
  const headers = isFormData ? {} : { "Content-Type": "application/json" };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export async function apiRequest(path, options = {}) {
  const bodyIsFormData = options.body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...authHeaders(bodyIsFormData),
      ...(options.headers || {}),
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data.detail || data.error || Object.values(data).flat().join(" ");
    throw new Error(message || "Request failed");
  }

  return data;
}

async function downloadRequest(path, filename) {
  const response = await fetch(`${API_BASE_URL}${path}`, { headers: authHeaders(false) });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || 'Unable to download this file.');
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename || 'download';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export const api = {
  login: (username, password) =>
    apiRequest("/token/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  register: (payload) =>
    apiRequest("/register/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  me: () => apiRequest("/users/me/"),
  courses: () => apiRequest("/courses/"),
  createCourse: (payload) =>
    apiRequest("/courses/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateCourse: (id, payload) =>
    apiRequest(`/courses/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  joinCourse: (courseCode) =>
    apiRequest("/enrollments/join/", {
      method: "POST",
      body: JSON.stringify({ course_code: courseCode }),
    }),
  enrollments: () => apiRequest("/enrollments/"),
  updateEnrollment: (id, payload) =>
    apiRequest(`/enrollments/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  leaveCourse: (enrollmentId) =>
    apiRequest(`/enrollments/${enrollmentId}/leave/`, { method: "POST" }),
  removeStudent: (enrollmentId) =>
    apiRequest(`/enrollments/${enrollmentId}/remove-student/`, { method: "POST" }),
  notifications: () => apiRequest("/notifications/"),
  markNotificationRead: (id) =>
    apiRequest(`/notifications/${id}/mark_read/`, { method: "POST" }),
  markAllNotificationsRead: () =>
    apiRequest("/notifications/mark_all_read/", { method: "POST" }),
  materials: () => apiRequest("/materials/"),
  createMaterial: (formData) =>
    apiRequest("/materials/", {
      method: "POST",
      body: formData,
    }),
  updateMaterial: (id, payload) =>
    apiRequest(`/materials/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteMaterial: (id) =>
    apiRequest(`/materials/${id}/`, {
      method: "DELETE",
    }),
  assignments: () => apiRequest("/assignments/"),
  assignment: (id) => apiRequest(`/assignments/${id}/`),
  createAssignment: (formData) =>
  apiRequest("/assignments/", {
    method: "POST",
    body: formData,
  }),
  updateAssignment: (id, formData) =>
  apiRequest(`/assignments/${id}/`, {
    method: "PUT",
    body: formData,
  }),
  deleteAssignment: (id) =>
    apiRequest(`/assignments/${id}/`, {
      method: "DELETE",
    }),
  submissions: () => apiRequest("/submissions/"),
  createSubmission: (formData) =>
    apiRequest("/submissions/", {
      method: "POST",
      body: formData,
    }),
  tests: () => apiRequest("/tests/"),
  createTest: (payload) =>
    apiRequest("/tests/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  downloadMaterial: (id, filename) => downloadRequest(`/materials/${id}/download/`, filename),
  updateTest: (id, payload) =>
    apiRequest(`/tests/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteTest: (id) =>
    apiRequest(`/tests/${id}/`, { method: "DELETE" }),
  createQuestion: (payload) =>
    apiRequest("/questions/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateQuestion: (id, payload) =>
    apiRequest(`/questions/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteQuestion: (id) =>
    apiRequest(`/questions/${id}/`, { method: "DELETE" }),
  createOption: (payload) =>
    apiRequest("/options/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateOption: (id, payload) =>
    apiRequest(`/options/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteOption: (id) =>
    apiRequest(`/options/${id}/`, { method: "DELETE" }),
  submitTest: (payload) =>
    apiRequest("/test-submissions/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  testSubmissions: () => apiRequest("/test-submissions/"),
  testSubmissionResult: (id) => apiRequest(`/test-submissions/${id}/result/`),
  coursePosts: () => apiRequest("/course-posts/"),
  createCoursePost: (formData) =>
    apiRequest("/course-posts/", {
      method: "POST",
      body: formData,
    }),
  updateCoursePost: (id, payload) =>
    apiRequest(`/course-posts/${id}/`, { method: 'PATCH', body: payload instanceof FormData ? payload : JSON.stringify(payload) }),
  deleteCoursePost: (id) => apiRequest(`/course-posts/${id}/`, { method: 'DELETE' }),
  createCoursePostReply: (payload) =>
    apiRequest("/course-post-replies/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateCoursePostReply: (id, payload) => apiRequest(`/course-post-replies/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteCoursePostReply: (id) => apiRequest(`/course-post-replies/${id}/`, { method: 'DELETE' }),
  leaveRequests: () => apiRequest('/leave-requests/'),
  createLeaveRequest: (payload) => apiRequest('/leave-requests/', { method: 'POST', body: JSON.stringify(payload) }),
  reviewLeaveRequest: (id, status) => apiRequest(`/leave-requests/${id}/review/`, { method: 'POST', body: JSON.stringify({ status }) }),
  leaveCourseRequests: (courseId) => apiRequest(`/leave-course-requests/${courseId ? `?course=${courseId}` : ''}`),
  createLeaveCourseRequest: (course) => apiRequest('/leave-course-requests/', { method: 'POST', body: JSON.stringify({ course }) }),
  cancelLeaveCourseRequest: (id) => apiRequest(`/leave-course-requests/${id}/cancel/`, { method: 'POST' }),
  decideLeaveCourseRequest: (id, status) => apiRequest(`/leave-course-requests/${id}/decide/`, { method: 'POST', body: JSON.stringify({ status }) }),
};
