import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EnvelopeIcon, LockClosedIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const updateField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const validate = () => {
    const loginId = form.email.trim();
    if (!loginId) return 'Please enter your email or username.';
    if (loginId.includes('@') && !emailPattern.test(loginId)) return 'Please enter a valid email address.';
    if (!form.password || form.password.length < 8) return 'Password must be at least 8 characters.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) return setError(v);
    setError('');
    setLoading(true);
    try {
      await login({ email: form.email.trim(), password: form.password });
      navigate('/courses');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-only">
      <section className="auth-panel" aria-label="Login">
        <div className="auth-card auth-card-compact">
          <h2>Login</h2>
          <p>Enter your account credentials to continue.</p>

          {error && <div className="form-alert">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              <span>Email or username</span>
              <div className="input-wrap">
                <EnvelopeIcon className="h-5 w-5" />
                <input type="text" value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="you@school.edu or username" autoComplete="username" />
              </div>
            </label>

            <label>
              <span>Password</span>
              <div className="input-wrap">
                <LockClosedIcon className="h-5 w-5" />
                <input type="password" value={form.password} onChange={(e) => updateField('password', e.target.value)} placeholder="At least 8 characters" autoComplete="current-password" />
              </div>
            </label>

            <button className="primary-action" type="submit" disabled={loading}>
              <span>{loading ? 'Please wait...' : 'Login'}</span>
              <ArrowRightIcon className="h-5 w-5" />
            </button>
          </form>

          <p className="auth-link" style={{ textAlign: 'center', marginTop: 8 }}>
            Don't have an account? {' '}
            <Link to="/signup">Signup</Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
