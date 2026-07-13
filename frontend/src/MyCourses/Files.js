import React, { useCallback, useEffect, useRef, useState } from "react";
import { faDownload, faEllipsisVertical, faFile, faPen, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useOutletContext } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Files.css";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const allowed = /\.(pdf|doc|docx|ppt|pptx|xls|xlsx|txt|csv|zip|png|jpe?g|gif)$/i;
const readableSize = (bytes) => bytes ? bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB` : "0 KB";

function Files() {
  const { courseId, course } = useOutletContext();
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [sort, setSort] = useState("newest");
  const [activeMenu, setActiveMenu] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [enrollment, setEnrollment] = useState(null);
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);
  const isTeacherForCourse = String(course?.teacher) === String(user?.id);
  const canUpload = isTeacherForCourse || Boolean(
    course?.allow_student_file_sharing !== false && enrollment?.can_share_files
  );

  const loadMaterials = useCallback(async () => {
    try {
      const [materialData, enrollmentData] = await Promise.all([api.materials(), api.enrollments()]);
      setMaterials(materialData.filter((item) => String(item.course) === String(courseId)));
      setEnrollment(enrollmentData.find((item) => String(item.course) === String(courseId) && String(item.student) === String(user?.id)) || null);
    }
    catch (err) { setMessage(err.message); }
  }, [courseId, user?.id]);
  useEffect(() => { loadMaterials(); }, [loadMaterials]);
  useEffect(() => {
    const close = (event) => { if (menuRef.current && !menuRef.current.contains(event.target)) setActiveMenu(null); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const upload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const invalid = files.find((file) => !allowed.test(file.name) || file.size > MAX_FILE_SIZE);
    if (invalid) { setMessage(`“${invalid.name}” is not supported or is larger than 10 MB.`); event.target.value = ""; return; }
    setUploading(true); setMessage("");
    try {
      for (const [index, file] of files.entries()) {
        setUploadProgress(`Uploading ${index + 1} of ${files.length}: ${file.name}`);
        const data = new FormData(); data.append("course", courseId); data.append("title", file.name); data.append("file", file);
        await api.createMaterial(data);
      }
      await loadMaterials(); setMessage(`${files.length} file${files.length === 1 ? "" : "s"} uploaded successfully.`);
    } catch (err) { setMessage(err.message); }
    finally { setUploading(false); setUploadProgress(""); event.target.value = ""; }
  };
  const download = async (material) => {
    try {
      if (material.file) await api.downloadMaterial(material.id, material.title);
      else if (material.link) window.open(material.link, "_blank", "noopener,noreferrer");
      setActiveMenu(null);
    } catch (err) { setMessage(err.message); }
  };
  const open = (material) => { if (material.link) window.open(material.link, "_blank", "noopener,noreferrer"); else download(material); };
  const rename = async (material) => {
    const title = window.prompt("Rename file", material.title);
    if (!title || title.trim() === material.title) return;
    try { await api.updateMaterial(material.id, { title: title.trim() }); await loadMaterials(); setActiveMenu(null); }
    catch (err) { setMessage(err.message); }
  };
  const remove = async (material) => {
    if (!window.confirm(`Delete “${material.title}”?`)) return;
    try { await api.deleteMaterial(material.id); await loadMaterials(); setActiveMenu(null); }
    catch (err) { setMessage(err.message); }
  };
  const ordered = [...materials].sort((a, b) => sort === "newest" ? new Date(b.uploaded_at) - new Date(a.uploaded_at) : new Date(a.uploaded_at) - new Date(b.uploaded_at));

  return <div className="modules-page"><div className="modules-top"><div><h2>Resources</h2><p className="resources-help">Class files shared by your teacher and classmates.</p></div><div className="sort-box"><label htmlFor="fileSort">Sort by:</label><select id="fileSort" value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Newest First</option><option value="oldest">Oldest First</option></select></div></div>
    {message && <div className={message.includes("successfully") ? "form-message success" : "form-message error"}>{message}</div>}{uploading && <div className="upload-progress" role="status">{uploadProgress}</div>}
    {!ordered.length && <div className="page-state">No files have been shared with this class yet.</div>}
    <div className="module-grid">{ordered.map((material) => <article key={material.id} className="module-card" onClick={() => open(material)}><div className="module-card-top"><div className="module-icon-box"><FontAwesomeIcon icon={faFile} className="file-icon" /></div><div className="menu-wrapper" ref={activeMenu === material.id ? menuRef : null} onClick={(event) => event.stopPropagation()}><button className="dots-btn" aria-label="File actions" onClick={() => setActiveMenu(activeMenu === material.id ? null : material.id)}><FontAwesomeIcon icon={faEllipsisVertical} /></button>{activeMenu === material.id && <div className="popup-menu"><button onClick={() => download(material)}><FontAwesomeIcon icon={faDownload} /> Download</button>{isTeacherForCourse && <><button onClick={() => rename(material)}><FontAwesomeIcon icon={faPen} /> Rename</button><button className="delete-btn" onClick={() => remove(material)}><FontAwesomeIcon icon={faTrash} /> Delete</button></>}</div>}</div></div><h3 title={material.title}>{material.title}</h3><p>{new Date(material.uploaded_at).toLocaleDateString()} • {material.file ? (material.file_type || "File") : "Link"}</p><p className="material-meta">{material.file ? readableSize(material.file_size) : "External resource"} • {material.uploaded_by_name?.trim() || material.uploaded_by_username || "Teacher"}</p></article>)}</div>
    {canUpload && <><input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.zip,.png,.jpg,.jpeg,.gif" style={{ display: "none" }} onChange={upload} /><button className="floating-btn" disabled={uploading} onClick={() => fileInputRef.current?.click()} aria-label="Upload files"><FontAwesomeIcon icon={faPlus} /></button></>}
  </div>;
}

export default Files;
