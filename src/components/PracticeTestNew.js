import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { SavedTestsService } from '../SavedTestsService';
import SaveModal from '../SaveModal';
import SearchResults from './SearchResults';
import './PracticeTest.css';

function PracticeTestNew({ selectedTest, onBackToSelection, searchTerm, onClearSearch, onTestComplete }) {
  console.log('*** COMPLETELY NEW FILE LOADED - CACHE DEFINITELY BUSTED ***');
  console.log('PracticeTestNew: Component function called, selectedTest:', selectedTest?.title);
  
  // State
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [questionScore, setQuestionScore] = useState([]);
  const [questionSubmitted, setQuestionSubmitted] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);

  // Simple initialization
  useEffect(() => {
    console.log('PracticeTestNew: SIMPLE useEffect triggered');
    
    if (!selectedTest || !selectedTest.questions) {
      console.log('PracticeTestNew: No test or questions, returning');
      return;
    }
    
    console.log('PracticeTestNew: Setting up questions, count:', selectedTest.questions.length);
    setQuestions(selectedTest.questions);
    
    // Initialize user answers based on question type
    const initialAnswers = selectedTest.questions.map(q => {
      if (q?.question_type?.toLowerCase() === 'drag and drop') {
        return {};
      } else if (q?.question_type?.toLowerCase() === 'multiple choice') {
        return [];
      }
      return '';
    });
    
    setUserAnswers(initialAnswers);
    setQuestionScore(Array(selectedTest.questions.length).fill(null));
    setQuestionSubmitted(Array(selectedTest.questions.length).fill(false));
    setLoading(false);
    
    console.log('PracticeTestNew: Initialization complete - should render now');
  }, [selectedTest]);

  console.log('PracticeTestNew: RENDER FUNCTION REACHED! State check - loading:', loading, 'questions.length:', questions.length);

  if (loading) {
    return (
      <div className="practice-test-loading">
        <div className="loading-icon">⚡</div>
        <div className="loading-title">Loading {selectedTest?.title}...</div>
        <div className="loading-subtitle">Please wait while we prepare your questions</div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="practice-test-error">
        <div className="error-icon">📚</div>
        <div className="error-title">No questions found for this test.</div>
        <button onClick={onBackToSelection} className="back-btn">
          Back to Test Selection
        </button>
      </div>
    );
  }

  const q = questions[current];
  console.log('PracticeTestNew: Rendering question', current + 1, 'of', questions.length, ':', {
    question_type: q?.question_type,
    question_text: q?.question_text,
    choices: q?.choices,
    correct_answer: q?.correct_answer,
    full_question_object: q
  });

  // Drag and drop logic
  const renderDragAndDrop = () => {
    console.log('PracticeTestNew: Rendering drag and drop question');
    
    // Parse items and zones from choices
    const lines = q.choices?.split('\n') || [];
    let items = [];
    let zones = [];
    
    for (const line of lines) {
      if (line.startsWith('Items:')) {
        items = line.replace('Items:', '').split(',').map(item => item.trim());
      } else if (line.startsWith('Zones:')) {
        zones = line.replace('Zones:', '').split(',').map(zone => zone.trim());
      }
    }
    
    console.log('PracticeTestNew: Parsed items:', items, 'zones:', zones);
    
    const currentAnswer = userAnswers[current] || {};
    const isSubmitted = questionSubmitted[current];
    
    // Parse correct answers for feedback
    let correctMatches = {};
    if (isSubmitted && q.correct_answer) {
      q.correct_answer.split(',').forEach(match => {
        const [item, zone] = match.split('->').map(s => s.trim());
        if (item && zone) {
          correctMatches[item] = zone;
        }
      });
    }
    
    const handleDrop = (item, zone) => {
      if (isSubmitted) return; // Don't allow changes after submission
      
      console.log('PracticeTestNew: Dropping item:', item, 'in zone:', zone);
      const newAnswer = { ...currentAnswer, [item]: zone };
      const newAnswers = [...userAnswers];
      newAnswers[current] = newAnswer;
      setUserAnswers(newAnswers);
    };
    
    const handleRemove = (item) => {
      if (isSubmitted) return; // Don't allow changes after submission
      
      console.log('PracticeTestNew: Removing item:', item);
      const newAnswer = { ...currentAnswer };
      delete newAnswer[item];
      const newAnswers = [...userAnswers];
      newAnswers[current] = newAnswer;
      setUserAnswers(newAnswers);
    };

    // Helper function to get item feedback class
    const getItemFeedbackClass = (item) => {
      if (!isSubmitted) return '';
      const studentZone = currentAnswer[item];
      const correctZone = correctMatches[item];
      
      if (studentZone === correctZone) {
        return 'item-correct';
      } else if (studentZone) {
        return 'item-incorrect';
      }
      return '';
    };

    // Helper function to get zone feedback class
    const getZoneFeedbackClass = (zone) => {
      if (!isSubmitted) return '';
      const itemsInZone = Object.entries(currentAnswer).filter(([_, z]) => z === zone);
      const allCorrect = itemsInZone.every(([item, _]) => correctMatches[item] === zone);
      const hasItems = itemsInZone.length > 0;
      
      if (hasItems && allCorrect) {
        return 'zone-correct';
      } else if (hasItems) {
        return 'zone-incorrect';
      }
      return '';
    };

    return (
      <div className="drag-drop-container">
        <div className="drag-drop-instructions">
          <p>Drag items from the left to the correct zones on the right</p>
        </div>
        
        <div className="drag-drop-workspace">
          {/* Items area */}
          <div className="draggable-items-panel">
            <h4>Items</h4>
            <div className="draggable-items">
              {items.map(item => {
                const isPlaced = currentAnswer[item];
                if (isPlaced) return null;
                
                const feedbackClass = getItemFeedbackClass(item);
                
                return (
                  <div
                    key={item}
                    className={`draggable-item ${feedbackClass}`}
                    draggable={!isSubmitted}
                    onDragStart={(e) => {
                      if (isSubmitted) {
                        e.preventDefault();
                        return;
                      }
                      e.dataTransfer.setData('text/plain', item);
                      console.log('PracticeTestNew: Started dragging:', item);
                    }}
                    style={{ 
                      cursor: isSubmitted ? 'default' : 'grab',
                      opacity: isSubmitted ? 0.7 : 1
                    }}
                  >
                    {item}
                  </div>
                );
              })}
              {/* Show correctly placed items that should be in the items area */}
              {isSubmitted && items.map(item => {
                const isPlaced = currentAnswer[item];
                const feedbackClass = getItemFeedbackClass(item);
                
                // Show items that are incorrectly placed or should be unplaced
                if (!isPlaced && correctMatches[item]) {
                  return (
                    <div
                      key={`missing-${item}`}
                      className={`draggable-item item-incorrect`}
                      style={{ 
                        cursor: 'default',
                        opacity: 0.5,
                        border: '2px dashed #dc3545'
                      }}
                    >
                      {item} <span style={{ fontSize: '0.8em', color: '#dc3545' }}>(should be placed)</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
          
          {/* Zones area */}
          <div className="drop-zones-panel">
            <h4>Drop Zones</h4>
            <div className="drop-zones">
              {zones.map(zone => {
                const itemsInZone = Object.entries(currentAnswer).filter(([_, z]) => z === zone);
                const zoneFeedbackClass = getZoneFeedbackClass(zone);
                
                return (
                  <div
                    key={zone}
                    className={`drop-zone ${zoneFeedbackClass} ${itemsInZone.length > 0 ? 'has-items' : ''}`}
                    onDragOver={(e) => {
                      if (isSubmitted) return;
                      e.preventDefault();
                      console.log('PracticeTestNew: Dragging over zone:', zone);
                    }}
                    onDrop={(e) => {
                      if (isSubmitted) return;
                      e.preventDefault();
                      const item = e.dataTransfer.getData('text/plain');
                      console.log('PracticeTestNew: Dropped item:', item, 'in zone:', zone);
                      handleDrop(item, zone);
                    }}
                    style={{
                      opacity: isSubmitted ? 0.9 : 1
                    }}
                  >
                    <div className="zone-label">
                      {zone}
                      {isSubmitted && (
                        <span style={{ 
                          marginLeft: '8px', 
                          fontSize: '0.9em',
                          color: zoneFeedbackClass === 'zone-correct' ? '#28a745' : 
                                 zoneFeedbackClass === 'zone-incorrect' ? '#dc3545' : '#6c757d'
                        }}>
                          {zoneFeedbackClass === 'zone-correct' ? '✓' : 
                           zoneFeedbackClass === 'zone-incorrect' ? '✗' : ''}
                        </span>
                      )}
                    </div>
                    <div className="zone-content">
                      {itemsInZone.map(([item, _]) => {
                        const itemFeedbackClass = getItemFeedbackClass(item);
                        
                        return (
                          <div
                            key={item}
                            className={`dropped-item ${itemFeedbackClass}`}
                            onClick={() => {
                              if (isSubmitted) return;
                              console.log('PracticeTestNew: Removing item:', item);
                              handleRemove(item);
                            }}
                            style={{ 
                              cursor: isSubmitted ? 'default' : 'pointer',
                              opacity: isSubmitted ? 0.9 : 1
                            }}
                          >
                            {item} 
                            {!isSubmitted && <span style={{ color: '#dc3545', marginLeft: '8px' }}>✕</span>}
                            {isSubmitted && (
                              <span style={{ 
                                marginLeft: '8px',
                                color: itemFeedbackClass === 'item-correct' ? '#28a745' : '#dc3545'
                              }}>
                                {itemFeedbackClass === 'item-correct' ? '✓' : '✗'}
                              </span>
                            )}
                          </div>
                        );
                      })}
                      {/* Show what should be in this zone if submitted and incorrect */}
                      {isSubmitted && Object.entries(correctMatches).map(([correctItem, correctZone]) => {
                        if (correctZone === zone && !currentAnswer[correctItem]) {
                          return (
                            <div
                              key={`should-be-${correctItem}`}
                              className="dropped-item item-incorrect"
                              style={{ 
                                opacity: 0.5,
                                border: '2px dashed #28a745',
                                backgroundColor: 'rgba(40, 167, 69, 0.1)'
                              }}
                            >
                              {correctItem} <span style={{ fontSize: '0.8em', color: '#28a745' }}>(correct answer)</span>
                            </div>
                          );
                        }
                        return null;
                      })}
                      {itemsInZone.length === 0 && !isSubmitted && (
                        <div className="drop-hint">Drop items here</div>
                      )}
                      {itemsInZone.length === 0 && isSubmitted && (
                        <div className="drop-hint" style={{ color: '#6c757d' }}>Empty</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const submitAnswer = () => {
    console.log('PracticeTestNew: Submitting answer for question', current + 1);
    const newSubmitted = [...questionSubmitted];
    newSubmitted[current] = true;
    setQuestionSubmitted(newSubmitted);
    setShowExplanation(true);
    
    // Enhanced scoring logic with custom points
    const newScores = [...questionScore];
    const answer = userAnswers[current];
    
    // Get question points (custom or auto-calculated)
    const getQuestionPoints = (question) => {
      if (question.points) return question.points;
      
      // Auto-calculate default points based on question type
      if (question.question_type?.toLowerCase() === 'drag and drop') {
        const choices = question.choices || '';
        const lines = choices.split('\n');
        for (const line of lines) {
          if (line.startsWith('Items:')) {
            const items = line.replace('Items:', '').split(',').map(item => item.trim()).filter(item => item);
            return items.length; // 1 point per correct match
          }
        }
      } else if (question.question_type?.toLowerCase() === 'multiple choice') {
        const correctAnswer = question.correct_answer || '';
        const correctCount = correctAnswer.split(',').map(ans => ans.trim()).filter(ans => ans).length;
        return correctCount > 0 ? correctCount : 1; // 1 point per correct answer
      } else if (question.question_type?.toLowerCase() === 'hotspot') {
        const correctAnswer = question.correct_answer || '';
        const hotspotCount = correctAnswer.split('\n').filter(line => line.trim().includes(':')).length;
        return hotspotCount > 0 ? hotspotCount : 1; // 1 point per hotspot
      }
      return 1; // Default 1 point for other question types
    };
    
    const maxPoints = getQuestionPoints(q);
    console.log('PracticeTestNew: Max points for this question:', maxPoints);
    
    if (q.question_type?.toLowerCase() === 'drag and drop') {
      // Parse correct matches from the correct_answer field
      const correctMatches = {};
      if (q.correct_answer) {
        q.correct_answer.split(',').forEach(match => {
          const [item, zone] = match.split('->').map(s => s.trim());
          if (item && zone) {
            correctMatches[item] = zone;
          }
        });
      }
      
      console.log('PracticeTestNew: Correct matches:', correctMatches);
      console.log('PracticeTestNew: Student answer:', answer);
      
      // Check if student's matches are correct
      const studentMatches = answer || {};
      const totalCorrectMatches = Object.keys(correctMatches).length;
      
      if (q.points) {
        // Custom points: award full points if all correct, 0 if any wrong
        const allItemsMatched = Object.keys(correctMatches).every(item => 
          studentMatches[item] === correctMatches[item]
        );
        const noExtraMatches = Object.keys(studentMatches).every(item => 
          correctMatches.hasOwnProperty(item)
        );
        
        if (allItemsMatched && noExtraMatches && 
            Object.keys(correctMatches).length === Object.keys(studentMatches).length) {
          newScores[current] = maxPoints;
          console.log('PracticeTestNew: All correct! Full custom points:', newScores[current]);
        } else {
          newScores[current] = 0;
          console.log('PracticeTestNew: Some incorrect. Custom points:', newScores[current]);
        }
      } else {
        // Auto points: 1 point per correct match (partial credit)
        let correctCount = 0;
        Object.keys(correctMatches).forEach(item => {
          if (studentMatches[item] === correctMatches[item]) {
            correctCount++;
          }
        });
        
        newScores[current] = correctCount;
        console.log('PracticeTestNew: Partial credit - correct matches:', correctCount, 'out of', totalCorrectMatches);
      }
    } else if (q.question_type?.toLowerCase() === 'multiple choice') {
      // Multiple choice scoring with partial credit for multiple correct answers
      const correctAnswers = (q.correct_answer || '').split(',').map(ans => ans.trim().toUpperCase()).filter(ans => ans);
      const studentAnswers = Array.isArray(answer) ? answer.map(ans => ans.toUpperCase()) : 
                            typeof answer === 'string' ? answer.split(',').map(ans => ans.trim().toUpperCase()).filter(ans => ans) : [];
      
      if (q.points) {
        // Custom points: all-or-nothing scoring
        const allCorrect = correctAnswers.length === studentAnswers.length && 
                          correctAnswers.every(ans => studentAnswers.includes(ans)) &&
                          studentAnswers.every(ans => correctAnswers.includes(ans));
        newScores[current] = allCorrect ? maxPoints : 0;
        console.log('PracticeTestNew: Multiple choice custom scoring - all correct:', allCorrect, 'score:', newScores[current]);
      } else {
        // Auto points: 1 point per correct answer (partial credit)
        let correctCount = 0;
        correctAnswers.forEach(correctAns => {
          if (studentAnswers.includes(correctAns)) {
            correctCount++;
          }
        });
        // Subtract points for incorrect selections
        studentAnswers.forEach(studentAns => {
          if (!correctAnswers.includes(studentAns)) {
            correctCount = Math.max(0, correctCount - 1);
          }
        });
        newScores[current] = correctCount;
        console.log('PracticeTestNew: Multiple choice partial credit - correct answers:', correctCount, 'out of', correctAnswers.length);
      }
    } else if (q.question_type?.toLowerCase() === 'essay' || q.question_type?.toLowerCase() === 'essay question') {
      // Essay scoring - award points if answered (manual grading needed)
      const hasAnswer = answer && answer.trim().length > 0;
      newScores[current] = hasAnswer ? maxPoints : 0;
      console.log('PracticeTestNew: Essay score (submitted):', newScores[current]);
    } else if (q.question_type?.toLowerCase() === 'short answer' || q.question_type?.toLowerCase() === 'short answer question') {
      // Short answer scoring - award points if answered (could add keyword matching later)
      const hasAnswer = answer && answer.trim().length > 0;
      newScores[current] = hasAnswer ? maxPoints : 0;
      console.log('PracticeTestNew: Short answer score (submitted):', newScores[current]);
    } else {
      // Default scoring for other question types
      newScores[current] = answer && answer.length > 0 ? maxPoints : 0;
    }
    
    setQuestionScore(newScores);
  };

  return (
    <div className="practice-test">
      <div className="practice-test-header">
        <button onClick={onBackToSelection} className="back-to-tests-btn">
          ← Back to Tests
        </button>
        <h1>{selectedTest?.title}</h1>
      </div>

      <div className="question-navigation">
        <span>Question {current + 1} of {questions.length}</span>
        <div className="score-display" style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          fontSize: '0.9em'
        }}>
          {questionSubmitted[current] && (
            <span className="current-question-score" style={{
              backgroundColor: questionScore[current] > 0 ? '#e8f5e9' : '#ffebee',
              color: questionScore[current] > 0 ? '#2e7d32' : '#c62828',
              padding: '4px 8px',
              borderRadius: '12px',
              fontWeight: 'bold'
            }}>
              {questionScore[current]}/{(() => {
                if (q.points) return q.points;
                if (q.question_type?.toLowerCase() === 'drag and drop') {
                  const choices = q.choices || '';
                  const lines = choices.split('\n');
                  for (const line of lines) {
                    if (line.startsWith('Items:')) {
                      const items = line.replace('Items:', '').split(',').map(item => item.trim()).filter(item => item);
                      return items.length;
                    }
                  }
                } else if (q.question_type?.toLowerCase() === 'multiple choice') {
                  const correctAnswer = q.correct_answer || '';
                  const correctCount = correctAnswer.split(',').map(ans => ans.trim()).filter(ans => ans).length;
                  return correctCount > 0 ? correctCount : 1;
                } else if (q.question_type?.toLowerCase() === 'hotspot') {
                  const correctAnswer = q.correct_answer || '';
                  const hotspotCount = correctAnswer.split('\n').filter(line => line.trim().includes(':')).length;
                  return hotspotCount > 0 ? hotspotCount : 1;
                }
                return 1;
              })()} pts
            </span>
          )}
          <span className="total-score" style={{
            color: '#6c757d'
          }}>
            Total: {questionScore.reduce((sum, score) => sum + (score || 0), 0)}/{questions.reduce((total, question) => {
              if (question.points) return total + question.points;
              if (question.question_type?.toLowerCase() === 'drag and drop') {
                const choices = question.choices || '';
                const lines = choices.split('\n');
                for (const line of lines) {
                  if (line.startsWith('Items:')) {
                    const items = line.replace('Items:', '').split(',').map(item => item.trim()).filter(item => item);
                    return total + items.length;
                  }
                }
              } else if (question.question_type?.toLowerCase() === 'multiple choice') {
                const correctAnswer = question.correct_answer || '';
                const correctCount = correctAnswer.split(',').map(ans => ans.trim()).filter(ans => ans).length;
                return total + (correctCount > 0 ? correctCount : 1);
              } else if (question.question_type?.toLowerCase() === 'hotspot') {
                const correctAnswer = question.correct_answer || '';
                const hotspotCount = correctAnswer.split('\n').filter(line => line.trim().includes(':')).length;
                return total + (hotspotCount > 0 ? hotspotCount : 1);
              }
              return total + 1;
            }, 0)} pts
          </span>
        </div>
      </div>

      <div className="question-text">
        <strong>{q.question_text}</strong>
      </div>

      {q.question_type?.toLowerCase() === 'drag and drop' && renderDragAndDrop()}

      {q.question_type?.toLowerCase() === 'multiple choice' && (
        <div className="multiple-choice-container">
          <p>Multiple choice question (simplified for testing)</p>
          <textarea
            value={userAnswers[current] || ''}
            onChange={(e) => {
              const newAnswers = [...userAnswers];
              newAnswers[current] = e.target.value;
              setUserAnswers(newAnswers);
            }}
            placeholder="Enter your answer"
          />
        </div>
      )}

      {(q.question_type?.toLowerCase() === 'essay' || q.question_type?.toLowerCase() === 'essay question') && (
        <div className="essay-container">
          <div className="essay-instructions">
            <p>Please provide a detailed written response to the question above.</p>
          </div>
          <textarea
            className="essay-textarea"
            value={userAnswers[current] || ''}
            onChange={(e) => {
              const newAnswers = [...userAnswers];
              newAnswers[current] = e.target.value;
              setUserAnswers(newAnswers);
            }}
            placeholder="Type your essay response here..."
            rows="10"
            disabled={questionSubmitted[current]}
            style={{
              width: '100%',
              minHeight: '200px',
              padding: '1rem',
              border: '2px solid #e9ecef',
              borderRadius: '8px',
              fontSize: '1rem',
              lineHeight: '1.5',
              fontFamily: 'inherit',
              resize: 'vertical',
              backgroundColor: questionSubmitted[current] ? '#f8f9fa' : 'white'
            }}
          />
          {questionSubmitted[current] && (
            <div className="essay-feedback" style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: '#e3f2fd',
              border: '1px solid #2196f3',
              borderRadius: '8px',
              color: '#1565c0'
            }}>
              <strong>📝 Essay Submitted</strong>
              <p>Your essay response has been recorded and will be reviewed by your instructor.</p>
            </div>
          )}
        </div>
      )}

      {(q.question_type?.toLowerCase() === 'short answer' || q.question_type?.toLowerCase() === 'short answer question') && (
        <div className="short-answer-container">
          <div className="short-answer-instructions">
            <p>Please provide a brief written response (typically 1-3 sentences).</p>
          </div>
          <textarea
            className="short-answer-textarea"
            value={userAnswers[current] || ''}
            onChange={(e) => {
              const newAnswers = [...userAnswers];
              newAnswers[current] = e.target.value;
              setUserAnswers(newAnswers);
            }}
            placeholder="Type your short answer here..."
            rows="3"
            disabled={questionSubmitted[current]}
            style={{
              width: '100%',
              minHeight: '80px',
              maxHeight: '120px',
              padding: '0.75rem',
              border: '2px solid #e9ecef',
              borderRadius: '8px',
              fontSize: '1rem',
              lineHeight: '1.4',
              fontFamily: 'inherit',
              resize: 'vertical',
              backgroundColor: questionSubmitted[current] ? '#f8f9fa' : 'white'
            }}
          />
          {questionSubmitted[current] && (
            <div className="short-answer-feedback" style={{
              marginTop: '0.75rem',
              padding: '0.75rem',
              backgroundColor: '#e8f5e9',
              border: '1px solid #4caf50',
              borderRadius: '8px',
              color: '#2e7d32'
            }}>
              <strong>✓ Short Answer Submitted</strong>
              <p>Your response has been recorded and will be reviewed by your instructor.</p>
            </div>
          )}
        </div>
      )}

      {/* Fallback for unknown question types */}
      {!['drag and drop', 'multiple choice', 'essay', 'essay question', 'short answer', 'short answer question'].includes(q.question_type?.toLowerCase()) && (
        <div className="unknown-question-type" style={{
          padding: '2rem',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3>⚠️ Unknown Question Type</h3>
          <p>Question type: <strong>{q.question_type}</strong></p>
          <p>This question type is not yet supported in the simplified interface.</p>
          <textarea
            value={userAnswers[current] || ''}
            onChange={(e) => {
              const newAnswers = [...userAnswers];
              newAnswers[current] = e.target.value;
              setUserAnswers(newAnswers);
            }}
            placeholder="Enter your answer here..."
            rows="4"
            style={{ width: '100%', padding: '0.5rem', marginTop: '1rem' }}
          />
        </div>
      )}

      <div className="nav-controls">
        <button
          onClick={() => setCurrent(Math.max(0, current - 1))}
          disabled={current === 0}
          className="nav-btn"
        >
          Previous
        </button>
        
        <button
          onClick={submitAnswer}
          disabled={questionSubmitted[current]}
          className="submit-btn"
        >
          Submit Answer
        </button>
        
        <button
          onClick={() => setCurrent(Math.min(questions.length - 1, current + 1))}
          disabled={current >= questions.length - 1}
          className="nav-btn"
        >
          Next
        </button>
      </div>

      {showExplanation && (
        <div className="explanation-container">
          <div className="explanation-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem'
          }}>
            <strong>Explanation:</strong>
            <span style={{
              backgroundColor: questionScore[current] > 0 ? '#e8f5e9' : '#ffebee',
              color: questionScore[current] > 0 ? '#2e7d32' : '#c62828',
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '0.9em',
              fontWeight: 'bold'
            }}>
              Score: {questionScore[current]}/{(() => {
                if (q.points) return q.points;
                if (q.question_type?.toLowerCase() === 'drag and drop') {
                  const choices = q.choices || '';
                  const lines = choices.split('\n');
                  for (const line of lines) {
                    if (line.startsWith('Items:')) {
                      const items = line.replace('Items:', '').split(',').map(item => item.trim()).filter(item => item);
                      return items.length;
                    }
                  }
                }
                return 1;
              })()} points
            </span>
          </div>
          <div className="explanation-text">{q.explanation}</div>
          <div className="correct-answer-header">
            <strong>Correct Answer:</strong>
          </div>
          <div className="correct-answer-text">{q.correct_answer}</div>
        </div>
      )}
    </div>
  );
}

export default PracticeTestNew;
