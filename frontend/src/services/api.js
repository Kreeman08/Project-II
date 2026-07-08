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
  joinCourse: (courseCode) =>
    apiRequest("/enrollments/join/", {
      method: "POST",
      body: JSON.stringify({ course_code: courseCode }),
    }),
  enrollments: () => apiRequest("/enrollments/"),
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
  createQuestion: (payload) =>
    apiRequest("/questions/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  createOption: (payload) =>
    apiRequest("/options/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  submitTest: (payload) =>
    apiRequest("/test-submissions/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  coursePosts: () => apiRequest("/course-posts/"),
  createCoursePost: (formData) =>
    apiRequest("/course-posts/", {
      method: "POST",
      body: formData,
    }),
  createCoursePostReply: (payload) =>
    apiRequest("/course-post-replies/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
