import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PublishedTestsService } from '../services/PublishedTestsService';
import './TakeTest.css';

export default function TakeTest() {
  const { shareId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState(null);
  const [studentInfo, setStudentInfo] = useState({ name: '', email: '' });
  const [accessCode, setAccessCode] = useState('');
  const [currentStep, setCurrentStep] = useState('info'); // 'info', 'access', 'test', 'results'
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [testStartTime, setTestStartTime] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTest();
  }, [shareId]);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && currentStep === 'test') {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && currentStep === 'test') {
      handleSubmitTest();
    }
  }, [timeLeft, currentStep]);

  const loadTest = async () => {
    try {
      const publishedTest = await PublishedTestsService.getPublishedTestByShareId(shareId);
      if (publishedTest) {
        console.log('=== LOADED TEST DEBUG ===');
        console.log('Full test object:', publishedTest);
        console.log('Questions array:', publishedTest.questions);
        if (publishedTest.questions && publishedTest.questions.length > 0) {
          console.log('First question:', publishedTest.questions[0]);
          publishedTest.questions.forEach((q, index) => {
            console.log(`Question ${index}:`, {
              question_type: q.question_type,
              choices: q.choices,
              choices_type: typeof q.choices,
              choices_length: q.choices?.length,
              correct_answer: q.correct_answer
            });
          });
        }
        console.log('=== END LOADED TEST DEBUG ===');
        
        setTest(publishedTest);
        if (publishedTest.settings.timeLimit > 0) {
          setTimeLeft(publishedTest.settings.timeLimit * 60); // Convert minutes to seconds
        }
      } else {
        setError('Test not found or no longer available');
      }
    } catch (error) {
      console.error('Error loading test:', error);
      setError('Failed to load test');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async () => {
    try {
      // Validate student eligibility
      const eligibility = await PublishedTestsService.canStudentTakeTest(shareId, studentInfo, accessCode);
      if (!eligibility.canTake) {
        alert(eligibility.reason);
        return;
      }

      // Record the attempt
      const attemptId = await PublishedTestsService.recordTestAttempt(shareId, studentInfo);
      setAttemptId(attemptId);
      setTestStartTime(new Date());
      setCurrentStep('test');
    } catch (error) {
      console.error('Error starting test:', error);
      alert('Failed to start test. Please try again.');
    }
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers({
      ...answers,
      [questionIndex]: answer
    });
  };

  const handleSubmitTest = async () => {
    if (!window.confirm('Are you sure you want to submit your test? You cannot change your answers after submission.')) {
      return;
    }

    try {
      const endTime = new Date();
      const timeSpent = Math.floor((endTime - testStartTime) / 1000); // seconds
      
      // Calculate score
      let correctAnswers = 0;
      const questionResults = {};
      
      test.questions.forEach((question, index) => {
        const studentAnswer = answers[index];
        const correctAnswer = question.correct_answer;
        const questionType = question.question_type?.toLowerCase();
        let isCorrect = false;
        
        // Handle different question types
        if (questionType === 'drag and drop') {
          // Parse correct matches from the correct_answer field
          const correctMatches = {};
          if (correctAnswer) {
            correctAnswer.split(',').forEach(match => {
              const [item, zone] = match.split('->').map(s => s.trim());
              if (item && zone) {
                correctMatches[item] = zone;
              }
            });
          }
          
          // Check if student's matches are correct
          const studentMatches = studentAnswer || {};
          const allItemsMatched = Object.keys(correctMatches).every(item => 
            studentMatches[item] === correctMatches[item]
          );
          const noExtraMatches = Object.keys(studentMatches).every(item => 
            correctMatches.hasOwnProperty(item)
          );
          
          isCorrect = allItemsMatched && noExtraMatches && 
                     Object.keys(correctMatches).length === Object.keys(studentMatches).length;
        } else {
          // Default comparison for other question types
          isCorrect = studentAnswer === correctAnswer;
        }
        
        questionResults[index] = {
          question: question.question_text,
          studentAnswer: questionType === 'drag and drop' ? 
            JSON.stringify(studentAnswer || {}) : studentAnswer,
          correctAnswer,
          isCorrect,
          explanation: question.explanation,
          questionType
        };
        
        if (isCorrect) correctAnswers++;
      });

      const score = correctAnswers;
      const percentage = Math.round((correctAnswers / test.questions.length) * 100);

      const testResults = {
        answers: questionResults,
        score: `${score}/${test.questions.length}`,
        percentage,
        timeSpent,
        passed: percentage >= test.settings.passingScore
      };

      // Submit results
      await PublishedTestsService.submitTestResults(shareId, attemptId, testResults);
      
      setResults(testResults);
      setCurrentStep('results');
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Failed to submit test. Please try again.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="take-test-loading">
        <div className="loading-spinner">🔄</div>
        <p>Loading test...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="take-test-error">
        <div className="error-icon">❌</div>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')}>Go Back</button>
      </div>
    );
  }

  // Student Info Step
  if (currentStep === 'info') {
    return (
      <div className="take-test-container">
        <div className="test-intro">
          <h1>{test.title}</h1>
          {test.description && <p className="test-description">{test.description}</p>}
          
          <div className="test-info">
            <div className="info-item">
              <span className="info-label">Questions:</span>
              <span className="info-value">{test.questions.length}</span>
            </div>
            {test.settings.timeLimit > 0 && (
              <div className="info-item">
                <span className="info-label">Time Limit:</span>
                <span className="info-value">{test.settings.timeLimit} minutes</span>
              </div>
            )}
            <div className="info-item">
              <span className="info-label">Passing Score:</span>
              <span className="info-value">{test.settings.passingScore}%</span>
            </div>
          </div>

          <div className="student-form">
            <h3>Before you begin</h3>
            {test.settings.requireName && (
              <div className="form-group">
                <label>Your Name *</label>
                <input
                  type="text"
                  value={studentInfo.name}
                  onChange={(e) => setStudentInfo({...studentInfo, name: e.target.value})}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}
            
            {test.settings.requireEmail && (
              <div className="form-group">
                <label>Your Email *</label>
                <input
                  type="email"
                  value={studentInfo.email}
                  onChange={(e) => setStudentInfo({...studentInfo, email: e.target.value})}
                  placeholder="Enter your email address"
                  required
                />
              </div>
            )}

            {test.settings.accessCode && (
              <div className="form-group">
                <label>Access Code *</label>
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="Enter the access code provided by your instructor"
                  required
                />
              </div>
            )}

            <button 
              className="start-test-btn"
              onClick={handleStartTest}
              disabled={
                (test.settings.requireName && !studentInfo.name.trim()) ||
                (test.settings.requireEmail && !studentInfo.email.trim()) ||
                (test.settings.accessCode && !accessCode.trim())
              }
            >
              Start Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Parse drag and drop data for current question
  const parseDragDropData = (question) => {
    if (question.question_type?.toLowerCase() !== 'drag and drop') return null;
    
    const lines = question.choices.split('\n').filter(line => line.trim());
    const items = [];
    const zones = [];
    
    let currentSection = '';
    
    lines.forEach(line => {
      const trimmed = line.trim().toLowerCase();
      if (trimmed.startsWith('items:')) {
        currentSection = 'items';
        const itemsText = line.substring(line.indexOf(':') + 1);
        if (itemsText.trim()) {
          items.push(...itemsText.split(',').map(item => item.trim()).filter(item => item));
        }
      } else if (trimmed.startsWith('zones:')) {
        currentSection = 'zones';
        const zonesText = line.substring(line.indexOf(':') + 1);
        if (zonesText.trim()) {
          zones.push(...zonesText.split(',').map(zone => zone.trim()).filter(zone => zone));
        }
      } else if (currentSection === 'items' && line.trim()) {
        items.push(...line.split(',').map(item => item.trim()).filter(item => item));
      } else if (currentSection === 'zones' && line.trim()) {
        zones.push(...line.split(',').map(zone => zone.trim()).filter(zone => zone));
      }
    });
    
    // Parse correct matches from the correct_answer field
    const correctMatches = {};
    if (question.correct_answer) {
      question.correct_answer.split(',').forEach(match => {
        const [item, zone] = match.split('->').map(s => s.trim());
        if (item && zone) {
          correctMatches[item] = zone;
        }
      });
    }
    
    return { items, zones, correctMatches };
  };

  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('text/plain', item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, zone) => {
    e.preventDefault();
    const item = e.dataTransfer.getData('text/plain');
    
    if (item && zone) {
      const currentAnswer = answers[currentQuestion] || {};
      const newAnswer = { ...currentAnswer, [item]: zone };
      handleAnswerChange(currentQuestion, newAnswer);
    }
  };

  const removeDragDropMatch = (item) => {
    const currentAnswer = answers[currentQuestion] || {};
    const newAnswer = { ...currentAnswer };
    delete newAnswer[item];
    handleAnswerChange(currentQuestion, newAnswer);
  };

  // Test Taking Step
  if (currentStep === 'test') {
    const question = test.questions[currentQuestion];
    const questionType = question.question_type?.toLowerCase();
    
    return (
      <div className="take-test-container">
        <div className="test-header">
          <div className="test-progress">
            <span>Question {currentQuestion + 1} of {test.questions.length}</span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{width: `${((currentQuestion + 1) / test.questions.length) * 100}%`}}
              ></div>
            </div>
          </div>
          {timeLeft !== null && (
            <div className={`timer ${timeLeft < 300 ? 'warning' : ''}`}>
              ⏱️ {formatTime(timeLeft)}
            </div>
          )}
        </div>

        <div className="question-content">
          <h2>{question.question_text}</h2>
          
          {/* Multiple Choice Questions */}
          {questionType === 'multiple choice' && (
            <div className="choices">
              {question.choices.split('\n').filter(choice => choice.trim()).map((choice, index) => (
                <label key={index} className="choice-option">
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    value={choice}
                    checked={answers[currentQuestion] === choice}
                    onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
                  />
                  <span className="choice-text">{choice}</span>
                </label>
              ))}
            </div>
          )}

          {/* Essay Questions */}
          {questionType === 'essay' && (
            <div className="essay-answer">
              <textarea
                value={answers[currentQuestion] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
                placeholder="Type your essay answer here..."
                className="essay-textarea"
                rows={10}
              />
            </div>
          )}

          {/* Short Answer Questions */}
          {questionType === 'short answer' && (
            <div className="short-answer">
              <input
                type="text"
                value={answers[currentQuestion] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
                placeholder="Type your answer here..."
                className="short-answer-input"
              />
            </div>
          )}

          {/* Drag and Drop Questions */}
          {questionType === 'drag and drop' && (() => {
            console.log('=== DRAG AND DROP DEBUG START ===');
            console.log('Question Object:', question);
            console.log('Question Type:', question.question_type);
            console.log('Question Type (lowercase):', questionType);
            console.log('Choices Raw:', question.choices);
            console.log('Choices Type:', typeof question.choices);
            console.log('Choices Length:', question.choices?.length);
            console.log('Correct Answer:', question.correct_answer);
            
            if (question.choices) {
              console.log('Choices Split by \\n:', question.choices.split('\n'));
              console.log('Filtered Lines:', question.choices.split('\n').filter(line => line.trim()));
            }
            
            const dragDropData = parseDragDropData(question);
            const currentAnswer = answers[currentQuestion] || {};
            
            console.log('Parsed drag drop data:', dragDropData);
            console.log('=== DRAG AND DROP DEBUG END ===');
            
            if (!dragDropData) {
              console.log('parseDragDropData returned null');
              return (
                <div className="error-message">
                  Failed to parse drag and drop data. Question type: {question.question_type}
                </div>
              );
            }
            
            if (!dragDropData.items.length || !dragDropData.zones.length) {
              console.log('Missing items or zones:', {
                items: dragDropData.items,
                zones: dragDropData.zones,
                rawChoices: question.choices,
                choicesLines: question.choices?.split('\n')
              });
              return (
                <div className="error-message">
                  This drag and drop question is not properly formatted. Expected format:
                  <br /><br />
                  <strong>In the "Drag Items &amp; Drop Zones" field:</strong>
                  <br />Items: item1, item2, item3
                  <br />Zones: zone1, zone2, zone3
                  <br /><br />
                  <strong>In the "Correct Matches" field:</strong>
                  <br />item1-&gt;zone1, item2-&gt;zone2
                  <br /><br />
                  <strong>Current choices data:</strong> {question.choices || 'No choices data'}
                  <br /><strong>Parsed items ({dragDropData.items.length}):</strong> {JSON.stringify(dragDropData.items)}
                  <br /><strong>Parsed zones ({dragDropData.zones.length}):</strong> {JSON.stringify(dragDropData.zones)}
                  <br /><strong>Lines in choices:</strong> {JSON.stringify(question.choices?.split('\n'))}
                </div>
              );
            }

            return (
              <div className="drag-drop-container">
                <div className="drag-drop-instructions">
                  <p>Drag items from the left panel to the appropriate drop zones on the right.</p>
                </div>
                
                <div className="drag-drop-workspace">
                  {/* Draggable Items */}
                  <div className="draggable-items-panel">
                    <h4>Items to Match:</h4>
                    <div className="draggable-items">
                      {dragDropData.items.map((item, index) => {
                        const isMatched = Object.keys(currentAnswer).includes(item);
                        return (
                          <div
                            key={index}
                            className={`draggable-item ${isMatched ? 'matched' : ''}`}
                            draggable={!isMatched}
                            onDragStart={(e) => handleDragStart(e, item)}
                            style={{ opacity: isMatched ? 0.5 : 1 }}
                          >
                            {item}
                            {isMatched && (
                              <button 
                                className="remove-match"
                                onClick={() => removeDragDropMatch(item)}
                                title="Remove match"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Drop Zones */}
                  <div className="drop-zones-panel">
                    <h4>Drop Zones:</h4>
                    <div className="drop-zones">
                      {dragDropData.zones.map((zone, index) => {
                        const matchedItems = Object.entries(currentAnswer)
                          .filter(([item, matchedZone]) => matchedZone === zone)
                          .map(([item]) => item);

                        return (
                          <div
                            key={index}
                            className={`drop-zone ${matchedItems.length > 0 ? 'has-items' : ''}`}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, zone)}
                          >
                            <div className="zone-label">{zone}</div>
                            <div className="zone-content">
                              {matchedItems.length === 0 ? (
                                <span className="drop-hint">Drop items here</span>
                              ) : (
                                matchedItems.map((item, itemIndex) => (
                                  <div key={itemIndex} className="dropped-item">
                                    {item}
                                    <button 
                                      className="remove-match"
                                      onClick={() => removeDragDropMatch(item)}
                                      title="Remove match"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Current Matches Summary */}
                {Object.keys(currentAnswer).length > 0 && (
                  <div className="matches-summary">
                    <h4>Current Matches:</h4>
                    <ul>
                      {Object.entries(currentAnswer).map(([item, zone], index) => (
                        <li key={index}>
                          <strong>{item}</strong> → {zone}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Hotspot Questions */}
          {questionType === 'hotspot' && (
            <div className="hotspot-question">
              <p>Click on the correct area in the image/diagram</p>
              {/* Note: Hotspot implementation would need additional image/coordinate handling */}
              <div className="hotspot-placeholder">
                Hotspot question interface needs additional implementation
              </div>
            </div>
          )}
        </div>

        <div className="test-navigation">
          <button 
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="nav-btn prev-btn"
          >
            ← Previous
          </button>
          
          {currentQuestion === test.questions.length - 1 ? (
            <button 
              onClick={handleSubmitTest}
              className="submit-btn"
            >
              Submit Test
            </button>
          ) : (
            <button 
              onClick={() => setCurrentQuestion(Math.min(test.questions.length - 1, currentQuestion + 1))}
              className="nav-btn next-btn"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    );
  }

  // Results Step
  if (currentStep === 'results') {
    return (
      <div className="take-test-container">
        <div className="test-results">
          <h1>Test Complete!</h1>
          
          <div className="results-summary">
            <div className={`score-display ${results.passed ? 'passed' : 'failed'}`}>
              <div className="score-circle">
                <span className="percentage">{results.percentage}%</span>
                <span className="score">{results.score}</span>
              </div>
              <div className="pass-status">
                {results.passed ? '✅ Passed' : '❌ Failed'}
              </div>
            </div>

            <div className="results-details">
              <div className="detail-item">
                <span>Time Spent:</span>
                <span>{formatTime(results.timeSpent)}</span>
              </div>
              <div className="detail-item">
                <span>Passing Score:</span>
                <span>{test.settings.passingScore}%</span>
              </div>
            </div>
          </div>

          {test.settings.showResults && test.settings.allowReview && (
            <div className="results-review">
              <h3>Review Your Answers</h3>
              {Object.entries(results.answers).map(([index, result]) => (
                <div key={index} className={`review-item ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="review-question">
                    <strong>Q{parseInt(index) + 1}: {result.question}</strong>
                  </div>
                  <div className="review-answers">
                    <div className="student-answer">
                      <span className="label">Your Answer:</span>
                      <span className={result.isCorrect ? 'correct' : 'incorrect'}>
                        {result.studentAnswer ? (
                          result.questionType === 'drag and drop' && typeof result.studentAnswer === 'object' ?
                            Object.entries(result.studentAnswer).map(([item, zone]) => `${item} → ${zone}`).join(', ') :
                            result.studentAnswer
                        ) : 'No answer'}
                      </span>
                    </div>
                    {test.settings.showCorrectAnswers && !result.isCorrect && (
                      <div className="correct-answer">
                        <span className="label">Correct Answer:</span>
                        <span className="correct">
                          {result.questionType === 'drag and drop' && typeof result.correctAnswer === 'string' && result.correctAnswer.includes('->') ? 
                            result.correctAnswer.split(',').map(match => {
                              const [item, zone] = match.split('->').map(s => s.trim());
                              return `${item} → ${zone}`;
                            }).join(', ') :
                            result.correctAnswer
                          }
                        </span>
                      </div>
                    )}
                    {test.settings.showExplanations && result.explanation && (
                      <div className="explanation">
                        <span className="label">Explanation:</span>
                        <span>{result.explanation}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="results-actions">
            <p>Your results have been submitted to your instructor.</p>
            <button onClick={() => navigate('/')}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
