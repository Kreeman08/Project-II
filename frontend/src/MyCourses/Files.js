import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  faDownload,
  faEllipsisVertical,
  faFile,
  faPen,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useOutletContext } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Files.css";

function Files() {
  const [activeMenu, setActiveMenu] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [sort, setSort] = useState("newest");
  const [message, setMessage] = useState("");

  const menuRef = useRef(null);
  const fileInputRef = useRef(null);

  const { courseId, course } = useOutletContext();
  const { user } = useAuth();

  const isTeacherForCourse =
    String(course?.teacher) === String(user?.id);

  const loadMaterials = useCallback(async () => {
    try {
      const data = await api.materials();

      setMaterials(
        data.filter(
          (item) =>
            String(item.course) === String(courseId)
        )
      );

      setMessage("");
    } catch (err) {
      setMessage(err.message);
    }
  }, [courseId]);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setActiveMenu(null);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  const sortedMaterials = [...materials].sort(
    (a, b) => {
      const left = new Date(
        a.uploaded_at
      ).getTime();

      const right = new Date(
        b.uploaded_at
      ).getTime();

      return sort === "newest"
        ? right - left
        : left - right;
    }
  );

  const fileUrl = (material) =>
    material.file || material.link;

  const openMaterial = (material) => {
    const url = fileUrl(material);

    if (url) {
      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };
// const openMaterial = (material) => {
//   if (!material?.id) return;

//   const url = `${process.env.REACT_APP_API_URL}/materials/view/${material.id}/`;

//   window.open(url, "_blank");
// };
  const handleFilesSelected = async (
    event
  ) => {
    const selectedFiles = Array.from(
      event.target.files || []
    );

    if (!selectedFiles.length) return;

    try {
      for (const currentFile of selectedFiles) {
        const formData = new FormData();

        formData.append(
          "course",
          courseId
        );

        formData.append(
          "title",
          currentFile.name
        );

        formData.append(
          "file",
          currentFile
        );

        await api.createMaterial(formData);
      }

      await loadMaterials();

      setMessage("");
    } catch (err) {
      setMessage(err.message);
    }

    event.target.value = "";
  };

  const handleRename = async (
    material
  ) => {
    const nextTitle =
      window.prompt(
        "Rename file",
        material.title
      );

    if (
      !nextTitle ||
      nextTitle.trim() === material.title
    ) {
      return;
    }

    try {
      await api.updateMaterial(
        material.id,
        {
          title: nextTitle.trim(),
        }
      );

      setActiveMenu(null);
      loadMaterials();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleDelete = async (
    material
  ) => {
    if (
      !window.confirm(
        `Delete "${material.title}"?`
      )
    ) {
      return;
    }

    try {
      await api.deleteMaterial(
        material.id
      );

      setActiveMenu(null);
      loadMaterials();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="modules-page">
      {/* TOP BAR */}

      <div className="modules-top">
        <h2>Resources</h2>

        <div className="sort-box">
          <label htmlFor="fileSort">
            Sort by:
          </label>

          <select
            id="fileSort"
            value={sort}
            onChange={(e) =>
              setSort(e.target.value)
            }
          >
            <option value="newest">
              Newest First
            </option>

            <option value="oldest">
              Oldest First
            </option>
          </select>
        </div>
      </div>

      {/* ERROR */}

      {message && (
        <div className="form-message error">
          {message}
        </div>
      )}

      {/* EMPTY */}

      {sortedMaterials.length === 0 && (
        <div className="page-state">
          No files uploaded yet.
        </div>
      )}

      {/* FILE GRID */}

      <div className="module-grid">
        {sortedMaterials.map(
          (material) => (
            <div
              key={material.id}
              className="module-card"
              onClick={() =>
                openMaterial(material)
              }
            >
              <div className="module-card-top">
                <div className="module-icon-box">
                  <FontAwesomeIcon
                    icon={faFile}
                    className="file-icon"
                  />
                </div>

                <div
                  className="menu-wrapper"
                  ref={
                    activeMenu ===
                    material.id
                      ? menuRef
                      : null
                  }
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                >
                  <button
                    className="dots-btn"
                    onClick={() =>
                      setActiveMenu(
                        activeMenu ===
                          material.id
                          ? null
                          : material.id
                      )
                    }
                  >
                    <FontAwesomeIcon
                      icon={
                        faEllipsisVertical
                      }
                    />
                  </button>

                  {activeMenu ===
                    material.id && (
                    <div className="popup-menu">
                      <button
                        onClick={() =>
                          openMaterial(
                            material
                          )
                        }
                      >
                        <FontAwesomeIcon
                          icon={
                            faDownload
                          }
                        />
                        Download
                      </button>

                      {isTeacherForCourse && (
                        <>
                          <button
                            onClick={() =>
                              handleRename(
                                material
                              )
                            }
                          >
                            <FontAwesomeIcon
                              icon={faPen}
                            />
                            Rename
                          </button>

                          <button
                            className="delete-btn"
                            onClick={() =>
                              handleDelete(
                                material
                              )
                            }
                          >
                            <FontAwesomeIcon
                              icon={
                                faTrash
                              }
                            />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <h3>
                {material.title}
              </h3>

              <p>
                {new Date(
                  material.uploaded_at
                ).toLocaleDateString()}
                {" • "}
                {material.file
                  ? "File"
                  : "Link"}
              </p>
            </div>
          )
        )}
      </div>

      {/* HIDDEN FILE INPUT */}

      {isTeacherForCourse && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{
              display: "none",
            }}
            onChange={
              handleFilesSelected
            }
          />

          <button
            className="floating-btn"
            onClick={() =>
              fileInputRef.current?.click()
            }
          >
            <FontAwesomeIcon
              icon={faPlus}
            />
          </button>
        </>
      )}
    </div>
  );
}

export default Files;