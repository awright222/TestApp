import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { SavedTestsService } from './SavedTestsService';
import SaveModal from './SaveModal';
import './CaseStudies.css';
import './components/PracticeTest.css';
import './QuestionQuiz.css';

const META_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTDO68GqAelFKS2G6SwiUWdPs2tw5Gt62D5xLiB_9zyLyBPLSZm5gTthaQz9yCpmDKuymWMc83PV5a2/pub?gid=2042421471&single=true&output=csv';
const SECTIONS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTDO68GqAelFKS2G6SwiUWdPs2tw5Gt62D5xLiB_9zyLyBPLSZm5gTthaQz9yCpmDKuymWMc83PV5a2/pub?gid=905416087&single=true&output=csv';
const QUESTIONS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTDO68GqAelFKS2G6SwiUWdPs2tw5Gt62D5xLiB_9zyLyBPLSZm5gTthaQz9yCpmDKuymWMc83PV5a2/pub?gid=771661310&single=true&output=csv';

export function CaseStudies() {
  const [meta, setMeta] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(META_URL)
      .then(r => r.text())
      .then(csv => {
        const metaData = Papa.parse(csv, { header: true }).data
          .filter(row => row.id && row.title && row.title.toLowerCase() !== 'title');
        setMeta(metaData);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="case-studies-loading">
      <div className="case-studies-loading-icon">📚</div>
      <div className="case-studies-loading-text">Loading Case Studies...</div>
    </div>
  );

  return (
    <div className="case-studies-container">
      {/* Header with Back Button */}
      <div className="case-studies-header">
        <button
          onClick={() => navigate('/practice')}
          className="back-to-practice-btn"
        >
          ← Back to Practice Tests
        </button>
        <div className="case-studies-header-info">
          <div className="case-studies-subtitle">
            💼 MB-800 Certification
          </div>
          <h1 className="case-studies-title">
            Case Studies
          </h1>
        </div>
      </div>
      
      <div className="case-studies-grid">
        {meta.map(cs => (
          <Link
            key={cs.id}
            to={`/case-studies/${cs.id}`}
            className="case-study-card"
          >
            {/* Case Study Icon */}
            <div className="case-study-icon">
              📋
            </div>

            {/* Title */}
            <h3 className="case-study-card-title">
              {cs.title}
            </h3>

            {/* Description */}
            <p className="case-study-description">
              {cs.description}
            </p>

            {/* Badge */}
            <div className="case-study-badge">
              Interactive Case Study
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function CaseStudyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meta, setMeta] = useState(null);
  const [sections, setSections] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(null);
  const [modalSection, setModalSection] = useState(null);
  const [showTestInterface, setShowTestInterface] = useState(false);
  
  // Test state for the PracticeTest-style interface
  const [savedProgress, setSavedProgress] = useState(null);

  // Check for saved progress for this case study
  useEffect(() => {
    const checkSavedProgress = async () => {
      if (id) {
        try {
          const savedTests = await SavedTestsService.getSavedTests();
          const caseStudyProgress = savedTests.find(test => 
            test.type === 'case-study' && 
            String(test.caseStudyId) === String(id)
          );
          if (caseStudyProgress) {
            setSavedProgress(caseStudyProgress);
          }
        } catch (error) {
          console.error('Error loading saved progress:', error);
        }
      }
    };
    
    checkSavedProgress();
  }, [id]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(META_URL).then(r => r.text()),
      fetch(SECTIONS_URL).then(r => r.text()),
      fetch(QUESTIONS_URL).then(r => r.text()),
    ]).then(([metaCsv, sectionsCsv, questionsCsv]) => {
      const metaData = Papa.parse(metaCsv, { header: true }).data;
      const sectionData = Papa.parse(sectionsCsv, { header: true }).data;
      const questionData = Papa.parse(questionsCsv, { header: true }).data;

      console.log('Case Study Data Loaded:', {
        id,
        totalQuestions: questionData.length,
        filteredQuestions: questionData.filter(row => String(row.case_study_id).trim() === String(id).trim()).length
      });

      setMeta(metaData.find(row => String(row.id).trim() === String(id).trim()));
      const filteredSections = sectionData.filter(row => String(row.case_study_id).trim() === String(id).trim());
      setSections(filteredSections);
      setQuestions(questionData.filter(row => String(row.case_study_id).trim() === String(id).trim()));
      setActiveTab(filteredSections.length > 0 ? filteredSections[0].section_group : null);
      setLoading(false);
    });
  }, [id]);

  if (loading || !meta) {
    return (
      <div className="case-study-detail-loading">
        <div className="case-study-detail-loading-icon">📚</div>
        <div className="case-study-detail-loading-text">Loading Case Study...</div>
      </div>
    );
  }

  // If we have questions and user wants to see test interface
  if (questions.length > 0 && showTestInterface) {
    const testData = {
      title: `${meta.title} - Case Study Test`,
      questions: questions,
      isCaseStudy: true,
      caseStudyId: id,
      caseStudyTitle: meta.title,
      caseStudyMeta: meta,
      caseStudySections: sections,
      savedProgress: savedProgress?.progress,
      savedTestInfo: savedProgress
    };

    return <CaseStudyTestInterface 
      selectedTest={testData}
      onBackToSelection={() => setShowTestInterface(false)}
      sections={sections}
      meta={meta}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      modalSection={modalSection}
      setModalSection={setModalSection}
    />;
  }

  // Group sections by section_group
  const groupedSections = sections.reduce((acc, section) => {
    const group = section.section_group || 'General';
    if (!acc[group]) acc[group] = [];
    acc[group].push(section);
    return acc;
  }, {});

  return (
    <>
      <div className="case-study-detail">
        {/* Header - simplified to match existing format */}
        <div className="case-study-detail-header">
          <button
            onClick={() => navigate('/practice')}
            className="back-to-case-studies-btn"
          >
            ← Back to Practice Tests
          </button>
          <div className="case-study-header-content">
            <div className="case-studies-subtitle">
              📋 Interactive Case Study
            </div>
            <h1 className="case-study-detail-title">
              {meta.title}
            </h1>
            <p className="case-study-description">
              {meta.description}
            </p>
          </div>
        </div>

      {/* Show saved progress notification */}
      {savedProgress && (
        <div className="saved-progress-notification">
          <div className="saved-progress-content">
            <div className="saved-progress-icon">💾</div>
            <div className="saved-progress-info">
              <strong>Saved Progress Found!</strong>
              <p>Your answers and current position have been restored from your previous session.</p>
            </div>
          </div>
        </div>
      )}

      {/* Section Tabs - using existing styling format */}
      <div className="question-quiz-box" style={{ marginBottom: '2rem' }}>
        <div className="question-quiz-header">
          <h2 className="question-quiz-title">
            📖 Case Study Information
          </h2>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '0.75rem', 
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          {Object.keys(groupedSections).map(group => (
            <button
              key={group}
              className={`question-quiz-nav-btn ${activeTab === group ? 'active' : ''}`}
              style={{
                background: activeTab === group 
                  ? '#669BBC' 
                  : 'rgba(102, 155, 188, 0.1)',
                color: activeTab === group ? 'white' : '#669BBC',
                border: activeTab === group ? 'none' : '2px solid #669BBC'
              }}
              onClick={() => setActiveTab(group)}
            >
              {group}
            </button>
          ))}
        </div>

        {/* Section Content */}
        {activeTab && groupedSections[activeTab] && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1rem'
          }}>
            {groupedSections[activeTab].map((section, index) => (
              <div
                key={section.id || section.section_title}
                className="question-quiz-choice"
                style={{ cursor: 'pointer' }}
                onClick={() => setModalSection(section)}
              >
                <div style={{
                  background: '#669BBC',
                  color: 'white',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  flexShrink: 0,
                  marginRight: '1rem'
                }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    color: '#003049',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    margin: '0 0 0.5rem 0',
                    lineHeight: '1.3'
                  }}>
                    {section.section_title}
                  </h4>
                  <p style={{
                    color: '#669BBC',
                    fontSize: '0.9rem',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    Click to read the full information
                  </p>
                </div>
                <div style={{
                  color: '#669BBC',
                  fontSize: '1.2rem'
                }}>
                  →
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Start Practice Questions Button */}
      {questions.length > 0 && (
        <div className="question-quiz-box" style={{ textAlign: 'center' }}>
          <div className="question-quiz-header">
            <h2 className="question-quiz-title">
              📝 Practice Questions
            </h2>
          </div>
          <div className="question-quiz-text">
            <p style={{ marginBottom: '1.5rem' }}>
              Ready to test your understanding? Start the practice questions for this case study.
            </p>
            <button
              onClick={() => setShowTestInterface(true)}
              className="question-quiz-nav-btn"
              style={{
                fontSize: '1.1rem',
                padding: '1rem 2rem',
                background: '#669BBC',
                color: 'white'
              }}
            >
              🚀 Start Practice Questions ({questions.length} questions)
            </button>
          </div>
        </div>
      )}
      
      {/* No Questions Available */}
      {questions.length === 0 && (
        <div className="question-quiz-box" style={{ textAlign: 'center' }}>
          <div className="question-quiz-header">
            <h2 className="question-quiz-title">
              📝 No Questions Available
            </h2>
          </div>
          <div className="question-quiz-text">
            <p style={{ margin: 0 }}>This case study doesn't have practice questions yet.</p>
          </div>
        </div>
      )}
      </div>

      {/* Modal for section content - moved outside container for proper overlay */}
      {modalSection && (
        <div className="question-quiz-modal-overlay" onClick={() => setModalSection(null)}>
          <div className="question-quiz-modal-content" onClick={e => e.stopPropagation()}>
            <button
              className="question-quiz-modal-close"
              onClick={() => setModalSection(null)}
              aria-label="Close"
            >
              ✕
            </button>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: '#669BBC',
                color: 'white',
                borderRadius: '12px',
                padding: '0.75rem',
                fontSize: '1.5rem'
              }}>
                📄
              </div>
              <h3 className="question-quiz-modal-title">
                {modalSection.section_title}
              </h3>
            </div>
            
            <div className="question-quiz-modal-text" style={{ 
              whiteSpace: 'pre-line',
              background: 'rgba(102, 155, 188, 0.05)',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid rgba(102, 155, 188, 0.1)'
            }}>
              {modalSection.content}
            </div>
            
            <div style={{
              marginTop: '2rem',
              textAlign: 'center'
            }}>
              <button
                onClick={() => setModalSection(null)}
                className="question-quiz-nav-btn"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// New component that combines case study info with full PracticeTest interface
function CaseStudyTestInterface({ 
  selectedTest, 
  onBackToSelection, 
  sections, 
  meta, 
  activeTab, 
  setActiveTab, 
  modalSection, 
  setModalSection 
}) {
  const [questions, setQuestions] = useState([]);
  const [originalQuestions, setOriginalQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [questionScore, setQuestionScore] = useState([]);
  const [questionSubmitted, setQuestionSubmitted] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentSavedTest, setCurrentSavedTest] = useState(null);
  const [testCompleted, setTestCompleted] = useState(false);
  
  // Mark for Review feature states
  const [markedQuestions, setMarkedQuestions] = useState([]);
  const [questionNotes, setQuestionNotes] = useState({});
  
  // Wrong Answers feature states
  const [showWrongAnswersModal, setShowWrongAnswersModal] = useState(false);
  const [wrongAnswersFilter, setWrongAnswersFilter] = useState(false);
  const [retryMode, setRetryMode] = useState(false);
  const [retryQuestions, setRetryQuestions] = useState([]); // Filtered questions for retry mode
  const [retryProgress, setRetryProgress] = useState({ completed: 0, remaining: 0 }); // Track retry progress
  const [showStudyTipsModal, setShowStudyTipsModal] = useState(false);
  
  // Timer state - simplified for case studies (practice mode only)
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerTime, setTimerTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerInputMinutes, setTimerInputMinutes] = useState(90);
  const [timerTimeHidden, setTimerTimeHidden] = useState(false);

  // Helper function to get initial answer based on question type
  function getInitialUserAnswer(q) {
    if (q?.question_type?.toLowerCase() === 'multiple choice') {
      return [];
    } else if (q?.question_type?.toLowerCase() === 'hotspot') {
      return {};
    }
    return '';
  }

  // Initialize questions and state
  useEffect(() => {
    if (selectedTest && selectedTest.questions) {
      const questionArray = selectedTest.questions;
      setQuestions(questionArray);
      setOriginalQuestions(questionArray);
      
      // Restore saved progress if available
      if (selectedTest.savedProgress) {
        setCurrent(selectedTest.savedProgress.current || 0);
        setUserAnswers(selectedTest.savedProgress.userAnswers || questionArray.map(getInitialUserAnswer));
        setQuestionScore(selectedTest.savedProgress.questionScore || Array(questionArray.length).fill(null));
        setQuestionSubmitted(selectedTest.savedProgress.questionSubmitted || Array(questionArray.length).fill(false));
        setMarkedQuestions(selectedTest.savedProgress.markedQuestions || []);
        setQuestionNotes(selectedTest.savedProgress.questionNotes || {});
        setWrongAnswersFilter(selectedTest.savedProgress.wrongAnswersFilter || false);
        setRetryMode(selectedTest.savedProgress.retryMode || false);
      } else {
        setUserAnswers(questionArray.map(getInitialUserAnswer));
        setQuestionScore(Array(questionArray.length).fill(null));
        setQuestionSubmitted(Array(questionArray.length).fill(false));
      }
      
      if (selectedTest.savedTestInfo) {
        setCurrentSavedTest(selectedTest.savedTestInfo);
      }
    }
  }, [selectedTest]);

  // Timer initialization
  useEffect(() => {
    setTimerTime(timerInputMinutes * 60);
  }, [timerInputMinutes]);

  // Timer countdown effect
  useEffect(() => {
    let interval;
    if (timerEnabled && timerRunning && timerTime > 0 && !testCompleted) {
      interval = setInterval(() => {
        setTimerTime(prev => {
          if (prev <= 1) {
            setTimerRunning(false);
            alert('⏰ Time\'s up! You can still continue working, but your time is recorded.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerEnabled, timerRunning, timerTime, testCompleted]);

  // Timer utility functions
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setTimerEnabled(!timerEnabled);
    if (!timerEnabled) {
      setTimerTime(timerInputMinutes * 60);
      setTimerRunning(false);
    }
  };

  const startStopTimer = () => {
    setTimerRunning(!timerRunning);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimerTime(timerInputMinutes * 60);
  };

  const updateTimerMinutes = (minutes) => {
    if (!timerRunning) {
      setTimerInputMinutes(minutes);
      setTimerTime(minutes * 60);
    }
  };

  const toggleTimerTimeVisibility = () => {
    setTimerTimeHidden(!timerTimeHidden);
  };

  // Shuffle function
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
      if (prev.includes(questionIndex)) {
        return prev.filter(i => i !== questionIndex);
      } else {
        return [...prev, questionIndex];
      }
    });
  };

  const isQuestionMarked = (questionIndex) => {
    return markedQuestions.includes(questionIndex);
  };

  const updateQuestionNote = (questionIndex, note) => {
    setQuestionNotes(prev => ({
      ...prev,
      [questionIndex]: note
    }));
  };

  // Wrong Answers functionality
  const getWrongAnswers = () => {
    return questions.map((q, index) => {
      if (!questionSubmitted[index]) return null;
      
      let isCorrect = false;
      
      if (q.question_type?.toLowerCase() === 'multiple choice') {
        const correctAnswers = q.correct_answer.split(',').map(s => s.trim());
        const userSelections = Array.isArray(userAnswers[index]) ? userAnswers[index] : [];
        
        // Get the labels of user selections
        const userLabels = userSelections.map(answer => getChoiceLabel(answer)).filter(Boolean);
        
        // Check if user selected exactly the correct answers (no more, no less)
        const hasAllCorrect = correctAnswers.every(correct => userLabels.includes(correct));
        const hasNoIncorrect = userLabels.every(userLabel => correctAnswers.includes(userLabel));
        
        isCorrect = hasAllCorrect && hasNoIncorrect && userLabels.length === correctAnswers.length;
      } else if (q.question_type?.toLowerCase() === 'hotspot') {
        const correctHotspotAnswers = {};
        const lines = q.correct_answer.split(/\r?\n/).filter(Boolean);
        for (const line of lines) {
          const [label, answer] = line.split(':');
          if (label && answer) {
            correctHotspotAnswers[label.trim()] = answer.trim();
          }
        }
        
        isCorrect = Object.entries(correctHotspotAnswers).every(
          ([label, correctAnswer]) => (userAnswers[index] && userAnswers[index][label]) === correctAnswer
        );
      } else {
        isCorrect = userAnswers[index] === q.correct_answer;
      }
      
      return isCorrect ? null : { questionIndex: index, question: q };
    }).filter(Boolean);
  };

  const getWrongAnswersCount = () => getWrongAnswers().length;

  const navigateToNextWrong = () => {
    const wrongAnswers = getWrongAnswers();
    if (wrongAnswers.length === 0) return;
    
    const currentWrongIndex = wrongAnswers.findIndex(wa => wa.questionIndex === current);
    const nextWrongIndex = (currentWrongIndex + 1) % wrongAnswers.length;
    setCurrent(wrongAnswers[nextWrongIndex].questionIndex);
  };

  const navigateToPrevWrong = () => {
    const wrongAnswers = getWrongAnswers();
    if (wrongAnswers.length === 0) return;
    
    const currentWrongIndex = wrongAnswers.findIndex(wa => wa.questionIndex === current);
    const prevWrongIndex = currentWrongIndex <= 0 ? wrongAnswers.length - 1 : currentWrongIndex - 1;
    setCurrent(wrongAnswers[prevWrongIndex].questionIndex);
  };

  const startRetryMode = () => {
    const wrongAnswers = getWrongAnswers();
    if (wrongAnswers.length === 0) return;
    
    // Create a focused test with only wrong answer questions
    const wrongQuestions = wrongAnswers.map(({ questionIndex, question }) => ({
      ...question,
      originalIndex: questionIndex // Keep track of original position
    }));
    
    setRetryMode(true);
    setWrongAnswersFilter(true);
    setRetryQuestions(wrongQuestions);
    setRetryProgress({ completed: 0, remaining: wrongQuestions.length });
    
    // Switch to retry questions and reset state for retry mode
    setQuestions(wrongQuestions);
    setCurrent(0);
    setUserAnswers(wrongQuestions.map(getInitialUserAnswer));
    setQuestionScore(Array(wrongQuestions.length).fill(null));
    setQuestionSubmitted(Array(wrongQuestions.length).fill(false));
    
    setShowWrongAnswersModal(false);
    
    // Show study tips modal for retry mode
    setShowStudyTipsModal(true);
  };

  // Exit retry mode and return to original test
  const exitRetryMode = () => {
    setRetryMode(false);
    setWrongAnswersFilter(false);
    setRetryQuestions([]);
    setRetryProgress({ completed: 0, remaining: 0 });
    
    // Restore original questions and state
    setQuestions(originalQuestions);
    setCurrent(0);
    
    // Restore the original progress but don't reset scores for questions that were correct
    setUserAnswers(originalQuestions.map(getInitialUserAnswer));
    setQuestionScore(Array(originalQuestions.length).fill(null));
    setQuestionSubmitted(Array(originalQuestions.length).fill(false));
  };

  // Update retry progress when questions are completed
  const updateRetryProgress = () => {
    if (!retryMode || retryQuestions.length === 0) return;
    
    const correctCount = questions.filter((q, index) => {
      if (!questionSubmitted[index]) return false;
      return isQuestionCorrect(q, index);
    }).length;
    
    setRetryProgress({ completed: correctCount, remaining: retryQuestions.length - correctCount });
    
    // Dynamic elimination: Remove correctly answered questions from retry set
    if (correctCount > retryProgress.completed) {
      const stillWrongQuestions = questions.filter((q, index) => {
        if (!questionSubmitted[index]) return true; // Keep unanswered questions
        return !isQuestionCorrect(q, index); // Keep incorrectly answered questions
      });
      
      if (stillWrongQuestions.length !== questions.length) {
        // Update the questions array to only include still-wrong questions
        setQuestions(stillWrongQuestions);
        setRetryQuestions(stillWrongQuestions);
        
        // Reset arrays to match new question count
        const newUserAnswers = stillWrongQuestions.map(getInitialUserAnswer);
        const newQuestionScore = Array(stillWrongQuestions.length).fill(null);
        const newQuestionSubmitted = Array(stillWrongQuestions.length).fill(false);
        
        setUserAnswers(newUserAnswers);
        setQuestionScore(newQuestionScore);
        setQuestionSubmitted(newQuestionSubmitted);
        
        // Adjust current index if needed
        if (current >= stillWrongQuestions.length) {
          setCurrent(Math.max(0, stillWrongQuestions.length - 1));
        }
      }
    }
  };

  // Helper function to check if a question is correct
  const isQuestionCorrect = (q, index) => {
    if (q.question_type?.toLowerCase() === 'multiple choice') {
      const correctAnswers = q.correct_answer.split(',').map(s => s.trim());
      const userSelections = Array.isArray(userAnswers[index]) ? userAnswers[index] : [];
      const userLabels = userSelections.map(answer => getChoiceLabel(answer)).filter(Boolean);
      const hasAllCorrect = correctAnswers.every(correct => userLabels.includes(correct));
      const hasNoIncorrect = userLabels.every(userLabel => correctAnswers.includes(userLabel));
      return hasAllCorrect && hasNoIncorrect && userLabels.length === correctAnswers.length;
    } else if (q.question_type?.toLowerCase() === 'hotspot') {
      const correctHotspotAnswers = {};
      const lines = q.correct_answer.split(/\r?\n/).filter(Boolean);
      for (const line of lines) {
        const [label, answer] = line.split(':');
        if (label && answer) {
          correctHotspotAnswers[label.trim()] = answer.trim();
        }
      }
      return Object.entries(correctHotspotAnswers).every(
        ([label, correctAnswer]) => (userAnswers[index] && userAnswers[index][label]) === correctAnswer
      );
    } else {
      return userAnswers[index] === q.correct_answer;
    }
  };

  // Call updateRetryProgress when relevant state changes
  React.useEffect(() => {
    updateRetryProgress();
    
    // Check if retry mode is complete
    if (retryMode && retryProgress.remaining === 0 && retryProgress.completed > 0) {
      setTimeout(() => {
        alert('All retry questions completed! Great work!');
        exitRetryMode();
      }, 1000);
    }
  }, [questionSubmitted, userAnswers, retryMode, retryProgress.completed, retryProgress.remaining]); // eslint-disable-line react-hooks/exhaustive-deps

  // Navigation functions
  const allQuestionsAttempted = () => {
    return questionSubmitted.every(Boolean);
  };

  const answeredCount = () => {
    return questionSubmitted.filter(Boolean).length;
  };

  const handleFinishTest = () => {
    setTestCompleted(true);
    // Complete the test
  };

  // Save progress function
  const handleSaveProgress = async (saveData) => {
    try {
      const caseStudySaveData = {
        ...saveData,
        type: 'case-study',
        caseStudyId: selectedTest.caseStudyId,
        caseStudyTitle: selectedTest.caseStudyTitle,
        title: `${selectedTest.caseStudyTitle} - ${saveData.title}`,
        questions: questions.map(q => ({ ...q })),
        originalTest: {
          caseStudyId: selectedTest.caseStudyId,
          caseStudyTitle: selectedTest.caseStudyTitle,
          type: 'case-study'
        },
        progress: {
          current,
          userAnswers,
          questionScore,
          questionSubmitted,
          markedQuestions,
          questionNotes,
          wrongAnswersFilter,
          retryMode
        }
      };
      
      await SavedTestsService.saveTest(caseStudySaveData);
      alert('Case study progress saved!');
    } catch (error) {
      console.error('Error saving case study:', error);
      throw error;
    }
  };

  // Answer handling
  const updateUserAnswer = (answer) => {
    const newAnswers = [...userAnswers];
    newAnswers[current] = answer;
    setUserAnswers(newAnswers);
  };

  // Handle hotspot question changes
  const handleHotspotChange = (label, val) => {
    const newAnswers = [...userAnswers];
    newAnswers[current] = { ...newAnswers[current], [label]: val };
    setUserAnswers(newAnswers);
  };

  const submitAnswer = () => {
    if (questions[current]) {
      const newSubmitted = [...questionSubmitted];
      newSubmitted[current] = true;
      setQuestionSubmitted(newSubmitted);
      
      // Calculate score for this question
      const q = questions[current];
      let score = 0;
      
      if (q.question_type?.toLowerCase() === 'multiple choice') {
        const correctAnswers = q.correct_answer.split(',').map(s => s.trim());
        const userSelections = Array.isArray(userAnswers[current]) ? userAnswers[current] : [];
        
        // Award 1 point for each correct answer selected (no penalty for incorrect selections)
        score = userSelections.filter(answer => {
          const choiceLabel = getChoiceLabel(answer);
          return correctAnswers.includes(choiceLabel);
        }).length;
      } else if (q.question_type?.toLowerCase() === 'hotspot') {
        const correctHotspotAnswers = {};
        const lines = q.correct_answer.split(/\r?\n/).filter(Boolean);
        for (const line of lines) {
          const [label, answer] = line.split(':');
          if (label && answer) {
            correctHotspotAnswers[label.trim()] = answer.trim();
          }
        }
        
        // Award 1 point for each correct hotspot selection
        score = Object.entries(correctHotspotAnswers).filter(
          ([label, correctAnswer]) => (userAnswers[current] && userAnswers[current][label]) === correctAnswer
        ).length;
      } else {
        // For other question types, simple correct/incorrect (1 point)
        score = userAnswers[current] === q.correct_answer ? 1 : 0;
      }
      
      const newScores = [...questionScore];
      newScores[current] = score;
      setQuestionScore(newScores);
      
      // Show celebration message in retry mode if question is answered correctly
      if (retryMode && isQuestionCorrect(q, current)) {
        const encouragementMessages = [
          "🎉 Excellent! You got it right this time!",
          "✨ Great improvement! Well done!",
          "🌟 Perfect! You're mastering this!",
          "🎊 Fantastic! Keep up the great work!",
          "💪 Nice job! You're getting stronger!",
          "🚀 Awesome! You're on fire!",
          "🎯 Bulls-eye! Great understanding!",
          "⭐ Brilliant! You've got this!"
        ];
        
        const randomMessage = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
        
        // Show a brief celebration toast
        const toast = document.createElement('div');
        toast.className = 'retry-success-toast';
        toast.textContent = randomMessage;
        toast.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: white;
          padding: 1rem 1.5rem;
          border-radius: 10px;
          font-weight: 600;
          z-index: 10000;
          animation: slideInRight 0.3s ease-out;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        `;
        
        document.body.appendChild(toast);
        setTimeout(() => {
          toast.style.animation = 'slideOutRight 0.3s ease-in';
          setTimeout(() => document.body.removeChild(toast), 300);
        }, 2000);
      }
    }
  };

  // Get choice label helper
  function getChoiceLabel(choice) {
    const match = choice.match(/^([A-Z])\./);
    return match ? match[1] : null;
  }

  if (!questions.length) {
    return (
      <div className="case-study-test-loading">
        <div className="case-study-test-loading-icon">📚</div>
        <div className="case-study-test-loading-text">Loading Case Study Test...</div>
      </div>
    );
  }

  const q = questions[current];
  if (!q) return null;

  // Use the same choice parsing as PracticeTest for consistency
  let choices = q.choices?.match(/^[A-Z]\..+?(?=\n[A-Z]\.|$)/gms)?.map(s => s.trim()) || [];
  
  // Fallback: if no choices found with regex, try splitting by newlines and filtering for A-Z format
  if (choices.length === 0 && q.choices) {
    choices = q.choices.split(/\r?\n/)
      .filter(line => line.trim())
      .filter(line => /^[A-Z]\./.test(line.trim()))
      .map(line => line.trim());
  }

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
  
  // Debug: Log choices data for first question
  if (current === 0) {
    console.log('Question 1 hotspot data:', {
      question_type: q.question_type,
      hotspotOptions: hotspotOptions,
      correctHotspotAnswers: correctHotspotAnswers
    });
  }
  
  const runningScore = questionScore.reduce((sum, val) => sum + (val || 0), 0);

  // Group sections by section_group for case study info
  const groupedSections = sections.reduce((acc, section) => {
    const group = section.section_group || 'General';
    if (!acc[group]) acc[group] = [];
    acc[group].push(section);
    return acc;
  }, {});

  return (
    <>
      <div className="practice-test case-study-test">
      {/* Case Study Information Box - Always visible at top */}
      <div className="case-study-info-box">
        <div className="case-study-info-header">
          <div className="case-study-info-title">
            <span className="case-study-icon">📋</span>
            <h2>{meta.title} - Case Study Information</h2>
          </div>
          <div className="case-study-info-tabs">
            {Object.keys(groupedSections).map(group => (
              <button
                key={group}
                className={`case-study-tab ${activeTab === group ? 'active' : ''}`}
                onClick={() => setActiveTab(group)}
              >
                📖 {group}
              </button>
            ))}
          </div>
        </div>
        
        {activeTab && groupedSections[activeTab] && (
          <div className="case-study-info-content">
            {groupedSections[activeTab].map((section, index) => (
              <div
                key={section.id || section.section_title}
                className="case-study-info-item"
                onClick={() => setModalSection(section)}
              >
                <div className="case-study-info-item-number">{index + 1}</div>
                <div className="case-study-info-item-content">
                  <h4>{section.section_title}</h4>
                  <p>Click to read full information</p>
                </div>
                <div className="case-study-info-item-arrow">→</div>
              </div>
            ))}
          </div>
        )}
        
        {!activeTab && (
          <div className="case-study-info-summary">
            <p>Click any tab above to view available case study sections.</p>
          </div>
        )}
      </div>

      {/* Modal for section content */}
      {modalSection && (
        <div className="question-quiz-modal-overlay" onClick={() => setModalSection(null)}>
          <div className="question-quiz-modal-content" onClick={e => e.stopPropagation()}>
            <button
              className="question-quiz-modal-close"
              onClick={() => setModalSection(null)}
              aria-label="Close"
            >
              ✕
            </button>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: '#669BBC',
                color: 'white',
                borderRadius: '12px',
                padding: '0.75rem',
                fontSize: '1.5rem'
              }}>
                �
              </div>
              <h3 className="question-quiz-modal-title">
                {modalSection.section_title}
              </h3>
            </div>
            
            <div className="question-quiz-modal-text" style={{ 
              whiteSpace: 'pre-line',
              background: 'rgba(102, 155, 188, 0.05)',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid rgba(102, 155, 188, 0.1)'
            }}>
              {modalSection.content}
            </div>
            
            <div style={{
              marginTop: '2rem',
              textAlign: 'center'
            }}>
              <button
                onClick={() => setModalSection(null)}
                className="question-quiz-nav-btn"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clean Header */}
      <div className="practice-test-header">
        <div className="header-top">
          <button onClick={onBackToSelection} className="back-to-tests-btn">
            ← Back to Case Study
          </button>
          <div className="mode-info">
            {retryMode ? (
              <span className="mode-badge retry-mode">
                🔄 Retry Mode
              </span>
            ) : (
              <span className="mode-badge practice-mode">
                🎯 Practice Mode
              </span>
            )}
            <p className="mode-description">
              {retryMode 
                ? `Focus on wrong answers • ${retryProgress.remaining} remaining • ${retryProgress.completed} corrected`
                : 'Get immediate feedback as you submit each answer'
              }
            </p>
          </div>
        </div>
        <div className="header-bottom">
          <div className="test-info">
            <h1 className="test-title">
              {selectedTest.title}
              {retryMode && <span className="retry-indicator"> - Retry Mode</span>}
            </h1>
          </div>
        </div>
      </div>

      {/* Integrated Timer */}
      {timerEnabled && (
        <div className="integrated-timer">
          <div className="timer-display">
            <div className="timer-time">
              <span className={`timer-value ${timerTime < 300 && timerTime > 0 ? 'timer-warning' : ''} ${timerTime === 0 ? 'timer-expired' : ''} ${timerTimeHidden ? 'timer-hidden' : ''}`}>
                {timerTimeHidden ? '••:••:••' : formatTime(timerTime)}
              </span>
              <span className="timer-label">
                {timerTimeHidden && timerEnabled ? 'Timer Hidden (Still Running)' : 'Practice Timer'}
              </span>
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
                onClick={toggleTimer}
                className={`timer-btn ${timerEnabled ? 'timer-enabled' : 'timer-disabled'}`}
                title={timerEnabled ? 'Disable timer' : 'Enable timer'}
              >
                {timerEnabled ? '⏰' : '⏱️'}
              </button>
              
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
            </div>
          </div>
        </div>
      )}

      {/* Retry Mode Progress Bar */}
      {retryMode && (
        <div className="retry-progress-bar">
          <div 
            className="retry-progress-fill"
            style={{ 
              width: `${retryProgress.completed > 0 ? (retryProgress.completed / (retryProgress.completed + retryProgress.remaining)) * 100 : 0}%` 
            }}
          />
        </div>
      )}

      {/* Ultra-Compact Test Navigation & Controls */}
      <div className="compact-test-bar">
        <div className="test-bar-left">
          <div className="question-nav">
            <span className="current-question">Q {current + 1}/{questions.length}</span>
            <input
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
              className="question-jump-input compact"
              title="Jump to question"
              placeholder={`1-${questions.length}`}
            />
          </div>
          <div className="score-compact">
            Score: {runningScore}/{
              questions.reduce((sum, q) => {
                if (q.question_type?.toLowerCase() === 'multiple choice') {
                  return sum + q.correct_answer.split(',').length;
                } else if (q.question_type?.toLowerCase() === 'hotspot') {
                  return sum + q.correct_answer.split(/\r?\n/).filter(Boolean).length;
                }
                return sum + 1;
              }, 0)
            }
            {getWrongAnswersCount() > 0 && (
              <div className="wrong-nav-controls">
                <button 
                  onClick={navigateToPrevWrong}
                  className="wrong-nav-btn"
                  title="Previous wrong answer"
                >
                  ◄❌
                </button>
                <button 
                  onClick={navigateToNextWrong}
                  className="wrong-nav-btn"
                  title="Next wrong answer"
                >
                  ❌►
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="test-bar-center">
          <div className="test-controls-compact">
            {retryMode && (
              <button
                onClick={exitRetryMode}
                className="control-btn compact exit-retry"
                title="Exit Retry Mode"
              >
                <span className="btn-icon">🚪</span>
                <span className="btn-text">Exit Retry</span>
              </button>
            )}
            <button
              onClick={() => {
                setQuestions(shuffleArray(originalQuestions));
                setCurrent(0);
              }}
              className="control-btn compact"
              title="Shuffle Questions"
              disabled={retryMode}
            >
              <span className="btn-icon">🔀</span>
              <span className="btn-text">Shuffle</span>
            </button>
            <button
              onClick={() => {
                setQuestions(originalQuestions);
                setCurrent(0);
                setUserAnswers(originalQuestions.map(getInitialUserAnswer));
                setQuestionScore(Array(originalQuestions.length).fill(null));
                setQuestionSubmitted(Array(originalQuestions.length).fill(false));
              }}
              className="control-btn compact"
              title="Reset Test"
              disabled={retryMode}
            >
              <span className="btn-icon">🔄</span>
              <span className="btn-text">Reset</span>
            </button>
            <button onClick={() => setShowSaveModal(true)} className="control-btn compact" title="Save Progress">
              <span className="btn-icon">💾</span>
              <span className="btn-text">Save</span>
            </button>
            {getWrongAnswersCount() > 0 && !retryMode && (
              <button 
                onClick={() => setShowWrongAnswersModal(true)}
                className="control-btn compact wrong-answers"
                title={`${getWrongAnswersCount()} wrong answer(s) to review`}
              >
                <span className="btn-icon">❌</span>
                <span className="btn-text">Wrong ({getWrongAnswersCount()})</span>
              </button>
            )}
          </div>
        </div>
        
        <div className="test-bar-right">
          {!testCompleted && (
            <div className="finish-test-compact">
              {allQuestionsAttempted() ? (
                <button
                  onClick={handleFinishTest}
                  className="finish-test-btn compact ready"
                >
                  <span className="btn-icon">✅</span>
                  <span className="btn-text">Finish</span>
                </button>
              ) : (
                <button
                  onClick={handleFinishTest}
                  className="finish-test-btn compact partial"
                  title={`${questions.length - answeredCount()} questions remaining`}
                >
                  <span className="btn-icon">📝</span>
                  <span className="btn-text">Finish ({answeredCount()}/{questions.length})</span>
                </button>
              )}
            </div>
          )}
          
          {testCompleted && (
            <div className="test-completed-compact">
              <span className="btn-icon">🎉</span>
              <span className="btn-text">Complete!</span>
            </div>
          )}
        </div>
      </div>

      {/* Secondary controls row for timer and review when needed */}
      {(timerEnabled || markedQuestions.length > 0) && (
        <div className="compact-test-bar secondary">
          <div className="test-bar-left">
            {timerEnabled && (
              <div className="timer-controls-compact">
                <button 
                  onClick={toggleTimer}
                  className={`control-btn compact small ${timerEnabled ? 'timer-enabled' : 'timer-disabled'}`}
                  title={timerEnabled ? 'Disable timer' : 'Enable timer'}
                >
                  <span className="btn-icon">{timerEnabled ? '⏰' : '⏱️'}</span>
                </button>
                <button 
                  onClick={startStopTimer}
                  className={`control-btn compact small ${timerRunning ? 'timer-pause' : 'timer-play'}`}
                  title={timerRunning ? 'Pause timer' : 'Start timer'}
                >
                  <span className="btn-icon">{timerRunning ? '⏸️' : '▶️'}</span>
                </button>
                <button 
                  onClick={resetTimer}
                  className="control-btn compact small timer-reset"
                  title="Reset timer"
                >
                  <span className="btn-icon">🔄</span>
                </button>
              </div>
            )}
          </div>
          
          <div className="test-bar-center">
            {/* Center space for future use */}
          </div>
          
          <div className="test-bar-right">
            {markedQuestions.length > 0 && (
              <button 
                onClick={() => alert(`${markedQuestions.length} question(s) marked for review. Review functionality coming soon!`)}
                className="control-btn compact small"
                title={`${markedQuestions.length} question(s) marked for review`}
              >
                <span className="btn-icon">📌</span>
                <span className="btn-text">Review ({markedQuestions.length})</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Question Content */}
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
                
                if (isSelected) {
                  feedbackClass = isCorrectChoice ? 'choice-correct' : 'choice-incorrect';
                } else if (isCorrectChoice) {
                  feedbackClass = 'choice-missed';
                }
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
                          updateUserAnswer(currentAnswers.filter(c => c !== choice));
                        } else {
                          const correctAnswers = q.correct_answer.split(',').map(s => s.trim());
                          const maxSelections = correctAnswers.length;
                          
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
              const userSelection = (userAnswers[current] && userAnswers[current][label]) || '';
              const correctAnswer = correctHotspotAnswers[label];
              const isCorrect = userSelection === correctAnswer;
              
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
            }
            
            return (
              <div key={label} className={`hotspot-item ${feedbackClass}`}>
                <strong className="hotspot-label">{label}:</strong>
                <select
                  value={(userAnswers[current] && userAnswers[current][label]) || ''}
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

      {/* Submit button and navigation - Combined on one line */}
      <div className="question-actions-navigation">
        <button
          onClick={() => {
            setCurrent(Math.max(0, current - 1));
          }}
          disabled={current === 0}
          className="nav-btn prev"
        >
          ← Previous
        </button>

        <div className="submit-section">
          {!questionSubmitted[current] && (
            <button 
              onClick={submitAnswer}
              disabled={
                (q.question_type?.toLowerCase() === 'multiple choice' && 
                 (!Array.isArray(userAnswers[current]) || userAnswers[current].length === 0)) ||
                (q.question_type?.toLowerCase() !== 'multiple choice' && !userAnswers[current])
              }
              className="submit-answer-btn"
            >
              Submit Answer
            </button>
          )}
          
          {questionSubmitted[current] && (
            <div className="answer-submitted">
              ✅ Answer submitted
            </div>
          )}
        </div>
        
        <button
          onClick={() => {
            setCurrent(Math.min(questions.length - 1, current + 1));
          }}
          disabled={current === questions.length - 1}
          className="nav-btn next"
        >
          Next →
        </button>
      </div>

      {/* Explanation modal */}
      {showModal && (
        <div className="question-quiz-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="question-quiz-modal-content" onClick={e => e.stopPropagation()}>
            <button
              className="question-quiz-modal-close"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              ✕
            </button>
            
            <h3 className="question-quiz-modal-title">
              Question {current + 1} - Explanation
            </h3>
            
            <div className="question-quiz-modal-text">
              <p><strong>Correct Answer:</strong> {q.correct_answer}</p>
              {q.explanation && (
                <div>
                  <strong>Explanation:</strong>
                  <div style={{ marginTop: '0.5rem' }}>{q.explanation}</div>
                </div>
              )}
            </div>
            
            <div style={{
              marginTop: '2rem',
              textAlign: 'center'
            }}>
              <button
                onClick={() => setShowModal(false)}
                className="question-quiz-nav-btn"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Modal */}
      {showSaveModal && (
        <SaveModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          onSave={handleSaveProgress}
          currentProgress={{
            current,
            userAnswers,
            questionScore,
            questionSubmitted,
            markedQuestions,
            questionNotes
          }}
          existingSavedTest={currentSavedTest}
        />
      )}

      {/* Wrong Answers Modal */}
      {showWrongAnswersModal && (
        <div className="question-quiz-modal-overlay" onClick={() => setShowWrongAnswersModal(false)}>
          <div className="question-quiz-modal-content wrong-answers-modal" onClick={e => e.stopPropagation()}>
            <button
              className="question-quiz-modal-close"
              onClick={() => setShowWrongAnswersModal(false)}
              aria-label="Close"
            >
              ✕
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{
                background: '#dc3545',
                color: 'white',
                borderRadius: '12px',
                padding: '0.75rem',
                fontSize: '1.5rem'
              }}>
                ❌
              </div>
              <h3 className="question-quiz-modal-title">
                Wrong Answers Review
              </h3>
            </div>
            
            <div className="wrong-answers-summary">
              <div className="wrong-answers-stats">
                <div className="stat-item">
                  <span className="stat-number">{getWrongAnswersCount()}</span>
                  <span className="stat-label">Wrong Answers</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{questions.filter((_, i) => questionSubmitted[i]).length - getWrongAnswersCount()}</span>
                  <span className="stat-label">Correct Answers</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{Math.round((questions.filter((_, i) => questionSubmitted[i]).length - getWrongAnswersCount()) / Math.max(1, questions.filter((_, i) => questionSubmitted[i]).length) * 100)}%</span>
                  <span className="stat-label">Accuracy</span>
                </div>
              </div>
              
              {getWrongAnswersCount() > 0 && (
                <div className="wrong-answers-list">
                  <h4>Questions to Review:</h4>
                  <div className="wrong-questions-grid">
                    {getWrongAnswers().map(({ questionIndex, question }) => (
                      <div 
                        key={questionIndex}
                        className="wrong-question-item"
                        onClick={() => {
                          setCurrent(questionIndex);
                          setShowWrongAnswersModal(false);
                        }}
                      >
                        <div className="wrong-question-number">Q{questionIndex + 1}</div>
                        <div className="wrong-question-text">
                          {question.question_text.substring(0, 80)}...
                        </div>
                        <div className="wrong-question-arrow">→</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="wrong-answers-actions">
              {getWrongAnswersCount() > 0 && (
                <>
                  <button
                    onClick={startRetryMode}
                    className="question-quiz-nav-btn retry-btn"
                    style={{ background: '#dc3545', color: 'white' }}
                  >
                    🔄 Retry Wrong Answers
                  </button>
                  <button
                    onClick={() => {
                      if (getWrongAnswersCount() > 0) {
                        setCurrent(getWrongAnswers()[0].questionIndex);
                      }
                      setShowWrongAnswersModal(false);
                    }}
                    className="question-quiz-nav-btn"
                  >
                    📖 Review First Wrong Answer
                  </button>
                </>
              )}
              <button
                onClick={() => setShowWrongAnswersModal(false)}
                className="question-quiz-nav-btn"
                style={{ background: '#6c757d', color: 'white' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Modal for section content - moved outside container for proper overlay */}
      {modalSection && (
        <div className="question-quiz-modal-overlay" onClick={() => setModalSection(null)}>
          <div className="question-quiz-modal-content" onClick={e => e.stopPropagation()}>
            <button
              className="question-quiz-modal-close"
              onClick={() => setModalSection(null)}
              aria-label="Close"
            >
              ✕
            </button>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: '#669BBC',
                color: 'white',
                borderRadius: '12px',
                padding: '0.75rem',
                fontSize: '1.5rem'
              }}>
                📄
              </div>
              <h3 className="question-quiz-modal-title">
                {modalSection.section_title}
              </h3>
            </div>
            
            <div className="question-quiz-modal-text" style={{ 
              whiteSpace: 'pre-line',
              background: 'rgba(102, 155, 188, 0.05)',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid rgba(102, 155, 188, 0.1)'
            }}>
              {modalSection.content}
            </div>
            
            <div style={{
              marginTop: '2rem',
              textAlign: 'center'
            }}>
              <button
                onClick={() => setModalSection(null)}
                className="question-quiz-nav-btn"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Study Tips Modal for Retry Mode */}
      {showStudyTipsModal && (
        <div className="question-quiz-modal-overlay" onClick={() => setShowStudyTipsModal(false)}>
          <div className="question-quiz-modal-content study-tips-modal" onClick={e => e.stopPropagation()}>
            <button
              className="question-quiz-modal-close"
              onClick={() => setShowStudyTipsModal(false)}
              aria-label="Close"
            >
              ✕
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                color: 'white',
                borderRadius: '12px',
                padding: '0.75rem',
                fontSize: '1.5rem'
              }}>
                🎯
              </div>
              <h3 className="question-quiz-modal-title">
                Retry Mode Study Tips
              </h3>
            </div>
            
            <div className="study-tips-content">
              <div className="study-tip">
                <h4>🔄 Focus Mode Active</h4>
                <p>You're now in retry mode! Only the questions you got wrong will appear. As you answer each question correctly, it will be automatically removed from your retry set.</p>
              </div>
              
              <div className="study-tip">
                <h4>📚 Study Strategies</h4>
                <ul>
                  <li>Read each question carefully and take your time</li>
                  <li>Use the case study information tabs above for reference</li>
                  <li>Look for keywords that might have been missed initially</li>
                  <li>Consider why your previous answer was incorrect</li>
                </ul>
              </div>
              
              <div className="study-tip">
                <h4>💡 Dynamic Progress</h4>
                <p>Watch the progress bar at the top! Each correct answer reduces your retry set. The goal is to get all questions right and clear your retry list completely.</p>
              </div>
              
              <div className="study-tip">
                <h4>🎉 Celebrate Success</h4>
                <p>You'll get encouraging messages when you answer correctly. Keep going until you've mastered all the challenging questions!</p>
              </div>
            </div>
            
            <div style={{
              marginTop: '2rem',
              textAlign: 'center'
            }}>
              <button
                onClick={() => setShowStudyTipsModal(false)}
                className="question-quiz-nav-btn"
                style={{ background: '#28a745', color: 'white', fontSize: '1.1rem', padding: '0.75rem 1.5rem' }}
              >
                🚀 Start Retry Mode
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CaseStudyDetail;