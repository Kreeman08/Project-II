import React, { useCallback, useEffect, useState } from "react";
import "./AssignmentDetails.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faFilter, faUpload, faFile } from "@fortawesome/free-solid-svg-icons";
import { useParams } from "react-router-dom";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function AssignmentDetails() {
  const { assignmentId } = useParams();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortType, setSortType] = useState("az");

  const [referenceType, setReferenceType] = useState("text");

  // ✅ FIXED: moved logic ABOVE usage
  const getSubmissionStatus = (item) => {
    if (!item.submitted) return "unsubmitted";

    if (!item.submittedAt || !assignment?.deadline) return "onTime";

    const submittedTime = new Date(item.submittedAt).getTime();
    const deadlineTime = new Date(assignment.deadline).getTime();

    return submittedTime > deadlineTime ? "late" : "onTime";
  };

  useEffect(() => {
    if (!assignment) return;

    setReferenceType(
      assignment.reference_text ? "text" : "file"
    );
  }, [assignment]);

  const loadData = useCallback(async () => {
    try {
      const [assignmentData, submissionData] = await Promise.all([
        api.assignment(assignmentId),
        api.submissions(),
      ]);
      const enrollmentData = await api.enrollments();
      setAssignment(assignmentData);
      setSubmissions(
        submissionData.filter(
          (item) => String(item.assignment) === String(assignmentId)
        )
      );
      setEnrollments(
        enrollmentData.filter(
          (item) => String(item.course) === String(assignmentData.course)
        )
      );
    } catch (err) {
      setMessage(err.message);
      setMessageType("error");
    }
  }, [assignmentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setMessage("");
    setMessageType("");

    const formData = new FormData();
    formData.append("assignment", assignmentId);
    formData.append("text", "");
    if (uploadedFile) formData.append("file", uploadedFile);

    try {
      await api.createSubmission(formData);
      setUploadedFile(null);
      setMessage("Assignment submitted.");
      setMessageType("success");
      await loadData();
    } catch (err) {
      setMessage(err.message);
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  const submissionByStudent = submissions.reduce((map, submission) => {
    map[String(submission.student)] = submission;
    return map;
  }, {});

  const teacherRows = enrollments.map((enrollment) => {
    const submission = submissionByStudent[String(enrollment.student)];
    return {
      student: enrollment.student,
      studentName:
        enrollment.student_name?.trim() ||
        enrollment.student_username ||
        `Student ${enrollment.student}`,
      submitted: Boolean(submission),
      submittedAt: submission?.submittedAt || submission?.submitted_at,
      file: submission?.file,
      text: submission?.text,
    };
  });

  const filteredSubmissions = teacherRows
    .filter((item) => {
      const status = getSubmissionStatus(item);

      if (statusFilter === "all") return true;
      if (statusFilter === "submitted") return status !== "unsubmitted";
      return status === statusFilter;
    })
    .sort((a, b) => {
      const left = a.studentName.toLowerCase();
      const right = b.studentName.toLowerCase();
      return sortType === "az"
        ? left.localeCompare(right)
        : right.localeCompare(left);
    });

  if (!assignment)
    return (
      <div className="page-state">
        {message || "Loading assignment..."}
      </div>
    );

  const isTeacherForAssignment =
    assignment.created_by === user?.id;

  const mySubmission = submissions.find(
    (item) => item.student === user?.id
  );

  return (
    <div className="assignment-details-page">
      <div className="assignment-top">
        <h1>{assignment.title}</h1>
        <div className="deadline-box">
          <span className="deadline-label">DEADLINE</span>
          <div className="deadline-time">
            {new Date(assignment.deadline).toLocaleString()}
          </div>
        </div>
      </div>

      {message && (
        <div className={`form-message ${messageType}`}>
          {message}
        </div>
      )}

      {/* INSTRUCTIONS */}
      <div className="detail-section">
        <div className="detail-title">
          <FontAwesomeIcon icon={faCircleInfo} />
          <h3>Instructions</h3>
        </div>

        <div className="instruction-box">
          <p>
            {assignment.description ||
              "No instructions provided."}
          </p>
        </div>
      </div>

      {/* REFERENCE SECTION */}
{(assignment?.reference_text || assignment?.reference_file) && (
  <div className="detail-section">

    {/* Show tabs only when both exist */}
    {assignment.reference_text && assignment.reference_file && (
      <div className="reference-tabs">
        <button
          className={referenceType === "text" ? "active-tab" : ""}
          onClick={() => setReferenceType("text")}
        >
          Text Reference
        </button>

        <button
          className={referenceType === "file" ? "active-tab" : ""}
          onClick={() => setReferenceType("file")}
        >
          File Reference
        </button>
      </div>
    )}

    {/* Only text exists */}
    {assignment.reference_text &&
      !assignment.reference_file && (
        <>
          <div className="detail-title">
            <h3>Text Reference</h3>
          </div>

          <div className="reference-text-box">
            <p>{assignment.reference_text}</p>
          </div>
        </>
      )}

    {/* Only file exists */}
    {assignment.reference_file &&
      !assignment.reference_text && (
        <>
          <div className="detail-title">
            <h3>File Reference</h3>
          </div>

          <a
            href={assignment.reference_file}
            target="_blank"
            rel="noreferrer"
            className="reference-file-link-box"
          >
            <div className="reference-file">
              <div className="reference-left">
                <div className="file-icon-box">
                  <FontAwesomeIcon icon={faFile} />
                </div>

                <div>
                  <h4>
                    {decodeURIComponent(
                      assignment.reference_file
                        .split("/")
                        .pop()
                    )}
                  </h4>
                  <p>Click to open file</p>
                </div>
              </div>
            </div>
          </a>
        </>
      )}

    {/* Text tab */}
    {assignment.reference_text &&
      assignment.reference_file &&
      referenceType === "text" && (
        <div className="reference-text-box">
          <p>{assignment.reference_text}</p>
        </div>
      )}

    {/* File tab */}
    {assignment.reference_text &&
      assignment.reference_file &&
      referenceType === "file" && (
        <a
          href={assignment.reference_file}
          target="_blank"
          rel="noreferrer"
          className="reference-file-link-box"
        >
          <div className="reference-file">
            <div className="reference-left">
              <div className="file-icon-box">
                <FontAwesomeIcon icon={faFile} />
              </div>

              <div>
                <h4>
                  {decodeURIComponent(
                    assignment.reference_file
                      .split("/")
                      .pop()
                  )}
                </h4>
                <p>Click to open file</p>
              </div>
            </div>
          </div>
        </a>
      )}
  </div>
)}
      {/* STUDENT VIEW */}
      {!isTeacherForAssignment && (
        <>
          <div className="detail-section">
            <div className="detail-title">
              <FontAwesomeIcon icon={faUpload} />
              <h3>Submission</h3>
            </div>

            {mySubmission ? (
              <div className="submission-box submitted-box">
                <p>Assignment submitted.</p>
                {mySubmission.file && (
                  <a
                    className="submission-file-link"
                    href={mySubmission.file}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View submitted file
                  </a>
                )}
              </div>
            ) : (
              <div className="submission-box">
                <input
                  type="file"
                  id="assignmentFile"
                  hidden
                  onChange={(event) =>
                    setUploadedFile(event.target.files[0])
                  }
                />
                <button
                  className="upload-btn"
                  onClick={() =>
                    document
                      .getElementById("assignmentFile")
                      .click()
                  }
                >
                  Upload Files
                </button>
                {uploadedFile && (
                  <div className="uploaded-file-name">
                    {uploadedFile.name}
                  </div>
                )}
              </div>
            )}
          </div>

          {!mySubmission && (
            <div className="submit-section">
              <button
                className="submit-btn"
                onClick={handleSubmit}
                disabled={submitting || !uploadedFile}
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Assignment"}
              </button>
            </div>
          )}
        </>
      )}

      {/* TEACHER VIEW */}
      {isTeacherForAssignment && (
        <div className="teacher-submission-section">
          <div className="teacher-top">
            <h2>Student Submissions</h2>

            <div className="filter-row">
              <div className="filter-box">
                <FontAwesomeIcon icon={faFilter} />
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                >
                  <option value="all">All</option>
                  <option value="submitted">
                    Submitted
                  </option>
                  <option value="late">
                    Late submitted
                  </option>
                  <option value="unsubmitted">
                    Unsubmitted
                  </option>
                </select>
              </div>

              <div className="filter-box">
                <span>Sort By</span>
                <select
                  value={sortType}
                  onChange={(e) =>
                    setSortType(e.target.value)
                  }
                >
                  <option value="az">
                    Name (A-Z)
                  </option>
                  <option value="za">
                    Name (Z-A)
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div className="submission-table">
            <div className="table-header">
              <div>STUDENT</div>
              <div>STATUS</div>
              <div>SUBMITTED</div>
              <div>FILE</div>
            </div>

            {filteredSubmissions.map((item) => {
              const submissionStatus =
                getSubmissionStatus(item);

              return (
                <div
                  className="table-row"
                  key={item.student}
                >
                  <div className="student-name">
                    <div className="student-avatar">
                      {item.studentName
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <span>{item.studentName}</span>
                  </div>

                  <div>
                    <div
                      className={`table-status ${submissionStatus}`}
                    >
                      {submissionStatus === "onTime" &&
                        "Submitted on time"}
                      {submissionStatus === "late" &&
                        "Late submitted"}
                      {submissionStatus ===
                        "unsubmitted" &&
                        "Not submitted"}
                    </div>
                  </div>

                  <div>
                    {item.submittedAt
                      ? new Date(
                          item.submittedAt
                        ).toLocaleDateString()
                      : "-"}
                  </div>

                  <div>
                    {item.file ? (
                      <a
                        className="submission-file-link"
                        href={item.file}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View file
                      </a>
                    ) : item.text ? (
                      <span className="submission-text-note">
                        Text submitted
                      </span>
                    ) : (
                      "-"
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default AssignmentDetails;