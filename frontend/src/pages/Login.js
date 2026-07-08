import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faEnvelope,
  faLock,
  faUser,
  faMoon,
  faSun,
} from "@fortawesome/free-solid-svg-icons";

import { useAuth } from "../context/AuthContext";
import "./Login.css";
import logo from "../logo.png";

function Login({ darkMode, setDarkMode }) {
  const { login, register } = useAuth();

  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isLogin = mode === "login";

  const updateForm = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        if (form.password !== form.confirmPassword) {
          throw new Error("Passwords do not match");
        }

        const [firstName, ...rest] = form.name.trim().split(/\s+/);

        await register({
          email: form.email,
          password: form.password,
          first_name: firstName || "",
          last_name: rest.join(" "),
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="lms-auth-page">
      <form className="lms-auth-card" onSubmit={handleSubmit}>

        {/* TOP BAR (inside card like you wanted) */}
        <div className="lms-auth-topbar">
          <div className="lms-auth-brand">
            <img
              src={logo}
              alt="Academy Logo"
              className="lms-auth-logo"
            />
            <h2>Academy</h2>
          </div>

          <button
            type="button"
            className="lms-auth-theme-btn"
            onClick={() => setDarkMode(!darkMode)}
          >
            <FontAwesomeIcon
              icon={darkMode ? faSun : faMoon}
            />
          </button>
        </div>

        <h1>{isLogin ? "Login" : "Create account"}</h1>

        <p>
          {isLogin
            ? "Enter your account credentials to continue."
            : "Sign up to access your courses, tests, and assignments."}
        </p>

        {error && (
          <div className="lms-auth-error">{error}</div>
        )}

        {!isLogin && (
          <label className="lms-auth-label">
            Name
            <div className="lms-auth-field">
              <div className="lms-auth-icon">
                <FontAwesomeIcon icon={faUser} />
              </div>
              <input
                name="name"
                value={form.name}
                onChange={updateForm}
                required
              />
            </div>
          </label>
        )}

        <label className="lms-auth-label">
          Email
          <div className="lms-auth-field">
            <div className="lms-auth-icon">
              <FontAwesomeIcon icon={faEnvelope} />
            </div>
            <input
              name="email"
              value={form.email}
              onChange={updateForm}
              required
            />
          </div>
        </label>

        <label className="lms-auth-label">
          Password
          <div className="lms-auth-field">
            <div className="lms-auth-icon">
              <FontAwesomeIcon icon={faLock} />
            </div>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={updateForm}
              required
            />
          </div>
        </label>

        {!isLogin && (
          <label className="lms-auth-label">
            Confirm Password
            <div className="lms-auth-field">
              <div className="lms-auth-icon">
                <FontAwesomeIcon icon={faLock} />
              </div>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={updateForm}
                required
              />
            </div>
          </label>
        )}

        <button
          className="lms-auth-button"
          type="submit"
          disabled={busy}
        >
          {busy
            ? "Please wait..."
            : isLogin
            ? "Login"
            : "Create account"}

          <FontAwesomeIcon icon={faArrowRight} />
        </button>

        <div className="lms-auth-footer">
          {isLogin ? "No account? " : "Already have account? "}

          <button
            type="button"
            onClick={() =>
              setMode(isLogin ? "register" : "login")
            }
          >
            {isLogin ? "Signup" : "Login"}
          </button>
        </div>

      </form>
    </div>
  );
}

export default Login;