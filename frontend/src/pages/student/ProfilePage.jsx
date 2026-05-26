import React, { useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { CheckCircleIcon, KeyIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const ProfilePage = () => {
  const { user, updateProfile, changePassword } = useAuth();
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
    updateProfile(profile);
    setMessage('Profile updated successfully.');
  };

  const savePassword = (event) => {
    event.preventDefault();
    try {
      changePassword(passwords);
      setPasswords({ currentPassword: '', newPassword: '' });
      setMessage('Password changed successfully.');
    } catch (err) {
      setMessage(err.message || 'Could not change password.');
    }
  };

  return (
    <MainLayout>
      <section className="profile-password-page">
        <div className="section-heading">
          <p className="eyebrow">Profile</p>
          <h1>Profile Settings</h1>
          <p>Manage your account information and password.</p>
        </div>

        {message && (
          <div className="toast-inline">
            <CheckCircleIcon className="h-5 w-5" />
            {message}
            <button onClick={() => setMessage('')}>Dismiss</button>
          </div>
        )}

        <form className="surface profile-settings-form" onSubmit={saveProfile}>
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

        <form className="surface password-surface" onSubmit={savePassword}>
          <div className="card-title">
            <KeyIcon className="h-5 w-5" />
            <h2>Change password</h2>
          </div>
          <label>
            <span>Current password</span>
            <input
              type="password"
              value={passwords.currentPassword}
              onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })}
              required
            />
          </label>
          <label>
            <span>New password</span>
            <input
              type="password"
              value={passwords.newPassword}
              onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })}
              minLength={8}
              required
            />
          </label>
          <button className="primary-action compact" type="submit">Update password</button>
        </form>
      </section>
    </MainLayout>
  );
};

export default ProfilePage;
