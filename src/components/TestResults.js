import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PublishedTestsService } from '../services/PublishedTestsService';
import './TestResults.css';

export default function TestResults() {
  const { testId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState(null);
  const [results, setResults] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    loadTestResults();
  }, [testId]);

  const loadTestResults = async () => {
    try {
      // Get the published test
      const publishedTests = await PublishedTestsService.getPublishedTests();
      const publishedTest = publishedTests.find(t => t.id === testId);
      
      if (publishedTest) {
        setTest(publishedTest);
        setShareLink(PublishedTestsService.generateShareLink(publishedTest.shareId));
        
        // Get results
        const testResults = await PublishedTestsService.getTestResults(publishedTest.shareId);
        setResults(testResults);
      } else {
        alert('Test not found or not published');
        navigate('/my-tests');
      }
    } catch (error) {
      console.error('Error loading test results:', error);
      alert('Failed to load test results');
    } finally {
      setLoading(false);
    }
  };

  const handleExportResults = () => {
    if (results && results.results.length > 0) {
      PublishedTestsService.exportResultsToCSV(results.results, test.title);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Share link copied to clipboard!');
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return '#28a745'; // A
    if (percentage >= 80) return '#17a2b8'; // B
    if (percentage >= 70) return '#ffc107'; // C
    if (percentage >= 60) return '#fd7e14'; // D
    return '#dc3545'; // F
  };

  if (loading) {
    return (
      <div className="results-loading">
        <div className="loading-spinner">🔄</div>
        <p>Loading test results...</p>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="results-error">
        <h2>Test not found</h2>
        <button onClick={() => navigate('/my-tests')}>Back to My Tests</button>
      </div>
    );
  }

  return (
    <div className="test-results-container">
      <div className="results-header">
        <div className="header-content">
          <h1>📊 {test.title} - Results</h1>
          <p>{test.description}</p>
        </div>
        <button className="back-btn" onClick={() => navigate('/my-tests')}>
          ← Back to My Tests
        </button>
      </div>

      {/* Share Link Section */}
      <div className="share-section">
        <h3>🔗 Share Test</h3>
        <div className="share-link-container">
          <input 
            type="text" 
            value={shareLink} 
            readOnly 
            className="share-link-input"
          />
          <button onClick={copyShareLink} className="copy-btn">
            📋 Copy Link
          </button>
        </div>
        <p className="share-help">Send this link to students to take the test</p>
      </div>

      {/* Statistics Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-number">{results.totalAttempts}</div>
          <div className="stat-label">Total Attempts</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{results.completedAttempts}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{results.averageScore.toFixed(1)}%</div>
          <div className="stat-label">Average Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{results.highestScore}%</div>
          <div className="stat-label">Highest Score</div>
        </div>
      </div>

      {/* Results Table */}
      {results.results.length > 0 ? (
        <div className="results-section">
          <div className="section-header">
            <h3>📈 Student Results</h3>
            <button onClick={handleExportResults} className="export-btn">
              📊 Export to CSV
            </button>
          </div>

          <div className="results-table-container">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Status</th>
                  <th>Time Spent</th>
                  <th>Completed At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.results.map((result, index) => (
                  <tr key={index}>
                    <td className="student-name">{result.studentName}</td>
                    <td className="student-email">{result.studentEmail || 'N/A'}</td>
                    <td className="score">{result.score}</td>
                    <td className="percentage">
                      <span 
                        className="percentage-badge"
                        style={{ color: getGradeColor(result.percentage) }}
                      >
                        {result.percentage.toFixed(1)}%
                      </span>
                    </td>
                    <td className="status">
                      <span className={`status-badge ${result.percentage >= test.settings.passingScore ? 'passed' : 'failed'}`}>
                        {result.percentage >= test.settings.passingScore ? '✅ Passed' : '❌ Failed'}
                      </span>
                    </td>
                    <td className="time-spent">{formatTime(result.timeSpent)}</td>
                    <td className="completed-at">
                      {new Date(result.completedAt).toLocaleDateString()} <br />
                      <small>{new Date(result.completedAt).toLocaleTimeString()}</small>
                    </td>
                    <td className="actions">
                      <button 
                        onClick={() => setSelectedStudent(result)}
                        className="view-btn"
                      >
                        👁️ View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="no-results">
          <div className="no-results-icon">📭</div>
          <h3>No submissions yet</h3>
          <p>Students haven't taken this test yet. Share the link above to get started!</p>
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="student-detail-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>📋 {selectedStudent.studentName}'s Results</h3>
              <button 
                className="close-modal-btn"
                onClick={() => setSelectedStudent(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="student-summary">
                <div className="summary-item">
                  <span>Score:</span>
                  <span>{selectedStudent.score}</span>
                </div>
                <div className="summary-item">
                  <span>Percentage:</span>
                  <span style={{ color: getGradeColor(selectedStudent.percentage) }}>
                    {selectedStudent.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="summary-item">
                  <span>Time Spent:</span>
                  <span>{formatTime(selectedStudent.timeSpent)}</span>
                </div>
                <div className="summary-item">
                  <span>Status:</span>
                  <span className={selectedStudent.percentage >= test.settings.passingScore ? 'passed' : 'failed'}>
                    {selectedStudent.percentage >= test.settings.passingScore ? 'Passed' : 'Failed'}
                  </span>
                </div>
              </div>

              <h4>Question by Question Breakdown</h4>
              <div className="question-breakdown">
                {Object.entries(selectedStudent.answers).map(([questionIndex, answer]) => (
                  <div key={questionIndex} className={`breakdown-item ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                    <div className="question-text">
                      <strong>Q{parseInt(questionIndex) + 1}: {answer.question}</strong>
                    </div>
                    <div className="answer-details">
                      <div className="student-answer">
                        <span className="label">Student Answer:</span>
                        <span className={answer.isCorrect ? 'correct' : 'incorrect'}>
                          {answer.studentAnswer || 'No answer'}
                        </span>
                      </div>
                      {!answer.isCorrect && (
                        <div className="correct-answer">
                          <span className="label">Correct Answer:</span>
                          <span className="correct">{answer.correctAnswer}</span>
                        </div>
                      )}
                      {answer.explanation && (
                        <div className="explanation">
                          <span className="label">Explanation:</span>
                          <span>{answer.explanation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="modal-actions">
              <button onClick={() => setSelectedStudent(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
