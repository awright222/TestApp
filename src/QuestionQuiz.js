import React, { useState } from 'react';
import './QuestionQuiz.css';

export default function QuestionQuiz({ questions }) {
  const [current, setCurrent] = useState(0);
  const [userAnswers, setUserAnswers] = useState(questions.map(getInitialUserAnswer));
  const [submitted, setSubmitted] = useState(false);
  const [questionScore, setQuestionScore] = useState(Array(questions.length).fill(null));
  const [questionSubmitted, setQuestionSubmitted] = useState(Array(questions.length).fill(false));
  const [showModal, setShowModal] = useState(false);

  function getChoiceLabel(choice) {
    const match = choice.match(/^([A-Z])\./);
    return match ? match[1] : null;
  }

  function getInitialUserAnswer(q) {
    if (q?.question_type?.toLowerCase() === 'multiple choice') {
      return [];
    } else if (q?.question_type?.toLowerCase() === 'hotspot') {
      return {};
    }
    return '';
  }

  const q = questions[current];
  const isLast = current >= questions.length - 1;

  // Multiple Choice
  const choices = q.choices?.match(/^[A-Z]\..+?(?=\n[A-Z]\.|$)/gms)?.map(s => s.trim()) || [];

  // Hotspot: parse as label: option1, option2, ...
  const hotspotOptions = {};
  if (q.question_type?.toLowerCase() === 'hotspot') {
    const lines = q.choices.split(/\r?\n/).filter(Boolean);
    for (const line of lines) {
      const [label, rest] = line.split(':');
      if (label && rest) {
        hotspotOptions[label.trim()] = rest.split(',').map(opt => opt.trim()).filter(Boolean);
      }
    }
  }

  // Correct answers for hotspot
  const correctHotspotAnswers = {};
  if (q.question_type?.toLowerCase() === 'hotspot') {
    const lines = q.correct_answer.split(/\r?\n/).filter(Boolean);
    for (const line of lines) {
      const [label, answer] = line.split(':');
      if (label && answer) {
        correctHotspotAnswers[label.trim()] = answer.trim();
      }
    }
  }

  // Update answer for current question
  const updateUserAnswer = (answer) => {
    setUserAnswers(prev => {
      const updated = [...prev];
      updated[current] = answer;
      return updated;
    });
  };

  // Submit current question
  const submitCurrentQuestion = () => {
    let points = 0;
    if (q.question_type?.toLowerCase() === 'multiple choice') {
      const correct = q.correct_answer.split(',').map(s => s.trim());
      const user = Array.isArray(userAnswers[current]) ? userAnswers[current] : [userAnswers[current]];
      const userLabels = user.map(getChoiceLabel);
      points = userLabels.filter(label => correct.includes(label)).length;
    } else if (q.question_type?.toLowerCase() === 'hotspot') {
      points = Object.entries(correctHotspotAnswers).filter(
        ([label, correct]) => userAnswers[current][label] === correct
      ).length;
    }
    setQuestionSubmitted(prev => {
      const updated = [...prev];
      updated[current] = true;
      return updated;
    });
    setQuestionScore(prev => {
      const updated = [...prev];
      updated[current] = points;
      return updated;
    });
  };

  // Navigation
  const prevQuestion = () => setCurrent(c => Math.max(0, c - 1));
  const nextQuestion = () => setCurrent(c => Math.min(questions.length - 1, c + 1));

  // Handle answer change for multiple choice (allow multiple selections up to the number of correct answers)
  const handleChoiceChange = (choice) => {
    const currentAnswers = Array.isArray(userAnswers[current]) ? userAnswers[current] : [];
    const isSelected = currentAnswers.includes(choice);
    
    if (isSelected) {
      // Remove the choice
      updateUserAnswer(currentAnswers.filter(c => c !== choice));
    } else {
      // Check how many correct answers this question has
      const correctAnswers = q.correct_answer.split(',').map(s => s.trim());
      const maxSelections = correctAnswers.length;
      
      // Only add if we haven't reached the limit
      if (currentAnswers.length < maxSelections) {
        updateUserAnswer([...currentAnswers, choice]);
      }
    }
  };

  const handleHotspotChange = (label, val) => {
    setUserAnswers(prev => {
      const updated = [...prev];
      updated[current] = { ...updated[current], [label]: val };
      return updated;
    });
  };

  function calculateScore() {
    return questionScore.reduce((sum, val) => sum + (val || 0), 0);
  }

  function maxScore() {
    return questions.reduce((sum, q) => {
      if (q.question_type?.toLowerCase() === 'multiple choice') {
        return sum + q.correct_answer.split(',').length;
      } else if (q.question_type?.toLowerCase() === 'hotspot') {
        return sum + q.correct_answer.split(/\r?\n/).filter(Boolean).length;
      }
      return sum + 1;
    }, 0);
  }

  return (
    <div className="question-quiz-container">
      <div className="question-quiz-box">
        <div className="question-quiz-header">
          <h2 className="question-quiz-title">
            Question {current + 1} of {questions.length}
          </h2>
          <button
            className="question-quiz-info-btn"
            onClick={() => setShowModal(true)}
            aria-label="Show explanation"
            title="Show explanation"
          >
            <span className="question-quiz-info-circle">i</span>
          </button>
        </div>
        
        <div className="question-quiz-text">
          {q.question_text}
        </div>

        {/* Multiple Choice */}
        {q.question_type?.toLowerCase() === 'multiple choice' && (
          <>
            {(() => {
              const correctAnswers = q.correct_answer.split(',').map(s => s.trim());
              const maxSelections = correctAnswers.length;
              const currentSelections = Array.isArray(userAnswers[current]) ? userAnswers[current].length : 0;
              const limitReached = currentSelections >= maxSelections;
              
              return (
                <div className={`question-quiz-selection-info ${limitReached ? 'limit-reached' : ''}`}>
                  {limitReached 
                    ? `Selection limit reached: ${currentSelections}/${maxSelections} choices selected`
                    : `Select up to ${maxSelections} answer${maxSelections > 1 ? 's' : ''} (${currentSelections}/${maxSelections} selected)`
                  }
                </div>
              );
            })()}
            <div className="question-quiz-choices">
              {choices.map((choice, idx) => {
                const isSelected = Array.isArray(userAnswers[current]) && userAnswers[current].includes(choice);
                return (
                  <label 
                    key={idx} 
                    className={`question-quiz-choice ${isSelected ? 'selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleChoiceChange(choice)}
                      disabled={questionSubmitted[current]}
                    />
                    <span className="question-quiz-choice-text">{choice}</span>
                  </label>
                );
              })}
            </div>
          </>
        )}

        {/* Hotspot */}
        {q.question_type?.toLowerCase() === 'hotspot' && (
          <div className="question-quiz-hotspot">
            {Object.entries(hotspotOptions).map(([label, options], idx) => {
              const userValue = userAnswers[current]?.[label] || '';
              const correctValue = correctHotspotAnswers[label];
              const isSubmitted = questionSubmitted ? questionSubmitted[current] : submitted;
              const isCorrect = userValue && userValue === correctValue;
              const showFeedback = isSubmitted && userValue;

              return (
                <div key={idx} className="question-quiz-hotspot-item">
                  <strong className="question-quiz-hotspot-label">{label}:</strong>
                  <div className="dropdown-container">
                    <select
                      className="question-quiz-hotspot-select"
                      value={userValue}
                      onChange={e => {
                        if (isSubmitted) return;
                        handleHotspotChange(label, e.target.value);
                      }}
                      disabled={isSubmitted}
                    >
                      <option value="">-- Select an option --</option>
                      {options.map((opt, i) => (
                        <option key={i} value={opt} title={opt}>{opt}</option>
                      ))}
                    </select>
                    {showFeedback && (
                      <div className={`question-quiz-hotspot-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
                        {isCorrect
                          ? <span>✅ Correct</span>
                          : (
                            <>
                              <span>❌ Incorrect</span>
                              <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>
                                Correct: {correctValue}
                              </span>
                            </>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Navigation */}
        <div className="question-quiz-nav">
          <button 
            className="question-quiz-nav-btn"
            onClick={prevQuestion} 
            disabled={current === 0}
          >
            ⬅ Back
          </button>
          
          {/* Jump to Question */}
          <div className="question-jump">
            <label htmlFor="question-jump">Go to Q:</label>
            <input
              id="question-jump"
              type="number"
              min="1"
              max={questions.length}
              value={current + 1}
              onChange={(e) => {
                const questionNum = parseInt(e.target.value);
                if (questionNum >= 1 && questionNum <= questions.length) {
                  setCurrent(questionNum - 1);
                }
              }}
              className="question-jump-input"
            />
            <span className="question-total">of {questions.length}</span>
          </div>
          
          {current < questions.length - 1 && (
            <button 
              className="question-quiz-nav-btn"
              onClick={nextQuestion}
            >
              Next ➡
            </button>
          )}
        </div>

        {/* Submit and feedback */}
        {!questionSubmitted[current] && (
          <div className="question-quiz-submit">
            <button 
              className="question-quiz-submit-btn"
              onClick={submitCurrentQuestion}
            >
              Submit Question
            </button>
          </div>
        )}
        
        {questionSubmitted[current] && (
          <div className={`question-quiz-feedback ${questionScore[current] > 0 ? 'correct' : 'incorrect'}`}>
            <div className={`question-quiz-feedback-status ${questionScore[current] > 0 ? 'correct' : 'incorrect'}`}>
              {questionScore[current] > 0 ? '✅ Correct!' : '❌ Incorrect.'}
            </div>
            <div className="question-quiz-feedback-text">
              <strong>Explanation:</strong> {q.explanation || 'No explanation provided.'}
            </div>
            <div className="question-quiz-feedback-answer">
              <strong>Correct Answer:</strong> {q.correct_answer}
            </div>
          </div>
        )}

        {/* Score summary */}
        <div className="question-quiz-score">
          Score: {calculateScore()} / {maxScore()}
        </div>

        {/* Modal for explanation */}
        {showModal && (
          <div className="question-quiz-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="question-quiz-modal-content" onClick={e => e.stopPropagation()}>
              <button 
                className="question-quiz-modal-close" 
                onClick={() => setShowModal(false)} 
                aria-label="Close"
              >
                &times;
              </button>
              <div className="question-quiz-modal-title">Explanation</div>
              <div className="question-quiz-modal-text">
                {q.explanation || 'No explanation provided.'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}