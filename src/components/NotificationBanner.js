import React from 'react';
import './NotificationBanner.css';

export default function NotificationBanner({ 
  type = 'info', 
  message, 
  actionText = null, 
  onAction = null, 
  onDismiss = null,
  dismissible = true 
}) {
  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  return (
    <div className={`notification-banner ${type}`}>
      <div className="notification-content">
        <span className="notification-icon">{getIcon()}</span>
        <span className="notification-message">{message}</span>
      </div>
      <div className="notification-actions">
        {actionText && onAction && (
          <button onClick={onAction} className="notification-action">
            {actionText}
          </button>
        )}
        {dismissible && onDismiss && (
          <button onClick={onDismiss} className="notification-dismiss">
            ×
          </button>
        )}
      </div>
    </div>
  );
}
