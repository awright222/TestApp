import { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Papa from 'papaparse';
import './App.css';
import { CaseStudies, CaseStudyDetail } from './CaseStudies';
import Timer from "./Timer";
import SaveModal from './SaveModal';
import SavedTests from './SavedTests';
import { SavedTestsService } from './SavedTestsService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import { useAuth } from './firebase/AuthContext';
import AuthModal from './components/AuthModal';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import SharedTests from './components/SharedTests';
import MyCreatedTests from './components/MyCreatedTests';
import CreateTest from './components/CreateTest';

const AVAILABLE_TESTS = [
  {
    id: 'mb800',
    title: 'MB-800: Microsoft Dynamics 365 Business Central Functional Consultant',
    description: 'Practice test for Microsoft Dynamics 365 Business Central Functional Consultant certification',
    questionCount: '65+ Questions',
    difficulty: 'Intermediate',
    csvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTDO68GqAelFKS2G6SwiUWdPs2tw5Gt62D5xLiB_9zyLyBPLSZm5gTthaQz9yCpmDKuymWMc83PV5a2/pub?gid=0&single=true&output=csv',
    color: '#003049',
    icon: '💼'
  },
  // Add more tests here in the future
];

function TestSelector({ onTestSelect }) {
  return (
    <div style={{
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '3rem'
      }}>
        <h1 style={{
          color: '#003049',
          fontSize: '2.5rem',
          marginBottom: '1rem',
          fontWeight: '600'
        }}>
          Practice Tests
        </h1>
        <p style={{
          color: '#669BBC',
          fontSize: '1.2rem',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Choose a practice test to start your certification preparation journey
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '2rem',
        marginTop: '2rem'
      }}>
        {AVAILABLE_TESTS.map((test) => (
          <div
            key={test.id}
            onClick={() => onTestSelect(test)}
            style={{
              background: 'linear-gradient(135deg, #FDF0D5 0%, #FFFFFF 100%)',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 8px 32px rgba(0, 48, 73, 0.1)',
              border: '1px solid rgba(102, 155, 188, 0.2)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-8px)';
              e.target.style.boxShadow = '0 16px 48px rgba(0, 48, 73, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 32px rgba(0, 48, 73, 0.1)';
            }}
          >
            {/* Background Pattern */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100px',
              height: '100px',
              background: `linear-gradient(135deg, ${test.color}10, ${test.color}05)`,
              borderRadius: '50%',
              transform: 'translate(30px, -30px)'
            }} />
            
            {/* Icon */}
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem'
            }}>
              {test.icon}
            </div>

            {/* Title */}
            <h3 style={{
              color: test.color,
              fontSize: '1.4rem',
              marginBottom: '1rem',
              fontWeight: '600',
              lineHeight: '1.3'
            }}>
              {test.title}
            </h3>

            {/* Description */}
            <p style={{
              color: '#669BBC',
              fontSize: '1rem',
              marginBottom: '1.5rem',
              lineHeight: '1.5'
            }}>
              {test.description}
            </p>

            {/* Test Info */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <span style={{
                background: `${test.color}10`,
                color: test.color,
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                {test.questionCount}
              </span>
              <span style={{
                background: '#669BBC20',
                color: '#669BBC',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                {test.difficulty}
              </span>
            </div>

            {/* Start Button */}
            <button style={{
              background: `linear-gradient(135deg, ${test.color} 0%, ${test.color}dd 100%)`,
              color: 'white',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
            >
              Start Practice Test
            </button>
          </div>
        ))}
      </div>

      {/* Coming Soon Section */}
      <div style={{
        marginTop: '4rem',
        textAlign: 'center',
        padding: '2rem',
        background: 'linear-gradient(135deg, #669BBC10 0%, #669BBC05 100%)',
        borderRadius: '16px',
        border: '2px dashed #669BBC40'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🚀</div>
        <h3 style={{ color: '#669BBC', marginBottom: '0.5rem' }}>More Tests Coming Soon!</h3>
        <p style={{ color: '#669BBC80' }}>
          We're working on adding more certification practice tests. Stay tuned!
        </p>
      </div>
    </div>
  );
}

function PracticeTestContainer() {
  const [selectedTest, setSelectedTest] = useState(null);

  if (!selectedTest) {
    return <TestSelector onTestSelect={setSelectedTest} />;
  }

  return <PracticeTest selectedTest={selectedTest} onBackToSelection={() => setSelectedTest(null)} />;
}

function PracticeTest({ selectedTest, onBackToSelection }) {
  const [questions, setQuestions] = useState([]);
  const [originalQuestions, setOriginalQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [questionScore, setQuestionScore] = useState([]);
  const [questionSubmitted, setQuestionSubmitted] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [currentSavedTest, setCurrentSavedTest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedTest) {
      setLoading(true);
      Papa.parse(selectedTest.csvUrl, {
        download: true,
        header: true,
        complete: (result) => {
          const filtered = result.data.filter(q => q.question_text);
          setQuestions(filtered);
          setOriginalQuestions(filtered);
          setUserAnswers(filtered.map(getInitialUserAnswer));
          setQuestionScore(Array(filtered.length).fill(null));
          setQuestionSubmitted(Array(filtered.length).fill(false));
          setLoading(false);
        },
        error: (error) => {
          console.error('Error loading test:', error);
          setLoading(false);
          alert('Failed to load test questions. Please try again.');
        }
      });
    }
  }, [selectedTest]);

  // Show loading screen while questions are being loaded
  if (loading) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        color: '#669BBC',
        minHeight: '50vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
        <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Loading {selectedTest.title}...</div>
        <div style={{ fontSize: '1rem', opacity: 0.7 }}>Please wait while we prepare your questions</div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        color: '#669BBC',
        minHeight: '50vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📚</div>
        <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>No questions found for this test.</div>
        <button 
          onClick={onBackToSelection}
          style={{
            background: '#669BBC',
            color: 'white',
            border: 'none',
            padding: '0.75rem 2rem',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Back to Test Selection
        </button>
      </div>
    );
  }

  function getInitialUserAnswer(q) {
    if (q?.question_type?.toLowerCase() === 'multiple choice') {
      return [];
    } else if (q?.question_type?.toLowerCase() === 'hotspot') {
      return {};
    }
    return '';
  }

  const handleSaveProgress = async (saveData) => {
    try {
      await SavedTestsService.saveTest(saveData);
      setCurrentSavedTest(saveData);
      alert('Test saved successfully!');
    } catch (error) {
      console.error('Error saving test:', error);
      throw error;
    }
  };

  if (!questions.length) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#669BBC' }}>Loading questions...</div>;
  }

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

  function getChoiceLabel(choice) {
    const match = choice.match(/^([A-Z])\./);
    return match ? match[1] : null;
  }

  const updateUserAnswer = (answer) => {
    setUserAnswers(prev => {
      const updated = [...prev];
      updated[current] = answer;
      return updated;
    });
  };

  function handleHotspotChange(label, val) {
    setUserAnswers(prev => {
      const updated = [...prev];
      updated[current] = { ...updated[current], [label]: val };
      return updated;
    });
  }

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

  const runningScore = questionScore.reduce((sum, val) => sum + (val || 0), 0);

  const nextQuestion = () => {
    setCurrent(prev => Math.min(questions.length - 1, prev + 1));
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

  return (
    <div className="app">
      {/* Header with Back Button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '2rem',
        padding: '1rem 0',
        borderBottom: '2px solid #669BBC20'
      }}>
        <button
          onClick={onBackToSelection}
          style={{
            background: 'transparent',
            border: '2px solid #669BBC',
            color: '#669BBC',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            cursor: 'pointer',
            marginRight: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#669BBC';
            e.target.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = '#669BBC';
          }}
        >
          ← Back to Tests
        </button>
        <div>
          <div style={{
            fontSize: '0.9rem',
            color: '#669BBC',
            marginBottom: '0.25rem'
          }}>
            {selectedTest.icon} {selectedTest.difficulty} Level
          </div>
          <h1 style={{
            margin: 0,
            fontSize: '1.5rem',
            color: '#003049'
          }}>
            {selectedTest.title}
          </h1>
        </div>
      </div>

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
            setUserAnswers(originalQuestions.map(getInitialUserAnswer));
            setQuestionScore(Array(originalQuestions.length).fill(null));
            setQuestionSubmitted(Array(originalQuestions.length).fill(false));
          }}
          style={{ marginRight: 8 }}
        >
          Reset
        </button>
        <button onClick={() => setShowSaveModal(true)}>
          Save Progress
        </button>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        Question {current + 1} of {questions.length}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <strong>{q.question_text}</strong>
      </div>

      {/* Multiple Choice Questions */}
      {q.question_type?.toLowerCase() === 'multiple choice' && (
        <div style={{ marginBottom: '1rem' }}>
          {choices.map((choice, idx) => {
            const isSelected = Array.isArray(userAnswers[current]) 
              ? userAnswers[current].includes(choice)
              : userAnswers[current] === choice;
            
            return (
              <div key={idx} style={{ marginBottom: '0.5rem' }}>
                <label>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateUserAnswer([...userAnswers[current], choice]);
                      } else {
                        updateUserAnswer(userAnswers[current].filter(c => c !== choice));
                      }
                    }}
                    disabled={questionSubmitted[current]}
                  />
                  {choice}
                </label>
              </div>
            );
          })}
        </div>
      )}

      {/* Hotspot Questions */}
      {q.question_type?.toLowerCase() === 'hotspot' && (
        <div style={{ marginBottom: '1rem' }}>
          {Object.entries(hotspotOptions).map(([label, options]) => (
            <div key={label} style={{ marginBottom: '1rem' }}>
              <strong>{label}:</strong>
              <select
                value={userAnswers[current][label] || ''}
                onChange={(e) => handleHotspotChange(label, e.target.value)}
                disabled={questionSubmitted[current]}
                style={{ marginLeft: '0.5rem', padding: '0.25rem' }}
              >
                <option value="">Select...</option>
                {options.map((option, idx) => (
                  <option key={idx} value={option}>{option}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={submitCurrentQuestion}
          disabled={questionSubmitted[current]}
          style={{ marginRight: 8 }}
        >
          Submit Answer
        </button>
        <button onClick={prevQuestion} disabled={current === 0} style={{ marginRight: 8 }}>
          Previous
        </button>
        <button onClick={nextQuestion} disabled={isLast}>
          Next
        </button>
      </div>

      {showExplanation && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          border: '1px solid #ccc', 
          backgroundColor: '#f9f9f9' 
        }}>
          <strong>Explanation:</strong>
          <p>{q.explanation}</p>
          <strong>Correct Answer:</strong>
          <p>{q.correct_answer}</p>
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
    </div>
  );
}

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showTimer, setShowTimer] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const location = useLocation();
  const { user, loading, logout } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #003049 0%, #00243a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', color: '#669BBC', marginBottom: '1rem' }}>🔄</div>
          <div style={{ color: '#FDF0D5', fontSize: '1.2rem' }}>Loading...</div>
        </div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  if (!user) {
    return <Landing />;
  }

  // Main authenticated app
  return (
    <div style={{ display: 'flex' }}>
      {/* Mobile Hamburger Menu Button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileMenuOpen(open => !open)}
        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
      >
        <span className="hamburger-icon">{mobileMenuOpen ? "✕" : "☰"}</span>
      </button>

      {/* Mobile Dropdown Menu */}
      <div className={`mobile-dropdown-menu${mobileMenuOpen ? " open" : ""}`}>
        <div className="mobile-menu-content">
          <nav>
            <ul>
              <li>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={location.pathname === '/dashboard' ? 'active' : ''}
                >
                  🏠 Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/practice"
                  onClick={() => setMobileMenuOpen(false)}
                  className={location.pathname === '/practice' ? 'active' : ''}
                >
                  📝 Practice Test
                </Link>
              </li>
              <li>
                <Link
                  to="/shared-tests"
                  onClick={() => setMobileMenuOpen(false)}
                  className={location.pathname === '/shared-tests' ? 'active' : ''}
                >
                  📤 Shared Tests
                </Link>
              </li>
              <li>
                <Link
                  to="/my-tests"
                  onClick={() => setMobileMenuOpen(false)}
                  className={location.pathname === '/my-tests' ? 'active' : ''}
                >
                  📚 My Created Tests
                </Link>
              </li>
              <li>
                <Link
                  to="/create-test"
                  onClick={() => setMobileMenuOpen(false)}
                  className={location.pathname === '/create-test' ? 'active' : ''}
                >
                  ✨ Create Test
                </Link>
              </li>
              <li>
                <Link
                  to="/case-studies"
                  onClick={() => setMobileMenuOpen(false)}
                  className={location.pathname === '/case-studies' ? 'active' : ''}
                >
                  📚 Case Studies
                </Link>
              </li>
              <li>
                <Link
                  to="/saved-tests"
                  onClick={() => setMobileMenuOpen(false)}
                  className={location.pathname === '/saved-tests' ? 'active' : ''}
                >
                  💾 Saved Tests
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
              <li style={{ marginTop: '1rem', borderTop: '1px solid #669BBC', paddingTop: '1rem' }}>
                <div>
                  <div style={{ color: '#FDF0D5', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    Welcome, {user.displayName || user.email}
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    style={{
                      background: 'transparent',
                      border: '1px solid #669BBC',
                      color: '#669BBC',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      width: '100%'
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <nav className="sidebar">
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
              to="/dashboard"
              style={{
                color: location.pathname === '/dashboard' ? '#FDF0D5' : '#669BBC',
                fontWeight: 'bold',
                textDecoration: 'none'
              }}
            >
              🏠 Dashboard
            </Link>
          </li>
          <li style={{ marginTop: '1.5rem' }}>
            <Link
              to="/practice"
              style={{
                color: location.pathname === '/practice' ? '#FDF0D5' : '#669BBC',
                fontWeight: 'bold',
                textDecoration: 'none'
              }}
            >
              📝 Practice Test
            </Link>
          </li>
          <li style={{ marginTop: '1.5rem' }}>
            <Link
              to="/shared-tests"
              style={{
                color: location.pathname === '/shared-tests' ? '#FDF0D5' : '#669BBC',
                fontWeight: 'bold',
                textDecoration: 'none'
              }}
            >
              📤 Shared Tests
            </Link>
          </li>
          <li style={{ marginTop: '1.5rem' }}>
            <Link
              to="/my-tests"
              style={{
                color: location.pathname === '/my-tests' ? '#FDF0D5' : '#669BBC',
                fontWeight: 'bold',
                textDecoration: 'none'
              }}
            >
              📚 My Created Tests
            </Link>
          </li>
          <li style={{ marginTop: '1.5rem' }}>
            <Link
              to="/create-test"
              style={{
                color: location.pathname === '/create-test' ? '#FDF0D5' : '#669BBC',
                fontWeight: 'bold',
                textDecoration: 'none'
              }}
            >
              ✨ Create Test
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
              📚 Case Studies
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
              💾 Saved Tests
            </Link>
          </li>
        </ul>
        
        {/* Auth Section */}
        <div style={{ marginTop: '2rem', borderTop: '1px solid #669BBC', paddingTop: '1rem' }}>
          <div>
            <div style={{ color: '#FDF0D5', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              Welcome, {user.displayName || user.email}
            </div>
            <button
              onClick={logout}
              style={{
                background: 'transparent',
                border: '1px solid #669BBC',
                color: '#669BBC',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/practice" element={<PracticeTestContainer />} />
          <Route path="/shared-tests" element={<SharedTests />} />
          <Route path="/my-tests" element={<MyCreatedTests />} />
          <Route path="/create-test" element={<CreateTest />} />
          <Route path="/case-studies" element={<CaseStudies />} />
          <Route path="/case-studies/:id" element={<CaseStudyDetail />} />
          <Route path="/saved-tests" element={<SavedTests />} />
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}

export default App;
