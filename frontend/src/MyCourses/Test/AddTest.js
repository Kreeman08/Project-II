// AddTest.js

import React, {
  useState,
  useEffect,
  useRef,
} from "react";

import "./AddTest.css";

/* REUSE DATE/TIME POPUP CSS */
import "../Assignment/AddAssignmentPopup.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faSliders,
  faCalendarDays,
  faClock,
  faStopwatch,
  faListOl,
  faTrash,
  faCircleCheck,
  faPlus,
  faUpload,
  faChevronUp,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useOutletContext } from "react-router-dom";
import { api } from "../../services/api";

const AddTest = () => {
  /* =========================
      REF
  ========================= */

  const timePopupRef = useRef(null);
  const navigate = useNavigate();
  const { courseId } = useOutletContext();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  /* =========================
      DATE
  ========================= */

  const today = new Date();

  const minDate = today
    .toISOString()
    .split("T")[0];

  /* =========================
      TEST DETAILS
  ========================= */

  const [testDetails, setTestDetails] =
    useState({
      title: "",
      scheduleDate: minDate,
      dueDate: minDate,
      duration: 60,
    });

  const handleDetailChange = (e) => {
    setTestDetails({
      ...testDetails,
      [e.target.name]: e.target.value,
    });
  };

  /* =========================
      SCHEDULE TIME
  ========================= */

  const [showSchedulePopup, setShowSchedulePopup] =
    useState(false);

  const [scheduleHour, setScheduleHour] =
    useState(11);

  const [scheduleMinute, setScheduleMinute] =
    useState(0);

  const [schedulePeriod, setSchedulePeriod] =
    useState("AM");

  /* =========================
      DUE TIME
  ========================= */

  const [showDuePopup, setShowDuePopup] =
    useState(false);

  const [dueHour, setDueHour] =
    useState(11);

  const [dueMinute, setDueMinute] =
    useState(59);

  const [duePeriod, setDuePeriod] =
    useState("PM");

  /* =========================
      CLOSE POPUP
  ========================= */

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        timePopupRef.current &&
        !timePopupRef.current.contains(
          e.target
        )
      ) {
        setShowSchedulePopup(false);
        setShowDuePopup(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* =========================
      TIME FUNCTIONS
  ========================= */

  const increaseValue = (
    setter,
    max,
    min = 0
  ) => {
    setter((prev) =>
      prev === max ? min : prev + 1
    );
  };

  const decreaseValue = (
    setter,
    min,
    max
  ) => {
    setter((prev) =>
      prev === min ? max : prev - 1
    );
  };

  const handleTimeInput = (
    e,
    setter,
    min,
    max
  ) => {
    let value = e.target.value;

    if (value === "") {
      setter("");
      return;
    }

    value = Number(value);

    if (value >= min && value <= max) {
      setter(value);
    }
  };

  /* =========================
      QUESTIONS
  ========================= */

  const [questions, setQuestions] =
    useState([
      {
        id: 1,
        question: "",
        points: 10,
        options: [
          {
            text: "",
            correct: false,
          },
          {
            text: "",
            correct: false,
          },
        ],
      },
    ]);

  /* =========================
      ADD QUESTION
  ========================= */

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      question: "",
      points: 10,
      options: [
        {
          text: "",
          correct: false,
        },
        {
          text: "",
          correct: false,
        },
      ],
    };

    setQuestions([
      ...questions,
      newQuestion,
    ]);
  };

  /* =========================
      DELETE QUESTION
  ========================= */

  const deleteQuestion = (id) => {
    setQuestions(
      questions.filter(
        (question) => question.id !== id
      )
    );
  };

  /* =========================
      UPDATE QUESTION
  ========================= */

  const updateQuestion = (
    id,
    value
  ) => {
    setQuestions(
      questions.map((q) =>
        q.id === id
          ? { ...q, question: value }
          : q
      )
    );
  };

  /* =========================
      UPDATE POINTS
  ========================= */

  const updatePoints = (
    id,
    value
  ) => {
    setQuestions(
      questions.map((q) =>
        q.id === id
          ? {
              ...q,
              points: Math.max(
                1,
                Number(value)
              ),
            }
          : q
      )
    );
  };

  /* =========================
      UPDATE OPTION
  ========================= */

  const updateOption = (
    questionId,
    optionIndex,
    value
  ) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const updatedOptions = [
            ...q.options,
          ];

          updatedOptions[
            optionIndex
          ].text = value;

          return {
            ...q,
            options: updatedOptions,
          };
        }

        return q;
      })
    );
  };

  /* =========================
      ADD OPTION
  ========================= */

  const addOption = (
    questionId
  ) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: [
              ...q.options,
              {
                text: "",
                correct: false,
              },
            ],
          };
        }

        return q;
      })
    );
  };

  /* =========================
      DELETE OPTION
  ========================= */

  const deleteOption = (
    questionId,
    optionIndex
  ) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: q.options.filter(
              (_, i) =>
                i !== optionIndex
            ),
          };
        }

        return q;
      })
    );
  };

  /* =========================
      SELECT ANSWER
  ========================= */

  const selectCorrectAnswer = (
    questionId,
    optionIndex
  ) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const updatedOptions =
            q.options.map(
              (option, i) => ({
                ...option,
                correct:
                  i === optionIndex,
              })
            );

          return {
            ...q,
            options: updatedOptions,
          };
        }

        return q;
      })
    );
  };

  /* =========================
      TOTAL MARKS
  ========================= */

  const totalPoints =
    questions.reduce(
      (sum, q) =>
        sum + Number(q.points),
      0
    );

  const publishTest = async () => {
    setBusy(true);
    setMessage("");

    try {
      const test = await api.createTest({
        course: Number(courseId),
        title: testDetails.title,
        description: "",
      });

      for (const question of questions.filter((item) => item.question.trim())) {
        const createdQuestion = await api.createQuestion({
          test: test.id,
          text: question.question,
        });

        for (const option of question.options.filter((item) => item.text.trim())) {
          await api.createOption({
            question: createdQuestion.id,
            text: option.text,
            is_correct: option.correct,
          });
        }
      }

      navigate(`/myclass/${courseId}/tests`);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="test-page-builder">
      {/* HEADER */}
      <div className="test-header">
        <h1>New Test</h1>

        <button className="publish-btn" onClick={publishTest} disabled={busy || !testDetails.title.trim()}>
          <FontAwesomeIcon
            icon={faUpload}
          />
          {busy ? "Publishing..." : "Publish Test"}
        </button>
      </div>
      {message && <div className="form-message error">{message}</div>}

      <div className="test-layout">
        {/* LEFT PANEL */}
        <div className="details-panel">
          <div className="panel-title">
            <FontAwesomeIcon
              icon={faSliders}
            />
            <span>Test Details</span>
          </div>

          {/* TITLE */}
          <div className="form-group">
            <label>Test Title</label>

            <input
              type="text"
              name="title"
              value={testDetails.title}
              onChange={
                handleDetailChange
              }
              placeholder="Enter test title"
            />
          </div>

          {/* SCHEDULE */}
          <div className="form-group">
            <label>
              Scheduled Date & Time
            </label>

            <div className="date-time-row">
              {/* DATE */}
              <div className="date-time-field">
                <div
                  className="input-icon-box date-click-area"
                  onClick={() =>
                    document
                      .getElementById(
                        "scheduleDateInput"
                      )
                      .showPicker()
                  }
                >
                  <FontAwesomeIcon
                    icon={
                      faCalendarDays
                    }
                    className="input-icon"
                  />

                  <input
                    id="scheduleDateInput"
                    type="date"
                    min={minDate}
                    name="scheduleDate"
                    value={
                      testDetails.scheduleDate
                    }
                    onChange={
                      handleDetailChange
                    }
                    className="styled-input hide-calendar-icon"
                  />
                </div>
              </div>

              {/* TIME */}
              <div className="date-time-field">
                <div
                  className="input-icon-box time-click"
                  onClick={() =>
                    setShowSchedulePopup(
                      (prev) =>
                        !prev
                    )
                  }
                >
                  <FontAwesomeIcon
                    icon={faClock}
                    className="input-icon"
                  />

                  <span className="time-display">
                    {String(
                      scheduleHour
                    ).padStart(
                      2,
                      "0"
                    )}
                    :
                    {String(
                      scheduleMinute
                    ).padStart(
                      2,
                      "0"
                    )}{" "}
                    {
                      schedulePeriod
                    }
                  </span>
                </div>

                {showSchedulePopup && (
                  <div
                    className="time-popup"
                    ref={
                      timePopupRef
                    }
                  >
                    {/* HOUR */}
                    <div className="time-control">
                      <button
                        onClick={() =>
                          increaseValue(
                            setScheduleHour,
                            12,
                            1
                          )
                        }
                      >
                        <FontAwesomeIcon
                          icon={
                            faChevronUp
                          }
                        />
                      </button>

                      <input
                        type="number"
                        value={
                          scheduleHour
                        }
                        onChange={(
                          e
                        ) =>
                          handleTimeInput(
                            e,
                            setScheduleHour,
                            1,
                            12
                          )
                        }
                      />

                      <button
                        onClick={() =>
                          decreaseValue(
                            setScheduleHour,
                            1,
                            12
                          )
                        }
                      >
                        <FontAwesomeIcon
                          icon={
                            faChevronDown
                          }
                        />
                      </button>
                    </div>

                    <span className="time-separator">
                      :
                    </span>

                    {/* MINUTES */}
                    <div className="time-control">
                      <button
                        onClick={() =>
                          increaseValue(
                            setScheduleMinute,
                            59
                          )
                        }
                      >
                        <FontAwesomeIcon
                          icon={
                            faChevronUp
                          }
                        />
                      </button>

                      <input
                        type="number"
                        value={
                          scheduleMinute
                        }
                        onChange={(
                          e
                        ) =>
                          handleTimeInput(
                            e,
                            setScheduleMinute,
                            0,
                            59
                          )
                        }
                      />

                      <button
                        onClick={() =>
                          decreaseValue(
                            setScheduleMinute,
                            0,
                            59
                          )
                        }
                      >
                        <FontAwesomeIcon
                          icon={
                            faChevronDown
                          }
                        />
                      </button>
                    </div>

                    {/* AM PM */}
                    <div className="ampm-toggle">
                      <button
                        className={
                          schedulePeriod ===
                          "AM"
                            ? "active-period"
                            : ""
                        }
                        onClick={() =>
                          setSchedulePeriod(
                            "AM"
                          )
                        }
                      >
                        AM
                      </button>

                      <button
                        className={
                          schedulePeriod ===
                          "PM"
                            ? "active-period"
                            : ""
                        }
                        onClick={() =>
                          setSchedulePeriod(
                            "PM"
                          )
                        }
                      >
                        PM
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* DUE */}
          <div className="form-group">
            <label>
              Due Date & Time
            </label>

            <div className="date-time-row">
              {/* DATE */}
              <div className="date-time-field">
                <div
                  className="input-icon-box date-click-area"
                  onClick={() =>
                    document
                      .getElementById(
                        "dueDateInput"
                      )
                      .showPicker()
                  }
                >
                  <FontAwesomeIcon
                    icon={
                      faCalendarDays
                    }
                    className="input-icon"
                  />

                  <input
                    id="dueDateInput"
                    type="date"
                    min={minDate}
                    name="dueDate"
                    value={
                      testDetails.dueDate
                    }
                    onChange={
                      handleDetailChange
                    }
                    className="styled-input hide-calendar-icon"
                  />
                </div>
              </div>

              {/* TIME */}
              <div className="date-time-field">
                <div
                  className="input-icon-box time-click"
                  onClick={() =>
                    setShowDuePopup(
                      (prev) =>
                        !prev
                    )
                  }
                >
                  <FontAwesomeIcon
                    icon={faClock}
                    className="input-icon"
                  />

                  <span className="time-display">
                    {String(
                      dueHour
                    ).padStart(
                      2,
                      "0"
                    )}
                    :
                    {String(
                      dueMinute
                    ).padStart(
                      2,
                      "0"
                    )}{" "}
                    {duePeriod}
                  </span>
                </div>

                {showDuePopup && (
                  <div
                    className="time-popup"
                    ref={
                      timePopupRef
                    }
                  >
                    {/* HOUR */}
                    <div className="time-control">
                      <button
                        onClick={() =>
                          increaseValue(
                            setDueHour,
                            12,
                            1
                          )
                        }
                      >
                        <FontAwesomeIcon
                          icon={
                            faChevronUp
                          }
                        />
                      </button>

                      <input
                        type="number"
                        value={dueHour}
                        onChange={(
                          e
                        ) =>
                          handleTimeInput(
                            e,
                            setDueHour,
                            1,
                            12
                          )
                        }
                      />

                      <button
                        onClick={() =>
                          decreaseValue(
                            setDueHour,
                            1,
                            12
                          )
                        }
                      >
                        <FontAwesomeIcon
                          icon={
                            faChevronDown
                          }
                        />
                      </button>
                    </div>

                    <span className="time-separator">
                      :
                    </span>

                    {/* MINUTES */}
                    <div className="time-control">
                      <button
                        onClick={() =>
                          increaseValue(
                            setDueMinute,
                            59
                          )
                        }
                      >
                        <FontAwesomeIcon
                          icon={
                            faChevronUp
                          }
                        />
                      </button>

                      <input
                        type="number"
                        value={
                          dueMinute
                        }
                        onChange={(
                          e
                        ) =>
                          handleTimeInput(
                            e,
                            setDueMinute,
                            0,
                            59
                          )
                        }
                      />

                      <button
                        onClick={() =>
                          decreaseValue(
                            setDueMinute,
                            0,
                            59
                          )
                        }
                      >
                        <FontAwesomeIcon
                          icon={
                            faChevronDown
                          }
                        />
                      </button>
                    </div>

                    {/* AM PM */}
                    <div className="ampm-toggle">
                      <button
                        className={
                          duePeriod ===
                          "AM"
                            ? "active-period"
                            : ""
                        }
                        onClick={() =>
                          setDuePeriod(
                            "AM"
                          )
                        }
                      >
                        AM
                      </button>

                      <button
                        className={
                          duePeriod ===
                          "PM"
                            ? "active-period"
                            : ""
                        }
                        onClick={() =>
                          setDuePeriod(
                            "PM"
                          )
                        }
                      >
                        PM
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* TIME LIMIT */}
          <div className="form-group">
            <label>
              Time Limit (Minutes)
            </label>

            <div className="input-icon-box">
              <FontAwesomeIcon
                icon={faStopwatch}
                className="input-icon"
              />

              <input
                type="number"
                min="0"
                step="5"
                value={
                  testDetails.duration
                }
                onChange={(e) => {
                  const value =
                    Math.max(
                      0,
                      Number(
                        e.target
                          .value
                      )
                    );

                  setTestDetails({
                    ...testDetails,
                    duration:
                      value,
                  });
                }}
                className="styled-input"
              />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="builder-panel">
          <div className="builder-header">
            <div>
              <h2>
                MCQ Test Builder
              </h2>

              <p>
                Design your
                multiple-choice
                questions below.
              </p>
            </div>

            <div className="points-box">
              <FontAwesomeIcon
                icon={faListOl}
              />

              <span>
                {totalPoints} Total
                Marks
              </span>
            </div>
          </div>

          {/* QUESTIONS */}
          {questions.map(
            (q, index) => (
              <div
                className="question-card"
                key={q.id}
              >
                <div className="question-number">
                  {index + 1}
                </div>

                <div className="question-top">
                  <textarea
                    className="question-input"
                    placeholder="Enter your question..."
                    value={q.question}
                    onChange={(e) =>
                      updateQuestion(
                        q.id,
                        e.target
                          .value
                      )
                    }
                  />

                  <div className="points-input">
                    <span>
                      Marks
                    </span>

                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={
                        q.points
                      }
                      onChange={(
                        e
                      ) =>
                        updatePoints(
                          q.id,
                          Math.max(
                            1,
                            Number(
                              e.target
                                .value
                            )
                          )
                        )
                      }
                    />
                  </div>

                  <button
                    className="icon-btn"
                    onClick={() =>
                      deleteQuestion(
                        q.id
                      )
                    }
                  >
                    <FontAwesomeIcon
                      icon={faTrash}
                    />
                  </button>
                </div>

                {/* OPTIONS */}
                <div className="options-list">
                  {q.options.map(
                    (
                      option,
                      i
                    ) => (
                      <div
                        className={`option-item ${
                          option.correct
                            ? "correct-option"
                            : ""
                        }`}
                        key={i}
                      >
                        <div className="option-left">
                          <div
                            className={`radio-circle ${
                              option.correct
                                ? "active-radio"
                                : ""
                            }`}
                            onClick={() =>
                              selectCorrectAnswer(
                                q.id,
                                i
                              )
                            }
                          ></div>

                          <input
                            type="text"
                            placeholder={`Option ${
                              i +
                              1
                            }`}
                            value={
                              option.text
                            }
                            onChange={(
                              e
                            ) =>
                              updateOption(
                                q.id,
                                i,
                                e
                                  .target
                                  .value
                              )
                            }
                          />
                        </div>

                        <div className="option-actions">
                          {option.correct && (
                            <FontAwesomeIcon
                              icon={
                                faCircleCheck
                              }
                              className="correct-icon"
                            />
                          )}

                          <FontAwesomeIcon
                            icon={
                              faTrash
                            }
                            onClick={() =>
                              deleteOption(
                                q.id,
                                i
                              )
                            }
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>

                <button
                  className="add-option-btn"
                  onClick={() =>
                    addOption(
                      q.id
                    )
                  }
                >
                  <FontAwesomeIcon
                    icon={faPlus}
                  />
                  Add Option
                </button>
              </div>
            )
          )}

          {/* ADD QUESTION */}
          <button
            className="add-question-btn"
            onClick={addQuestion}
          >
            <FontAwesomeIcon
              icon={faPlus}
            />
            Add New Question
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTest;
