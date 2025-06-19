import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { SavedTestsService } from '../SavedTestsService';
import SaveModal from '../SaveModal';
import SearchResults from './SearchResults';
import './PracticeTest.css';

function PracticeTest({ selectedTest, onBackToSelection, searchTerm, onClearSearch, onTestComplete }) {
  const [questions, setQuestions] = useState([]);
  const [originalQuestions, setOriginalQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [questionScore, setQuestionScore] = useState([]);
  const [questionSubmitted, setQuestionSubmitted] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentSavedTest, setCurrentSavedTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testCompleted, setTestCompleted] = useState(false);
  const [showFinishConfirmation, setShowFinishConfirmation] = useState(false);
  
  // Mark for Review feature states
  const [markedQuestions, setMarkedQuestions] = useState([]);
  const [questionNotes, setQuestionNotes] = useState({});
  const [showReviewPanel, setShowReviewPanel] = useState(false);
  
  // Timer state
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerTime, setTimerTime] = useState(0); // in seconds
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerInputMinutes, setTimerInputMinutes] = useState(90);
  const [timerMinimized, setTimerMinimized] = useState(false);
  const [timerFloating, setTimerFloating] = useState(false);
  const [timerDragging, setTimerDragging] = useState(false);
  const [timerTimeHidden, setTimerTimeHidden] = useState(false);
  const [timerPosition, setTimerPosition] = useState({ x: window.innerWidth - 280, y: 24 });
  const timerOffset = useRef({ x: 0, y: 0 });
  const dragRef = useRef({ isDragging: false, lastUpdate: 0 });
  
  // Determine test mode based on test type
  const isAssessmentMode = selectedTest?.isSharedTest || selectedTest?.assessmentMode || false;
  const isPracticeMode = !isAssessmentMode;

  useEffect(() => {
    if (selectedTest) {
      console.log('PracticeTest: Loading selectedTest:', selectedTest);
      setLoading(true);
      
      // Set start time for shared tests
      if (selectedTest.isSharedTest && !selectedTest.startTime) {
        selectedTest.startTime = Date.now();
      }
      
      // Handle different test sources
      if (selectedTest.csvUrl) {
        console.log('PracticeTest: Loading from CSV URL');
        // Load from CSV (original test format)
        Papa.parse(selectedTest.csvUrl, {
          download: true,
          header: true,
          complete: (result) => {
            const filtered = result.data.filter(q => q.question_text);
            console.log('PracticeTest: CSV loaded, questions:', filtered.length);
            setQuestions(filtered);
            setOriginalQuestions(filtered);
            
            // Check if this is a saved test with progress
            if (selectedTest.savedProgress) {
              console.log('PracticeTest: Restoring saved progress:', selectedTest.savedProgress);
              // Set the current saved test info for the SaveModal
              if (selectedTest.savedTestInfo) {
                setCurrentSavedTest(selectedTest.savedTestInfo);
              }          // Restore saved progress
          setCurrent(selectedTest.savedProgress.current || 0);
          setUserAnswers(selectedTest.savedProgress.userAnswers || filtered.map(getInitialUserAnswer));
          setQuestionScore(selectedTest.savedProgress.questionScore || Array(filtered.length).fill(null));
          setQuestionSubmitted(selectedTest.savedProgress.questionSubmitted || Array(filtered.length).fill(false));
          // Restore marked questions and notes
          setMarkedQuestions(selectedTest.savedProgress.markedQuestions || []);
          setQuestionNotes(selectedTest.savedProgress.questionNotes || {});
            } else {
              // Initialize fresh state
              setUserAnswers(filtered.map(getInitialUserAnswer));
              setQuestionScore(Array(filtered.length).fill(null));
              setQuestionSubmitted(Array(filtered.length).fill(false));
            }
            setLoading(false);
          },
          error: (error) => {
            console.error('Error loading test:', error);
            setLoading(false);
            alert('Failed to load test questions. Please try again.');
          }
        });
      } else if (selectedTest.questions && Array.isArray(selectedTest.questions)) {
        console.log('PracticeTest: Loading from questions array, count:', selectedTest.questions.length);
        // Handle custom tests or saved tests with direct question arrays
        const questionArray = selectedTest.questions;
        setQuestions(questionArray);
        setOriginalQuestions(questionArray);
        
        // Check if this is a saved test with progress
        if (selectedTest.savedProgress) {
          console.log('PracticeTest: Restoring saved progress:', selectedTest.savedProgress);
          // Set the current saved test info for the SaveModal
          if (selectedTest.savedTestInfo) {
            setCurrentSavedTest(selectedTest.savedTestInfo);
          }
          // Restore saved progress
          setCurrent(selectedTest.savedProgress.current || 0);
          setUserAnswers(selectedTest.savedProgress.userAnswers || questionArray.map(getInitialUserAnswer));
          setQuestionScore(selectedTest.savedProgress.questionScore || Array(questionArray.length).fill(null));
          setQuestionSubmitted(selectedTest.savedProgress.questionSubmitted || Array(questionArray.length).fill(false));
          // Restore marked questions and notes
          setMarkedQuestions(selectedTest.savedProgress.markedQuestions || []);
          setQuestionNotes(selectedTest.savedProgress.questionNotes || {});
        } else {
          console.log('PracticeTest: Initializing fresh state');
          // Initialize fresh state
          setUserAnswers(questionArray.map(getInitialUserAnswer));
          setQuestionScore(Array(questionArray.length).fill(null));
          setQuestionSubmitted(Array(questionArray.length).fill(false));
        }
        setLoading(false);
      } else {
        console.error('PracticeTest: Invalid test format:', selectedTest);
        setLoading(false);
        alert('Invalid test format. Please try again.');
      }
    }
  }, [selectedTest]);

  // Timer initialization effect
  useEffect(() => {
    if (selectedTest && questions.length > 0) {
      if (isAssessmentMode) {
        // Assessment mode: auto-start timer with required time
        const defaultTime = selectedTest.timeLimit || 90; // minutes
        setTimerTime(defaultTime * 60); // convert to seconds
        setTimerEnabled(true);
        setTimerRunning(true);
      } else {
        // Practice mode: timer available but not auto-started
        setTimerEnabled(false);
        setTimerTime(timerInputMinutes * 60);
      }
    }
  }, [selectedTest, questions, isAssessmentMode, timerInputMinutes]);

  // Timer countdown effect
  useEffect(() => {
    let interval;
    if (timerEnabled && timerRunning && timerTime > 0 && !testCompleted) {
      interval = setInterval(() => {
        setTimerTime(prev => {
          if (prev <= 1) {
            setTimerRunning(false);
            // Auto-finish test when time runs out in assessment mode
            if (isAssessmentMode) {
              handleFinishTest();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerEnabled, timerRunning, timerTime, testCompleted, isAssessmentMode]);

  // Timer drag effect
  useEffect(() => {
    if (timerDragging) {
      const handleMouseMove = (e) => {
        if (!timerDragging) return;
        
        // Throttle updates to 60fps max
        const now = Date.now();
        if (now - dragRef.current.lastUpdate < 16) return; // ~60fps
        dragRef.current.lastUpdate = now;
        
        // Use requestAnimationFrame for smooth animation
        requestAnimationFrame(() => {
          setTimerPosition({
            x: e.clientX - timerOffset.current.x,
            y: Math.max(0, e.clientY - timerOffset.current.y),
          });
        });
      };
      
      const handleMouseUp = () => {
        setTimerDragging(false);
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
      };

      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      window.addEventListener("mouseup", handleMouseUp);
      
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [timerDragging]);

  // Timer utility functions
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    if (isPracticeMode) {
      setTimerEnabled(!timerEnabled);
      if (!timerEnabled) {
        setTimerTime(timerInputMinutes * 60);
        setTimerRunning(false);
      }
    }
  };

  const startStopTimer = () => {
    setTimerRunning(!timerRunning);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    if (isAssessmentMode) {
      const defaultTime = selectedTest.timeLimit || 90;
      setTimerTime(defaultTime * 60);
    } else {
      setTimerTime(timerInputMinutes * 60);
    }
  };

  const updateTimerMinutes = (minutes) => {
    if (isPracticeMode && !timerRunning) {
      setTimerInputMinutes(minutes);
      setTimerTime(minutes * 60);
    }
  };

  // Helper function to get initial answer based on question type
  function getInitialUserAnswer(q) {
    if (q?.question_type?.toLowerCase() === 'multiple choice') {
      return [];
    } else if (q?.question_type?.toLowerCase() === 'hotspot') {
      return {};
    }
    return '';
  }

  // Function to get choice label from choice text
  function getChoiceLabel(choice) {
    const match = choice.match(/^([A-Z])\./);
    return match ? match[1] : null;
  }

  // Function to shuffle array
  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

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

  // Handle saving progress
  const handleSaveProgress = async (saveData) => {
    try {
      // Use the progress data from SaveModal (it has the correct structure with totalQuestions and completedQuestions)
      const progressData = {
        ...saveData.progress, // Use SaveModal's progress structure
        questions: questions.map(q => ({ ...q })), // Add questions array for backward compatibility
        markedQuestions: markedQuestions, // Save marked questions
        questionNotes: questionNotes // Save question notes
      };
      
      // Create the complete saved test object
      const savedTestData = {
        id: currentSavedTest?.id || Date.now().toString(), // Ensure ID is string
        title: saveData.title,
        type: 'practice-test',
        progress: progressData,
        questions: questions.map(q => ({ ...q })), // Include questions at root level for compatibility
        dateCreated: currentSavedTest?.dateCreated || new Date().toISOString(),
        dateModified: new Date().toISOString(),
        // Include original test metadata if available
        originalTest: {
          title: selectedTest.title,
          color: selectedTest.color,
          csvUrl: selectedTest.csvUrl,
          isCustomTest: selectedTest.isCustomTest,
          customTestId: selectedTest.customTestId
        }
      };
      
      await SavedTestsService.saveTest(savedTestData);
      
      console.log('PracticeTest: Saved test data:', {
        title: savedTestData.title,
        progress: savedTestData.progress,
        totalQuestions: savedTestData.progress?.totalQuestions,
        completedQuestions: savedTestData.progress?.completedQuestions
      });
      
      setShowSaveModal(false);
      
      // Enhanced success message
      alert(
        '✅ Test saved successfully!\n\n' +
        '📍 You can find it in the "Saved Tests" section in the sidebar.\n' +
        '☁️ If you\'re logged in, it\'s automatically synced across your devices!'
      );
    } catch (error) {
      console.error('Error saving test:', error);
      throw error;
    }
  };

  // Update user answer for current question
  const updateUserAnswer = (answer) => {
    setUserAnswers(prev => {
      const updated = [...prev];
      updated[current] = answer;
      return updated;
    });
  };

  // Handle hotspot question changes
  function handleHotspotChange(label, val) {
    setUserAnswers(prev => {
      const updated = [...prev];
      updated[current] = { ...updated[current], [label]: val };
      return updated;
    });
  }

  // Submit current question
  const submitCurrentQuestion = () => {
    let points = 0;
    const q = questions[current];
    
    if (q.question_type?.toLowerCase() === 'multiple choice') {
      const correctAnswers = q.correct_answer.split(',').map(a => a.trim());
      const userSelection = Array.isArray(userAnswers[current]) ? userAnswers[current] : [userAnswers[current]];
      
      for (const userChoice of userSelection) {
        const userLabel = getChoiceLabel(userChoice);
        if (correctAnswers.includes(userLabel)) {
          points++;
        }
      }
    } else if (q.question_type?.toLowerCase() === 'hotspot') {
      const correctHotspotAnswers = {};
      const lines = q.correct_answer.split(/\r?\n/).filter(Boolean);
      for (const line of lines) {
        const [label, answer] = line.split(':');
        if (label && answer) {
          correctHotspotAnswers[label.trim()] = answer.trim();
        }
      }
      points = Object.entries(correctHotspotAnswers).filter(
        ([label, correct]) => userAnswers[current][label] === correct
      ).length;
    }
    setShowExplanation(true);
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

  // Check if all questions have been attempted
  const allQuestionsAttempted = () => {
    if (isPracticeMode) {
      // In practice mode, check if questions are submitted
      return questionSubmitted.every(submitted => submitted === true);
    } else {
      // In assessment mode, check if answers are provided
      return userAnswers.every(answer => {
        if (Array.isArray(answer)) {
          return answer.length > 0;
        } else if (typeof answer === 'object' && answer !== null) {
          return Object.keys(answer).length > 0;
        }
        return answer !== undefined && answer !== null && answer !== '';
      });
    }
  };

  // Get number of questions answered
  const answeredCount = () => {
    if (isPracticeMode) {
      return questionSubmitted.filter(submitted => submitted === true).length;
    } else {
      return userAnswers.filter(answer => {
        if (Array.isArray(answer)) {
          return answer.length > 0;
        } else if (typeof answer === 'object' && answer !== null) {
          return Object.keys(answer).length > 0;
        }
        return answer !== undefined && answer !== null && answer !== '';
      }).length;
    }
  };

  // Handle test finish
  const handleFinishTest = () => {
    if (!allQuestionsAttempted()) {
      const unanswered = questions.length - answeredCount();
      if (!window.confirm(`You have ${unanswered} unanswered questions. Are you sure you want to finish the test?`)) {
        return;
      }
    }
    setShowFinishConfirmation(true);
  };

  // Confirm and submit test
  const confirmFinishTest = () => {
    let finalScore = questionScore;
    let correctAnswers = 0;
    
    if (isAssessmentMode) {
      // In assessment mode, calculate all scores at once
      finalScore = userAnswers.map((userAnswer, index) => {
        const q = questions[index];
        let points = 0;
        
        if (q.question_type?.toLowerCase() === 'multiple choice') {
          const correctAnswers = q.correct_answer.split(',').map(a => a.trim());
          const userSelection = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
          
          for (const userChoice of userSelection) {
            const userLabel = getChoiceLabel(userChoice);
            if (correctAnswers.includes(userLabel)) {
              points++;
            }
          }
        } else if (q.question_type?.toLowerCase() === 'hotspot') {
          const correctAnswers = q.hotspot_answers;
          if (correctAnswers && userAnswer) {
            points = Object.entries(correctAnswers).filter(
              ([label, correct]) => userAnswer[label] === correct
            ).length;
          }
        }
        
        return points;
      });
      
      correctAnswers = finalScore.reduce((sum, val) => sum + (val || 0), 0);
    } else {
      // In practice mode, use existing scores
      correctAnswers = finalScore.reduce((sum, val) => sum + (val || 0), 0);
    }
    
    const totalQuestions = questions.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    
    // Calculate time spent (if we have start time)
    const timeSpent = selectedTest.startTime ? 
      Math.floor((Date.now() - selectedTest.startTime) / 1000) : 0;
    
    const results = {
      score,
      totalQuestions,
      correctAnswers,
      timeSpent,
      completedAt: new Date().toISOString(),
      answeredCount: answeredCount(),
      mode: isAssessmentMode ? 'assessment' : 'practice'
    };

    setTestCompleted(true);
    setShowFinishConfirmation(false);
    
    // Update question scores for display
    if (isAssessmentMode) {
      setQuestionScore(finalScore);
      setQuestionSubmitted(new Array(questions.length).fill(true));
      setShowExplanation(true);
    }

    // Call completion callback for shared tests
    if (onTestComplete && selectedTest?.isSharedTest) {
      onTestComplete(results);
    }

    // Show results summary
    const modeText = isAssessmentMode ? 'Assessment' : 'Practice Test';
    alert(`${modeText} Completed!\n\nScore: ${score}%\nCorrect Answers: ${correctAnswers}/${totalQuestions}\nQuestions Answered: ${answeredCount()}/${totalQuestions}\nTime Spent: ${Math.floor(timeSpent / 60)}m ${timeSpent % 60}s`);
  };

  // Navigation functions
  const nextQuestion = () => {
    setCurrent(prev => Math.min(questions.length - 1, prev + 1));
    setShowExplanation(false);
  };

  const prevQuestion = () => {
    setCurrent(prev => Math.max(0, prev - 1));
    setShowExplanation(false);
  };

  const jumpToQuestion = (questionIndex) => {
    setCurrent(questionIndex);
    setShowExplanation(false);
  };

  // Timer drag handlers
  const onTimerMouseDown = (e) => {
    if (!timerFloating) return;
    e.preventDefault(); // Prevent text selection
    setTimerDragging(true);
    timerOffset.current = {
      x: e.clientX - timerPosition.x,
      y: e.clientY - timerPosition.y,
    };
    document.body.style.userSelect = "none";
    document.body.style.cursor = "grabbing";
  };

  const minimizeTimer = () => {
    setTimerMinimized(true);
    setTimerFloating(true);
  };

  const maximizeTimer = () => {
    setTimerMinimized(false);
    setTimerFloating(false);
    document.body.style.cursor = ""; // Reset cursor
  };

  const makeTimerFloating = () => {
    setTimerFloating(true);
    setTimerMinimized(false);
  };

  const toggleTimerTimeVisibility = () => {
    setTimerTimeHidden(!timerTimeHidden);
  };

  // Show loading screen while questions are being loaded
  if (loading) {
    return (
      <div className="practice-test-loading">
        <div className="loading-icon">⚡</div>
        <div className="loading-title">Loading {selectedTest.title}...</div>
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

  // Prepare current question data
  const q = questions[current];
  const isLast = current >= questions.length - 1;
  const choices = q.choices?.match(/^[A-Z]\..+?(?=\n[A-Z]\.|$)/gms)?.map(s => s.trim()) || [];

  // Hotspot options
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

  const runningScore = questionScore.reduce((sum, val) => sum + (val || 0), 0);

  return (
    <div className="practice-test">
      {/* Clean Header */}
      <div className="practice-test-header">
        <div className="header-top">
          <button onClick={onBackToSelection} className="back-to-tests-btn">
            ← Back to Tests
          </button>
          <div className="mode-info">
            <span className={`mode-badge ${isAssessmentMode ? 'assessment-mode' : 'practice-mode'}`}>
              {isAssessmentMode ? '📝 Assessment Mode' : '🎯 Practice Mode'}
            </span>
            <p className="mode-description">
              {isAssessmentMode 
                ? 'Answer all questions, then submit for final score' 
                : 'Get immediate feedback as you submit each answer'}
            </p>
          </div>
        </div>
        <div className="header-bottom">
          <div className="test-info">
            <h1 className="test-title">
              {selectedTest.title}
            </h1>
            {selectedTest.isSavedTest && currentSavedTest && selectedTest.showSaveName && (
              <p className="saved-test-info">
                Save: <span className="save-name">{currentSavedTest.title}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Integrated Timer */}
      {(timerEnabled || isPracticeMode) && !timerFloating && (
        <div className="integrated-timer">
          <div className="timer-display">
            <div className="timer-time">
              <span className={`timer-value ${timerTime < 300 && timerTime > 0 ? 'timer-warning' : ''} ${timerTime === 0 ? 'timer-expired' : ''} ${timerTimeHidden ? 'timer-hidden' : ''}`}>
                {timerTimeHidden ? '••:••:••' : formatTime(timerTime)}
              </span>
              {isAssessmentMode && (
                <span className="timer-label">{timerTimeHidden ? 'Time Hidden (Still Running)' : 'Time Remaining'}</span>
              )}
              {isPracticeMode && (
                <span className="timer-label">
                  {timerTimeHidden && timerEnabled ? 'Timer Hidden (Still Running)' : 
                   timerEnabled ? 'Practice Timer' : 'Timer Available'}
                </span>
              )}
            </div>
            
            <div className="timer-controls">
              <button 
                onClick={toggleTimerTimeVisibility}
                className="timer-btn timer-hide-time"
                title={timerTimeHidden ? 'Show time' : 'Hide time'}
              >
                {timerTimeHidden ? '👁️' : '🙈'}
              </button>
              
              <button 
                onClick={minimizeTimer}
                className="timer-btn timer-minimize"
                title="Minimize timer"
              >
                ➖
              </button>
              
              <button 
                onClick={makeTimerFloating}
                className="timer-btn timer-float"
                title="Make timer floating"
              >
                📌
              </button>
              
              {isPracticeMode && (
                <>
                  <button 
                    onClick={toggleTimer}
                    className={`timer-btn ${timerEnabled ? 'timer-enabled' : 'timer-disabled'}`}
                    title={timerEnabled ? 'Disable timer' : 'Enable timer'}
                  >
                    {timerEnabled ? '⏰' : '⏱️'}
                  </button>
                  
                  {timerEnabled && (
                    <>
                      <button 
                        onClick={startStopTimer}
                        className={`timer-btn ${timerRunning ? 'timer-pause' : 'timer-play'}`}
                        title={timerRunning ? 'Pause timer' : 'Start timer'}
                      >
                        {timerRunning ? '⏸️' : '▶️'}
                      </button>
                      
                      <button 
                        onClick={resetTimer}
                        className="timer-btn timer-reset"
                        title="Reset timer"
                      >
                        🔄
                      </button>
                      
                      <input
                        type="number"
                        min="1"
                        max="300"
                        value={timerInputMinutes}
                        onChange={(e) => updateTimerMinutes(parseInt(e.target.value) || 1)}
                        className="timer-input"
                        disabled={timerRunning}
                        title="Set timer minutes"
                      />
                      <span className="timer-unit">min</span>
                    </>
                  )}
                </>
              )}
              
              {isAssessmentMode && (
                <div className="assessment-timer-info">
                  <span className="timer-status">
                    {timerRunning ? '🟢 Running' : '🔴 Stopped'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Timer */}
      {(timerEnabled || isPracticeMode) && timerFloating && (
        <div 
          className={`floating-timer ${timerMinimized ? 'minimized' : ''} ${timerDragging ? 'dragging' : ''}`}
          style={{
            position: 'fixed',
            left: `${timerPosition.x}px`,
            top: `${timerPosition.y}px`,
            zIndex: 1000,
          }}
          onMouseDown={onTimerMouseDown}
        >
          <div className="floating-timer-header">
            <div className="floating-timer-time">
              <span className={`floating-timer-value ${timerTime < 300 && timerTime > 0 ? 'timer-warning' : ''} ${timerTime === 0 ? 'timer-expired' : ''} ${timerTimeHidden ? 'timer-hidden' : ''}`}>
                {timerTimeHidden ? '••:••:••' : formatTime(timerTime)}
              </span>
            </div>
            <div className="floating-timer-header-controls">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTimerTimeVisibility();
                }}
                className="floating-timer-btn floating-timer-hide-time"
                title={timerTimeHidden ? 'Show time' : 'Hide time'}
              >
                {timerTimeHidden ? '👁️' : '🙈'}
              </button>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setTimerMinimized(!timerMinimized);
                }}
                className="floating-timer-btn floating-timer-minimize"
                title={timerMinimized ? 'Expand timer' : 'Minimize timer'}
              >
                {timerMinimized ? '🔼' : '🔽'}
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  maximizeTimer();
                }}
                className="floating-timer-btn"
                title="Return to integrated view"
              >
                ⬜
              </button>
            </div>
          </div>
          
          {!timerMinimized && (
            <div className="floating-timer-body">
              <div className="floating-timer-label">
                {isAssessmentMode ? 'Time Remaining' : 
                 (isPracticeMode && timerEnabled ? 'Practice Timer' : 'Timer Available')}
              </div>
              
              <div className="floating-timer-controls">
                {isPracticeMode && (
                  <>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTimer();
                      }}
                      className={`floating-timer-btn ${timerEnabled ? 'timer-enabled' : 'timer-disabled'}`}
                      title={timerEnabled ? 'Disable timer' : 'Enable timer'}
                    >
                      {timerEnabled ? '⏰' : '⏱️'}
                    </button>
                    
                    {timerEnabled && (
                      <>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            startStopTimer();
                          }}
                          className={`floating-timer-btn ${timerRunning ? 'timer-pause' : 'timer-play'}`}
                          title={timerRunning ? 'Pause timer' : 'Start timer'}
                        >
                          {timerRunning ? '⏸️' : '▶️'}
                        </button>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            resetTimer();
                          }}
                          className="floating-timer-btn timer-reset"
                          title="Reset timer"
                        >
                          🔄
                        </button>
                        
                        <input
                          type="number"
                          min="1"
                          max="300"
                          value={timerInputMinutes}
                          onChange={(e) => {
                            e.stopPropagation();
                            updateTimerMinutes(parseInt(e.target.value) || 1);
                          }}
                          className="floating-timer-input"
                          disabled={timerRunning}
                          title="Set timer minutes"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="floating-timer-unit">min</span>
                      </>
                    )}
                  </>
                )}
                
                {isAssessmentMode && (
                  <div className="floating-assessment-timer-info">
                    <span className="floating-timer-status">
                      {timerRunning ? '🟢 Running' : '🔴 Stopped'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="score-display">
        <div className="score-info">
          <span className="current-score">
            Score: {runningScore} / {
              questions.reduce((sum, q) => {
                if (q.question_type?.toLowerCase() === 'multiple choice') {
                  return sum + q.correct_answer.split(',').length;
                } else if (q.question_type?.toLowerCase() === 'hotspot') {
                  return sum + q.correct_answer.split(/\r?\n/).filter(Boolean).length;
                }
                return sum + 1;
              }, 0)
            }
          </span>
        </div>
        
        {!testCompleted && (
          <div className="finish-test-section">
            {allQuestionsAttempted() ? (
              <button
                onClick={handleFinishTest}
                className="finish-test-btn finish-ready"
              >
                ✅ Finish Test
              </button>
            ) : (
              <button
                onClick={handleFinishTest}
                className="finish-test-btn finish-partial"
                title={`${questions.length - answeredCount()} questions remaining`}
              >
                📝 Finish Test ({answeredCount()}/{questions.length})
              </button>
            )}
          </div>
        )}
        
        {testCompleted && (
          <div className="test-completed-badge">
            🎉 Test Completed!
          </div>
        )}
      </div>

      <div className="test-controls">
        <button
          onClick={() => {
            setQuestions(shuffleArray(originalQuestions));
            setCurrent(0);
            setShowExplanation(false);
          }}
          className="control-btn"
        >
          Shuffle Questions
        </button>
        <button
          onClick={() => {
            setQuestions(originalQuestions);
            setCurrent(0);
            setShowExplanation(false);
            setUserAnswers(originalQuestions.map(getInitialUserAnswer));
            setQuestionScore(Array(originalQuestions.length).fill(null));
            setQuestionSubmitted(Array(originalQuestions.length).fill(false));
          }}
          className="control-btn"
        >
          Reset
        </button>
        <button onClick={() => setShowSaveModal(true)} className="control-btn save-btn">
          Save Progress
        </button>
        {markedQuestions.length > 0 && (
          <button 
            onClick={() => setShowReviewPanel(true)}
            className="control-btn review-btn"
            title={`${markedQuestions.length} question(s) marked for review`}
          >
            📌 Review ({markedQuestions.length})
          </button>
        )}
      </div>

      <div className="question-counter">
        <div className="question-count-display">
          <span className="current-question">Question {current + 1} of {questions.length}</span>
        </div>
        <div className="question-jump-container">
          <input
            id="practice-question-jump"
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
            title="Jump to question"
            placeholder={`1-${questions.length}`}
          />
        </div>
      </div>

      <div className="question-text">
        <div className="question-header">
          <strong>{q.question_text}</strong>
          <div className="question-header-buttons">
            <button
              onClick={() => toggleMarkQuestion(current)}
              className={`mark-review-btn ${isQuestionMarked(current) ? 'marked' : ''}`}
              title={isQuestionMarked(current) ? 'Remove mark for review' : 'Mark for review'}
            >
              {isQuestionMarked(current) ? '📌 Marked' : '📌 Mark'}
            </button>
            <button
              className="info-btn"
              onClick={() => setShowModal(true)}
              aria-label="Show explanation"
              title="Show explanation and correct answer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 16v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Notes Section for Marked Questions */}
      {isQuestionMarked(current) && (
        <div className="question-notes-section">
          <label className="notes-label">
            📝 Notes for this question:
          </label>
          <textarea
            className="question-notes-textarea"
            placeholder="Add your notes about this question..."
            value={questionNotes[current] || ''}
            onChange={(e) => updateQuestionNote(current, e.target.value)}
            rows="3"
          />
        </div>
      )}

      {/* Multiple Choice Questions */}
      {q.question_type?.toLowerCase() === 'multiple choice' && (
        <>
          {(() => {
            const correctAnswers = q.correct_answer.split(',').map(s => s.trim());
            const maxSelections = correctAnswers.length;
            const currentSelections = Array.isArray(userAnswers[current]) ? userAnswers[current].length : 0;
            const limitReached = currentSelections >= maxSelections;
            
            return (
              <div className={`selection-info ${limitReached ? 'limit-reached' : ''}`}>
                {limitReached 
                  ? `Selection limit reached: ${currentSelections}/${maxSelections} choices selected`
                  : `Select up to ${maxSelections} answer${maxSelections > 1 ? 's' : ''} (${currentSelections}/${maxSelections} selected)`
                }
              </div>
            );
          })()}
          <div className="choices-container">
            {choices.map((choice, idx) => {
            const isSelected = Array.isArray(userAnswers[current]) 
              ? userAnswers[current].includes(choice)
              : userAnswers[current] === choice;
            
            // Determine if this choice is correct/incorrect after submission
            let feedbackClass = '';
            if (questionSubmitted[current]) {
              const correctAnswers = q.correct_answer.split(',').map(s => s.trim());
              const choiceLabel = getChoiceLabel(choice);
              const isCorrectChoice = correctAnswers.includes(choiceLabel);
              
              console.log('Feedback Debug:', {
                choice: choice.substring(0, 50) + '...',
                choiceLabel,
                correctAnswers,
                isCorrectChoice,
                isSelected
              });
              
              if (isSelected) {
                feedbackClass = isCorrectChoice ? 'choice-correct' : 'choice-incorrect';
              } else if (isCorrectChoice) {
                feedbackClass = 'choice-missed'; // Correct answer that wasn't selected
              }
              
              console.log('Applied feedbackClass:', feedbackClass);
            }
            
            return (
              <div key={idx} className="choice-item">
                <label className={`choice-label ${isSelected ? 'selected' : ''} ${feedbackClass}`}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {
                      const currentAnswers = Array.isArray(userAnswers[current]) ? userAnswers[current] : [];
                      const isCurrentlySelected = currentAnswers.includes(choice);
                      
                      if (isCurrentlySelected) {
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
                    }}
                    disabled={questionSubmitted[current]}
                  />
                  <span className="choice-text">{choice}</span>
                </label>
              </div>
            );
          })}
          </div>
        </>
      )}

      {/* Hotspot Questions */}
      {q.question_type?.toLowerCase() === 'hotspot' && (
        <div className="hotspot-container">
          {Object.entries(hotspotOptions).map(([label, options]) => {
            // Determine feedback for this hotspot item after submission
            let feedbackClass = '';
            let feedbackIcon = '';
            if (questionSubmitted[current]) {
              const userSelection = userAnswers[current][label] || '';
              const correctAnswer = correctHotspotAnswers[label];
              const isCorrect = userSelection === correctAnswer;
              
              console.log('Hotspot Feedback Debug:', {
                label,
                userSelection,
                correctAnswer,
                isCorrect
              });
              
              if (userSelection) {
                if (isCorrect) {
                  feedbackClass = 'hotspot-correct';
                  feedbackIcon = '✓';
                } else {
                  feedbackClass = 'hotspot-incorrect';
                  feedbackIcon = '✗';
                }
              } else if (correctAnswer) {
                feedbackClass = 'hotspot-missed';
                feedbackIcon = '!';
              }
              
              console.log('Applied hotspot feedbackClass:', feedbackClass);
            }
            
            return (
              <div key={label} className={`hotspot-item ${feedbackClass}`}>
                <strong className="hotspot-label">{label}:</strong>
                <select
                  value={userAnswers[current][label] || ''}
                  onChange={(e) => handleHotspotChange(label, e.target.value)}
                  disabled={questionSubmitted[current]}
                  className={`hotspot-select ${feedbackClass}`}
                >
                  <option value="">Select...</option>
                  {options.map((option, idx) => (
                    <option key={idx} value={option}>{option}</option>
                  ))}
                </select>
                {questionSubmitted[current] && feedbackIcon && (
                  <div className={`hotspot-feedback-icon ${feedbackClass}`}>
                    {feedbackIcon}
                  </div>
                )}
                {questionSubmitted[current] && feedbackClass === 'hotspot-missed' && (
                  <div className="hotspot-correct-answer">
                    Correct: {correctHotspotAnswers[label]}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="nav-controls">
        <button
          onClick={prevQuestion} 
          disabled={current === 0} 
          className="nav-btn nav-btn-left"
        >
          Previous
        </button>
        
        {/* Submit Answer button only in Practice Mode */}
        {isPracticeMode && (
          <button
            onClick={submitCurrentQuestion}
            disabled={questionSubmitted[current]}
            className="submit-btn submit-btn-center"
          >
            Submit Answer
          </button>
        )}
        
        {/* In Assessment Mode, show answer selection status */}
        {isAssessmentMode && (
          <div className="answer-status-center">
            {userAnswers[current] && (
              Array.isArray(userAnswers[current]) ? userAnswers[current].length > 0 : 
              typeof userAnswers[current] === 'object' ? Object.keys(userAnswers[current]).length > 0 :
              userAnswers[current] !== undefined && userAnswers[current] !== null && userAnswers[current] !== ''
            ) ? (
              <span className="answer-selected">✓ Answer Selected</span>
            ) : (
              <span className="answer-pending">○ Select Answer</span>
            )}
          </div>
        )}
        
        <button 
          onClick={nextQuestion} 
          disabled={isLast}
          className="nav-btn nav-btn-right"
        >
          Next
        </button>
      </div>

      {/* Explanations - Show in Practice Mode after submission, or in Assessment Mode after completion */}
      {((isPracticeMode && showExplanation) || (isAssessmentMode && testCompleted)) && (
        <div className="explanation-container">
          <div className="explanation-header">
            <strong>Explanation:</strong>
          </div>
          <div className="explanation-text">{q.explanation}</div>
          <div className="correct-answer-header">
            <strong>Correct Answer:</strong>
          </div>
          <div className="correct-answer-text">{q.correct_answer}</div>
          
          {/* Show score for this question */}
          {questionScore[current] !== null && (
            <div className="question-score">
              <strong>Your Score: {questionScore[current]} points</strong>
              {questionScore[current] > 0 ? ' ✅' : ' ❌'}
            </div>
          )}
        </div>
      )}

      {/* Modal for explanation */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button 
              className="modal-close" 
              onClick={() => setShowModal(false)} 
              aria-label="Close"
            >
              &times;
            </button>
            <div className="modal-title">Explanation</div>
            <div className="modal-text">
              <div className="modal-explanation">
                <strong>Explanation:</strong>
                <p>{q.explanation || 'No explanation provided.'}</p>
              </div>
              <div className="modal-correct-answer">
                <strong>Correct Answer:</strong>
                <p>{q.correct_answer}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Finish Test Confirmation Modal */}
      {showFinishConfirmation && (
        <div className="modal-overlay">
          <div className="modal-content finish-confirmation-modal">
            <h3 className="finish-modal-title">🎯 Finish Test?</h3>
            <div className="finish-modal-body">
              <div className="test-summary">
                <div className="summary-item">
                  <span className="summary-label">Questions Answered:</span>
                  <span className="summary-value">{answeredCount()} / {questions.length}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Current Score:</span>
                  <span className="summary-value">
                    {Math.round((runningScore / questions.reduce((sum, q) => {
                      if (q.question_type?.toLowerCase() === 'multiple choice') {
                        return sum + q.correct_answer.split(',').length;
                      } else if (q.question_type?.toLowerCase() === 'hotspot') {
                        return sum + q.correct_answer.split(/\r?\n/).filter(Boolean).length;
                      }
                      return sum + 1;
                    }, 0)) * 100)}%
                  </span>
                </div>
                {selectedTest.startTime && (
                  <div className="summary-item">
                    <span className="summary-label">Time Spent:</span>
                    <span className="summary-value">
                      {Math.floor((Date.now() - selectedTest.startTime) / 60000)}m {Math.floor(((Date.now() - selectedTest.startTime) % 60000) / 1000)}s
                    </span>
                  </div>
                )}
              </div>
              
              {!allQuestionsAttempted() && (
                <div className="warning-message">
                  ⚠️ You have {questions.length - answeredCount()} unanswered questions. 
                  These will be marked as incorrect.
                </div>
              )}
              
              <div className="finish-modal-actions">
                <button
                  onClick={() => setShowFinishConfirmation(false)}
                  className="cancel-finish-btn"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmFinishTest}
                  className="confirm-finish-btn"
                >
                  {allQuestionsAttempted() ? '✅ Submit Test' : '📝 Submit Anyway'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Panel Modal */}
      {showReviewPanel && (
        <div className="modal-overlay" onClick={() => setShowReviewPanel(false)}>
          <div className="modal-content review-panel-modal" onClick={e => e.stopPropagation()}>
            <div className="review-panel-header">
              <h3>📌 Marked Questions for Review</h3>
              <button 
                className="modal-close" 
                onClick={() => setShowReviewPanel(false)}
                aria-label="Close review panel"
              >
                &times;
              </button>
            </div>
            
            <div className="review-panel-content">
              {markedQuestions.length === 0 ? (
                <div className="no-marked-questions">
                  <p>No questions marked for review yet.</p>
                  <p>Use the "📌 Mark" button on any question to add it here.</p>
                </div>
              ) : (
                <div className="marked-questions-list">
                  {markedQuestions.map(questionIndex => {
                    const question = questions[questionIndex];
                    const note = questionNotes[questionIndex];
                    return (
                      <div key={questionIndex} className="marked-question-item">
                        <div className="marked-question-header">
                          <span className="question-number">Question {questionIndex + 1}</span>
                          <div className="marked-question-actions">
                            <button 
                              onClick={() => {
                                jumpToQuestion(questionIndex);
                                setShowReviewPanel(false);
                              }}
                              className="jump-to-question-btn"
                            >
                              Go to Question
                            </button>
                            <button 
                              onClick={() => toggleMarkQuestion(questionIndex)}
                              className="unmark-question-btn"
                              title="Remove mark"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                        
                        <div className="marked-question-text">
                          {question.question_text.substring(0, 100)}
                          {question.question_text.length > 100 ? '...' : ''}
                        </div>
                        
                        {note && (
                          <div className="marked-question-note">
                            <strong>Your Note:</strong> {note}
                          </div>
                        )}
                        
                        <div className="marked-question-status">
                          {questionSubmitted[questionIndex] ? (
                            <span className="answered-status">✅ Answered</span>
                          ) : (
                            <span className="unanswered-status">⏳ Not answered yet</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {markedQuestions.length > 0 && (
                <div className="review-panel-footer">
                  <button 
                    onClick={clearAllMarks}
                    className="clear-all-marks-btn"
                  >
                    Clear All Marks
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <SaveModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveProgress}
        current={current}
        userAnswers={userAnswers}
        questionScore={questionScore}
        questionSubmitted={questionSubmitted}
        questions={questions}
        existingSavedTest={currentSavedTest}
      />

      {/* Search Results */}
      {searchTerm && (
        <SearchResults
          searchTerm={searchTerm}
          onClose={onClearSearch}
          currentQuestions={questions}
          onJumpToQuestion={jumpToQuestion}
          currentPage="practice"
        />
      )}
    </div>
  );
}

export default PracticeTest;
