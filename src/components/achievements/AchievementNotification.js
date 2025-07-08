import React, { useState, useEffect } from 'react';
import AchievementBadge from './AchievementBadge';

const AchievementNotification = ({ achievement, onClose, duration = 4500 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (!achievement) return;

    // Show notification immediately
    setIsVisible(true);

    // Auto-hide notification after duration
    const hideTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(hideTimer);
    };
  }, [achievement, duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 400);
  };

  if (!achievement) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      right: '0',
      transform: `translateY(-50%) translateX(${isVisible && !isLeaving ? '-20px' : '100%'})`,
      transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 1000,
      width: '380px',
      maxWidth: '90vw'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
        borderRadius: '16px 0 0 16px',
        padding: '1.5rem',
        boxShadow: '-8px 0 32px rgba(255, 215, 0, 0.3), 0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '2px solid #FFD700',
        borderRight: 'none',
        position: 'relative',
        overflow: 'hidden',
        animation: isVisible && !isLeaving ? 'slideInBounce 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
      }}>
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#003049',
            fontSize: '1.1rem',
            transition: 'all 0.2s ease',
            opacity: 0.7
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.3)';
            e.target.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            e.target.style.opacity = '0.7';
          }}
        >
          ×
        </button>

        {/* Progress bar */}
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          height: '3px',
          background: 'rgba(255, 255, 255, 0.6)',
          animation: `progressBar ${duration}ms linear`,
          transformOrigin: 'left'
        }} />

        {/* Sliding tab indicator */}
        <div style={{
          position: 'absolute',
          right: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '6px',
          height: '60px',
          background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)',
          borderRadius: '0 4px 4px 0',
          boxShadow: '2px 0 8px rgba(255, 215, 0, 0.4)'
        }} />

        {/* Celebration particles */}
        <div style={{
          position: 'absolute',
          top: '-10px',
          left: '-10px',
          right: '-10px',
          bottom: '-10px',
          pointerEvents: 'none',
          overflow: 'hidden'
        }}>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '6px',
                height: '6px',
                background: '#FFFFFF',
                borderRadius: '50%',
                animation: `particle${i} 3s infinite ease-out`,
                opacity: 0.6,
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </div>

        {/* Main content */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <div style={{
            fontSize: '1.8rem',
            animation: 'celebration 2s ease-in-out infinite',
            flexShrink: 0
          }}>
            🎉
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              margin: 0,
              color: '#003049',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              lineHeight: 1.2
            }}>
              Achievement Unlocked!
            </h3>
            <p style={{
              margin: '0.25rem 0 0 0',
              color: '#003049',
              fontSize: '0.85rem',
              opacity: 0.8
            }}>
              You've earned a new badge
            </p>
          </div>
        </div>

        {/* Achievement display - compact layout */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          padding: '1rem'
        }}>
          <div style={{ flexShrink: 0 }}>
            <AchievementBadge
              achievement={achievement}
              isEarned={true}
              size={60}
              showLabel={false}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{
              margin: '0 0 0.3rem 0',
              color: '#003049',
              fontSize: '1rem',
              fontWeight: 'bold',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {achievement.title}
            </h4>
            <p style={{
              margin: 0,
              color: '#003049',
              fontSize: '0.8rem',
              opacity: 0.8,
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {achievement.description}
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInBounce {
          0% {
            transform: translateY(-50%) translateX(100%);
            opacity: 0;
          }
          70% {
            transform: translateY(-50%) translateX(-30px);
            opacity: 1;
          }
          100% {
            transform: translateY(-50%) translateX(-20px);
            opacity: 1;
          }
        }

        @keyframes celebration {
          0%, 100% {
            transform: scale(1) rotate(0deg);
          }
          25% {
            transform: scale(1.1) rotate(-5deg);
          }
          75% {
            transform: scale(1.1) rotate(5deg);
          }
        }

        @keyframes progressBar {
          0% {
            transform: scaleX(1);
          }
          100% {
            transform: scaleX(0);
          }
        }

        @keyframes particle0 {
          0% {
            transform: translate(30px, 30px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(80px, -30px) rotate(180deg);
            opacity: 0;
          }
        }

        @keyframes particle1 {
          0% {
            transform: translate(30px, 30px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(-30px, -30px) rotate(-180deg);
            opacity: 0;
          }
        }

        @keyframes particle2 {
          0% {
            transform: translate(30px, 30px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(60px, -60px) rotate(90deg);
            opacity: 0;
          }
        }

        @keyframes particle3 {
          0% {
            transform: translate(30px, 30px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(-60px, 60px) rotate(-90deg);
            opacity: 0;
          }
        }

        @keyframes particle4 {
          0% {
            transform: translate(30px, 30px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(100px, 30px) rotate(45deg);
            opacity: 0;
          }
        }

        @keyframes particle5 {
          0% {
            transform: translate(30px, 30px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(-80px, 30px) rotate(-45deg);
            opacity: 0;
          }
        }

        @keyframes particle6 {
          0% {
            transform: translate(30px, 30px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(45px, -80px) rotate(135deg);
            opacity: 0;
          }
        }

        @keyframes particle7 {
          0% {
            transform: translate(30px, 30px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(15px, 80px) rotate(-135deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default AchievementNotification;
