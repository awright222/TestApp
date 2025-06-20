import React from 'react';
import { useAuth } from '../firebase/AuthContext';
import ProgressBar from './ProgressBar';
import './UsageDisplay.css';

export default function UsageDisplay({ compact = false }) {
  const { userProfile, canPerformAction } = useAuth();

  if (!userProfile || userProfile.accountType === 'student') {
    return null; // Don't show usage for students
  }

  const { subscription, usage } = userProfile;
  const features = subscription.features;

  const getUsagePercentage = (used, limit) => {
    if (limit === -1) return 0; // Unlimited
    if (limit === 0) return 100; // No access
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage) => {
    if (percentage < 60) return '#28a745';
    if (percentage < 85) return '#ffc107';
    return '#dc3545';
  };

  const testsPercentage = getUsagePercentage(usage.testsCreated, features.maxTestsPerMonth);
  const canCreateMore = canPerformAction('create_test');

  if (compact) {
    return (
      <div className="usage-display-compact">
        <div className="usage-item">
          <span className="usage-label">Tests this month:</span>
          <span className={`usage-value ${!canCreateMore ? 'limit-reached' : ''}`}>
            {usage.testsCreated}
            {features.maxTestsPerMonth > 0 ? `/${features.maxTestsPerMonth}` : ''}
          </span>
        </div>
        {!canCreateMore && (
          <div className="upgrade-prompt">
            <span>Limit reached - </span>
            <button className="upgrade-link">Upgrade</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="usage-display">
      <div className="usage-header">
        <h3>📊 Current Usage</h3>
        <div className="subscription-badge">
          {subscription.tier === 'free' ? '🆓 Free Plan' : 
           subscription.tier === 'paid' ? '⭐ Teacher Plan' : 
           '🏢 School Plan'}
        </div>
      </div>

      <div className="usage-metrics">
        {features.maxTestsPerMonth > 0 && (
          <div className="usage-metric">
            <ProgressBar
              value={usage.testsCreated}
              max={features.maxTestsPerMonth}
              label={`Tests Created This Month`}
              color={getUsageColor(testsPercentage)}
              showPercentage={false}
            />
            <div className="usage-details">
              <span className="usage-current">{usage.testsCreated}</span>
              <span className="usage-separator">of</span>
              <span className="usage-limit">{features.maxTestsPerMonth}</span>
            </div>
          </div>
        )}

        {features.maxTestsPerMonth === -1 && (
          <div className="usage-metric unlimited">
            <div className="unlimited-badge">∞ Unlimited Tests</div>
          </div>
        )}

        <div className="usage-metric">
          <div className="usage-stat">
            <span className="stat-label">Student Attempts:</span>
            <span className="stat-value">{usage.studentAttempts}</span>
          </div>
        </div>

        <div className="usage-metric">
          <div className="usage-stat">
            <span className="stat-label">Storage Used:</span>
            <span className="stat-value">{usage.storageUsedGB.toFixed(2)} GB</span>
          </div>
        </div>
      </div>

      {!canCreateMore && (
        <div className="upgrade-section">
          <div className="upgrade-message">
            <h4>🚀 Ready to create more tests?</h4>
            <p>You've reached your monthly test creation limit. Upgrade to continue building amazing assessments!</p>
          </div>
          <div className="upgrade-options">
            <button className="upgrade-btn primary">
              Upgrade to Teacher Plan - $12/month
            </button>
            <button className="upgrade-btn secondary">
              Learn More About Plans
            </button>
          </div>
        </div>
      )}

      {subscription.tier === 'free' && canCreateMore && (
        <div className="upgrade-hint">
          <p>💡 Enjoying TestBuilder? Upgrade for unlimited tests and advanced features!</p>
          <button className="upgrade-btn outline">View Plans</button>
        </div>
      )}
    </div>
  );
}
