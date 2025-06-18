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
        const isCorrect = studentAnswer === correctAnswer;
        
        questionResults[index] = {
          question: question.question_text,
          studentAnswer,
          correctAnswer,
          isCorrect,
          explanation: question.explanation
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

  // Test Taking Step
  if (currentStep === 'test') {
    const question = test.questions[currentQuestion];
    const choices = question.choices.split('\n').filter(choice => choice.trim());

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
          
          <div className="choices">
            {choices.map((choice, index) => (
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
                        {result.studentAnswer || 'No answer'}
                      </span>
                    </div>
                    {test.settings.showCorrectAnswers && !result.isCorrect && (
                      <div className="correct-answer">
                        <span className="label">Correct Answer:</span>
                        <span className="correct">{result.correctAnswer}</span>
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
