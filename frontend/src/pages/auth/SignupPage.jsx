import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserIcon, EnvelopeIcon, LockClosedIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignupPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const updateField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const validate = () => {
    if (!form.name.trim()) return 'Please enter your full name.';
    if (!emailPattern.test(form.email)) return 'Please enter a valid email address.';
    if (!form.password || form.password.length < 8) return 'Password must be at least 8 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) return setError(v);
    setError('');
    setLoading(true);
    try {
      await signup({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      navigate('/courses');
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-only">
      <section className="auth-panel" aria-label="Signup">
        <div className="auth-card auth-card-compact">
          <h2>Create account</h2>
          <p>Sign up to access your courses, tests, and assignments.</p>

          {error && <div className="form-alert">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              <span>Name</span>
              <div className="input-wrap">
                <UserIcon className="h-5 w-5" />
                <input type="text" value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Your full name" />
              </div>
            </label>

            <label>
              <span>Email</span>
              <div className="input-wrap">
                <EnvelopeIcon className="h-5 w-5" />
                <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="you@school.edu" autoComplete="email" />
              </div>
            </label>

            <label>
              <span>Password</span>
              <div className="input-wrap">
                <LockClosedIcon className="h-5 w-5" />
                <input type="password" value={form.password} onChange={(e) => updateField('password', e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" />
              </div>
            </label>

            <label>
              <span>Confirm password</span>
              <div className="input-wrap">
                <LockClosedIcon className="h-5 w-5" />
                <input type="password" value={form.confirmPassword} onChange={(e) => updateField('confirmPassword', e.target.value)} placeholder="Repeat password" autoComplete="new-password" />
              </div>
            </label>

            <button className="primary-action" type="submit" disabled={loading}>
              <span>{loading ? 'Please wait...' : 'Create account'}</span>
              <ArrowRightIcon className="h-5 w-5" />
            </button>
          </form>

          <p className="auth-link" style={{ textAlign: 'center', marginTop: 8 }}>
            Already have an account? {' '}
            <Link to="/login">Login</Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default SignupPage;
