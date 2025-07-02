import React, { useState } from 'react';
import SaveModal from './SaveModal';
import './QuestionQuiz.css'; // Reuse the same CSS

export default function QuestionQuizWithSave({ 
  questions, 
  onSaveProgress, 
  caseStudyTitle,
  showSaveButton = true,
  initialProgress = null,
  existingSavedTest = null // Prop to track if this is loaded from a saved test
}) {
  const [current, setCurrent] = useState(initialProgress?.current || 0);
  const [userAnswers, setUserAnswers] = useState(
    initialProgress?.userAnswers || questions.map(getInitialUserAnswer)
  );
  const [questionScore, setQuestionScore] = useState(
    initialProgress?.questionScore || Array(questions.length).fill(null)
  );
  const [questionSubmitted, setQuestionSubmitted] = useState(
    initialProgress?.questionSubmitted || Array(questions.length).fill(false)
  );
  const [showModal, setShowModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  
  // Mark for Review feature states
  const [markedQuestions, setMarkedQuestions] = useState(initialProgress?.markedQuestions || []);
  const [questionNotes, setQuestionNotes] = useState(initialProgress?.questionNotes || {});
  const [showReviewPanel, setShowReviewPanel] = useState(false);

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

  // Mark for Review functions
  const toggleMarkQuestion = (questionIndex = current) => {
    setMarkedQuestions(prev => {
      const isMarked = prev.includes(questionIndex);
      if (isMarked) {
        // Remove from marked questions and clear any notes
        setQuestionNotes(prevNotes => {
          const updated = { ...prevNotes };
          delete updated[questionIndex];
          return updated;
        });
        return prev.filter(index => index !== questionIndex);
      } else {
        // Add to marked questions
        return [...prev, questionIndex];
      }
    });
  };

  const updateQuestionNote = (questionIndex, note) => {
    setQuestionNotes(prev => ({
      ...prev,
      [questionIndex]: note
    }));
  };

  const clearAllMarks = () => {
    setMarkedQuestions([]);
    setQuestionNotes({});
  };

  const isQuestionMarked = (questionIndex) => {
    return markedQuestions.includes(questionIndex);
  };

  const jumpToQuestion = (questionIndex) => {
    setCurrent(questionIndex);
  };

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

  const handleSave = (saveData) => {
    if (onSaveProgress) {
      // Include marked questions and notes in the save data
      const enhancedSaveData = {
        ...saveData,
        progress: {
          ...saveData.progress,
          markedQuestions: markedQuestions,
          questionNotes: questionNotes
        }
      };
      onSaveProgress(enhancedSaveData);
    }
  };

  return (
    <div>
      {/* Save Progress Button */}
      {showSaveButton && (
        <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
          <button
            onClick={() => setShowSaveModal(true)}
            style={{ 
              background: '#669BBC',
              color: '#003049',
              marginBottom: '1rem'
            }}
          >
            Save Progress
          </button>
        </div>
      )}

      <div className="question-box">
        <div className="question-header">
          <h2>
            Question {current + 1} of {questions.length}
            {markedQuestions.length > 0 && (
              <button 
                onClick={() => setShowReviewPanel(true)}
                className="review-button"
                title={`${markedQuestions.length} question(s) marked for review`}
                style={{ marginLeft: '1rem', fontSize: '0.8rem' }}
              >
                📌 Review ({markedQuestions.length})
              </button>
            )}
          </h2>
          <div className="question-header-buttons">
            <button
              onClick={() => toggleMarkQuestion(current)}
              className={`mark-review-btn ${isQuestionMarked(current) ? 'marked' : ''}`}
              title={isQuestionMarked(current) ? 'Remove mark for review' : 'Mark for review'}
              style={{ 
                background: isQuestionMarked(current) ? '#ffc107' : '#669BBC',
                color: isQuestionMarked(current) ? '#212529' : 'white',
                border: 'none',
                padding: '0.4rem 0.8rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                marginRight: '0.5rem'
              }}
            >
              {isQuestionMarked(current) ? '📌 Marked' : '📌 Mark'}
            </button>
            <button
              className="info-btn"
              onClick={() => setShowModal(true)}
              aria-label="Show explanation"
              title="Show explanation"
            >
              <span className="info-circle">i</span>
            </button>
          </div>
        </div>
        
        {/* Notes Section for Marked Questions */}
        {isQuestionMarked(current) && (
          <div className="question-notes-section" style={{
            background: '#fff9c4',
            border: '1px solid #f7d794',
            borderRadius: '8px',
            padding: '1rem',
            margin: '1rem 0'
          }}>
            <label style={{
              display: 'block',
              fontWeight: '600',
              color: '#8b6914',
              marginBottom: '0.5rem'
            }}>
              📝 Notes for this question:
            </label>
            <textarea
              placeholder="Add your notes about this question..."
              value={questionNotes[current] || ''}
              onChange={(e) => updateQuestionNote(current, e.target.value)}
              rows="3"
              style={{
                width: '100%',
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '0.5rem',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>
        )}
        
        <p>{q.question_text}</p>

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
          <div className="hotspot-dropdowns">
            {Object.entries(hotspotOptions).map(([label, options], idx) => {
              const userValue = userAnswers[current]?.[label] || '';
              const correctValue = correctHotspotAnswers[label];
              const isSubmitted = questionSubmitted[current];
              const isCorrect = userValue && userValue === correctValue;
              const showFeedback = isSubmitted && userValue;

              return (
                <div key={idx} style={{ marginBottom: '1rem' }}>
                  <strong>{label}</strong>
                  <div className="dropdown-container">
                    <select
                      value={userValue}
                      onChange={e => handleHotspotChange(label, e.target.value)}
                      disabled={isSubmitted}
                      style={
                        showFeedback
                          ? isCorrect
                            ? { borderColor: 'green', color: 'green', fontWeight: 'bold' }
                            : { borderColor: 'red', color: 'red', fontWeight: 'bold' }
                          : {}
                      }
                    >
                      <option value="">-- Select an option --</option>
                      {options.map((opt, i) => (
                        <option key={i} value={opt} title={opt}>{opt}</option>
                      ))}
                    </select>
                    {showFeedback && (
                      <div style={{ marginTop: '0.25rem' }}>
                        {isCorrect
                          ? <span style={{ color: 'green' }}>✅</span>
                          : (
                            <>
                              <span style={{ color: 'red' }}>❌</span>
                              <span style={{ color: 'green', marginLeft: 8, fontWeight: 'bold' }}>
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
        <div className="nav-row">
          <button onClick={prevQuestion} disabled={current === 0}>⬅ Back</button>
          
          {/* Jump to Question */}
          <div className="question-jump">
            <label htmlFor="quiz-question-jump">Go to Q:</label>
            <input
              id="quiz-question-jump"
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
            <button onClick={nextQuestion}>Next ➡</button>
          )}
        </div>

        {/* Submit and feedback */}
        {!questionSubmitted[current] && (
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
            <button onClick={submitCurrentQuestion}>Submit Question</button>
          </div>
        )}
        {questionSubmitted[current] && (
          <div style={{ marginTop: '1rem', backgroundColor: '#f0f0f0', color: '#003049', padding: '1rem', borderRadius: 8 }}>
            <strong>
              {questionScore[current] > 0 ? '✅ Correct!' : '❌ Incorrect.'}
            </strong>
            <p><strong>Explanation:</strong> {q.explanation || 'No explanation provided.'}</p>
            <p><strong>Correct Answer:</strong> {q.correct_answer}</p>
          </div>
        )}

        {/* Score summary */}
        <div style={{ marginTop: '2rem', textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
          Score: {calculateScore()} / {maxScore()}
        </div>

        {/* Modal for explanation */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowModal(false)} aria-label="Close">&times;</button>
              <strong>Explanation</strong>
              <p style={{ marginTop: '1rem' }}>{q.explanation || 'No explanation provided.'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Review Panel Modal */}
      {showReviewPanel && (
        <div className="modal-overlay" onClick={() => setShowReviewPanel(false)}>
          <div className="modal-content review-panel-modal" onClick={e => e.stopPropagation()} style={{
            maxWidth: '800px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.5rem 1.5rem 1rem 1.5rem',
              borderBottom: '1px solid #eee'
            }}>
              <h3 style={{ margin: 0, color: '#003049' }}>📌 Marked Questions for Review</h3>
              <button 
                className="modal-close" 
                onClick={() => setShowReviewPanel(false)}
                aria-label="Close review panel"
              >
                &times;
              </button>
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              {markedQuestions.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#669BBC', fontStyle: 'italic' }}>
                  <p>No questions marked for review yet.</p>
                  <p>Use the "📌 Mark" button on any question to add it here.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {markedQuestions.map(questionIndex => {
                    const question = questions[questionIndex];
                    const note = questionNotes[questionIndex];
                    return (
                      <div key={questionIndex} style={{
                        background: '#f8f9fa',
                        border: '1px solid #dee2e6',
                        borderRadius: '8px',
                        padding: '1rem'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.5rem'
                        }}>
                          <span style={{ fontWeight: 'bold', color: '#669BBC' }}>
                            Question {questionIndex + 1}
                          </span>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                              onClick={() => {
                                jumpToQuestion(questionIndex);
                                setShowReviewPanel(false);
                              }}
                              style={{
                                background: '#669BBC',
                                color: 'white',
                                border: 'none',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '4px',
                                fontSize: '0.85rem',
                                cursor: 'pointer'
                              }}
                            >
                              Go to Question
                            </button>
                            <button 
                              onClick={() => toggleMarkQuestion(questionIndex)}
                              style={{
                                background: '#dc3545',
                                color: 'white',
                                border: 'none',
                                padding: '0.4rem 0.6rem',
                                borderRadius: '4px',
                                fontSize: '0.85rem',
                                cursor: 'pointer'
                              }}
                              title="Remove mark"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                        
                        <div style={{
                          color: '#495057',
                          marginBottom: '0.5rem',
                          lineHeight: '1.4'
                        }}>
                          {question.question_text.substring(0, 100)}
                          {question.question_text.length > 100 ? '...' : ''}
                        </div>
                        
                        {note && (
                          <div style={{
                            background: '#fff9c4',
                            border: '1px solid #f7d794',
                            borderRadius: '4px',
                            padding: '0.5rem',
                            margin: '0.5rem 0',
                            fontSize: '0.9rem'
                          }}>
                            <strong style={{ color: '#8b6914' }}>Your Note:</strong> {note}
                          </div>
                        )}
                        
                        <div style={{ marginTop: '0.5rem' }}>
                          {questionSubmitted[questionIndex] ? (
                            <span style={{ color: '#28a745', fontSize: '0.85rem', fontWeight: '600' }}>
                              ✅ Answered
                            </span>
                          ) : (
                            <span style={{ color: '#ffc107', fontSize: '0.85rem', fontWeight: '600' }}>
                              ⏳ Not answered yet
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {markedQuestions.length > 0 && (
                <div style={{
                  marginTop: '1.5rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #eee',
                  textAlign: 'center'
                }}>
                  <button 
                    onClick={clearAllMarks}
                    style={{
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '0.6rem 1.2rem',
                      borderRadius: '6px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Clear All Marks
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Save Modal */}
      <SaveModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSave}
        current={current}
        userAnswers={userAnswers}
        questionScore={questionScore}
        questionSubmitted={questionSubmitted}
        questions={questions}
        existingSavedTest={existingSavedTest}
      />
    </div>
  );
}
