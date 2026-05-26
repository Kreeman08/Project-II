import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AcademicCapIcon,
  ArrowLeftOnRectangleIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
  KeyIcon,
  UserGroupIcon,
  UserIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { key: 'courses', label: 'My Courses', path: '/courses', icon: AcademicCapIcon },
  { key: 'assignments', label: 'Assignment', path: '/assignments', icon: ClipboardDocumentIcon },
  { key: 'tests', label: 'Test', path: '/tests', icon: ClipboardDocumentCheckIcon },
];

const AcademyLayout = ({ active = 'courses', search = '', onSearchChange, searchPlaceholder = 'Search the classes', children }) => {
  const {
    user,
    logout,
    updateProfile,
    changePassword,
    createCourse,
    joinCourse,
  } = useAuth();
  const navigate = useNavigate();
  const [notice, setNotice] = useState('');
  const [modal, setModal] = useState(null);
  const [createdCourse, setCreatedCourse] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
      return;
    }
    document.documentElement.classList.remove('light');
    localStorage.setItem('theme', 'dark');
  }, [theme]);

  const handleCreateCourse = (payload) => {
    const nextCourse = createCourse(payload);
    setCreatedCourse(nextCourse);
    setModal('created');
  };

  const handleJoinCourse = (courseCode) => {
    const joined = joinCourse(courseCode);
    setNotice(`Joined ${joined.name}.`);
    setModal(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <BookOpenIcon className="h-7 w-7" />
          <span>Academy LMS</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                className={active === item.key ? 'active' : ''}
                onClick={() => navigate(item.path)}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-actions">
          <button className="primary-action" onClick={() => setModal('create')}>
            <PlusIcon className="h-5 w-5" />
            Create New Class
          </button>
          <button className="primary-action" onClick={() => setModal('join')}>
            <UserGroupIcon className="h-5 w-5" />
            Join a Class
          </button>
        </div>

        <div className="sidebar-footer">
          <button type="button" onClick={() => setModal('help')}>
            <QuestionMarkCircleIcon className="h-5 w-5" />
            Help
          </button>
          <button type="button" onClick={handleLogout}>
            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="topbar">
          <h1>Academy</h1>
          <div className="search-box">
            <MagnifyingGlassIcon className="h-5 w-5" />
            <input value={search} onChange={(event) => onSearchChange?.(event.target.value)} placeholder={searchPlaceholder} />
          </div>
          <div className="topbar-actions">
            <button
              type="button"
              className="icon-button theme-toggle"
              title="Toggle theme"
              onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
            >
              <Cog6ToothIcon className="h-6 w-6" />
            </button>
            <button type="button" className="profile-chip" title="Profile" onClick={() => setModal('profile')}>
              {user?.avatar ? <img src={user.avatar} alt={user.name} /> : <UserIcon className="h-6 w-6" />}
              <span>Profile</span>
            </button>
          </div>
        </header>

        {notice && (
          <div className="toast-inline">
            <CheckCircleIcon className="h-5 w-5" />
            {notice}
            <button onClick={() => setNotice('')}>Dismiss</button>
          </div>
        )}

        {children}
      </main>

      {modal === 'create' && <CreateClassModal onClose={() => setModal(null)} onCreate={handleCreateCourse} />}
      {modal === 'join' && <JoinClassModal onClose={() => setModal(null)} onJoin={handleJoinCourse} />}
      {modal === 'profile' && (
        <ProfileSettingsModal
          user={user}
          onClose={() => setModal(null)}
          onUpdateProfile={(profile) => {
            updateProfile(profile);
            setNotice('Profile updated.');
            setModal(null);
          }}
          onChangePassword={changePassword}
        />
      )}
      {modal === 'help' && <HelpModal onClose={() => setModal(null)} />}
      {modal === 'created' && createdCourse && (
        <SuccessModal course={createdCourse} onClose={() => setModal(null)} onOpen={() => navigate(`/courses/${createdCourse.id}`)} />
      )}
    </div>
  );
};

const ModalShell = ({ title, subtitle, children, onClose }) => (
  <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="modal-card" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
      <div className="modal-head">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="Close">x</button>
      </div>
      {children}
    </section>
  </div>
);

const CreateClassModal = ({ onClose, onCreate }) => {
  const [form, setForm] = useState({ name: '', shortCode: '', comments: true, fileSharing: true });

  const submit = (event) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    onCreate({ ...form, name: form.name.trim(), shortCode: form.shortCode.trim() });
  };

  return (
    <ModalShell title="Create class" subtitle="A unique course code is generated after creation." onClose={onClose}>
      <form className="modal-form" onSubmit={submit}>
        <label>
          <span>Class name</span>
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Data Structures" required />
        </label>
        <label>
          <span>Shortform / code</span>
          <input value={form.shortCode} onChange={(event) => setForm({ ...form, shortCode: event.target.value })} placeholder="CS101" />
        </label>
        <div className="toggle-row">
          <span>Comment permission</span>
          <button type="button" className={form.comments ? 'toggle on' : 'toggle'} onClick={() => setForm({ ...form, comments: !form.comments })} aria-pressed={form.comments} />
        </div>
        <div className="toggle-row">
          <span>File sharing</span>
          <button type="button" className={form.fileSharing ? 'toggle on' : 'toggle'} onClick={() => setForm({ ...form, fileSharing: !form.fileSharing })} aria-pressed={form.fileSharing} />
        </div>
        <button className="primary-action" type="submit">Create class</button>
      </form>
    </ModalShell>
  );
};

const JoinClassModal = ({ onClose, onJoin }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const submit = (event) => {
    event.preventDefault();
    try {
      onJoin(code);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <ModalShell title="Join class" subtitle="Enter the course code your teacher shared." onClose={onClose}>
      <form className="modal-form" onSubmit={submit}>
        {error && <div className="form-alert">{error}</div>}
        <label>
          <span>Course code</span>
          <input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="PHY-X92KQ" required />
        </label>
        <button className="primary-action" type="submit">Join class</button>
      </form>
    </ModalShell>
  );
};

const ProfileSettingsModal = ({ user, onClose, onUpdateProfile, onChangePassword }) => {
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', avatar: user?.avatar || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState('');

  const uploadAvatar = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfile((current) => ({ ...current, avatar: reader.result }));
    reader.readAsDataURL(file);
  };

  const saveProfile = (event) => {
    event.preventDefault();
    onUpdateProfile(profile);
  };

  const savePassword = (event) => {
    event.preventDefault();
    try {
      onChangePassword(passwords);
      setPasswords({ currentPassword: '', newPassword: '' });
      setMessage('Password changed successfully.');
    } catch (err) {
      setMessage(err.message || 'Could not change password.');
    }
  };

  return (
    <ModalShell title="Profile" subtitle="Manage your account information and password." onClose={onClose}>
      <div className="profile-settings">
        {message && (
          <div className="toast-inline">
            <CheckCircleIcon className="h-5 w-5" />
            {message}
            <button onClick={() => setMessage('')}>Dismiss</button>
          </div>
        )}
        <form className="profile-settings-form" onSubmit={saveProfile}>
          <div className="profile-avatar-edit">
            <div className="avatar-preview">
              {profile.avatar ? <img src={profile.avatar} alt={profile.name} /> : <UserCircleIcon className="h-16 w-16" />}
            </div>
            <label className="secondary-action">
              Upload picture
              <input className="hidden" type="file" accept="image/*" onChange={uploadAvatar} />
            </label>
          </div>
          <label>
            <span>Name</span>
            <input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} required />
          </label>
          <label>
            <span>Email</span>
            <input type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} required />
          </label>
          <button className="primary-action compact" type="submit">Save profile</button>
        </form>
        <form className="profile-settings-form" onSubmit={savePassword}>
          <div className="card-title">
            <KeyIcon className="h-5 w-5" />
            <h3>Change password</h3>
          </div>
          <label>
            <span>Current password</span>
            <input type="password" value={passwords.currentPassword} onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })} required />
          </label>
          <label>
            <span>New password</span>
            <input type="password" value={passwords.newPassword} onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })} minLength={8} required />
          </label>
          <button className="secondary-action" type="submit">Update password</button>
        </form>
        <div className="modal-actions">
          <button className="primary-action compact" type="button" onClick={onClose}>Done</button>
        </div>
      </div>
    </ModalShell>
  );
};

const HelpModal = ({ onClose }) => (
  <ModalShell title="Help" subtitle="Quick actions for using Academy LMS." onClose={onClose}>
    <div className="help-list">
      <div>
        <strong>Create New Class</strong>
        <p>Use this when you are teaching and need a new class code.</p>
      </div>
      <div>
        <strong>Join a Class</strong>
        <p>Enter the course code shared by your teacher.</p>
      </div>
      <div>
        <strong>Profile</strong>
        <p>Change your name, email, picture, or password from the top-right Profile button.</p>
      </div>
    </div>
    <div className="modal-actions">
      <button className="primary-action compact" type="button" onClick={onClose}>Done</button>
    </div>
  </ModalShell>
);

const SuccessModal = ({ course, onClose, onOpen }) => {
  const shareUrl = `${window.location.origin}/courses/${course.id}?join=${course.courseCode}`;
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard?.writeText(course.courseCode);
    setCopied(true);
  };

  return (
    <ModalShell title="Class created" subtitle="You are the teacher for this class." onClose={onClose}>
      <div className="success-panel">
        <CheckCircleIcon className="h-12 w-12" />
        <p>Course code</p>
        <strong>{course.courseCode}</strong>
        <div className="share-link">{shareUrl}</div>
        <div className="modal-actions">
          <button className="secondary-action" onClick={copy}>
            <ClipboardDocumentIcon className="h-5 w-5" />
            {copied ? 'Copied' : 'Copy code'}
          </button>
          <button className="primary-action compact" onClick={onOpen}>Open workspace</button>
        </div>
      </div>
    </ModalShell>
  );
};

export default AcademyLayout;
