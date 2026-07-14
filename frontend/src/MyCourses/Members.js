import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faUserMinus,
} from "@fortawesome/free-solid-svg-icons";
import { useOutletContext } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Members.css";

const nameFor = (member) =>
  member.student_name?.trim() ||
  member.student_username ||
  "Unknown User";

const initials = (name) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

function Members() {
  const { courseId, course } = useOutletContext();
  const { user } = useAuth();

  const [members, setMembers] = useState([]);

  const [settings, setSettings] = useState({
    comments: true,
    files: true,
  });

  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const isTeacher =
    String(course?.teacher) === String(user?.id);

  const loadMembers = useCallback(async () => {
    try {
      const data = await api.enrollments();

      setMembers(
        data.filter(
          (item) => String(item.course) === String(courseId)
        )
      );
    } catch (err) {
      setMessage(err.message);
    }
  }, [courseId]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    setSettings({
      comments:
        course?.allow_student_comments !== false,
      files:
        course?.allow_student_file_sharing !== false,
    });
  }, [course]);

  const visible = useMemo(() => {
    return members.filter((member) =>
      `${nameFor(member)} ${
        member.student_email || ""
      }`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [members, search]);

  const updatePermission = async (
    member,
    field,
    value
  ) => {
    if (
      (field === "can_share_files" && !settings.files) ||
      (field === "can_comment" && !settings.comments)
    ) {
      return;
    }
    setMembers((items) =>
      items.map((item) =>
        item.id === member.id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );

    try {
      await api.updateEnrollment(member.id, {
        [field]: value,
      });
    } catch (err) {
      setMessage(err.message);
      await loadMembers();
    }
  };

  const remove = async (member) => {
    if (
      !window.confirm(
        `Remove ${nameFor(
          member
        )} from this course?`
      )
    )
      return;

    try {
      await api.removeStudent(member.id);

      setMembers((items) =>
        items.filter(
          (item) => item.id !== member.id
        )
      );
    } catch (err) {
      setMessage(err.message);
    }
  };

  const updateClassSetting = async (
    field,
    value
  ) => {
    const previous = settings;

    const next = {
      ...settings,
      [field]: value,
    };

    setSettings(next);
    setBusy(true);

    const enrollmentField =
      field === "comments"
        ? "can_comment"
        : "can_share_files";

    setMembers((items) =>
      items.map((item) => ({
        ...item,
        [enrollmentField]: value,
      }))
    );

    try {
      await api.updateCourse(courseId, {
        allow_student_comments: next.comments,
        allow_student_file_sharing: next.files,
      });

      await Promise.all(
        members.map((member) =>
          api.updateEnrollment(member.id, {
            [enrollmentField]: value,
          })
        )
      );

      await loadMembers();
    } catch (err) {
      setSettings(previous);
      setMessage(err.message);
      await loadMembers();
    } finally {
      setBusy(false);
    }
  };

  if (!isTeacher) {
    return (
      <div className="page-state">
        Only the course teacher can manage
        members.
      </div>
    );
  }
    
  return (
  <section className="members-page">
    <div className="members-header">
      <div>
        <h1>Course Members Management</h1>

        <span>
          {members.length} enrolled student
          {members.length === 1 ? "" : "s"}
        </span>
      </div>

      <label className="members-search">

        <FontAwesomeIcon icon={faMagnifyingGlass} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search students"
        />
      </label>
    </div>

    {message && (
      <div className="form-message error">
        {message}
      </div>
    )}

    {/* ================= CLASS SETTINGS ================= */}

    <section className="members-class-settings">
      <strong>Course Defaults</strong>

      <div className="members-class-settings__toggles">
        <label className="toggle-label">
          <span>Allow student comments</span>
          <span className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.comments}
              disabled={busy}
              onChange={(e) =>
                updateClassSetting(
                  "comments",
                  e.target.checked
                )
              }
            />
            <span className="slider"></span>
          </span>
        </label>

        <label className="toggle-label">
          <span> Allow student file sharing</span>
          <span className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.files}
              disabled={busy}
              onChange={(e) =>
                updateClassSetting(
                  "files",
                  e.target.checked
                )
              }
            />

            <span className="slider"></span>
          </span>
        </label>
      </div>
    </section>

    {/* ================= MEMBER LIST ================= */}
    <div className="members-list">
      {visible.map((member) => (
        <article
          className="member-card"
          key={member.id}
        >

          <div className="member-profile">
            <span>
              {initials(nameFor(member))}
            </span>

            <div>
              <h2>{nameFor(member)}</h2>

              <p>
                {member.student_email ||
                  "No email address"}
              </p>


              <small>
                Joined{" "}
                {new Date(
                  member.enrolled_at
                ).toLocaleDateString()}
              </small>
            </div>
          </div>

          {/* ================= Permissions ================= */}
          <div className="member-permissions">
            <label className="permission-toggle">
              <span>
                Comments
              </span>

              <span className="toggle-switch small">

                <input
                  type="checkbox"
                  checked={
                    settings.comments &&
                    member.can_comment
                  }
                  disabled={!settings.comments}
                  onChange={(e) =>
                    updatePermission(
                      member,
                      "can_comment",
                      e.target.checked
                    )
                  }
                />
                <span className="slider"></span>
              </span>
            </label>



            <label className="permission-toggle">
              <span>File Sharing</span>
              <span className="toggle-switch small">
                <input
                  type="checkbox"
                  checked={
                    settings.files &&
                    member.can_share_files
                  }
                  disabled={!settings.files}
                  onChange={(e) =>
                    updatePermission(
                      member,
                      "can_share_files",
                      e.target.checked
                    )
                  }
                />
                <span className="slider"></span>
              </span>
            </label>
          </div>

          <button
            className="member-remove"
            onClick={() => remove(member)}
          >

            <FontAwesomeIcon
              icon={faUserMinus}
            />
            Remove
          </button>
        </article>

      ))}
    </div>

    {!visible.length && (
      <div className="page-state">
        No enrolled students match your
        search.
      </div>
    )}
  </section>
);
}

export default Members;
