import { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import './App.css';
import { CaseStudies, CaseStudyDetail } from './CaseStudies';
import Timer from "./Timer";
import SaveModal from './SaveModal';
import SavedTests from './SavedTests';
import { SavedTestsService } from './SavedTestsService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-regular-svg-icons';

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTDO68GqAelFKS2G6SwiUWdPs2tw5Gt62D5xLiB_9zyLyBPLSZm5gTthaQz9yCpmDKuymWMc83PV5a2/pub?gid=0&single=true&output=csv';

function App() {
  const [questions, setQuestions] = useState([]);
  const [originalQuestions, setOriginalQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]); // Store answers for all questions
  const [submitted, setSubmitted] = useState(false);
  const [questionScore, setQuestionScore] = useState(Array(questions.length).fill(null)); // Track per-question score
  const [questionSubmitted, setQuestionSubmitted] = useState(Array(questions.length).fill(false)); // Track if question was submitted
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showTimer, setShowTimer] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [currentSavedTest, setCurrentSavedTest] = useState(null);

  const navigate = useNavigate();

  // ✅ All hooks (including useEffect) go here, before any return or if
  useEffect(() => {
    Papa.parse(SHEET_CSV_URL, {
      download: true,
      header: true,
      complete: (result) => {
        const filtered = result.data.filter(q => q.question_text);
        setQuestions(filtered);
        setOriginalQuestions(filtered);
        setUserAnswers(filtered.map(getInitialUserAnswer)); // Initialize answers
      },
    });
  }, []);

  // Filter questions by search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
    } else {
      const term = searchTerm.toLowerCase();
      setSearchResults(
        questions.filter(q =>
          (q.question_text && q.question_text.toLowerCase().includes(term)) ||
          (q.choices && q.choices.toLowerCase().includes(term)) ||
          (q.explanation && q.explanation.toLowerCase().includes(term))
        )
      );
    }
  }, [searchTerm, questions]);

  const location = useLocation(); // <-- Moved here

  // Save progress function
  const handleSaveProgress = (saveData) => {
    try {
      SavedTestsService.saveTest(saveData);
      setCurrentSavedTest(saveData);
      alert('Test saved successfully!');
    } catch (error) {
      console.error('Error saving test:', error);
      throw error;
    }
  };

  // Load saved test function
  const handleLoadTest = (savedTest) => {
    if (!savedTest || !savedTest.progress) {
      alert('Invalid saved test data');
      return;
    }

    try {
      const { progress } = savedTest;
      setCurrent(progress.current || 0);
      setUserAnswers(progress.userAnswers || []);
      setQuestionScore(progress.questionScore || []);
      setQuestionSubmitted(progress.questionSubmitted || []);
      setCurrentSavedTest(savedTest);
      
      // Navigate to the main test page
      navigate('/');
      
      alert(`Loaded saved test: ${savedTest.title}`);
    } catch (error) {
      console.error('Error loading test:', error);
      alert('Failed to load saved test');
    }
  };

  // ❌ Never put hooks below this line if you have an early return
  if (!questions.length) return <div>Loading...</div>;

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

  function getChoiceLabel(choice) {
    const match = choice.match(/^([A-Z])\./);
    return match ? match[1] : null;
  }

  // Update answer for current question
  const updateUserAnswer = (answer) => {
    setUserAnswers(prev => {
      const updated = [...prev];
      updated[current] = answer;
      return updated;
    });
  };

  // Calculate score on submit
  const calculateScore = () => {
    let totalScore = 0;
    questions.forEach((q, idx) => {
      if (q.question_type?.toLowerCase() === 'multiple choice') {
        const correct = q.correct_answer.split(',').map(s => s.trim());
        const user = Array.isArray(userAnswers[idx]) ? userAnswers[idx] : [userAnswers[idx]];
        const userLabels = user.map(getChoiceLabel);
        totalScore += userLabels.filter(label => correct.includes(label)).length;
      } else if (q.question_type?.toLowerCase() === 'hotspot') {
        const correctHotspotAnswers = {};
        const lines = q.correct_answer.split(/\r?\n/).filter(Boolean);
        for (const line of lines) {
          const [label, answer] = line.split(':');
          if (label && answer) {
            correctHotspotAnswers[label.trim()] = answer.trim();
          }
        }
        const correctEntries = Object.entries(correctHotspotAnswers);
        totalScore += correctEntries.filter(
          ([label, correct]) => userAnswers[idx][label] === correct
        ).length;
      }
    });
    return totalScore;
  };

  const nextQuestion = () => {
    setCurrent(prev => prev + 1);
    setShowExplanation(false);
  };

  const prevQuestion = () => {
    setCurrent(prev => Math.max(0, prev - 1));
    setShowExplanation(false);
  };

  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function getInitialUserAnswer(q) {
    if (q?.question_type?.toLowerCase() === 'multiple choice') {
      return [];
    } else if (q?.question_type?.toLowerCase() === 'hotspot') {
      return {};
    }
    return '';
  }

  // Add this function to check and score the current question
  const submitCurrentQuestion = () => {
    let points = 0;
    if (q.question_type?.toLowerCase() === 'multiple choice') {
      const correct = q.correct_answer.split(',').map(s => s.trim());
      const user = Array.isArray(userAnswers[current]) ? userAnswers[current] : [userAnswers[current]];
      const userLabels = user.map(getChoiceLabel);
      // Count how many correct answers the user selected
      points = userLabels.filter(label => correct.includes(label)).length;
    } else if (q.question_type?.toLowerCase() === 'hotspot') {
      const correctHotspotAnswers = {};
      const lines = q.correct_answer.split(/\r?\n/).filter(Boolean);
      for (const line of lines) {
        const [label, answer] = line.split(':');
        if (label && answer) {
          correctHotspotAnswers[label.trim()] = answer.trim();
        }
      }
      // Count how many dropdowns are correct
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

  // Calculate running score
  const runningScore = questionScore.reduce((sum, val) => sum + (val || 0), 0);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  // Add this function above your return statement
  function handleHotspotChange(label, val) {
    setUserAnswers(prev => {
      const updated = [...prev];
      updated[current] = { ...updated[current], [label]: val };
      return updated;
    });
  }

  return (
    <div style={{ display: 'flex' }}>
      {/* Mobile Hamburger Menu Button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileMenuOpen(open => !open)}
        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
      >
        {/* Hamburger icon */}
        <span className="hamburger-icon">{mobileMenuOpen ? "✕" : "☰"}</span>
      </button>

      {/* Mobile Dropdown Menu */}
      <div className={`mobile-dropdown-menu${mobileMenuOpen ? " open" : ""}`}>
        <div className="mobile-menu-content">
          <nav>
            <ul>
              <li>
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={location.pathname === '/' ? 'active' : ''}
                >
                  🏠 Home
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={location.pathname === '/' ? 'active' : ''}
                >
                  Practice Test
                </Link>
              </li>
              <li>
                <Link
                  to="/case-studies"
                  onClick={() => setMobileMenuOpen(false)}
                  className={location.pathname === '/case-studies' ? 'active' : ''}
                >
                  Case Studies
                </Link>
              </li>
              <li>
                <Link
                  to="/saved-tests"
                  onClick={() => setMobileMenuOpen(false)}
                  className={location.pathname === '/saved-tests' ? 'active' : ''}
                >
                  Saved Tests
                </Link>
              </li>
              <li>
                <button
                  className="timer-toggle-btn mobile"
                  onClick={() => {
                    setShowTimer(true);
                    setMobileMenuOpen(false);
                  }}
                >
                  <FontAwesomeIcon icon={faClock} /> Timer
                </button>
              </li>
            </ul>
          </nav>
          <div className="sidebar-search mobile">
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')}>
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <nav className="sidebar">
        {/* Search Bar in Sidebar */}
        <div className="sidebar-search">
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')}>
              Clear
            </button>
          )}
        </div>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li>
            <Link
              to="/"
              style={{
                color: location.pathname === '/' ? '#FDF0D5' : '#669BBC',
                fontWeight: 'bold',
                textDecoration: 'none'
              }}
            >
              Practice Test
            </Link>
          </li>
          <li style={{ marginTop: '1.5rem' }}>
            <Link
              to="/case-studies"
              style={{
                color: location.pathname === '/case-studies' ? '#FDF0D5' : '#669BBC',
                fontWeight: 'bold',
                textDecoration: 'none'
              }}
            >
              Case Studies
            </Link>
          </li>
          <li style={{ marginTop: '1.5rem' }}>
            <Link
              to="/saved-tests"
              style={{
                color: location.pathname === '/saved-tests' ? '#FDF0D5' : '#669BBC',
                fontWeight: 'bold',
                textDecoration: 'none'
              }}
            >
              Saved Tests
            </Link>
          </li>
        </ul>
      </nav>
      {/* Timer Toggle Button (desktop only) */}
      {!showTimer && (
        <button
          className="timer-toggle-btn desktop"
          onClick={() => setShowTimer(true)}
        >
          <FontAwesomeIcon icon={faClock} />
        </button>
      )}
      {showTimer && (
        <Timer onClose={() => setShowTimer(false)} />
      )}

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: 40 }}>
        <Routes>
          <Route path="/" element={
            <div className="app">
              <h1>MB-800: Microsoft Dynamics 365 Business Central Functional Consultant Practice Test</h1>
              <div style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
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
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <button
                  onClick={() => {
                    setQuestions(shuffleArray(originalQuestions));
                    setCurrent(0);
                    setShowExplanation(false);
                    setScore(0);
                  }}
                  style={{ marginRight: 8 }}
                >
                  Shuffle Questions
                </button>
                <button
                  onClick={() => {
                    setQuestions(originalQuestions);
                    setCurrent(0);
                    setShowExplanation(false);
                    setSubmitted(false);
                    setUserAnswers(originalQuestions.map(getInitialUserAnswer));
                    setQuestionScore(Array(originalQuestions.length).fill(null));
                    setQuestionSubmitted(Array(originalQuestions.length).fill(false));
                  }}
                  style={{ marginRight: 8 }}
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowSaveModal(true)}
                  style={{ 
                    background: '#669BBC',
                    color: '#003049'
                  }}
                >
                  Save Progress
                </button>
              </div>
              {/* Jump to Question */}
              <div style={{ marginBottom: '1rem' }}>
                <label>
                  Jump to question:&nbsp;
                  <input
                    type="number"
                    min={1}
                    max={questions.length}
                    value={current + 1}
                    onChange={e => {
                      const val = Number(e.target.value);
                      if (val >= 1 && val <= questions.length) {
                        setCurrent(val - 1);
                        setShowExplanation(false);
                      }
                    }}
                    style={{ width: 60 }}
                  />
                  &nbsp;/ {questions.length}
                </label>
              </div>

              {/* If searching, show results */}
              {searchTerm && (
                <div className="search-results-container">
                  <h3>Search Results ({searchResults.length})</h3>
                  {searchResults.length === 0 && <p>No questions found.</p>}
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {searchResults.map((q, idx) => {
                      // Parse choices for multiple choice
                      const choices = q.choices?.match(/^[A-Z]\..+?(?=\n[A-Z]\.|$)/gms)?.map(s => s.trim()) || [];
                      const correctLabels = q.correct_answer?.split(',').map(s => s.trim()) || [];
                      function getChoiceLabel(choice) {
                        const match = choice.match(/^([A-Z])\./);
                        return match ? match[1] : null;
                      }
                      // Hotspot parsing
                      const hotspotOptions = {};
                      if (q.question_type?.toLowerCase() === 'hotspot') {
                        const lines = q.choices?.split(/\r?\n/).filter(Boolean) || [];
                        for (const line of lines) {
                          const [label, rest] = line.split(':');
                          if (label && rest) {
                            hotspotOptions[label.trim()] = rest.split(',').map(opt => opt.trim()).filter(Boolean);
                          }
                        }
                      }
                      const correctHotspotAnswers = {};
                      if (q.question_type?.toLowerCase() === 'hotspot') {
                        const lines = q.correct_answer?.split(/\r?\n/).filter(Boolean) || [];
                        for (const line of lines) {
                          const [label, answer] = line.split(':');
                          if (label && answer) {
                            correctHotspotAnswers[label.trim()] = answer.trim();
                          }
                        }
                      }
                      return (
                        <li key={idx} className="search-result-item">
                          <strong>Q:</strong> {q.question_text}
                          <br />
                          <strong>Type:</strong> {q.question_type}
                          <br />
                          <strong>Choices:</strong>
                          <div>
                            {q.question_type?.toLowerCase() === 'multiple choice' && (
                              <div className="choices">
                                {choices.map((choice, i) => {
                                  const label = getChoiceLabel(choice);
                                  const isCorrect = correctLabels.includes(label);
                                  return (
                                    <label
                                      key={i}
                                      style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        color: isCorrect ? 'green' : undefined,
                                        fontWeight: isCorrect ? 'bold' : undefined,
                                      }}
                                    >
                                      <input
                                        type={correctLabels.length === 1 ? "radio" : "checkbox"}
                                        checked={isCorrect}
                                        readOnly
                                        style={{ accentColor: isCorrect ? 'green' : undefined, marginRight: 8 }}
                                      />
                                      {choice}
                                      {isCorrect && <span style={{ color: 'green', marginLeft: 8 }}>✅</span>}
                                    </label>
                                  );
                                })}
                              </div>
                            )}
                            {q.question_type?.toLowerCase() === 'hotspot' && (
                              <div>
                                {Object.entries(hotspotOptions).map(([label, options], i) => (
                                  <div key={i} style={{ marginBottom: '0.5rem' }}>
                                    <strong>{label}:</strong>{" "}
                                    <select disabled value={correctHotspotAnswers[label] || ''}>
                                      <option value="">-- Select an option --</option>
                                      {options.map((opt, j) => (
                                        <option key={j} value={opt}>
                                          {opt}
                                        </option>
                                      ))}
                                    </select>
                                    {correctHotspotAnswers[label] && (
                                      <span style={{ color: 'green', marginLeft: 8 }}>✅</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <br />
                          <strong>Answer:</strong>
                          <div>
                            {q.question_type?.toLowerCase() === 'multiple choice' && (
                              <div>
                                {choices
                                  .filter(choice => correctLabels.includes(getChoiceLabel(choice)))
                                  .map((choice, i) => (
                                    <div key={i} style={{ color: 'green', fontWeight: 'bold' }}>
                                      {choice}
                                    </div>
                                  ))}
                              </div>
                            )}
                            {q.question_type?.toLowerCase() === 'hotspot' && (
                              <div>
                                {Object.entries(correctHotspotAnswers).map(([label, answer], i) => (
                                  <div key={i} style={{ color: 'green', fontWeight: 'bold' }}>
                                    {label}: {answer}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <br />
                          <strong>Explanation:</strong> {q.explanation}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Only show quiz if not searching */}
              {!searchTerm && (
                <div className="question-box">
                  <div className="question-header">
                    <h2>
                      Question {current + 1} of {questions.length}
                    </h2>
                    {!submitted && (
                      <button
                        className="info-btn"
                        onClick={openModal}
                        aria-label="Show explanation"
                        title="Show explanation"
                      >
                        <span className="info-circle">i</span>
                      </button>
                    )}
                  </div>
                  <p>{q.question_text}</p>

                  {/* Multiple Choice Rendering */}
                  {q.question_type?.toLowerCase() === 'multiple choice' && (
                    <div className="choices">
                      {choices.map((choice, idx) => {
                        const isSingle = q.correct_answer.split(',').length === 1;
                        const correctLabels = q.correct_answer.split(',').map(s => s.trim());
                        const choiceLabel = getChoiceLabel(choice);
                        const userSelected = isSingle
                          ? userAnswers[current]?.[0] === choice
                          : Array.isArray(userAnswers[current]) && userAnswers[current].includes(choice);

                        // Determine feedback after question is submitted
                        let feedbackIcon = null;
                        let feedbackStyle = {};
                        if (questionSubmitted[current]) {
                          if (correctLabels.includes(choiceLabel)) {
                            // Correct answer
                            if (userSelected) {
                              feedbackIcon = <span style={{ color: 'green', marginLeft: 8 }}>✅</span>;
                              feedbackStyle = { color: 'green', fontWeight: 'bold' };
                            } else {
                              // Missed correct answer
                              feedbackIcon = <span style={{ color: 'green', marginLeft: 8 }}>✅</span>;
                              feedbackStyle = { color: 'green' };
                            }
                          } else if (userSelected) {
                            // Incorrect selection
                            feedbackIcon = <span style={{ color: 'red', marginLeft: 8 }}>❌</span>;
                            feedbackStyle = { color: 'red', fontWeight: 'bold' };
                          }
                        }

                        return (
                          <label key={idx} style={feedbackStyle}>
                            <input
                              type={isSingle ? "radio" : "checkbox"}
                              name={`answer-${current}`}
                              value={choice}
                              checked={userSelected}
                              onChange={e => {
                                if (submitted) return;
                                if (isSingle) {
                                  updateUserAnswer([choice]);
                                } else {
                                  let arr = Array.isArray(userAnswers[current]) ? [...userAnswers[current]] : [];
                                  if (e.target.checked) {
                                    // Limit selection to the number of correct answers
                                    const maxSelections = correctLabels.length;
                                    if (arr.length < maxSelections) {
                                      if (!arr.includes(choice)) arr.push(choice);
                                    }
                                  } else {
                                    arr = arr.filter(c => c !== choice);
                                  }
                                  updateUserAnswer(arr);
                                }
                              }}
                              disabled={submitted}
                            />
                            {choice}
                            {feedbackIcon}
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Hotspot with Multiple Dropdowns */}
                  {q.question_type?.toLowerCase() === 'hotspot' && (
                    <div className="hotspot-dropdowns">
                      {Object.entries(hotspotOptions).map(([label, options], idx) => {
                        const userValue = userAnswers[current]?.[label] || '';
                        const correctValue = correctHotspotAnswers[label];
                        const isSubmitted = questionSubmitted ? questionSubmitted[current] : submitted;
                        const isCorrect = userValue && userValue === correctValue;
                        const showFeedback = isSubmitted && userValue;

                        return (
                          <div key={idx} style={{ marginBottom: '1rem' }}>
                            <strong>{label}</strong>
                            <div className="dropdown-container">
                              <select
                                value={userValue}
                                onChange={e => {
                                  if (isSubmitted) return;
                                  // ...existing update logic...
                                  if (typeof updateUserAnswer === "function") {
                                    // For QuestionQuiz.js
                                    handleHotspotChange(label, e.target.value);
                                  } else {
                                    // For App.js
                                    const prev = userAnswers[current] || {};
                                    updateUserAnswer({
                                      ...prev,
                                      [label]: e.target.value
                                    });
                                  }
                                }}
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

                  <div className="nav-row">
                    <button onClick={prevQuestion} disabled={current === 0 || submitted}>⬅ Back</button>
                    {!isLast && (
                      <button onClick={nextQuestion} disabled={submitted}>
                        Next ➡
                      </button>
                    )}
                  </div>

                  {/* Submit Button */}
                  {isLast && !submitted && (
                    <div className="submit-row">
                      <button
                        onClick={() => setSubmitted(true)}
                      >
                        Submit Test
                      </button>
                    </div>
                  )}

                  {/* Show score after submit */}
                  {submitted && (
                    <div className="final-page" style={{ textAlign: 'center', marginTop: '2rem' }}>
                      <p style={{ fontWeight: 'bold', fontSize: '1.3rem' }}>
                        🎉 You’ve completed the test!<br />
                        Final Score: {calculateScore()} / {
                          questions.reduce((sum, q) => {
                            if (q.question_type?.toLowerCase() === 'multiple choice') {
                              return sum + q.correct_answer.split(',').length;
                            } else if (q.question_type?.toLowerCase() === 'hotspot') {
                              return sum + q.correct_answer.split(/\r?\n/).filter(Boolean).length;
                            }
                            return sum + 1;
                          }, 0)
                        }
                        <br />
                        {
                          (() => {
                            const total = questions.reduce((sum, q) => {
                              if (q.question_type?.toLowerCase() === 'multiple choice') {
                                return sum + q.correct_answer.split(',').length;
                              } else if (q.question_type?.toLowerCase() === 'hotspot') {
                                return sum + q.correct_answer.split(/\r?\n/).filter(Boolean).length;
                              }
                              return sum + 1;
                            }, 0);
                            const percent = total === 0 ? 0 : Math.round((calculateScore() / total) * 100);
                            return `You got ${percent}% correct.`;
                          })()
                        }
                      </p>
                      <button
                        style={{ marginTop: '1.5rem' }}
                        onClick={() => {
                          setQuestions(originalQuestions);
                          setCurrent(0);
                          setShowExplanation(false);
                          setSubmitted(false);
                          setUserAnswers(originalQuestions.map(getInitialUserAnswer));
                          setQuestionScore(Array(originalQuestions.length).fill(null));
                          setQuestionSubmitted(Array(originalQuestions.length).fill(false));
                        }}
                      >
                        Reset
                      </button>
                    </div>
                  )}

                  {/* Submit Question Button */}
                  {!submitted && !questionSubmitted[current] && (
                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                      <button onClick={submitCurrentQuestion}>Submit Question</button>
                    </div>
                  )}
                  {questionSubmitted[current] && (
                    <div style={{ marginTop: '1rem', backgroundColor: '#f0f0f0', color: '#003049', padding: '1rem', borderRadius: 8 }}>
                      <strong>
                        {
                          // Calculate max possible points for this question
                          (() => {
                            let maxPoints = 1;
                            if (q.question_type?.toLowerCase() === 'multiple choice') {
                              maxPoints = q.correct_answer.split(',').length;
                            } else if (q.question_type?.toLowerCase() === 'hotspot') {
                              maxPoints = q.correct_answer.split(/\r?\n/).filter(Boolean).length;
                            }
                            return questionScore[current] === maxPoints ? "✅ Correct!" : "❌ Incorrect.";
                          })()
                        }
                      </strong>
                      <p><strong>Explanation:</strong> {q.explanation || 'No explanation provided.'}</p>
                      <p><strong>Correct Answer:</strong> {q.correct_answer}</p>
                    </div>
                  )}


                  {showModal && (
                    <div className="modal-overlay" onClick={closeModal}>
                      <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={closeModal} aria-label="Close">&times;</button>
                        <strong>Explanation</strong>
                        <p style={{ marginTop: '1rem' }}>{q.explanation || 'No explanation provided.'}</p>
                        {/* <p><strong>Correct Answer:</strong> {q.correct_answer}</p> */}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          } />
          <Route path="/case-studies" element={<CaseStudies />} />
          <Route path="/case-studies/:id" element={<CaseStudyDetail />} />
          <Route path="/saved-tests" element={<SavedTests onLoadTest={handleLoadTest} />} />
        </Routes>
        
        {/* Save Modal */}
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
      </div>
    </div>
  );
}

export default App;
