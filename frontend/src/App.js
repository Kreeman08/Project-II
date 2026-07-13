import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import MyClasses from "./pages/MyClasses";
import MyAssignments from "./pages/MyAssignments";
import MyAssessments from "./pages/MyAssessments";
import Notifications from "./pages/Notifications";
import CreateClass from "./components/CreateClass";
import JoinClass from "./components/JoinClass";
import MyClass from "./MyCourses/MyClass";
import General from "./MyCourses/General";
import Files from "./MyCourses/Files";
import Test from "./MyCourses/Test/Test";
import AddTest from "./MyCourses/Test/AddTest";
import TestResults from "./MyCourses/Test/TestResults";
import AttemptTest from "./MyCourses/Test/AttemptTest";
import Assignment from "./MyCourses/Assignment/Assignment";
import AssignmentDetails from "./MyCourses/Assignment/AssignmentDetails";
import Members from "./MyCourses/Members";
import LeaveCourseRequests from "./pages/LeaveCourseRequests";
import Login from "./pages/Login";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "./styles/Theme.css";
import "./styles/App.css";

function AppShell() {
  const [darkMode, setDarkMode] = useState(true);
  const { user, loading, logout } = useAuth();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event) => { if (event.key === "Escape") setShowLogoutConfirm(false); };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

if (loading) {
  return (
    <div className={darkMode ? "app dark" : "app light"}>
      <main className="main-content">
        <div className="page-state">Loading...</div>
      </main>
    </div>
  );
}

if (!user) {
  return (
    <div className={darkMode ? "app dark" : "app light"}>
      <main className="main-content no-sidebar">
        <Login
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      </main>
    </div>
  );
}
  return (
      <div className={darkMode ? "app dark" : "app light"}>

        {/* SIDEBAR */}
        <Sidebar
          openCreateModal={() => setShowCreateModal(true)}
          openJoinModal={() => setShowJoinModal(true)}
          onLogoutRequest={() => setShowLogoutConfirm(true)}
        />

        {/* MAIN CONTENT */}
        <main className="main-content">

          <Header
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            onLogoutRequest={() => setShowLogoutConfirm(true)}
          />

          <Routes>

            {/* HOME */}
            <Route path="/" element={<MyClasses />} />

            {/* OTHER PAGES */}
            <Route path="/myassignments" element={<MyAssignments />} />
            <Route path="/myassessments" element={<MyAssessments />} />
            <Route path="/notifications" element={<Notifications />} />

            {/* NESTED CLASS ROUTES */}
            <Route path="/myclass/:courseId/*" element={<MyClass />}>
          <Route index element={<General />} />
          <Route path="files" element={<Files />} />
          <Route path="assignment" element={<Assignment />} />
          <Route path="assignment/:assignmentId" element={<AssignmentDetails />}/>
          <Route path="members" element={<Members />} />
          <Route path="leave-requests" element={<LeaveCourseRequests />} />
          <Route path="tests" element={<Test />} />
          <Route path="tests/:testId/attempt" element={<AttemptTest />} />
          <Route path="tests/:testId/results" element={<TestResults />} />
          <Route path="add-test" element={<AddTest />} />
          <Route path="tests/:testId/edit" element={<AddTest />} />
          </Route>

          </Routes>

        </main>

        {/* MODALS */}
        {showCreateModal && (
          <CreateClass closeModal={() => setShowCreateModal(false)} />
        )}

        {showJoinModal && (
          <JoinClass closeModal={() => setShowJoinModal(false)} />
        )}

        {showLogoutConfirm && (
          <div className="logout-overlay" onClick={() => setShowLogoutConfirm(false)}>
            <div className="logout-dialog" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
              <h2>Log Out</h2>
              <p>Are you sure you want to log out of your account?</p>
              <div><button onClick={() => setShowLogoutConfirm(false)}>Cancel</button><button className="logout-dialog__confirm" onClick={logout}>Log Out</button></div>
            </div>
          </div>
        )}

      </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
