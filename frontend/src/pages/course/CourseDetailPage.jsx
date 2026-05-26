import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  PencilSquareIcon,
  PlayIcon,
  PlusIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const tabs = [
  { id: 'general', label: 'General', icon: ChatBubbleLeftRightIcon },
  { id: 'files', label: 'Files', icon: PaperClipIcon },
  { id: 'assignments', label: 'Assignments', icon: DocumentTextIcon },
  { id: 'tests', label: 'Tests', icon: PencilSquareIcon },
];

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, user, getCourseRole, updateCourse } = useAuth();
  const course = state.courses.find((item) => item.id === id);
  const role = getCourseRole(course);
  const [activeTab, setActiveTab] = useState('general');
  const [notice, setNotice] = useState('');
  const [activeTestId, setActiveTestId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [postText, setPostText] = useState('');
  const [fileForm, setFileForm] = useState({ title: '', type: 'PDF', size: 'New upload' });
  const [openMenu, setOpenMenu] = useState({ id: null, x: 0, y: 0 });

  React.useEffect(() => {
    const onDocClick = (e) => {
      const el = e.target;
      if (!el) return;
      if (openMenu.id) {
        if (!el.closest || (!el.closest('.kebab-menu') && !el.closest('.kebab'))) {
          setOpenMenu({ id: null, x: 0, y: 0 });
        }
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [openMenu.id]);
  const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', deadline: '' });
  const [testForm, setTestForm] = useState({
    title: '',
    description: '',
    duration: 15,
    questions: [{ question: '', options: ['', '', '', ''], answer: 0 }],
  });

  const isTeacher = role === 'Teacher';

  const activeTest = useMemo(() => (
    course?.tests.find((test) => test.id === activeTestId)
  ), [activeTestId, course]);

  if (!course || !role) {
    return (
      <main className="course-empty">
        <section className="surface">
          <h1>Course not found</h1>
          <p>This class may not exist or your account does not have access.</p>
          <button className="primary-action compact" onClick={() => navigate('/courses')}>Back to courses</button>
        </section>
      </main>
    );
  }

  const mutateCourse = (updater) => updateCourse(course.id, updater);

  const addPost = (event) => {
    event.preventDefault();
    if (!postText.trim()) return;
    const nextPost = {
      id: `p-${Date.now()}`,
      author: user.name,
      role,
      text: postText.trim(),
      time: 'Just now',
      likes: 0,
      replies: [],
    };
    mutateCourse((current) => ({ ...current, posts: [nextPost, ...current.posts] }));
    setPostText('');
  };

  const likePost = (postId) => {
    mutateCourse((current) => ({
      ...current,
      posts: current.posts.map((post) => (post.id === postId ? { ...post, likes: post.likes + 1 } : post)),
    }));
  };

  const addFile = (event) => {
    event.preventDefault();
    if (!fileForm.title.trim() && !fileForm.file) return;

    const entry = {
      id: `f-${Date.now()}`,
      title: fileForm.title.trim() || (fileForm.file && fileForm.file.name) || 'Untitled',
      type: fileForm.type,
      size: fileForm.size || (fileForm.file ? `${Math.round(fileForm.file.size / 1024)} KB` : 'Unknown'),
      uploadedBy: user.name,
      fileData: fileForm.fileData || null,
    };

    mutateCourse((current) => ({
      ...current,
      files: [entry, ...current.files],
    }));

    setFileForm({ title: '', type: 'PDF', size: 'New upload', file: null, fileData: null });
    setNotice('Material uploaded.');
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFileForm((prev) => ({
        ...prev,
        title: prev.title || f.name,
        size: `${Math.round(f.size / 1024)} KB`,
        file: f,
        fileData: reader.result,
      }));
    };
    reader.readAsDataURL(f);
  };

  const viewFile = async (file) => {
    try {
      const href = file.fileData || file.url;
      if (!href) return;

      // If it's a data URL, convert to a Blob and open via object URL for better browser compatibility
      if (href.startsWith('data:')) {
        const res = await fetch(href);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        // If PDF, embed into a new window to avoid download behavior
        if (blob.type && blob.type.includes('pdf')) {
          console.debug('viewFile: created blob URL for preview', { url, mime: blob.type, title: file.title });
          const w = window.open('', '_blank');
          if (w) {
            w.document.title = file.title || 'Preview';
            w.document.body.style.margin = '0';
            const embed = w.document.createElement('embed');
            embed.src = url;
            embed.type = 'application/pdf';
            embed.style.width = '100%';
            embed.style.height = '100vh';
            w.document.body.appendChild(embed);
          } else {
            window.open(url, '_blank');
          }
        } else {
          console.debug('viewFile: opening blob URL', { url, mime: blob.type, title: file.title });
          window.open(url, '_blank');
        }
        // Revoke after a minute
        setTimeout(() => URL.revokeObjectURL(url), 60 * 1000);
        return;
      }

      // Otherwise open directly
      // If the declared type or filename suggests PDF, embed instead of direct open
      const isPdf = (file.type && file.type.toLowerCase().includes('pdf')) || (href.toLowerCase && href.toLowerCase().endsWith('.pdf'));
      if (isPdf) {
        console.debug('viewFile: embedding remote PDF URL', { href, title: file.title, type: file.type });
        const w = window.open('', '_blank');
        if (w) {
          w.document.title = file.title || 'Preview';
          w.document.body.style.margin = '0';
          const embed = w.document.createElement('embed');
          embed.src = href;
          embed.type = 'application/pdf';
          embed.style.width = '100%';
          embed.style.height = '100vh';
          w.document.body.appendChild(embed);
        } else {
          window.open(href, '_blank');
        }
      } else {
        window.open(href, '_blank');
      }
    } catch (err) {
      // Fallback to direct open or alert
      try {
        if (file.url) window.open(file.url, '_blank');
      } catch (e) {
        // eslint-disable-next-line no-alert
        alert('Unable to open file preview.');
      }
    }
  };

  const downloadFile = async (file) => {
    try {
      const href = file.fileData || file.url;
      if (!href) return;

      if (href.startsWith('data:')) {
        const res = await fetch(href);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.title || 'download';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 60 * 1000);
        return;
      }

      const a = document.createElement('a');
      a.href = href;
      a.download = file.title || 'download';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert('Unable to download file.');
    }
  };

  const deleteFile = (fileId) => {
    // confirmation
    // eslint-disable-next-line no-alert
    const ok = window.confirm('Delete this file? This action cannot be undone.');
    if (!ok) return;
    mutateCourse((current) => ({
      ...current,
      files: current.files.filter((f) => f.id !== fileId),
    }));
    setNotice('File deleted.');
  };

  const addAssignment = (event) => {
    event.preventDefault();
    mutateCourse((current) => ({
      ...current,
      assignments: [{ id: `a-${Date.now()}`, ...assignmentForm, submitted: false }, ...current.assignments],
    }));
    setAssignmentForm({ title: '', description: '', deadline: '' });
    setNotice('Assignment created.');
  };

  const submitAssignment = (assignmentId) => {
    mutateCourse((current) => ({
      ...current,
      assignments: current.assignments.map((assignment) => (
        assignment.id === assignmentId ? { ...assignment, submitted: true } : assignment
      )),
    }));
    setNotice('Submission uploaded.');
  };

  const addTest = (event) => {
    event.preventDefault();
    const validQuestions = testForm.questions
      .filter((question) => question.question.trim())
      .map((question, index) => ({ ...question, id: `q-${Date.now()}-${index}` }));
    if (!testForm.title.trim() || !validQuestions.length) return;
    mutateCourse((current) => ({
      ...current,
      tests: [{ id: `t-${Date.now()}`, ...testForm, questions: validQuestions, result: null }, ...current.tests],
    }));
    setTestForm({
      title: '',
      description: '',
      duration: 15,
      questions: [{ question: '', options: ['', '', '', ''], answer: 0 }],
    });
    setNotice('Test published.');
  };

  const submitTest = () => {
    const correct = activeTest.questions.reduce((sum, question) => (
      Number(answers[question.id]) === question.answer ? sum + 1 : sum
    ), 0);
    const percentage = Math.round((correct / activeTest.questions.length) * 100);
    mutateCourse((current) => ({
      ...current,
      tests: current.tests.map((test) => (
        test.id === activeTest.id ? { ...test, result: { correct, total: test.questions.length, percentage } } : test
      )),
    }));
    setActiveTestId(null);
    setAnswers({});
    setNotice(`Test submitted. Score: ${percentage}%.`);
  };

  return (
    <div className="course-shell">
      <aside className="course-nav">
        <button className="back-link" onClick={() => navigate('/courses')}>
          <ArrowLeftIcon className="h-5 w-5" />Courses
        </button>
        <div>
          <p className="eyebrow">Course workspace</p>
          <h1>{course.name}</h1>
          <span className={`role-badge ${role.toLowerCase()}`}>{role}</span>
        </div>
        <nav>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>
                <Icon className="h-5 w-5" />{tab.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="course-main">
        <header className="course-hero">
          <div>
            <p className="eyebrow">{course.courseCode}</p>
            <h2>{course.name}</h2>
            <p>{course.teacherName} teaches this class with {course.studentIds.length} enrolled students.</p>
          </div>
          <div className="course-settings">
            <span>Comments {course.settings.comments ? 'On' : 'Off'}</span>
            <span>Files {course.settings.fileSharing ? 'On' : 'Off'}</span>
          </div>
        </header>

        {notice && (
          <div className="toast-inline">
            <CheckCircleIcon className="h-5 w-5" />
            {notice}
            <button onClick={() => setNotice('')}>Dismiss</button>
          </div>
        )}

        {activeTab === 'general' && (
          <section className="workspace-grid">
            <div className="surface chat-surface">
              <div className="section-row">
                <div>
                  <p className="eyebrow">Discussion</p>
                  <h2>Course chat</h2>
                </div>
                <SparklesIcon className="h-6 w-6 text-slate-400" />
              </div>
              <form className="chat-composer" onSubmit={addPost}>
                <textarea value={postText} onChange={(event) => setPostText(event.target.value)} placeholder="Share an update, question, or resource" />
                <button className="primary-action compact" type="submit"><PaperAirplaneIcon className="h-5 w-5" />Post</button>
              </form>
              <div className="post-list">
                {course.posts.map((post) => (
                  <article key={post.id} className="post-card">
                    <div className="post-avatar">{post.author.charAt(0)}</div>
                    <div>
                      <div className="post-meta">
                        <strong>{post.author}</strong>
                        <span>{post.role}</span>
                        <time>{post.time}</time>
                      </div>
                      <p>{post.text}</p>
                      <div className="post-actions">
                        <button onClick={() => likePost(post.id)}>Like {post.likes}</button>
                        <button>Reply {post.replies.length}</button>
                      </div>
                      {post.replies.map((reply) => (
                        <div className="reply-card" key={reply.id}>
                          <strong>{reply.author}</strong>
                          <span>{reply.text}</span>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <aside className="surface compact-feed">
              <h3>Today</h3>
              <p>{course.assignments.filter((item) => !item.submitted).length} open assignments</p>
              <p>{course.tests.length} available tests</p>
              <p>{course.files.length} shared materials</p>
            </aside>
          </section>
        )}

        {activeTab === 'files' && (
          <section className="tab-stack">
            {isTeacher && (
              <form className="surface inline-form" onSubmit={addFile}>
                <input value={fileForm.title} onChange={(event) => setFileForm({ ...fileForm, title: event.target.value })} placeholder="Material title" />
                <input type="file" onChange={handleFileChange} />
                <select value={fileForm.type} onChange={(event) => setFileForm({ ...fileForm, type: event.target.value })}>
                  <option>PDF</option>
                  <option>DOCX</option>
                  <option>LINK</option>
                  <option>VIDEO</option>
                </select>
                <button className="primary-action compact" type="submit"><PlusIcon className="h-5 w-5" />Upload</button>
              </form>
            )}
                    <div className="material-grid">
                      {course.files.map((file) => (
                        <article className="material-card" key={file.id}>
                          <div className="material-head">
                            <DocumentTextIcon className="h-8 w-8" />
                            <div className="material-meta">
                              <span className="text-[var(--muted)] text-sm">{file.type}</span>
                              <h3>{file.title}</h3>
                              <p className="text-[var(--muted)]">{file.size} • {file.uploadedBy}</p>
                            </div>
                            <button
                              className="kebab"
                              title="More"
                              onClick={(e) => {
                                e.stopPropagation();
                                const rect = e.currentTarget.getBoundingClientRect();
                                setOpenMenu({ id: file.id, x: rect.right + window.scrollX - 8, y: rect.bottom + window.scrollY + 4 });
                              }}
                            >
                              ⋮
                            </button>
                          </div>
                          <div className="material-actions">
                            <button className="secondary-action" onClick={() => viewFile(file)}>View</button>
                            <button className="icon-button" title="Download" onClick={() => downloadFile(file)}><ArrowDownTrayIcon className="h-5 w-5" /></button>
                            <button className="secondary-action text-red-400" onClick={() => deleteFile(file.id)}>Delete</button>
                          </div>

                          {openMenu.id === file.id && (
                            <ul
                              className="kebab-menu"
                              style={{ position: 'absolute', top: openMenu.y, left: openMenu.x, zIndex: 80 }}
                            >
                              <li onClick={() => { downloadFile(file); setOpenMenu({ id: null, x: 0, y: 0 }); }}>Download</li>
                              <li onClick={() => {
                                const name = window.prompt('Rename file', file.title || '');
                                if (name && name.trim()) {
                                  mutateCourse((current) => ({
                                    ...current,
                                    files: current.files.map((f) => (f.id === file.id ? { ...f, title: name.trim() } : f)),
                                  }));
                                }
                                setOpenMenu({ id: null, x: 0, y: 0 });
                              }}>Rename</li>
                              <li className="danger" onClick={() => { deleteFile(file.id); setOpenMenu({ id: null, x: 0, y: 0 }); }}>Delete</li>
                            </ul>
                          )}
                        </article>
                      ))}
                    </div>
          </section>
        )}

        {activeTab === 'assignments' && (
          <section className="tab-stack">
            {isTeacher && (
              <form className="surface assignment-form" onSubmit={addAssignment}>
                <input value={assignmentForm.title} onChange={(event) => setAssignmentForm({ ...assignmentForm, title: event.target.value })} placeholder="Assignment title" required />
                <input value={assignmentForm.description} onChange={(event) => setAssignmentForm({ ...assignmentForm, description: event.target.value })} placeholder="Description" required />
                <input type="datetime-local" value={assignmentForm.deadline} onChange={(event) => setAssignmentForm({ ...assignmentForm, deadline: event.target.value })} required />
                <button className="primary-action compact" type="submit">Create</button>
              </form>
            )}
            {course.assignments.map((assignment) => (
              <article className="surface assignment-card" key={assignment.id}>
                <div>
                  <span className={assignment.submitted ? 'status done' : 'status open'}>{assignment.submitted ? 'Submitted' : 'Open'}</span>
                  <h3>{assignment.title}</h3>
                  <p>{assignment.description}</p>
                  <time>Deadline: {assignment.deadline ? new Date(assignment.deadline).toLocaleString() : 'No deadline'}</time>
                </div>
                {!isTeacher && (
                  <button className="primary-action compact" onClick={() => submitAssignment(assignment.id)}>
                    <ArrowUpTrayIconFallback />Submit
                  </button>
                )}
              </article>
            ))}
          </section>
        )}

        {activeTab === 'tests' && (
          <section className="tab-stack">
            {activeTest ? (
              <div className="surface test-runner">
                <div className="section-row">
                  <div>
                    <p className="eyebrow">{activeTest.duration} minutes</p>
                    <h2>{activeTest.title}</h2>
                  </div>
                  <button className="secondary-action" onClick={() => setActiveTestId(null)}>Exit</button>
                </div>
                {activeTest.questions.map((question, index) => (
                  <fieldset className="question-card" key={question.id}>
                    <legend>{index + 1}. {question.question}</legend>
                    {question.options.map((option, optionIndex) => (
                      <label key={option}>
                        <input
                          type="radio"
                          name={question.id}
                          checked={Number(answers[question.id]) === optionIndex}
                          onChange={() => setAnswers({ ...answers, [question.id]: optionIndex })}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </fieldset>
                ))}
                <button className="primary-action" onClick={submitTest}>Submit test</button>
              </div>
            ) : (
              <>
                {isTeacher && (
                  <form className="surface test-form" onSubmit={addTest}>
                    <input value={testForm.title} onChange={(event) => setTestForm({ ...testForm, title: event.target.value })} placeholder="Test title" required />
                    <input value={testForm.description} onChange={(event) => setTestForm({ ...testForm, description: event.target.value })} placeholder="Description" />
                    {testForm.questions.map((question, questionIndex) => (
                      <div className="question-builder" key={questionIndex}>
                        <input value={question.question} onChange={(event) => {
                          const questions = [...testForm.questions];
                          questions[questionIndex].question = event.target.value;
                          setTestForm({ ...testForm, questions });
                        }} placeholder={`Question ${questionIndex + 1}`} required />
                        <div className="option-grid">
                          {question.options.map((option, optionIndex) => (
                            <label key={optionIndex}>
                              <input type="radio" name={`answer-${questionIndex}`} checked={question.answer === optionIndex} onChange={() => {
                                const questions = [...testForm.questions];
                                questions[questionIndex].answer = optionIndex;
                                setTestForm({ ...testForm, questions });
                              }} />
                              <input value={option} onChange={(event) => {
                                const questions = [...testForm.questions];
                                questions[questionIndex].options[optionIndex] = event.target.value;
                                setTestForm({ ...testForm, questions });
                              }} placeholder={`Option ${optionIndex + 1}`} required />
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="modal-actions">
                      <button type="button" className="secondary-action" onClick={() => setTestForm({
                        ...testForm,
                        questions: [...testForm.questions, { question: '', options: ['', '', '', ''], answer: 0 }],
                      })}>Add question</button>
                      <button className="primary-action compact" type="submit">Publish test</button>
                    </div>
                  </form>
                )}
                <div className="test-grid">
                  {course.tests.map((test) => (
                    <article className="surface test-card" key={test.id}>
                      <span>{test.questions.length} questions</span>
                      <h3>{test.title}</h3>
                      <p>{test.description}</p>
                      {test.result && <strong>Result: {test.result.percentage}%</strong>}
                      {!isTeacher && <button className="primary-action compact" onClick={() => setActiveTestId(test.id)}><PlayIcon className="h-5 w-5" />Start test</button>}
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

const ArrowUpTrayIconFallback = () => <PaperClipIcon className="h-5 w-5" />;

export default CourseDetailPage;
