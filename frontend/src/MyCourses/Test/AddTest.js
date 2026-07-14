import React, { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCirclePlus, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { api, apiRequest } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./AddTest.css";

const newQuestion = () => ({
  localId: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
  text: "",
  options: ["", "", "", ""],
  correctIndex: null,
});

const toDatetimeLocal = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
};

const AddTest = () => {
  const { courseId, course } = useOutletContext();
  const { testId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(30);
  const [deadline, setDeadline] = useState("");
  const [questions, setQuestions] = useState([newQuestion()]);
  const [existingTest, setExistingTest] = useState(null);
  const [loading, setLoading] = useState(Boolean(testId));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const ownsCourse = String(course?.teacher) === String(user?.id);

  useEffect(() => {
    if (!testId) return;
    apiRequest(`/tests/${testId}/`)
      .then((test) => {
        if (String(test.course) !== String(courseId) || test.published) {
          throw new Error("Only unpublished tests can be edited.");
        }
        setExistingTest(test);
        setTitle(test.title);
        setDescription(test.description || "");
        setTimerEnabled(test.timer_enabled);
        setTimeLimitMinutes(test.time_limit_minutes || 30);
        setDeadline(toDatetimeLocal(test.deadline));
        const loadedQuestions = test.questions.map((question) => ({
          localId: String(question.id),
          text: question.text,
          options: Array.from({ length: 4 }, (_, index) => question.options[index]?.text || ""),
          correctIndex: question.options.findIndex((option) => option.is_correct),
        }));
        setQuestions(loadedQuestions.length ? loadedQuestions : [newQuestion()]);
      })
      .catch((err) => setMessage(err.message))
      .finally(() => setLoading(false));
  }, [courseId, testId]);

  const invalidQuestionCount = useMemo(() => questions.filter((question) => (
    !question.text.trim() ||
    question.options.length !== 4 ||
    question.options.some((option) => !option.trim()) ||
    question.correctIndex === null
  )).length, [questions]);
  const canPublish = ownsCourse && title.trim() && questions.length > 0 && invalidQuestionCount === 0;

  const updateQuestion = (localId, updates) => setQuestions((items) => items.map(
    (question) => question.localId === localId ? { ...question, ...updates } : question
  ));
  const updateOption = (localId, index, text) => setQuestions((items) => items.map((question) => {
    if (question.localId !== localId) return question;
    const options = [...question.options];
    options[index] = text;
    return { ...question, options };
  }));

  const save = async (publish) => {
    if (!ownsCourse) {
      setMessage("Only the teacher who owns this course can manage tests.");
      return;
    }
    if (!title.trim()) {
      setMessage("Give the test a title before saving.");
      return;
    }
    if (publish && !canPublish) {
      setMessage("Every question needs text, exactly four choices, and one correct choice before publishing.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const payload = {
        course: Number(courseId),
        title: title.trim(),
        description: description.trim(),
        published: false,
        timer_enabled: timerEnabled,
        time_limit_minutes: timerEnabled ? Number(timeLimitMinutes) : null,
        deadline: deadline ? new Date(deadline).toISOString() : null,
      };
      const test = existingTest
        ? await api.updateTest(existingTest.id, payload)
        : await api.createTest(payload);

      if (existingTest) {
        await Promise.all(existingTest.questions.map((question) => api.deleteQuestion(question.id)));
      }
      for (const question of questions) {
        const createdQuestion = await api.createQuestion({ test: test.id, text: question.text.trim() });
        for (let index = 0; index < 4; index += 1) {
          await api.createOption({
            question: createdQuestion.id,
            text: question.options[index].trim(),
            is_correct: question.correctIndex === index,
          });
        }
      }
      if (publish) await api.updateTest(test.id, { published: true });
      navigate(`/myclass/${courseId}/tests`);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="page-state">Loading test editor…</div>;
  if (!ownsCourse) return <div className="page-state">Only the teacher who owns this course can edit tests.</div>;

  return (
    <section className="test-builder">
      <div className="test-builder__header">
        <div><h1>{existingTest ? "Edit test" : "Create test"}</h1><p>Every question is multiple choice with exactly four answers and one correct answer.</p></div>
        <div className="builder-actions"><button className="builder-button builder-button--secondary" disabled={busy} onClick={() => save(false)}>Save draft</button><button className="builder-button builder-button--primary" disabled={busy || !canPublish} onClick={() => save(true)}><FontAwesomeIcon icon={faCheck} /> {busy ? "Saving…" : "Publish test"}</button></div>
      </div>
      {message && <div className="form-message error">{message}</div>}

      <div className="builder-summary"><span>{questions.length} question{questions.length === 1 ? "" : "s"}</span><span>{invalidQuestionCount === 0 ? "Ready to publish" : `${invalidQuestionCount} question${invalidQuestionCount === 1 ? " needs" : "s need"} attention`}</span></div>
      <div className="builder-details">
        <label>Test title<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Chapter 1 review" /></label>
        <label>Description <span>(optional)</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Tell students what this test covers." rows="3" /></label>
        <div className="builder-timer-setting">
          <label className="builder-toggle"><input type="checkbox" checked={timerEnabled} onChange={(event) => setTimerEnabled(event.target.checked)} /><span>Use a timer for this test</span></label>
          <p>{timerEnabled ? "The test will submit automatically when time runs out." : "Students can take the test without a time limit."}</p>
          {timerEnabled && <label className="builder-time-limit">Time limit (minutes)<input type="number" min="1" value={timeLimitMinutes} onChange={(event) => setTimeLimitMinutes(Math.max(1, Number(event.target.value) || 1))} /></label>}
        </div>
        <label className="builder-deadline">Deadline <span>(optional)</span><input type="datetime-local" value={deadline} onChange={(event) => setDeadline(event.target.value)} /></label>
      </div>

      <div className="builder-questions">
        {questions.map((question, questionIndex) => (
          <article className="builder-question" key={question.localId}>
            <div className="builder-question__heading"><span>Question {questionIndex + 1}</span><button className="builder-icon-button" aria-label={`Delete question ${questionIndex + 1}`} disabled={questions.length === 1} onClick={() => setQuestions((items) => items.filter((item) => item.localId !== question.localId))}><FontAwesomeIcon icon={faTrashCan} /></button></div>
            <textarea value={question.text} onChange={(event) => updateQuestion(question.localId, { text: event.target.value })} placeholder="Write your multiple-choice question" rows="2" />
            <fieldset><legend>Answer choices <span>Choose one correct answer</span></legend>{question.options.map((option, optionIndex) => (
              <label className={`builder-option ${question.correctIndex === optionIndex ? "builder-option--correct" : ""}`} key={optionIndex}>
                <input type="radio" name={`correct-${question.localId}`} checked={question.correctIndex === optionIndex} onChange={() => updateQuestion(question.localId, { correctIndex: optionIndex })} aria-label={`Set choice ${optionIndex + 1} as correct`} />
                <span>{String.fromCharCode(65 + optionIndex)}</span><input value={option} onChange={(event) => updateOption(question.localId, optionIndex, event.target.value)} placeholder={`Choice ${optionIndex + 1}`} />
              </label>
            ))}</fieldset>
          </article>
        ))}
      </div>
      <button className="builder-add-question" onClick={() => setQuestions((items) => [...items, newQuestion()])}><FontAwesomeIcon icon={faCirclePlus} /> Add question</button>
    </section>
  );
};

export default AddTest;
