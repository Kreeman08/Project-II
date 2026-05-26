import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import CourseDetailPage from '../pages/course/CourseDetailPage';
import ProfilePage from '../pages/student/ProfilePage';
import AssignmentsPage from '../pages/student/AssignmentsPage';
import TestsPage from '../pages/student/TestsPage';
import TestPage from '../pages/student/TestPage';

const HomeRedirect = () => <Navigate to="/login" replace />;

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/courses"
      element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/courses/:id"
      element={
        <ProtectedRoute>
          <CourseDetailPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/profile"
      element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/assignments"
      element={
        <ProtectedRoute>
          <AssignmentsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/tests"
      element={
        <ProtectedRoute>
          <TestsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/tests/:id"
      element={
        <ProtectedRoute>
          <TestPage />
        </ProtectedRoute>
      }
    />

    <Route path="/" element={<HomeRedirect />} />
    <Route path="*" element={<HomeRedirect />} />
  </Routes>
);

export default AppRoutes;
