// Sidebar.jsx
import React, { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faGraduationCap,
    faBook,
    faClipboard,
    faArrowRightFromBracket,
    faPlus,
    faCircleUser,
    faBell,
} from "@fortawesome/free-solid-svg-icons";

import "./Sidebar.css";
import logo from "./logo.png";
import { api } from "../services/api";

function Sidebar({ openCreateModal, openJoinModal, onLogoutRequest }) {
    const [unreadCount, setUnreadCount] = useState(0);
    const loadUnread = useCallback(async () => {
        try { setUnreadCount((await api.notifications()).filter((item) => !item.is_read).length); } catch { setUnreadCount(0); }
    }, []);
    useEffect(() => {
        loadUnread();
        const refresh = () => loadUnread();
        window.addEventListener("notifications:changed", refresh);
        const interval = window.setInterval(loadUnread, 30000);
        return () => { window.removeEventListener("notifications:changed", refresh); window.clearInterval(interval); };
    }, [loadUnread]);

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
                    <NavLink to="/notifications">
                        <button>
                            <span className="icon">
                                <FontAwesomeIcon icon={faBell} />
                            </span>

                            Notifications {unreadCount > 0 && <span className="notification-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>}
                        </button>
                    </NavLink>

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

                    <button onClick={onLogoutRequest}>
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
