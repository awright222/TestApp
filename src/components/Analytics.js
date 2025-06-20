import React, { useState, useEffect } from 'react';
import { CreatedTestsService } from '../services/CreatedTestsService';
import { PublishedTestsService } from '../services/PublishedTestsService';
import { useAuth } from '../firebase/AuthContext';
import ProgressBar from './ProgressBar';
import NotificationBanner from './NotificationBanner';
import './Analytics.css';

export default function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState([]);
  const [publishedTests, setPublishedTests] = useState([]);
  const [insights, setInsights] = useState([]);
  const [dismissedInsights, setDismissedInsights] = useState(new Set());
  const [overallStats, setOverallStats] = useState({
    totalTests: 0,
    totalStudents: 0,
    averageScore: 0,
    totalAttempts: 0
  });

  useEffect(() => {
    if (user) {
      loadAnalyticsData();
    }
  }, [user]);

  const generateInsights = (createdTests, publishedTests, stats) => {
    const insights = [];

    // Low engagement insight
    if (stats.totalTests >= 3 && stats.totalStudents < 5) {
      insights.push({
        id: 'low-engagement',
        type: 'warning',
        message: `You have ${stats.totalTests} tests but only ${stats.totalStudents} students have taken them. Consider sharing your tests more widely or checking if students can access them easily.`,
        actionText: 'View Sharing Guide'
      });
    }

    // High-performing class insight
    if (stats.averageScore >= 85 && stats.totalAttempts >= 10) {
      insights.push({
        id: 'high-performance',
        type: 'success',
        message: `Excellent! Your students are achieving an ${stats.averageScore.toFixed(1)}% average across ${stats.totalAttempts} completions. Your teaching methods are working well!`
      });
    }

    // Low average score insight
    if (stats.averageScore < 60 && stats.totalAttempts >= 5) {
      insights.push({
        id: 'low-scores',
        type: 'warning',
        message: `Class average is ${stats.averageScore.toFixed(1)}%. Consider reviewing difficult questions or providing additional study materials.`,
        actionText: 'Analyze Questions'
      });
    }

    // New user encouragement
    if (stats.totalTests === 0) {
      insights.push({
        id: 'welcome',
        type: 'info',
        message: 'Welcome to your analytics dashboard! Create your first test to start tracking student performance.',
        actionText: 'Create Test'
      });
    }

    // Growth opportunity
    if (stats.totalTests >= 1 && stats.totalTests < 3) {
      insights.push({
        id: 'growth',
        type: 'info',
        message: `You've created ${stats.totalTests} test${stats.totalTests > 1 ? 's' : ''}. Consider creating more tests to build a comprehensive assessment library.`,
        actionText: 'Create Another Test'
      });
    }

    return insights;
  };

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Get all created tests
      const createdTests = await CreatedTestsService.getCreatedTests();
      setTests(createdTests);

      // Get published test results
      const published = await PublishedTestsService.getPublishedTests();
      setPublishedTests(published);

      // Calculate overall statistics
      let totalStudents = 0;
      let totalScore = 0;
      let completedAttempts = 0;

      const addToTotalScore = (result) => {
        totalScore += result.percentage || 0;
      };

      for (const test of published) {
        if (test.shareId) {
          const results = await PublishedTestsService.getTestResults(test.shareId);
          completedAttempts += results.completedAttempts;
          
          // Count unique students (by email)
          const uniqueStudents = new Set(
            results.results.map(r => r.studentEmail).filter(email => email)
          );
          totalStudents += uniqueStudents.size;

          // Add to total score for average calculation
          results.results.forEach(addToTotalScore);
        }
      }

      setOverallStats({
        totalTests: createdTests.length,
        totalStudents,
        averageScore: completedAttempts > 0 ? (totalScore / completedAttempts) : 0,
        totalAttempts: completedAttempts
      });

      // Generate insights
      const generatedInsights = generateInsights(createdTests, published, {
        totalTests: createdTests.length,
        totalStudents,
        averageScore: completedAttempts > 0 ? (totalScore / completedAttempts) : 0,
        totalAttempts: completedAttempts
      });
      setInsights(generatedInsights);

    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner">📊</div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h1>📊 Teaching Analytics Dashboard</h1>
        <p>Overview of all your tests and student performance</p>
      </div>

      {/* Intelligent Insights */}
      {insights.filter(insight => !dismissedInsights.has(insight.id)).map(insight => (
        <NotificationBanner 
          key={insight.id}
          type={insight.type}
          message={insight.message}
          actionText={insight.actionText}
          onAction={() => {
            // Handle different actions
            if (insight.actionText === 'Create Test' || insight.actionText === 'Create Another Test') {
              window.location.href = '/create-test';
            } else if (insight.actionText === 'Analyze Questions') {
              // Could navigate to question analysis or show tips
              alert('💡 Tip: Review your test questions for clarity and difficulty. Consider providing study guides or breaking complex topics into smaller questions.');
            } else if (insight.actionText === 'View Sharing Guide') {
              alert('📤 Sharing Tips:\n• Use the "Share Test" button in your test list\n• Share the test link with students via email or LMS\n• Check if students have the correct permissions\n• Consider setting up test announcements');
            }
          }}
          onDismiss={() => {
            setDismissedInsights(prev => new Set([...prev, insight.id]));
          }}
        />
      ))}

      {/* Overall Statistics */}
      <div className="overall-stats">
        <div className="stat-card">
          <div className="stat-number">{overallStats.totalTests}</div>
          <div className="stat-label">Created Tests</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{overallStats.totalStudents}</div>
          <div className="stat-label">Unique Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{overallStats.averageScore.toFixed(1)}%</div>
          <div className="stat-label">Average Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{overallStats.totalAttempts}</div>
          <div className="stat-label">Total Completions</div>
        </div>
      </div>

      {/* Performance Visualization */}
      {overallStats.totalAttempts > 0 && (
        <div className="performance-overview">
          <h2>📊 Performance Overview</h2>
          <div className="performance-bars">
            <ProgressBar 
              value={overallStats.averageScore}
              max={100}
              label={`Overall Class Average (${overallStats.totalAttempts} completions)`}
              color={
                overallStats.averageScore >= 80 ? '#28a745' : 
                overallStats.averageScore >= 70 ? '#17a2b8' : 
                overallStats.averageScore >= 60 ? '#ffc107' : 
                '#dc3545'
              }
              height="16px"
              animated={true}
            />
            <ProgressBar 
              value={Math.min(overallStats.totalStudents, 50)}
              max={50}
              label={`Student Engagement (${overallStats.totalStudents} unique students)`}
              color="#669BBC"
              height="12px"
            />
            <ProgressBar 
              value={Math.min(overallStats.totalTests, 20)}
              max={20}
              label={`Content Creation Progress (${overallStats.totalTests} tests created)`}
              color="#6f42c1"
              height="12px"
            />
          </div>
        </div>
      )}

      {/* Tests Overview */}
      <div className="tests-overview">
        <h2>📝 Your Tests</h2>
        {tests.length > 0 ? (
          <div className="tests-grid">
            {tests.map(test => {
              const publishedTest = publishedTests.find(p => p.id === test.id);
              const isPublished = !!publishedTest;
              
              return (
                <div key={test.id} className="test-summary-card">
                  <div className="test-header">
                    <h3>{test.title}</h3>
                    <div className={`status-badge ${isPublished ? 'published' : 'draft'}`}>
                      {isPublished ? '🟢 Published' : '⚪ Draft'}
                    </div>
                  </div>
                  
                  <div className="test-stats">
                    <div className="stat-row">
                      <span>Questions:</span>
                      <span>{test.questions?.length || 0}</span>
                    </div>
                    {isPublished && (
                      <>
                        <div className="stat-row">
                          <span>Total Attempts:</span>
                          <span>{publishedTest.totalAttempts || 0}</span>
                        </div>
                        <div className="stat-row">
                          <span>Completed:</span>
                          <span>{publishedTest.completedAttempts || 0}</span>
                        </div>
                        <div className="stat-row">
                          <span>Average Score:</span>
                          <span>{publishedTest.averageScore?.toFixed(1) || 0}%</span>
                        </div>
                        <div className="score-progress">
                          <ProgressBar 
                            value={publishedTest.averageScore || 0}
                            max={100}
                            label=""
                            color={
                              (publishedTest.averageScore || 0) >= 80 ? '#28a745' : 
                              (publishedTest.averageScore || 0) >= 70 ? '#17a2b8' : 
                              (publishedTest.averageScore || 0) >= 60 ? '#ffc107' : 
                              '#dc3545'
                            }
                            height="8px"
                            showPercentage={false}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="test-actions">
                    {isPublished && (
                      <a 
                        href={`/test-analytics/${test.id}`}
                        className="analytics-link"
                      >
                        📊 View Detailed Analytics
                      </a>
                    )}
                    {!isPublished && (
                      <p className="no-analytics">Publish test to see analytics</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No tests created yet</h3>
            <p>Create your first test to start seeing analytics</p>
            <a href="/create-test" className="create-test-link">
              ✨ Create Your First Test
            </a>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>🚀 Quick Actions</h2>
        <div className="actions-grid">
          <a href="/create-test" className="action-card">
            <div className="action-icon">✨</div>
            <h3>Create New Test</h3>
            <p>Build a new test with our question builder</p>
          </a>
          
          <a href="/my-tests" className="action-card">
            <div className="action-icon">📚</div>
            <h3>Manage Tests</h3>
            <p>Edit, share, and publish your existing tests</p>
          </a>
          
          <button 
            onClick={loadAnalyticsData}
            className="action-card refresh-card"
          >
            <div className="action-icon">🔄</div>
            <h3>Refresh Data</h3>
            <p>Update analytics with latest student results</p>
          </button>
        </div>
      </div>

      {/* Tips Section */}
      <div className="analytics-tips">
        <h2>💡 Analytics Tips</h2>
        <div className="tips-grid">
          <div className="tip-card">
            <h4>📈 Improve Low-Performing Questions</h4>
            <p>If a question has low accuracy (&lt;60%), consider reviewing it for clarity or difficulty.</p>
          </div>
          <div className="tip-card">
            <h4>⏱️ Monitor Time Spent</h4>
            <p>Very long or very short completion times might indicate issues with question clarity or difficulty.</p>
          </div>
          <div className="tip-card">
            <h4>🎯 Use Security Features</h4>
            <p>Enable browser lockdown and full-screen mode for important assessments to maintain test integrity.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
