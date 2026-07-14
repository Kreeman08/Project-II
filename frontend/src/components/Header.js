import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun, faUser, faSearch, faChevronDown, faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import "./Header.css";
import logo from "./logo.png";
import { useAuth } from "../context/AuthContext";

function Header({ darkMode, setDarkMode, onLogoutRequest }) {
  const [query, setQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const { user } = useAuth();
  const profileRef = useRef(null);
  const displayName = user?.name || `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "Unknown User";
  useEffect(() => {
    const close = (event) => { if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false); };
    const escape = (event) => { if (event.key === "Escape") setProfileOpen(false); };
    document.addEventListener("mousedown", close); document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", escape); };
  }, []);
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('classes:search', { detail: query }));
  }, [query]);

  return (
  <header className="header">
    <div className="header-right">
      <div className="sidebar-brand">
        <img
          src={logo}
          alt="Academy LMS Logo"
          className="sidebar-logo"
        />
        <h2>Academy</h2>
      </div>

      <div className="search-area">
        <button
          type="button"
          className="search-icon-btn"
          aria-label="Search"
        >
          <FontAwesomeIcon
            icon={faSearch}
            className="search-icon"
          />
        </button>

        <input
          type="text"
          placeholder="Search the classes"
          className="search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        {query && (
          <button
            type="button"
            className="clear-btn-input"
            onClick={() => setQuery("")}
          >
            &times;
          </button>
        )}
      </div>
    </div>

    <div className="header-left">
      <button
        className="theme-btn theme-btn--toggle"
        onClick={() => setDarkMode(!darkMode)}
        aria-label={darkMode ? "Use light mode" : "Use dark mode"}
      >
        <FontAwesomeIcon
          icon={darkMode ? faMoon : faSun}
          size="lg"
        />
      </button>

      <div
        className="profile-menu"
        ref={profileRef}
      >
        <button
          className="profile-trigger"
          onClick={() => setProfileOpen((open) => !open)}
          aria-expanded={profileOpen}
        >
          <span className="profile-avatar">
            {displayName.slice(0, 1).toUpperCase() || (
              <FontAwesomeIcon icon={faUser} />
            )}
          </span>

          <FontAwesomeIcon icon={faChevronDown} />
        </button>

        {profileOpen && (
          <div className="profile-dropdown">
            <div className="profile-dropdown__identity">
              <span className="profile-avatar profile-avatar--large">
                {displayName.slice(0, 1).toUpperCase()}
              </span>

              <div>
                <strong>{displayName}</strong>
                <span>
                  {user?.email || "No email address"}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setProfileOpen(false);
                onLogoutRequest();
              }}
            >
              <FontAwesomeIcon icon={faArrowRightFromBracket} />
              {" "}Log out
            </button>
          </div>
        )}
      </div>
    </div>
  </header>
);
}

export default Header;
