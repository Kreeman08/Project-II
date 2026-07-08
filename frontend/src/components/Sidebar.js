// Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faGraduationCap,
    faBook,
    faClipboard,
    faCircleQuestion,
    faArrowRightFromBracket,
    faPlus,
    faCircleUser,
} from "@fortawesome/free-solid-svg-icons";

import "./Sidebar.css";
import logo from "./logo.png";
import { useAuth } from "../context/AuthContext";

function Sidebar({ openCreateModal, openJoinModal }) {
    const { logout } = useAuth();

    return (
        <aside className="sidebar">

            <div className="top">

                <div className="sidebar-brand">

  <img src={logo} alt="Academy LMS Logo" className="sidebar-logo" />

  <h2>Academy</h2>

</div>

                <div className="menu">

                    <NavLink to="/">
                        <button>
                            <span className="icon">
                                <FontAwesomeIcon icon={faGraduationCap} />
                            </span>

                            My Classes
                        </button>
                    </NavLink>

                    <NavLink to="/myassignments">
                        <button>
                            <span className="icon"><FontAwesomeIcon icon={faBook} /></span>
                            My Assignments
                        </button>
                    </NavLink>

                    <NavLink to="/myassessments">
                        <button>
                            <span className="icon">
                                <FontAwesomeIcon icon={faClipboard} />
                            </span>
                            My Assessments
                        </button>
                    </NavLink>
{/* 
                    <NavLink to="/notifications">
                        <button>
                            <span className="icon">
                                <FontAwesomeIcon icon={faBell} />
                            </span>

                            Notifications
                        </button>
                    </NavLink> */}

                </div>
            </div>

            <div className="bottom">

                {/* CREATE CLASS */}
                <button
                    className="create-btn"
                    onClick={openCreateModal}
                >
                    <span className="icon">
                        <FontAwesomeIcon icon={faPlus} />
                    </span>  Create Class
                </button>

                {/* JOIN CLASS */}
                <button
                    className="create-btn"
                    onClick={openJoinModal}
                >
                    <span className="icon">
                        <FontAwesomeIcon icon={faCircleUser} />
                    </span>  Join a Class
                </button>

                <div className="menu">
{/* 
                    <button>
                        <span className="icon">
                            <FontAwesomeIcon icon={faCircleQuestion} />
                        </span>

                        Help
                    </button> */}

                    <button onClick={logout}>
                        <span className="icon">
                            <FontAwesomeIcon
                                icon={faArrowRightFromBracket}
                            />
                        </span>

                        Logout
                    </button>

                </div>
            </div>

        </aside>
    );
}

export default Sidebar;
