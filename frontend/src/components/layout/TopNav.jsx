import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserCircleIcon } from '@heroicons/react/24/outline';

const TopNav = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      if (theme === 'light') {
        document.documentElement.classList.add('light');
        localStorage.setItem('theme', 'light');
      } else {
        document.documentElement.classList.remove('light');
        localStorage.setItem('theme', 'dark');
      }
    } catch (e) {
      // ignore
    }
  }, [theme]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-[var(--nav)] shadow-lg sticky top-0 z-20 border-b" style={{ borderColor: 'var(--line)' }}>
      <div className="flex items-center justify-between h-16 px-8">
        {/* Left side - Title */}
        <div>
          <h2 className="text-xl font-bold text-white hidden md:block">Academy</h2>
        </div>

        {/* Middle - Search Bar */}
        <div className="flex-1 mx-8">
          <input
            type="text"
            placeholder="Search the classes"
            className="w-full max-w-md px-4 py-2 bg-[rgba(255,255,255,0.02)] border rounded-full text-[var(--ink)] placeholder-[color:var(--muted)] border-[var(--line)] focus:outline-none focus:ring-2 focus:ring-[var(--blue)]"
          />
        </div>

        {/* Right side - Icons and User Menu */}
        <div className="flex items-center gap-6">
          {/* Settings Icon */}
          <button className="text-gray-300 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle theme"
            className="icon-button theme-toggle"
          >
            {theme === 'dark' ? (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
            ) : (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /></svg>
            )}
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="profile-pill"
            >
              {user?.avatar ? <img src={user.avatar} alt={user.name} /> : <UserCircleIcon className="h-6 w-6" />}
              <span style={{ marginLeft: 8, fontWeight: 800 }}>{user?.name}</span>
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[var(--paper)] rounded-lg shadow-lg border" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}>
                <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--line)' }}>
                  <p className="font-semibold text-sm">{user?.name}</p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    navigate('/profile');
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[rgba(255,255,255,0.02)] text-sm"
                >
                  👤 My Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-[rgba(255,0,0,0.04)] text-sm border-t"
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
