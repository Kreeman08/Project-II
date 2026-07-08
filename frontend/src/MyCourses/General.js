import React, { useCallback, useEffect, useRef, useState } from "react";
import { faEraser, faFilePdf, faPaperclip, faPlus, faReply, faUser, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useOutletContext } from "react-router-dom";
import { api } from "../services/api";
import "./General.css";

function displayName(item) {
  return item.author_name?.trim() || item.author_username || "Class member";
}

function General() {
  const { courseId, course } = useOutletContext();
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");
  const [replyText, setReplyText] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [attachedFile, setAttachedFile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef();

  const loadPosts = useCallback(async () => {
    try {
      const data = await api.coursePosts();
      setPosts(data.filter((post) => String(post.course) === String(courseId)));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }, [courseId]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleErase = () => {
    setMessage("");
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCreatePost = async () => {
    if (!message.trim() && !attachedFile) return;
    const formData = new FormData();
    formData.append("course", courseId);
    formData.append("text", message);
    if (attachedFile) formData.append("file", attachedFile);

    setBusy(true);
    try {
      await api.createCoursePost(formData);
      handleErase();
      setShowPopup(false);
      loadPosts();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleReply = async (postId) => {
    const text = replyText[postId]?.trim();
    if (!text) return;

    try {
      await api.createCoursePostReply({ post: postId, text });
      setReplyText({ ...replyText, [postId]: "" });
      setReplyingTo(null);
      loadPosts();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="noticeboard">
      <div className="noticeboard-header">
        <div>
          <h1>Noticeboard</h1>
          {/* <p>{course?.name || "Class"} discussion</p> */}
        </div>
      </div>

      {error && <div className="form-message error">{error}</div>}

      <div className="posts-wrapper">
        {posts.length === 0 && <div className="page-state">No post yet.</div>}

        {posts.map((post) => (
          <div className="post-card" key={post.id}>
            <div className="post-top">
              <div className="post-user">
                <div className="user-icon">
                  <FontAwesomeIcon icon={faUser} />
                </div>
                <div>
                  <h3>{displayName(post)}</h3>
                  <p>{new Date(post.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <p className="post-text">{post.text}</p>

            {post.file && (
              <a className="file-box" href={post.file} target="_blank" rel="noreferrer">
                <FontAwesomeIcon icon={faFilePdf} className="pdf-icon" />
                <span>{post.file.split("/").pop()}</span>
              </a>
            )}

            {post.replies.map((reply) => (
              <div className="reply-box" key={reply.id}>
                <div className="reply-user-icon">
                  <FontAwesomeIcon icon={faUser} />
                </div>
                <div>
                  <h4>{displayName(reply)}</h4>
                  <p>{reply.text}</p>
                </div>
              </div>
            ))}

            {replyingTo === post.id && (
              <div className="reply-form">
                <input
                  value={replyText[post.id] || ""}
                  onChange={(event) => setReplyText({ ...replyText, [post.id]: event.target.value })}
                  placeholder="Write a reply..."
                />
                <button onClick={() => handleReply(post.id)}>Reply</button>
              </div>
            )}

            <div className="post-actions">
              <button onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}>
                <FontAwesomeIcon icon={faReply} />
                Reply
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="floating-btn" onClick={() => setShowPopup(true)}>
        <FontAwesomeIcon icon={faPlus} />
      </button>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <button className="close-btn" onClick={() => setShowPopup(false)}>
              <FontAwesomeIcon icon={faXmark} />
            </button>

            <h2>Create Post</h2>
            <textarea
              placeholder="Share a question or comment with the class..."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />

            {attachedFile && (
              <div className="attached-file">
                <FontAwesomeIcon icon={faPaperclip} />
                <span>{attachedFile.name}</span>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              className="hidden-input"
              onChange={(event) => setAttachedFile(event.target.files[0])}
            />

            <div className="popup-actions">
              <button className="erase-btn" onClick={handleErase}>
                <FontAwesomeIcon icon={faEraser} />
                Erase
              </button>

              <div className="right-actions">
                <button className="attach-btn" onClick={() => fileInputRef.current.click()}>
                  <FontAwesomeIcon icon={faPaperclip} />
                  Attach
                </button>

                <button className="post-btn" onClick={handleCreatePost} disabled={busy}>
                  {busy ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default General;
