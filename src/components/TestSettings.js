import React, { useState } from 'react';
import './TestSettings.css';

export default function TestSettings({ settings, onSettingsChange, onSave, onCancel, isEditing = false }) {
  const [localSettings, setLocalSettings] = useState({
    title: settings?.title || '',
    description: settings?.description || '',
    timeLimit: settings?.timeLimit || 0, // 0 = no limit
    allowSaveAndReturn: settings?.allowSaveAndReturn || false,
    showExplanations: settings?.showExplanations || true,
    showCorrectAnswers: settings?.showCorrectAnswers || false,
    randomizeQuestions: settings?.randomizeQuestions || false,
    randomizeChoices: settings?.randomizeChoices || false,
    maxAttempts: settings?.maxAttempts || 1,
    isPublished: settings?.isPublished || false,
    requireName: settings?.requireName || true,
    requireEmail: settings?.requireEmail || false,
    passingScore: settings?.passingScore || 70,
    showResults: settings?.showResults || true,
    allowReview: settings?.allowReview || true,
    accessCode: settings?.accessCode || '',
    ...settings
  });

  const handleChange = (field, value) => {
    const updated = { ...localSettings, [field]: value };
    setLocalSettings(updated);
    onSettingsChange(updated);
  };

  const handleSave = () => {
    onSave(localSettings);
  };

  return (
    <div className="test-settings-overlay">
      <div className="test-settings-modal">
        <div className="settings-header">
          <h2>{isEditing ? '⚙️ Edit Test Settings' : '⚙️ Test Settings & Publishing'}</h2>
          <button className="close-btn" onClick={onCancel}>✕</button>
        </div>

        <div className="settings-content">
          {/* Basic Info */}
          <div className="settings-section">
            <h3>📝 Basic Information</h3>
            <div className="setting-group">
              <label>Test Title</label>
              <input
                type="text"
                value={localSettings.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter test title"
              />
            </div>
            <div className="setting-group">
              <label>Description (Optional)</label>
              <textarea
                value={localSettings.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe what this test covers..."
                rows="3"
              />
            </div>
          </div>

          {/* Timing & Attempts */}
          <div className="settings-section">
            <h3>⏱️ Timing & Attempts</h3>
            <div className="setting-group">
              <label>Time Limit (minutes)</label>
              <div className="time-input-group">
                <input
                  type="number"
                  min="0"
                  value={localSettings.timeLimit}
                  onChange={(e) => handleChange('timeLimit', parseInt(e.target.value) || 0)}
                />
                <span className="input-help">0 = No time limit</span>
              </div>
            </div>
            <div className="setting-group">
              <label>Maximum Attempts</label>
              <select
                value={localSettings.maxAttempts}
                onChange={(e) => handleChange('maxAttempts', parseInt(e.target.value))}
              >
                <option value={1}>1 attempt</option>
                <option value={2}>2 attempts</option>
                <option value={3}>3 attempts</option>
                <option value={5}>5 attempts</option>
                <option value={-1}>Unlimited</option>
              </select>
            </div>
            <div className="setting-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={localSettings.allowSaveAndReturn}
                  onChange={(e) => handleChange('allowSaveAndReturn', e.target.checked)}
                />
                Allow save and return later
              </label>
            </div>
          </div>

          {/* Student Experience */}
          <div className="settings-section">
            <h3>👥 Student Experience</h3>
            <div className="setting-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={localSettings.showExplanations}
                  onChange={(e) => handleChange('showExplanations', e.target.checked)}
                />
                Show explanations after submission
              </label>
            </div>
            <div className="setting-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={localSettings.showCorrectAnswers}
                  onChange={(e) => handleChange('showCorrectAnswers', e.target.checked)}
                />
                Show correct answers after submission
              </label>
            </div>
            <div className="setting-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={localSettings.showResults}
                  onChange={(e) => handleChange('showResults', e.target.checked)}
                />
                Show score and results immediately
              </label>
            </div>
            <div className="setting-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={localSettings.allowReview}
                  onChange={(e) => handleChange('allowReview', e.target.checked)}
                />
                Allow reviewing answers after submission
              </label>
            </div>
          </div>

          {/* Randomization */}
          <div className="settings-section">
            <h3>🔀 Randomization</h3>
            <div className="setting-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={localSettings.randomizeQuestions}
                  onChange={(e) => handleChange('randomizeQuestions', e.target.checked)}
                />
                Randomize question order
              </label>
            </div>
            <div className="setting-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={localSettings.randomizeChoices}
                  onChange={(e) => handleChange('randomizeChoices', e.target.checked)}
                />
                Randomize answer choices
              </label>
            </div>
          </div>

          {/* Access Control */}
          <div className="settings-section">
            <h3>🔐 Access Control</h3>
            <div className="setting-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={localSettings.requireName}
                  onChange={(e) => handleChange('requireName', e.target.checked)}
                />
                Require student name
              </label>
            </div>
            <div className="setting-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={localSettings.requireEmail}
                  onChange={(e) => handleChange('requireEmail', e.target.checked)}
                />
                Require student email
              </label>
            </div>
            <div className="setting-group">
              <label>Access Code (Optional)</label>
              <input
                type="text"
                value={localSettings.accessCode}
                onChange={(e) => handleChange('accessCode', e.target.value)}
                placeholder="Enter access code (leave blank for open access)"
              />
              <span className="input-help">Students will need this code to access the test</span>
            </div>
          </div>

          {/* Grading */}
          <div className="settings-section">
            <h3>📊 Grading</h3>
            <div className="setting-group">
              <label>Passing Score (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={localSettings.passingScore}
                onChange={(e) => handleChange('passingScore', parseInt(e.target.value) || 70)}
              />
            </div>
          </div>

          {/* Publishing */}
          <div className="settings-section">
            <h3>🌐 Publishing</h3>
            <div className="publishing-status">
              <div className={`status-indicator ${localSettings.isPublished ? 'published' : 'draft'}`}>
                {localSettings.isPublished ? '🟢 Published' : '🟡 Draft'}
              </div>
              <p className="status-description">
                {localSettings.isPublished 
                  ? 'This test is live and accessible via share link'
                  : 'This test is in draft mode and not accessible to students'
                }
              </p>
            </div>
            <div className="setting-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={localSettings.isPublished}
                  onChange={(e) => handleChange('isPublished', e.target.checked)}
                />
                Publish test (make it accessible to students)
              </label>
            </div>
          </div>
        </div>

        <div className="settings-actions">
          <button className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="save-btn" onClick={handleSave}>
            {isEditing ? 'Update Settings' : 'Save & Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
