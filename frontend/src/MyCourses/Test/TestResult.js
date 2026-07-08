// src/pages/TestResult.js

import React from "react";
import "./TestResult.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faCircleCheck,
  faCircleXmark,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";

const questions = [
  {
    id: 1,
    question:
      "What is the standard unit of force in the International System of Units (SI)?",
    userAnswer: "Newton (N)",
    correctAnswer: "Newton (N)",
    marks: "10 / 10 pts",
    correct: true,
  },
  {
    id: 2,
    question:
      "Which of the following laws states that for every action, there is an equal and opposite reaction?",
    userAnswer: "Newton's First Law",
    correctAnswer: "Newton's Third Law",
    marks: "0 / 10 pts",
    correct: false,
  },
  {
    id: 3,
    question: "Kinetic energy is best described as the energy of what?",
    userAnswer: "Motion",
    correctAnswer: "Motion",
    marks: "10 / 10 pts",
    correct: true,
  },
];

const TestResult = () => {
  return (
    <div className="test-result-page">
      {/* Top Summary */}
      <div className="result-summary">
        <div className="exam-card">
          <h1>Physics Midterm Examination</h1>
        </div>

        <div className="score-card">
          <span className="score-label">FINAL SCORE</span>

          <h2>20/30</h2>

          <div className="pass-badge">
            <FontAwesomeIcon icon={faCircleCheck} />
            <span>Passed</span>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="breakdown-header">
        <h3>Question Breakdown</h3>
      </div>

      <div className="questions-wrapper">
        {questions.map((item) => (
          <div
            className={`question-card ${
              item.correct ? "correct-card" : "wrong-card"
            }`}
            key={item.id}
          >
            <div className="question-top">
              <div className="question-left">
                <div
                  className={`status-icon ${
                    item.correct ? "correct-icon" : "wrong-icon"
                  }`}
                >
                  <FontAwesomeIcon
                    icon={
                      item.correct ? faCircleCheck : faCircleXmark
                    }
                  />
                </div>

                <h4>
                  {item.id}. {item.question}
                </h4>
              </div>

              <span className="marks">{item.marks}</span>
            </div>

            {item.correct ? (
              <div className="single-answer-box">
                <span className="answer-title">Your Answer:</span>

                <p>{item.userAnswer}</p>
              </div>
            ) : (
              <div className="answer-grid">
                <div className="answer-box wrong-answer">
                  <span className="answer-title wrong-text">
                    <FontAwesomeIcon icon={faCircleXmark}/>
                    Your Answer
                  </span>

                  <p>{item.userAnswer}</p>
                </div>

                <div className="answer-box correct-answer">
                  <span className="answer-title correct-text">
                    <FontAwesomeIcon icon={faCircleCheck}/>
                     Correct Answer
                  </span>

                  <p>{item.correctAnswer}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestResult;