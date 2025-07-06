import React, { useState, useEffect } from 'react';
import XPService from '../../services/XPService';

const LevelUpNotification = ({ isVisible, onClose, levelData }) => {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    if (isVisible) {
      setAnimationPhase(0);
      const timer1 = setTimeout(() => setAnimationPhase(1), 100);
      const timer2 = setTimeout(() => setAnimationPhase(2), 1000);
      const timer3 = setTimeout(() => setAnimationPhase(3), 2000);
      const timer4 = setTimeout(() => {
        onClose();
        setAnimationPhase(0);
      }, 4000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    }
  }, [isVisible, onClose]);

  if (!isVisible || !levelData) return null;

  const levelInfo = XPService.getLevelInfo(levelData.newLevel);
  const isMedalLevel = XPService.isMedalMilestone(levelData.newLevel);
  const medalInfo = isMedalLevel ? XPService.getMedalInfo(levelData.newLevel) : null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      opacity: animationPhase >= 1 ? 1 : 0,
      transition: 'opacity 0.3s ease'
    }}>
      {/* Celebration Background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 20%, rgba(255, 215, 0, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(255, 165, 0, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)
        `,
        animation: animationPhase >= 1 ? 'celebrate 3s ease-in-out' : 'none'
      }} />

      {/* Main Card */}
      <div style={{
        background: 'linear-gradient(135deg, #669BBC 0%, #003049 100%)',
        borderRadius: '24px',
        padding: '3rem 2rem',
        textAlign: 'center',
        color: 'white',
        maxWidth: '400px',
        width: '90%',
        position: 'relative',
        transform: animationPhase >= 1 ? 'scale(1)' : 'scale(0.5)',
        opacity: animationPhase >= 1 ? 1 : 0,
        transition: 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden'
      }}>
        {/* Sparkle Effects */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '20px',
          height: '20px',
          background: '#FFD700',
          borderRadius: '50%',
          opacity: animationPhase >= 2 ? 1 : 0,
          animation: animationPhase >= 2 ? 'sparkle 2s ease-in-out infinite' : 'none'
        }} />
        <div style={{
          position: 'absolute',
          top: '20%',
          right: '15%',
          width: '15px',
          height: '15px',
          background: '#FFA500',
          borderRadius: '50%',
          opacity: animationPhase >= 2 ? 1 : 0,
          animation: animationPhase >= 2 ? 'sparkle 2s ease-in-out infinite 0.5s' : 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '15%',
          left: '20%',
          width: '10px',
          height: '10px',
          background: '#FFD700',
          borderRadius: '50%',
          opacity: animationPhase >= 2 ? 1 : 0,
          animation: animationPhase >= 2 ? 'sparkle 2s ease-in-out infinite 1s' : 'none'
        }} />

        {/* Level Up Text */}
        <div style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          transform: animationPhase >= 2 ? 'translateY(0)' : 'translateY(20px)',
          opacity: animationPhase >= 2 ? 1 : 0,
          transition: 'all 0.5s ease 0.5s'
        }}>
          🎉 LEVEL UP! 🎉
        </div>

        {/* Level Badge */}
        <div style={{
          display: 'inline-block',
          padding: '1rem 2rem',
          background: `linear-gradient(135deg, ${levelInfo.color} 0%, ${levelInfo.color}CC 100%)`,
          borderRadius: '50px',
          marginBottom: '1.5rem',
          transform: animationPhase >= 2 ? 'scale(1)' : 'scale(0.8)',
          opacity: animationPhase >= 2 ? 1 : 0,
          transition: 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.7s'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '0.5rem'
          }}>
            {levelInfo.icon}
          </div>
          <div style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            marginBottom: '0.25rem'
          }}>
            Level {levelData.newLevel}
          </div>
          <div style={{
            fontSize: '1rem',
            opacity: 0.9
          }}>
            {levelInfo.title}
          </div>
        </div>

        {/* Medal Achievement */}
        {isMedalLevel && medalInfo && (
          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            background: `linear-gradient(135deg, ${medalInfo.color}33 0%, ${medalInfo.color}11 100%)`,
            borderRadius: '16px',
            border: `2px solid ${medalInfo.color}`,
            transform: animationPhase >= 2 ? 'scale(1)' : 'scale(0.9)',
            opacity: animationPhase >= 2 ? 1 : 0,
            transition: 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.9s'
          }}>
            <div style={{
              fontSize: '2rem',
              marginBottom: '0.5rem'
            }}>
              {medalInfo.icon}
            </div>
            <div style={{
              fontSize: '1.2rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
              color: medalInfo.color
            }}>
              {medalInfo.title}
            </div>
            <div style={{
              fontSize: '0.9rem',
              opacity: 0.9
            }}>
              {medalInfo.description}
            </div>
          </div>
        )}

        {/* XP Info */}
        <div style={{
          transform: animationPhase >= 3 ? 'translateY(0)' : 'translateY(20px)',
          opacity: animationPhase >= 3 ? 1 : 0,
          transition: 'all 0.5s ease 1s'
        }}>
          <div style={{
            fontSize: '1.1rem',
            marginBottom: '0.5rem'
          }}>
            Total XP: {levelData.xpData.totalXP.toLocaleString()}
          </div>
          <div style={{
            fontSize: '0.9rem',
            opacity: 0.8
          }}>
            You've grown stronger! Keep learning to unlock more achievements.
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            color: 'white',
            fontSize: '1.2rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            opacity: animationPhase >= 3 ? 1 : 0
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
        @keyframes celebrate {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.05) rotate(1deg); }
          50% { transform: scale(1.1) rotate(-1deg); }
          75% { transform: scale(1.05) rotate(1deg); }
        }
        
        @keyframes sparkle {
          0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
          50% { transform: scale(1) rotate(180deg); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default LevelUpNotification;
