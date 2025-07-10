import React, { useState } from 'react';
import { useAuth } from '../firebase/AuthContext';
import './DemoLogin.css';

const DemoLogin = ({ onClose }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const { demoLogin } = useAuth();

  const accountTypes = [
    {
      type: 'student',
      title: '🎓 Student Demo',
      description: 'Experience the learning interface',
      features: [
        'Take practice tests',
        'View progress and XP',
        'Earn achievements',
        'Access saved tests',
        'See gamification features'
      ],
      color: '#4A90E2',
      buttonText: 'Try as Student'
    },
    {
      type: 'teacher',
      title: '👨‍🏫 Teacher Demo',
      description: 'Explore the teaching tools',
      features: [
        'Create and edit tests',
        'Publish tests to students',
        'View analytics dashboard',
        'Manage class data',
        'Access all question types'
      ],
      color: '#28A745',
      buttonText: 'Try as Teacher'
    },
    {
      type: 'admin',
      title: '👑 Admin Demo',
      description: 'See the full admin experience',
      features: [
        'Organization management',
        'User directory access',
        'System-wide analytics',
        'Teacher and student oversight',
        'Complete platform control'
      ],
      color: '#DC3545',
      buttonText: 'Try as Admin'
    }
  ];

  const handleDemoLogin = (accountType) => {
    setSelectedRole(accountType);
    
    // Create demo user profile
    const demoProfile = {
      uid: `demo_${accountType}_${Date.now()}`,
      email: `demo.${accountType}@formulate.demo`,
      displayName: `Demo ${accountType.charAt(0).toUpperCase() + accountType.slice(1)}`,
      accountType: accountType,
      isDemo: true,
      createdAt: new Date().toISOString(),
      subscription: {
        tier: accountType === 'student' ? 'free' : 'professional',
        status: 'active',
        features: getFeaturesByAccountType(accountType)
      },
      usage: {
        currentPeriod: new Date().toISOString().substring(0, 7),
        testsCreated: 0,
        studentAttempts: 0,
        storageUsedGB: 0
      },
      preferences: {
        theme: 'default',
        timerDefault: 30
      }
    };

    // Initialize demo with seed test
    demoLogin(demoProfile);
    
    if (onClose) onClose();
  };

  const getFeaturesByAccountType = (type) => {
    switch (type) {
      case 'student':
        return {
          canCreateTests: false,
          canViewAnalytics: false,
          maxTestsPerMonth: 0,
          maxStudentsPerTest: 0,
          storageGB: 0.1
        };
      case 'teacher':
        return {
          canCreateTests: true,
          canViewAnalytics: true,
          maxTestsPerMonth: 25,
          maxStudentsPerTest: 1000,
          storageGB: 5.0
        };
      case 'admin':
        return {
          canCreateTests: true,
          canViewAnalytics: true,
          maxTestsPerMonth: 999,
          maxStudentsPerTest: 99999,
          storageGB: 50.0
        };
      default:
        return {
          canCreateTests: false,
          canViewAnalytics: false,
          maxTestsPerMonth: 0,
          maxStudentsPerTest: 0,
          storageGB: 0
        };
    }
  };

  return (
    <div className="demo-login-overlay">
      <div className="demo-login-modal">
        <div className="demo-login-header">
          <h2>🚀 Try Formulate Demo</h2>
          <p>Experience different user perspectives with one click!</p>
          <button className="demo-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="demo-notice">
          <div className="demo-notice-content">
            <span className="demo-icon">💡</span>
            <div>
              <strong>Demo Mode Features:</strong>
              <ul>
                <li>✅ Full interface experience with sample data</li>
                <li>✅ All features unlocked for exploration</li>
                <li>✅ Automatic seed test included</li>
                <li>⚠️ Changes saved locally only (no account needed)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="demo-accounts-grid">
          {accountTypes.map((account) => (
            <div 
              key={account.type} 
              className={`demo-account-card ${selectedRole === account.type ? 'selected' : ''}`}
              style={{ borderColor: account.color }}
            >
              <div className="demo-account-header">
                <h3 style={{ color: account.color }}>{account.title}</h3>
                <p className="demo-account-description">{account.description}</p>
              </div>

              <div className="demo-account-features">
                <h4>What you can do:</h4>
                <ul>
                  {account.features.map((feature, index) => (
                    <li key={index}>✓ {feature}</li>
                  ))}
                </ul>
              </div>

              <button 
                className="demo-login-btn"
                style={{ backgroundColor: account.color }}
                onClick={() => handleDemoLogin(account.type)}
                disabled={selectedRole === account.type}
              >
                {selectedRole === account.type ? 'Loading...' : account.buttonText}
              </button>
            </div>
          ))}
        </div>

        <div className="demo-footer">
          <p>
            <strong>Ready to create a real account?</strong> 
            <button className="demo-signup-link" onClick={onClose}>
              Sign up for free →
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DemoLogin;
