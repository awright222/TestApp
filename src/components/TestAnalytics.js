import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreatedTestsService } from '../services/CreatedTestsService';
import { PublishedTestsService } from '../services/PublishedTestsService';
import { ShareService } from '../services/ShareService';
import { useAuth } from '../firebase/AuthContext';
import ProgressBar from './ProgressBar';
import './TestAnalytics.css';

export default function TestAnalytics() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [publishedResults, setPublishedResults] = useState(null);
  const [selectedView, setSelectedView] = useState('overview'); // 'overview', 'attempts', 'questions', 'export'
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'week', 'month'

  useEffect(() => {
    if (testId && user) {
      loadTestAnalytics();
    }
  }, [testId, user]);

  const loadTestAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get the test data
      const testData = await CreatedTestsService.getTestById(testId);
      if (!testData) {
        alert('Test not found');
        navigate('/my-tests');
        return;
      }
      setTest(testData);

      // Check if test is published and get results
      const publishedTests = await PublishedTestsService.getPublishedTests();
      const publishedTest = publishedTests.find(t => t.id === testId);
      
      if (publishedTest) {
        const results = await PublishedTestsService.getTestResults(publishedTest.shareId);
        setPublishedResults(results);
      }

      // Get shared test analytics if using ShareService
      try {
        const sharedAnalytics = await ShareService.getTestAnalytics(testId, user.uid);
        setAnalytics(sharedAnalytics);
      } catch (error) {
        console.log('No shared analytics available:', error);
      }

    } catch (error) {
      console.error('Error loading test analytics:', error);
      alert('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const exportResults = () => {
    if (publishedResults && publishedResults.results.length > 0) {
      PublishedTestsService.exportResultsToCSV(publishedResults.results, test.title);
    } else {
      alert('No results available to export');
    }
  };

  const getFilteredResults = () => {
    if (!publishedResults?.results) return [];
    
    if (timeFilter === 'all') return publishedResults.results;
    
    const now = new Date();
    const filterDate = new Date();
    
    if (timeFilter === 'week') {
      filterDate.setDate(now.getDate() - 7);
    } else if (timeFilter === 'month') {
      filterDate.setMonth(now.getMonth() - 1);
    }
    
    return publishedResults.results.filter(result => 
      new Date(result.completedAt) >= filterDate
    );
  };

  const getQuestionAnalytics = () => {
    const filteredResults = getFilteredResults();
    if (!filteredResults.length || !test?.questions) return [];

    return test.questions.map((question, index) => {
      const correctAnswers = filteredResults.filter(result => {
        // Check if this student got this question correct
        // This assumes answers are stored by question index
        return result.answers && result.answers[index] === question.correct_answer;
      }).length;

      const totalAnswers = filteredResults.filter(result => 
        result.answers && result.answers[index] !== undefined
      ).length;

      const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;

      return {
        questionNumber: index + 1,
        questionText: question.question_text,
        correctAnswers,
        totalAnswers,
        accuracy: accuracy.toFixed(1),
        difficulty: accuracy >= 80 ? 'Easy' : accuracy >= 60 ? 'Medium' : 'Hard'
      };
    });
  };

  const getPerformanceInsights = () => {
    const filteredResults = getFilteredResults();
    if (!filteredResults.length) return [];

    const insights = [];
    
    // Average score insight
    const avgScore = filteredResults.reduce((sum, r) => sum + r.percentage, 0) / filteredResults.length;
    if (avgScore < 70) {
      insights.push({
        type: 'warning',
        title: 'Low Average Score',
        message: `Average score is ${avgScore.toFixed(1)}%. Consider reviewing difficult questions.`,
        icon: '⚠️'
      });
    } else if (avgScore > 90) {
      insights.push({
        type: 'success',
        title: 'High Performance',
        message: `Excellent! Average score is ${avgScore.toFixed(1)}%.`,
        icon: '🎉'
      });
    }

    // Completion rate insight
    if (publishedResults) {
      const completionRate = (publishedResults.completedAttempts / publishedResults.totalAttempts) * 100;
      if (completionRate < 80) {
        insights.push({
          type: 'info',
          title: 'Completion Rate',
          message: `${completionRate.toFixed(1)}% of students completed the test. Consider checking test length.`,
          icon: '📊'
        });
      }
    }

    // Question difficulty insight
    const questionAnalytics = getQuestionAnalytics();
    const hardQuestions = questionAnalytics.filter(q => q.accuracy < 60);
    if (hardQuestions.length > 0) {
      insights.push({
        type: 'info',
        title: 'Difficult Questions',
        message: `${hardQuestions.length} question(s) have accuracy below 60%. Review for clarity.`,
        icon: '🎯'
      });
    }

    return insights;
  };

  if (loading) {
    return (
      <div className="test-analytics-loading">
        <div className="loading-spinner">📊</div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="test-analytics-error">
        <h2>Test not found</h2>
        <button onClick={() => navigate('/my-tests')}>Back to My Tests</button>
      </div>
    );
  }

  const filteredResults = getFilteredResults();
  const questionAnalytics = getQuestionAnalytics();
  const insights = getPerformanceInsights();

  return (
    <div className="test-analytics">
      <div className="analytics-header">
        <div className="header-content">
          <h1>📊 {test.title} - Analytics</h1>
          <p>Comprehensive performance analysis and insights</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => navigate('/my-tests')} 
            className="back-btn"
          >
            ← Back to My Tests
          </button>
          <button 
            onClick={loadTestAnalytics} 
            className="refresh-btn"
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="analytics-nav">
        <button 
          className={`nav-btn ${selectedView === 'overview' ? 'active' : ''}`}
          onClick={() => setSelectedView('overview')}
        >
          📈 Overview
        </button>
        <button 
          className={`nav-btn ${selectedView === 'attempts' ? 'active' : ''}`}
          onClick={() => setSelectedView('attempts')}
        >
          👥 Student Attempts
        </button>
        <button 
          className={`nav-btn ${selectedView === 'questions' ? 'active' : ''}`}
          onClick={() => setSelectedView('questions')}
        >
          ❓ Question Analysis
        </button>
        <button 
          className={`nav-btn ${selectedView === 'export' ? 'active' : ''}`}
          onClick={() => setSelectedView('export')}
        >
          📤 Export Data
        </button>
      </div>

      {/* Time Filter */}
      <div className="time-filter">
        <label>Time Period:</label>
        <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
          <option value="all">All Time</option>
          <option value="month">Last Month</option>
          <option value="week">Last Week</option>
        </select>
      </div>

      {/* Content based on selected view */}
      {selectedView === 'overview' && (
        <div className="analytics-content">
          {/* Key Metrics */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-number">
                {publishedResults?.totalAttempts || 0}
              </div>
              <div className="metric-label">Total Attempts</div>
            </div>
            <div className="metric-card">
              <div className="metric-number">
                {publishedResults?.completedAttempts || 0}
              </div>
              <div className="metric-label">Completed</div>
            </div>
            <div className="metric-card">
              <div className="metric-number">
                {publishedResults?.averageScore?.toFixed(1) || 0}%
              </div>
              <div className="metric-label">Average Score</div>
            </div>
            <div className="metric-card">
              <div className="metric-number">
                {publishedResults?.highestScore || 0}%
              </div>
              <div className="metric-label">Highest Score</div>
            </div>
          </div>

          {/* Performance Insights */}
          {insights.length > 0 && (
            <div className="insights-section">
              <h3>💡 Performance Insights</h3>
              <div className="insights-list">
                {insights.map((insight, index) => (
                  <div key={index} className={`insight-card ${insight.type}`}>
                    <span className="insight-icon">{insight.icon}</span>
                    <div className="insight-content">
                      <h4>{insight.title}</h4>
                      <p>{insight.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Question Overview */}
          {questionAnalytics.length > 0 && (
            <div className="quick-question-overview">
              <h3>📝 Question Performance Summary</h3>
              <div className="question-difficulty-chart">
                <div className="difficulty-category easy">
                  <div className="difficulty-count">
                    {questionAnalytics.filter(q => q.difficulty === 'Easy').length}
                  </div>
                  <div className="difficulty-label">Easy (80%+)</div>
                </div>
                <div className="difficulty-category medium">
                  <div className="difficulty-count">
                    {questionAnalytics.filter(q => q.difficulty === 'Medium').length}
                  </div>
                  <div className="difficulty-label">Medium (60-79%)</div>
                </div>
                <div className="difficulty-category hard">
                  <div className="difficulty-count">
                    {questionAnalytics.filter(q => q.difficulty === 'Hard').length}
                  </div>
                  <div className="difficulty-label">Hard (&lt;60%)</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedView === 'attempts' && (
        <div className="analytics-content">
          <h3>👥 Student Attempts ({filteredResults.length})</h3>
          {filteredResults.length > 0 ? (
            <div className="attempts-table">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Time Spent</th>
                    <th>Completed</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result, index) => (
                    <tr key={index}>
                      <td>{result.studentName}</td>
                      <td>{result.studentEmail}</td>
                      <td>{result.score}/{test.questions?.length || 0}</td>
                      <td className={result.percentage >= 70 ? 'good-score' : 'low-score'}>
                        {result.percentage?.toFixed(1)}%
                      </td>
                      <td>{PublishedTestsService.formatTime(result.timeSpent)}</td>
                      <td>{new Date(result.completedAt).toLocaleDateString()}</td>
                      <td>
                        <button 
                          onClick={() => setSelectedStudent(result)}
                          className="view-details-btn"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-data">
              <p>No student attempts found for the selected time period.</p>
            </div>
          )}
        </div>
      )}

      {selectedView === 'questions' && (
        <div className="analytics-content">
          <h3>❓ Question Analysis</h3>
          {questionAnalytics.length > 0 ? (
            <div className="questions-analysis">
              {questionAnalytics.map((qa, index) => (
                <div key={index} className={`question-analytics-card ${qa.difficulty.toLowerCase()}`}>
                  <div className="question-header">
                    <h4>Question {qa.questionNumber}</h4>
                    <div className={`difficulty-badge ${qa.difficulty.toLowerCase()}`}>
                      {qa.difficulty}
                    </div>
                  </div>
                  <div className="question-text">
                    {qa.questionText.substring(0, 100)}
                    {qa.questionText.length > 100 ? '...' : ''}
                  </div>
                  <div className="question-stats">
                    <div className="accuracy-progress">
                      <ProgressBar 
                        value={parseFloat(qa.accuracy)}
                        max={100}
                        label="Accuracy"
                        color={
                          qa.accuracy >= 80 ? '#28a745' : 
                          qa.accuracy >= 60 ? '#ffc107' : 
                          '#dc3545'
                        }
                        height="12px"
                        animated={true}
                      />
                    </div>
                    <div className="stat">
                      <span className="stat-label">Correct Answers:</span>
                      <span className="stat-value">{qa.correctAnswers}/{qa.totalAnswers}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">
              <p>No question data available. Students need to complete the test first.</p>
            </div>
          )}
        </div>
      )}

      {selectedView === 'export' && (
        <div className="analytics-content">
          <h3>📤 Export Data</h3>
          <div className="export-options">
            <div className="export-card">
              <h4>📊 Student Results</h4>
              <p>Export all student attempts and scores to CSV format</p>
              <button 
                onClick={exportResults}
                className="export-btn primary"
                disabled={!publishedResults?.results?.length}
              >
                📥 Export Results CSV
              </button>
            </div>
            
            <div className="export-card">
              <h4>📈 Question Analytics</h4>
              <p>Export question-by-question performance analysis</p>
              <button 
                onClick={() => {
                  const csv = generateQuestionAnalyticsCSV(questionAnalytics);
                  downloadCSV(csv, `${test.title}_question_analytics.csv`);
                }}
                className="export-btn secondary"
                disabled={!questionAnalytics.length}
              >
                📥 Export Question Analysis
              </button>
            </div>

            <div className="export-card">
              <h4>📋 Test Summary</h4>
              <p>Export overall test performance summary</p>
              <button 
                onClick={() => {
                  const summary = generateTestSummary();
                  downloadJSON(summary, `${test.title}_summary.json`);
                }}
                className="export-btn secondary"
              >
                📥 Export Summary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="student-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Student Details: {selectedStudent.studentName}</h3>
              <button onClick={() => setSelectedStudent(null)}>×</button>
            </div>
            <div className="modal-content">
              <div className="student-info">
                <p><strong>Email:</strong> {selectedStudent.studentEmail}</p>
                <p><strong>Score:</strong> {selectedStudent.score}/{test.questions?.length || 0} ({selectedStudent.percentage?.toFixed(1)}%)</p>
                <p><strong>Time Spent:</strong> {PublishedTestsService.formatTime(selectedStudent.timeSpent)}</p>
                <p><strong>Started:</strong> {new Date(selectedStudent.startedAt).toLocaleString()}</p>
                <p><strong>Completed:</strong> {new Date(selectedStudent.completedAt).toLocaleString()}</p>
              </div>
              {selectedStudent.answers && (
                <div className="student-answers">
                  <h4>Answer Details</h4>
                  {/* You could show question-by-question breakdown here */}
                  <p>Detailed answer analysis coming soon...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Helper functions
  function generateQuestionAnalyticsCSV(analytics) {
    const headers = ['Question Number', 'Question Text', 'Correct Answers', 'Total Answers', 'Accuracy %', 'Difficulty'];
    const rows = analytics.map(qa => [
      qa.questionNumber,
      `"${qa.questionText.replace(/"/g, '""')}"`,
      qa.correctAnswers,
      qa.totalAnswers,
      qa.accuracy,
      qa.difficulty
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  function generateTestSummary() {
    return {
      testTitle: test.title,
      generatedAt: new Date().toISOString(),
      timeFilter: timeFilter,
      totalAttempts: publishedResults?.totalAttempts || 0,
      completedAttempts: publishedResults?.completedAttempts || 0,
      averageScore: publishedResults?.averageScore || 0,
      highestScore: publishedResults?.highestScore || 0,
      questionCount: test.questions?.length || 0,
      insights: insights,
      questionDifficulty: {
        easy: questionAnalytics.filter(q => q.difficulty === 'Easy').length,
        medium: questionAnalytics.filter(q => q.difficulty === 'Medium').length,
        hard: questionAnalytics.filter(q => q.difficulty === 'Hard').length
      }
    };
  }

  function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
