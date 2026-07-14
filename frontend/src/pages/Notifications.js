import React, { useCallback, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCheckDouble } from "@fortawesome/free-solid-svg-icons";
import { api } from "../services/api";
import "./Notifications.css";

function Notifications() {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try { setItems(await api.notifications()); }
    catch (err) { setMessage(err.message); }
  }, []);
  useEffect(() => { load().then(async () => { try { await api.markAllNotificationsRead(); window.dispatchEvent(new Event("notifications:changed")); setItems((current) => current.map((item) => ({ ...item, is_read: true }))); } catch { } }); }, [load]);

  const markRead = async (item) => {
    if (item.is_read) return;
    try {
      await api.markNotificationRead(item.id);
      window.dispatchEvent(new Event("notifications:changed"));
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, is_read: true } : entry));
    } catch (err) { setMessage(err.message); }
  };
  const markAllRead = async () => {
    try { await api.markAllNotificationsRead(); window.dispatchEvent(new Event("notifications:changed")); setItems((current) => current.map((item) => ({ ...item, is_read: true }))); }
    catch (err) { setMessage(err.message); }
  };

return (
  <section className="notifications-page">
    <div className="notifications-header">
      <div>
        <h1>Notifications</h1>
      </div>

      <button
        onClick={markAllRead}
        disabled={!items.some((item) => !item.is_read)}
      >
        <FontAwesomeIcon icon={faCheckDouble} />
        {" "}Mark all read
      </button>
    </div>

    {message && (
      <div className="form-message error">
        {message}
      </div>
    )}

    {!items.length ? (
      <div className="notifications-empty">
        <FontAwesomeIcon icon={faBell} />
        <p>You have no notifications yet.</p>
      </div>
    ) : (
      <div className="notifications-list">
        {items.map((item) => (
          <button
            key={item.id}
            className={`notification-item ${
              item.is_read ? "" : "notification-item--unread"
            }`}
            onClick={() => markRead(item)}
          >
            <span className="notification-dot" />

            <div>
              <strong>{item.course_name || "Classroom"}</strong>
              <p>{item.message}</p>
              <small>
                {new Date(item.created_at).toLocaleString()}
              </small>
            </div>

            {!item.is_read && <em>New</em>}
          </button>
        ))}
      </div>
    )}
  </section>
);
}

export default Notifications;
