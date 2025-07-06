import React, { useState, useEffect } from 'react';
import AchievementBadge from './AchievementBadge';

const AchievementNotification = ({ achievement, onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Show notification
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Auto-hide notification
    const hideTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  if (!isVisible && !isLeaving) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      transform: `translateX(${isVisible && !isLeaving ? '0' : '100%'})`,
      transition: 'all 0.3s ease-in-out',
      animation: isVisible && !isLeaving ? 'achievementBounce 0.6s ease-out' : 'none'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 8px 32px rgba(255, 215, 0, 0.3)',
        border: '2px solid #FFD700',
        maxWidth: '350px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#003049',
            fontSize: '1.2rem',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
        >
          ×
        </button>

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
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '8px',
                height: '8px',
                background: '#FFFFFF',
                borderRadius: '50%',
                animation: `particle${i} 2s infinite ease-out`,
                opacity: 0.8
              }}
            />
          ))}
        </div>

        {/* Main content */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <div style={{
            fontSize: '2rem',
            animation: 'pulse 1s infinite'
          }}>
            🎉
          </div>
          <div>
            <h3 style={{
              margin: 0,
              color: '#003049',
              fontSize: '1.3rem',
              fontWeight: 'bold'
            }}>
              Achievement Unlocked!
            </h3>
            <p style={{
              margin: '0.25rem 0 0 0',
              color: '#003049',
              fontSize: '0.9rem',
              opacity: 0.8
            }}>
              You've earned a new badge
            </p>
          </div>
        </div>

        {/* Achievement Badge */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '1rem'
        }}>
          <AchievementBadge
            achievement={achievement}
            isEarned={true}
            size={80}
            showLabel={true}
          />
        </div>

        {/* Achievement details */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <h4 style={{
            margin: '0 0 0.5rem 0',
            color: '#003049',
            fontSize: '1.1rem'
          }}>
            {achievement.title}
          </h4>
          <p style={{
            margin: 0,
            color: '#003049',
            fontSize: '0.9rem',
            opacity: 0.8
          }}>
            {achievement.description}
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes achievementBounce {
          0% {
            transform: translateX(100%) scale(0.8);
            opacity: 0;
          }
          50% {
            transform: translateX(-20px) scale(1.1);
            opacity: 1;
          }
          100% {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
        }

        @keyframes particle0 {
          0% {
            transform: translate(50px, 50px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(150px, -50px) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes particle1 {
          0% {
            transform: translate(50px, 50px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(-50px, -50px) rotate(-360deg);
            opacity: 0;
          }
        }

        @keyframes particle2 {
          0% {
            transform: translate(50px, 50px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(100px, -100px) rotate(180deg);
            opacity: 0;
          }
        }

        @keyframes particle3 {
          0% {
            transform: translate(50px, 50px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(-100px, 100px) rotate(-180deg);
            opacity: 0;
          }
        }

        @keyframes particle4 {
          0% {
            transform: translate(50px, 50px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(200px, 50px) rotate(90deg);
            opacity: 0;
          }
        }

        @keyframes particle5 {
          0% {
            transform: translate(50px, 50px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(-150px, 50px) rotate(-90deg);
            opacity: 0;
          }
        }

        @keyframes particle6 {
          0% {
            transform: translate(50px, 50px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(75px, -150px) rotate(270deg);
            opacity: 0;
          }
        }

        @keyframes particle7 {
          0% {
            transform: translate(50px, 50px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(25px, 150px) rotate(45deg);
            opacity: 0;
          }
        }

        @keyframes particle8 {
          0% {
            transform: translate(50px, 50px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(175px, 25px) rotate(-45deg);
            opacity: 0;
          }
        }

        @keyframes particle9 {
          0% {
            transform: translate(50px, 50px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(-75px, 175px) rotate(135deg);
            opacity: 0;
          }
        }

        @keyframes particle10 {
          0% {
            transform: translate(50px, 50px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(125px, 125px) rotate(-135deg);
            opacity: 0;
          }
        }

        @keyframes particle11 {
          0% {
            transform: translate(50px, 50px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(-25px, -25px) rotate(225deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default AchievementNotification;
