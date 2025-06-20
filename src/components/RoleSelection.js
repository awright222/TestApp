import React, { useState } from 'react';
import { useAuth } from '../firebase/AuthContext';
import './RoleSelection.css';

export default function RoleSelection({ isOpen, onComplete }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const { setUserRole } = useAuth();

  const handleRoleSelect = async () => {
    if (!selectedRole) return;
    
    setLoading(true);
    try {
      const result = await setUserRole(selectedRole);
      if (result.success) {
        onComplete();
      } else {
        alert('Failed to set role: ' + result.error);
      }
    } catch (error) {
      console.error('Role selection error:', error);
      alert('Failed to set role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="role-selection-overlay">
      <div className="role-selection-modal">
        <div className="role-selection-header">
          <h2>👋 Welcome to TestBuilder!</h2>
          <p>Choose your role to get started with a personalized experience</p>
        </div>

        <div className="role-options">
          <div 
            className={`role-card ${selectedRole === 'student' ? 'selected' : ''}`}
            onClick={() => setSelectedRole('student')}
          >
            <div className="role-icon">🎓</div>
            <h3>I'm a Student</h3>
            <ul>
              <li>Take tests and quizzes</li>
              <li>View my results and progress</li>
              <li>Access study materials</li>
              <li>Practice with unlimited tests</li>
            </ul>
            <div className="role-pricing">
              <span className="price">Free Forever</span>
            </div>
          </div>

          <div 
            className={`role-card ${selectedRole === 'teacher' ? 'selected' : ''}`}
            onClick={() => setSelectedRole('teacher')}
          >
            <div className="role-icon">👨‍🏫</div>
            <h3>I'm a Teacher</h3>
            <ul>
              <li>Create unlimited tests</li>
              <li>View detailed analytics</li>
              <li>Advanced security features</li>
              <li>Export results and reports</li>
            </ul>
            <div className="role-pricing">
              <span className="price">3 Free Tests</span>
              <span className="upgrade-note">Then $12/month</span>
            </div>
          </div>
        </div>

        <div className="role-selection-actions">
          <button 
            onClick={handleRoleSelect}
            disabled={!selectedRole || loading}
            className={`continue-btn ${selectedRole ? 'active' : ''}`}
          >
            {loading ? 'Setting up your account...' : 'Continue'}
          </button>
        </div>

        <div className="role-selection-footer">
          <p>You can upgrade or change your plan anytime in your account settings.</p>
        </div>
      </div>
    </div>
  );
}
