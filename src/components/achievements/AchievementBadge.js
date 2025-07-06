import React from 'react';

const AchievementBadge = ({ achievement, isEarned = false, size = 120, showLabel = true }) => {
  const { id, title, description, type, requirement, svg } = achievement;
  
  return (
    <div 
      className={`achievement-badge ${isEarned ? 'earned' : 'locked'}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1rem',
        borderRadius: '12px',
        background: isEarned 
          ? 'linear-gradient(135deg, #FDF0D5 0%, #FFFFFF 100%)'
          : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        border: isEarned 
          ? '2px solid #FFD700'
          : '2px solid #dee2e6',
        boxShadow: isEarned 
          ? '0 4px 16px rgba(255, 215, 0, 0.3)'
          : '0 2px 8px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        opacity: isEarned ? 1 : 0.6,
        transform: isEarned ? 'scale(1)' : 'scale(0.95)',
        filter: isEarned ? 'none' : 'grayscale(50%)',
        width: size + 40,
        maxWidth: '200px'
      }}
      onMouseEnter={(e) => {
        if (isEarned) {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.4)';
        }
      }}
      onMouseLeave={(e) => {
        if (isEarned) {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 215, 0, 0.3)';
        }
      }}
      title={isEarned ? `${title} - ${description}` : `🔒 ${title} - ${requirement}`}
    >
      <div 
        style={{ 
          width: size, 
          height: size,
          position: 'relative',
          marginBottom: showLabel ? '0.5rem' : 0
        }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      
      {showLabel && (
        <div style={{ textAlign: 'center', width: '100%' }}>
          <h4 style={{
            margin: '0 0 0.25rem 0',
            fontSize: '0.9rem',
            fontWeight: '600',
            color: isEarned ? '#003049' : '#6c757d'
          }}>
            {isEarned ? title : `🔒 ${title}`}
          </h4>
          <p style={{
            margin: 0,
            fontSize: '0.75rem',
            color: '#669BBC',
            lineHeight: '1.2'
          }}>
            {isEarned ? description : requirement}
          </p>
        </div>
      )}
    </div>
  );
};

export default AchievementBadge;
