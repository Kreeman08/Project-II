import React, { useState } from "react";
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
import AttemptTest from "./MyCourses/Test/AttemptTest";
import Assignment from "./MyCourses/Assignment/Assignment";
import AssignmentDetails from "./MyCourses/Assignment/AssignmentDetails";
import Login from "./pages/Login";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "./styles/Theme.css";
import "./styles/App.css";

function AppShell() {
  const [darkMode, setDarkMode] = useState(true);
  const { user, loading } = useAuth();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

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
        />

        {/* MAIN CONTENT */}
        <main className="main-content">

          <Header
            darkMode={darkMode}
            setDarkMode={setDarkMode}
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
          <Route path="tests" element={<Test />} />
          <Route path="tests/:testId/attempt" element={<AttemptTest />} />
          <Route path="add-test" element={<AddTest />} />
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
