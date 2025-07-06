import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../firebase/AuthContext';
import { CreatedTestsService } from '../services/CreatedTestsService';
import { PublishedTestsService } from '../services/PublishedTestsService';
import { SavedTestsService } from '../SavedTestsService';
import SearchResults from './SearchResults';
import AchievementDashboard from './achievements/AchievementDashboard';
import XPDashboard from './xp/XPDashboard';
import './Dashboard.css';

function Dashboard({ searchTerm, onClearSearch }) {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      let roleSpecificData = [];
      
      if (userProfile?.accountType === 'teacher') {
        // Teacher-specific activity data
        const createdTests = await CreatedTestsService.getCreatedTests();
        const userCreatedTests = createdTests.filter(test => test.createdBy === user.uid);
        
        roleSpecificData = [
          {
            id: 'tests-created',
            title: 'Tests Created',
            value: userCreatedTests.length,
            subtitle: `0 this month`,
            icon: '✨',
            trend: 'neutral',
            color: '#6366f1',
            actionText: 'Create New Test',
            actionPath: '/create-test'
          },
          {
            id: 'total-students',
            title: 'Students Enrolled',
            value: 0,
            subtitle: `Across 0 classes`,
            icon: '🎓',
            trend: 'neutral',
            color: '#10b981',
            actionText: 'Manage Classes',
            actionPath: '/classes'
          },
          {
            id: 'test-attempts',
            title: 'Total Test Attempts',
            value: 0,
            subtitle: 'From all your tests',
            icon: '📊',
            trend: 'neutral',
            color: '#f59e0b',
            actionText: 'View Analytics',
            actionPath: '/analytics'
          },
          {
            id: 'recent-activity',
            title: 'Recent Activity',
            value: 'Active',
            subtitle: 'Last login today',
            icon: '⚡',
            trend: 'up',
            color: '#8b5cf6',
            actionText: 'View Test Library',
            actionPath: '/test-library'
          }
        ];
      } else {
        // Student-specific activity data
        const savedTests = await SavedTestsService.getSavedTests();
        const userSavedTests = savedTests.filter(test => test.userId === user.uid);
        
        roleSpecificData = [
          {
            id: 'tests-taken',
            title: 'Tests Attempted',
            value: userSavedTests.length,
            subtitle: `0 this week`,
            icon: '📝',
            trend: 'neutral',
            color: '#6366f1',
            actionText: 'Browse Tests',
            actionPath: '/test-library'
          },
          {
            id: 'completion-rate',
            title: 'Completion Rate',
            value: `0%`,
            subtitle: `0 completed`,
            icon: '✅',
            trend: 'neutral',
            color: '#10b981',
            actionText: 'View Saved Tests',
            actionPath: '/saved-tests'
          },
          {
            id: 'average-score',
            title: 'Average Score',
            value: 'N/A',
            subtitle: `From 0 graded tests`,
            icon: '🎯',
            trend: 'neutral',
            color: '#f59e0b',
            actionText: 'Improve Skills',
            actionPath: '/test-library?tab=practice'
          },
          {
            id: 'enrolled-classes',
            title: 'My Classes',
            value: 0,
            subtitle: 'All caught up',
            icon: '🎓',
            trend: 'up',
            color: '#8b5cf6',
            actionText: 'View Classes',
            actionPath: '/my-classes'
          }
        ];
      }

      setActivityData(roleSpecificData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setActivityData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && userProfile) {
      loadDashboardData();
    }
  }, [user, userProfile]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.displayName || 'there'}!</h1>
        <p>Here's your overview for today</p>
      </div>

      {/* Activity Cards */}
      <div className="activity-cards">
        {activityData.map((card) => (
          <div 
            key={card.id} 
            className={`activity-card ${card.trend}`}
            style={{ '--card-color': card.color }}
          >
            <div className="activity-card-header">
              <div className="activity-icon" style={{ color: card.color }}>
                {card.icon}
              </div>
              <div className={`trend-indicator ${card.trend}`}>
                {card.trend === 'up' && '↗️'}
                {card.trend === 'down' && '↘️'}
                {card.trend === 'neutral' && '➡️'}
              </div>
            </div>
            
            <div className="activity-card-body">
              <h3 className="activity-value">{card.value}</h3>
              <p className="activity-title">{card.title}</p>
              <p className="activity-subtitle">{card.subtitle}</p>
            </div>
            
            <div className="activity-card-footer">
              <button 
                className="activity-action-btn"
                onClick={() => navigate(card.actionPath)}
                style={{ borderColor: card.color, color: card.color }}
              >
                {card.actionText}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Achievement Dashboard */}
      <AchievementDashboard />

      {/* XP Dashboard */}
      <XPDashboard />

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

export default Dashboard;
