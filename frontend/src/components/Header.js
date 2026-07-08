import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faMoon,
  faSun,
  faUser,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";

import "./Header.css";
import logo from "./logo.png";
import { useAuth } from "../context/AuthContext";

function Header({ darkMode, setDarkMode }) {

  const [query, setQuery] = useState("");
  const { user } = useAuth();

  const clearSearch = () => {
    setQuery("");
  };

  return (
    <header className="header">
      <div className="header-right">
                <div className="sidebar-brand">
                  <img src={logo} alt="Academy LMS Logo" className="sidebar-logo" />
                  <h2>Academy</h2>
                </div>

        <div className="search-area">
          <button
            type="submit"
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
            name="q"
            placeholder="Search the classes"
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={(e) => (e.target.placeholder = "")}
            onBlur={(e) =>
              (e.target.placeholder = "Search the classes")
            }
          />

          {query && (
            <button
              type="button"
              className="clear-btn-input"
              onClick={clearSearch}
            >
              &times;
            </button>
          )}

        </div>

      </div>

      <div className="header-left">

        <button
          className="theme-btn"
          onClick={() => setDarkMode(!darkMode)}
        >
          <span className="icon">
            <FontAwesomeIcon
              icon={darkMode ? faSun : faMoon}
              size="lg"
            />
          </span>
        </button>

        <button className="theme-btn" title={user?.username || "Profile"}>
          <span className="icon">
            <FontAwesomeIcon icon={faUser} size="lg" />
          </span>
        </button>

      </div>
    </header>
  );
}

export default Header;
