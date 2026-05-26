import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  AcademicCapIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const SidebarNav = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { label: 'My Courses', path: '/courses', icon: <AcademicCapIcon className="w-5 h-5" /> },
    { label: 'Assignment', path: '/assignments', icon: <ClipboardDocumentIcon className="w-5 h-5" /> },
    { label: 'Test', path: '/tests', icon: <ClipboardDocumentCheckIcon className="w-5 h-5" /> },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-[var(--blue)] text-white p-2 rounded-lg"
        aria-label="Toggle navigation"
      >
        {isOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
      </button>

      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-[var(--nav)] text-white shadow-lg transform transition-transform duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:sticky md:top-0`}
      >
        <div className="p-6 border-b" style={{ borderColor: 'var(--line)' }}>
          <h1 className="text-2xl font-bold">Academy LMS</h1>
          <p className="text-[var(--muted)] text-sm mt-1">Learning Management System</p>
        </div>

        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--line)' }}>
          <p className="text-sm text-blue-200">Logged in as:</p>
          <p className="font-semibold">{user?.name || user?.username}</p>
          {user?.role && (
            <span className="inline-block mt-2 px-3 py-1 bg-blue-500 rounded-full text-xs capitalize">
              {user.role}
            </span>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-500 border-l-4 border-white'
                  : 'hover:bg-blue-600'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="px-6 py-4 border-t grid gap-3" style={{ borderColor: 'var(--line)' }}>
          <button className="w-full flex items-center justify-center gap-2 bg-[var(--blue)] hover:brightness-90 text-white py-2 rounded-lg font-medium transition-all">
            <PlusIcon className="w-5 h-5" />
            Create New Class
          </button>
          <button className="w-full flex items-center justify-center gap-2 bg-[var(--blue)] hover:brightness-90 text-white py-2 rounded-lg font-medium transition-all">
            <UserGroupIcon className="w-5 h-5" />
            Join a Class
          </button>
        </div>

        <div className="px-6 py-4 border-t border-blue-600 space-y-2 text-sm">
          <button
            className="w-full text-left flex items-center gap-2 hover:bg-blue-600 px-4 py-2 rounded transition-colors"
            onClick={() => window.alert('Help: use My Courses to view classes, Assignment to submit work, Test to take exams, and Profile to update account settings.')}
          >
            <QuestionMarkCircleIcon className="w-5 h-5" />
            Help
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-left flex items-center gap-2 hover:bg-red-600 px-4 py-2 rounded transition-colors text-red-200"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default SidebarNav;
