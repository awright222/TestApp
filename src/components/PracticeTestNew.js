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
    correct_answer: q?.correct_answer
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
    
    const handleDrop = (item, zone) => {
      console.log('PracticeTestNew: Dropping item:', item, 'in zone:', zone);
      const newAnswer = { ...currentAnswer, [item]: zone };
      const newAnswers = [...userAnswers];
      newAnswers[current] = newAnswer;
      setUserAnswers(newAnswers);
    };
    
    const handleRemove = (item) => {
      console.log('PracticeTestNew: Removing item:', item);
      const newAnswer = { ...currentAnswer };
      delete newAnswer[item];
      const newAnswers = [...userAnswers];
      newAnswers[current] = newAnswer;
      setUserAnswers(newAnswers);
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
                
                return (
                  <div
                    key={item}
                    className="draggable-item"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', item);
                      console.log('PracticeTestNew: Started dragging:', item);
                    }}
                  >
                    {item}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Zones area */}
          <div className="drop-zones-panel">
            <h4>Drop Zones</h4>
            <div className="drop-zones">
              {zones.map(zone => {
                const itemsInZone = Object.entries(currentAnswer).filter(([_, z]) => z === zone);
                
                return (
                  <div
                    key={zone}
                    className="drop-zone"
                    onDragOver={(e) => {
                      e.preventDefault();
                      console.log('PracticeTestNew: Dragging over zone:', zone);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const item = e.dataTransfer.getData('text/plain');
                      console.log('PracticeTestNew: Dropped item:', item, 'in zone:', zone);
                      handleDrop(item, zone);
                    }}
                  >
                    <div className="zone-label">{zone}</div>
                    <div className="zone-content">
                      {itemsInZone.map(([item, _]) => (
                        <div
                          key={item}
                          className="dropped-item"
                          onClick={() => {
                            console.log('PracticeTestNew: Removing item:', item);
                            handleRemove(item);
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          {item} <span style={{ color: '#dc3545', marginLeft: '8px' }}>✕</span>
                        </div>
                      ))}
                      {itemsInZone.length === 0 && (
                        <div className="drop-hint">Drop items here</div>
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
    
    // Simple scoring - just mark as 1 point if any answer provided
    const newScores = [...questionScore];
    const answer = userAnswers[current];
    if (q.question_type?.toLowerCase() === 'drag and drop') {
      newScores[current] = Object.keys(answer || {}).length > 0 ? 1 : 0;
    } else {
      newScores[current] = answer && answer.length > 0 ? 1 : 0;
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
          <div className="explanation-header">
            <strong>Explanation:</strong>
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
