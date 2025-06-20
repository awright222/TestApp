import React from 'react';
import './ProgressBar.css';

export default function ProgressBar({ 
  value, 
  max = 100, 
  label = '', 
  color = '#669BBC',
  height = '8px',
  showPercentage = true,
  animated = false
}) {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className="progress-bar-container">
      {label && (
        <div className="progress-bar-label">
          <span className="label-text">{label}</span>
          {showPercentage && (
            <span className="label-value">{percentage.toFixed(1)}%</span>
          )}
        </div>
      )}
      <div 
        className="progress-bar-track" 
        style={{ height }}
      >
        <div 
          className={`progress-bar-fill ${animated ? 'animated' : ''}`}
          style={{ 
            width: `${percentage}%`,
            backgroundColor: color,
            height: '100%'
          }}
        />
      </div>
    </div>
  );
}
