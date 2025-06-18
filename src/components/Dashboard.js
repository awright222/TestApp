import React, { useState, useEffect } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { SavedTestsService } from '../SavedTestsService';
import SearchResults from './SearchResults';

export default function Dashboard({ searchTerm, onClearSearch }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTests: 0,
    lastTestTaken: null,
    lastScore: null,
    averageScore: 0,
    testsThisWeek: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      const savedTests = await SavedTestsService.getSavedTests();
      
      // Calculate stats from saved tests
      const totalTests = savedTests.length;
      let lastTestTaken = null;
      let lastScore = null;
      let totalScore = 0;
      let testsWithScores = 0;
      let testsThisWeek = 0;
      
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // Sort by date modified to find most recent
      const sortedTests = savedTests.sort((a, b) => 
        new Date(b.dateModified || b.dateCreated) - new Date(a.dateModified || a.dateCreated)
      );

      if (sortedTests.length > 0) {
        lastTestTaken = sortedTests[0];
        
        // Calculate last score as percentage
        if (lastTestTaken.progress) {
          const { questionScore } = lastTestTaken.progress;
          if (questionScore && questionScore.length > 0) {
            const earnedPoints = questionScore.filter(score => score !== null).reduce((sum, score) => sum + (score || 0), 0);
            const totalPossiblePoints = questionScore.length; // Simplified - assuming 1 point per question
            lastScore = totalPossiblePoints > 0 ? Math.round((earnedPoints / totalPossiblePoints) * 100) : 0;
          }
        }
      }

      // Calculate average score and tests this week
      savedTests.forEach(test => {
        const testDate = new Date(test.dateModified || test.dateCreated);
        
        if (testDate > oneWeekAgo) {
          testsThisWeek++;
        }

        if (test.progress && test.progress.questionScore) {
          const { questionScore } = test.progress;
          if (questionScore && questionScore.length > 0) {
            const earnedPoints = questionScore.filter(score => score !== null).reduce((sum, score) => sum + (score || 0), 0);
            const totalPossiblePoints = questionScore.length;
            if (totalPossiblePoints > 0) {
              totalScore += (earnedPoints / totalPossiblePoints) * 100;
              testsWithScores++;
            }
          }
        }
      });

      const averageScore = testsWithScores > 0 ? Math.round(totalScore / testsWithScores) : 0;

      setStats({
        totalTests,
        lastTestTaken,
        lastScore,
        averageScore,
        testsThisWeek
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Unknown date';
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ color: '#669BBC' }}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Welcome Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#FDF0D5', marginBottom: '0.5rem' }}>
          Welcome back, {user?.displayName || user?.email || 'User'}!
        </h1>
        <p style={{ color: '#bfc9d1', fontSize: '1.1rem' }}>
          Here's an overview of your testing activity
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Total Tests */}
        <div style={{
          background: '#00243a',
          border: '2px solid #669BBC',
          borderRadius: '10px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#669BBC', marginBottom: '0.5rem' }}>
            {stats.totalTests}
          </div>
          <div style={{ color: '#FDF0D5', fontSize: '1.1rem', fontWeight: 'bold' }}>
            Total Tests
          </div>
          <div style={{ color: '#bfc9d1', fontSize: '0.9rem' }}>
            Tests saved to your account
          </div>
        </div>

        {/* Average Score */}
        <div style={{
          background: '#00243a',
          border: '2px solid #669BBC',
          borderRadius: '10px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#669BBC', marginBottom: '0.5rem' }}>
            {stats.averageScore}%
          </div>
          <div style={{ color: '#FDF0D5', fontSize: '1.1rem', fontWeight: 'bold' }}>
            Average Score
          </div>
          <div style={{ color: '#bfc9d1', fontSize: '0.9rem' }}>
            Across all completed tests
          </div>
        </div>

        {/* Last Score */}
        <div style={{
          background: '#00243a',
          border: '2px solid #669BBC',
          borderRadius: '10px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#669BBC', marginBottom: '0.5rem' }}>
            {stats.lastScore !== null ? `${stats.lastScore}%` : '--'}
          </div>
          <div style={{ color: '#FDF0D5', fontSize: '1.1rem', fontWeight: 'bold' }}>
            Last Test Score
          </div>
          <div style={{ color: '#bfc9d1', fontSize: '0.9rem' }}>
            {stats.lastTestTaken ? stats.lastTestTaken.title : 'No tests taken yet'}
          </div>
        </div>

        {/* Tests This Week */}
        <div style={{
          background: '#00243a',
          border: '2px solid #669BBC',
          borderRadius: '10px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#669BBC', marginBottom: '0.5rem' }}>
            {stats.testsThisWeek}
          </div>
          <div style={{ color: '#FDF0D5', fontSize: '1.1rem', fontWeight: 'bold' }}>
            Tests This Week
          </div>
          <div style={{ color: '#bfc9d1', fontSize: '0.9rem' }}>
            Your recent activity
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {stats.lastTestTaken && (
        <div style={{
          background: '#00243a',
          border: '2px solid #669BBC',
          borderRadius: '10px',
          padding: '1.5rem'
        }}>
          <h3 style={{ color: '#FDF0D5', marginBottom: '1rem' }}>Recent Activity</h3>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            background: 'rgba(102, 155, 188, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(102, 155, 188, 0.3)'
          }}>
            <div>
              <div style={{ color: '#FDF0D5', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                {stats.lastTestTaken.title}
              </div>
              <div style={{ color: '#bfc9d1', fontSize: '0.9rem' }}>
                Last worked on: {formatDate(stats.lastTestTaken.dateModified || stats.lastTestTaken.dateCreated)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#669BBC', fontWeight: 'bold', fontSize: '1.2rem' }}>
                {stats.lastScore !== null ? `${stats.lastScore}%` : 'In Progress'}
              </div>
              <div style={{ color: '#bfc9d1', fontSize: '0.8rem' }}>
                {stats.lastTestTaken.progress?.completedQuestions || 0} / {stats.lastTestTaken.progress?.totalQuestions || 0} completed
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ color: '#FDF0D5', marginBottom: '1rem' }}>Quick Actions</h3>
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => window.location.href = '/practice'}
            style={{
              background: '#669BBC',
              color: '#FDF0D5',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            📝 Take Practice Test
          </button>
          <button
            onClick={() => window.location.href = '/saved-tests'}
            style={{
              background: 'transparent',
              color: '#669BBC',
              border: '2px solid #669BBC',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            📂 View Saved Tests
          </button>
        </div>
      </div>

      {/* Search Results */}
      {searchTerm && (
        <SearchResults
          searchTerm={searchTerm}
          onClose={onClearSearch}
          currentPage="dashboard"
        />
      )}
    </div>
  );
}
