import React, { useCallback, useEffect, useRef, useState } from "react";
import { faEraser, faFilePdf, faPaperclip, faPen, faPlus, faReply, faRightFromBracket, faTrash, faUser, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useOutletContext } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./General.css";

const displayName = (item) => item.author_name?.trim() || item.author_username || "Unknown User";

function General() {
  const { courseId, course } = useOutletContext();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");
  const [replyText, setReplyText] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [attachedFile, setAttachedFile] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState("");
  const [leaveStatus, setLeaveStatus] = useState(null);
  const [leaveRequestId, setLeaveRequestId] = useState(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showCancelLeaveConfirm, setShowCancelLeaveConfirm] = useState(false);
  const [leaveBusy, setLeaveBusy] = useState(false);
  const [leaveNotice, setLeaveNotice] = useState("");
  const fileInputRef = useRef();
  const isTeacher = String(course?.teacher) === String(user?.id);
  const canComment = isTeacher || course?.allow_student_comments !== false;
  const canShareFiles = isTeacher || course?.allow_student_file_sharing !== false;
  const isStudent = Boolean(user) && !isTeacher;

  const loadPosts = useCallback(async () => {
    try { setPosts((await api.coursePosts()).filter((post) => String(post.course) === String(courseId))); setError(""); }
    catch (err) { setError(err.message); }
  }, [courseId]);
  useEffect(() => {
    loadPosts();
    window.addEventListener("comments:changed", loadPosts);
    return () => window.removeEventListener("comments:changed", loadPosts);
  }, [loadPosts]);
  const loadLeaveStatus = useCallback(async () => {
    if (!isStudent) return;
    try {
      const requests = await api.leaveCourseRequests();
      const request = requests.filter((item) => String(item.course) === String(courseId)).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
      setLeaveStatus(request?.status || null);
      setLeaveRequestId(request?.id || null);
    } catch (err) { setError(err.message); }
  }, [courseId, isStudent]);
  useEffect(() => { loadLeaveStatus(); }, [loadLeaveStatus]);
  const changed = () => window.dispatchEvent(new Event("comments:changed"));

  const erase = () => { setMessage(""); setAttachedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; };
  const createPost = async () => {
    if (!message.trim() && !attachedFile) return;
    const formData = new FormData();
    formData.append("course", courseId); formData.append("text", message);
    if (attachedFile) formData.append("file", attachedFile);
    setBusy(true);
    try { await api.createCoursePost(formData); erase(); setShowPopup(false); changed(); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  const reply = async (postId) => {
    const text = replyText[postId]?.trim(); if (!text) return;
    setBusy(true);
    try { await api.createCoursePostReply({ post: postId, text }); setReplyText({ ...replyText, [postId]: "" }); setReplyingTo(null); changed(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  const beginEdit = (type, item) => { setEditing({ type, id: item.id }); setEditText(item.text); };
  const saveEdit = async () => {
    if (!editing || !editText.trim()) return;
    setBusy(true);
    try {
      if (editing.type === "post") await api.updateCoursePost(editing.id, { text: editText.trim() });
      else await api.updateCoursePostReply(editing.id, { text: editText.trim() });
      setEditing(null); setEditText(""); changed();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  const remove = async (type, item) => {
    if (!window.confirm(`Delete this ${type}?`)) return;
    setBusy(true);
    try { if (type === "post") await api.deleteCoursePost(item.id); else await api.deleteCoursePostReply(item.id); changed(); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  const canManage = (item) => isTeacher || String(item.author) === String(user?.id);
  const submitLeaveCourseRequest = async () => {
    setLeaveBusy(true); setLeaveNotice("");
    try {
      const request = await api.createLeaveCourseRequest(courseId);
      setLeaveStatus("pending");
      setLeaveRequestId(request.id);
      setShowLeaveConfirm(false);
      setLeaveNotice("Your leave course request was sent to the teacher.");
      window.dispatchEvent(new Event("notifications:changed"));
    } catch (err) { setLeaveNotice(err.message); }
    finally { setLeaveBusy(false); }
  };
  const cancelLeaveCourseRequest = async () => {
    if (!leaveRequestId) return;
    setLeaveBusy(true); setLeaveNotice("");
    try {
      await api.cancelLeaveCourseRequest(leaveRequestId);
      setLeaveStatus(null); setLeaveRequestId(null);
      setShowCancelLeaveConfirm(false);
      setLeaveNotice("Your leave request was cancelled.");
    } catch (err) { setLeaveNotice(err.message); }
    finally { setLeaveBusy(false); }
  };

  return <section className="noticeboard">
    <div className="noticeboard-header"><div><h1>Notice Board</h1><p>{course?.name || "Class"} announcements and discussion</p></div>{isStudent && <div className="leave-course-control">{leaveStatus === "pending" ? <><span className="leave-course-pending">Leave Request Pending</span><button className="leave-course-button leave-course-button--cancel" onClick={() => setShowCancelLeaveConfirm(true)}>Cancel Leave Request</button></> : <><button className="leave-course-button" onClick={() => setShowLeaveConfirm(true)}><FontAwesomeIcon icon={faRightFromBracket} /> Leave Class</button>{leaveStatus && <small className={`leave-course-current leave-course-current--${leaveStatus}`}>Last request: {leaveStatus}</small>}</>}</div>}</div>
    {error && <div className="form-message error">{error}</div>}
    {leaveNotice && <div className={leaveNotice.includes("sent") ? "form-message success" : "form-message error"}>{leaveNotice}</div>}
    {!canComment && <div className="noticeboard-disabled">Comments are currently disabled by the teacher. Existing posts remain available to read.</div>}
    <div className="posts-wrapper">{posts.length === 0 && <div className="page-state">No posts yet.</div>}{posts.map((post) => <article className="post-card" key={post.id}><div className="post-top"><div className="post-user"><div className="user-icon"><FontAwesomeIcon icon={faUser} /></div><div><h3>{displayName(post)}</h3><p>{new Date(post.created_at).toLocaleString()}</p></div></div>{canManage(post) && <div className="comment-manage"><button onClick={() => beginEdit("post", post)} aria-label="Edit comment"><FontAwesomeIcon icon={faPen} /></button><button onClick={() => remove("post", post)} aria-label="Delete comment"><FontAwesomeIcon icon={faTrash} /></button></div>}</div>{editing?.type === "post" && editing.id === post.id ? <div className="comment-editor"><textarea value={editText} onChange={(event) => setEditText(event.target.value)} /><button disabled={busy} onClick={saveEdit}>Save</button><button onClick={() => setEditing(null)}>Cancel</button></div> : <p className="post-text">{post.text}</p>}{post.file && <a className="file-box" href={post.file} target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faFilePdf} className="pdf-icon" /><span>{post.file.split("/").pop()}</span></a>}{post.replies.map((item) => <div className="reply-box" key={item.id}><div className="reply-user-icon"><FontAwesomeIcon icon={faUser} /></div><div className="reply-content"><div className="reply-heading"><h4>{displayName(item)}</h4><small>{new Date(item.created_at).toLocaleString()}</small>{canManage(item) && <span className="comment-manage"><button onClick={() => beginEdit("reply", item)} aria-label="Edit reply"><FontAwesomeIcon icon={faPen} /></button><button onClick={() => remove("reply", item)} aria-label="Delete reply"><FontAwesomeIcon icon={faTrash} /></button></span>}</div>{editing?.type === "reply" && editing.id === item.id ? <div className="comment-editor"><textarea value={editText} onChange={(event) => setEditText(event.target.value)} /><button disabled={busy} onClick={saveEdit}>Save</button><button onClick={() => setEditing(null)}>Cancel</button></div> : <p>{item.text}</p>}</div></div>)}{canComment && replyingTo === post.id && <div className="reply-form"><input value={replyText[post.id] || ""} onChange={(event) => setReplyText({ ...replyText, [post.id]: event.target.value })} placeholder="Write a reply..." /><button disabled={busy} onClick={() => reply(post.id)}>Reply</button></div>}{canComment && <div className="post-actions"><button onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}><FontAwesomeIcon icon={faReply} /> Reply</button></div>}</article>)}</div>
    {canComment && <button className="floating-btn" onClick={() => setShowPopup(true)} aria-label="Create post"><FontAwesomeIcon icon={faPlus} /></button>}
    {showPopup && <div className="popup-overlay"><div className="popup-box"><button className="close-btn" onClick={() => setShowPopup(false)} aria-label="Close"><FontAwesomeIcon icon={faXmark} /></button><h2>Create Post</h2><textarea placeholder="Share an announcement or question with the class..." value={message} onChange={(event) => setMessage(event.target.value)} />{attachedFile && <div className="attached-file"><FontAwesomeIcon icon={faPaperclip} /><span>{attachedFile.name}</span></div>}<input type="file" ref={fileInputRef} className="hidden-input" onChange={(event) => setAttachedFile(event.target.files[0])} /><div className="popup-actions"><button className="erase-btn" onClick={erase}><FontAwesomeIcon icon={faEraser} /> Erase</button><div className="right-actions">{canShareFiles && <button className="attach-btn" onClick={() => fileInputRef.current?.click()}><FontAwesomeIcon icon={faPaperclip} /> Attach</button>}<button className="post-btn" onClick={createPost} disabled={busy}>{busy ? "Posting..." : "Post"}</button></div></div></div></div>}
    {showLeaveConfirm && <div className="popup-overlay"><div className="leave-course-dialog" role="dialog" aria-modal="true"><h2>Leave Class</h2><p>Are you sure you want to leave this class? Your request will be sent to the teacher for approval.</p><div><button onClick={() => setShowLeaveConfirm(false)} disabled={leaveBusy}>Cancel</button><button className="leave-course-dialog__confirm" onClick={submitLeaveCourseRequest} disabled={leaveBusy}>{leaveBusy ? "Sending…" : "Send request"}</button></div></div></div>}
    {showCancelLeaveConfirm && <div className="popup-overlay"><div className="leave-course-dialog" role="dialog" aria-modal="true"><h2>Cancel Leave Request</h2><p>Are you sure you want to cancel your pending leave request?</p><div><button onClick={() => setShowCancelLeaveConfirm(false)} disabled={leaveBusy}>Keep request</button><button className="leave-course-dialog__confirm" onClick={cancelLeaveCourseRequest} disabled={leaveBusy}>{leaveBusy ? "Cancelling…" : "Cancel request"}</button></div></div></div>}
  </section>;
}

export default General;
