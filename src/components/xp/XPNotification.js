import React, { useState, useEffect } from 'react';

const XPNotification = ({ xpGain, isVisible, onClose }) => {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    if (isVisible && xpGain) {
      setAnimationPhase(0);
      const timer1 = setTimeout(() => setAnimationPhase(1), 100);
      const timer2 = setTimeout(() => setAnimationPhase(2), 1500);
      const timer3 = setTimeout(() => {
        onClose();
        setAnimationPhase(0);
      }, 3000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isVisible, xpGain, onClose]);

  if (!isVisible || !xpGain) return null;

  const getSourceIcon = (source) => {
    if (source.includes('Test Completion')) return '📝';
    if (source.includes('Perfect Score')) return '⭐';
    if (source.includes('Speed')) return '⚡';
    if (source.includes('Achievement')) return '🏆';
    if (source.includes('Creation')) return '🔨';
    if (source.includes('Login')) return '📅';
    return '✨';
  };

  return (
    <div style={{
      position: 'fixed',
      top: '2rem',
      right: '2rem',
      zIndex: 9999,
      transform: animationPhase >= 1 ? 'translateX(0)' : 'translateX(100%)',
      opacity: animationPhase >= 1 ? 1 : 0,
      transition: 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #32CD32 0%, #228B22 100%)',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        minWidth: '250px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Shine Effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
          animation: animationPhase >= 1 ? 'shine 2s ease-in-out' : 'none'
        }} />

        {/* Icon */}
        <div style={{
          fontSize: '1.5rem',
          transform: animationPhase >= 1 ? 'scale(1)' : 'scale(0.5)',
          transition: 'transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.2s'
        }}>
          {getSourceIcon(xpGain.source)}
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          transform: animationPhase >= 1 ? 'translateX(0)' : 'translateX(20px)',
          opacity: animationPhase >= 1 ? 1 : 0,
          transition: 'all 0.5s ease 0.3s'
        }}>
          <div style={{
            fontSize: '0.9rem',
            marginBottom: '0.25rem',
            opacity: 0.9
          }}>
            {xpGain.source}
          </div>
          <div style={{
            fontSize: '1.1rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{
              color: '#FFD700',
              fontSize: '1.3rem'
            }}>
              +{xpGain.pointsGained}
            </span>
            <span style={{ fontSize: '0.9rem' }}>XP</span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            color: 'white',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            opacity: animationPhase >= 2 ? 1 : 0
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.3)';
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          ×
        </button>
      </div>

      <style jsx>{`
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
};

export default XPNotification;
