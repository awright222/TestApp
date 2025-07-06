import React from 'react';
import { useNavigate } from 'react-router-dom';
import AchievementManager from './AchievementManager';

const AchievementDashboard = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      background: 'linear-gradient(135deg, #FDF0D5 0%, #FFFFFF 100%)',
      borderRadius: '16px',
      padding: '1.5rem',
      marginBottom: '2rem',
      border: '2px solid #FFD700',
      boxShadow: '0 4px 20px rgba(255, 215, 0, 0.1)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '100px',
        height: '100px',
        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
        borderRadius: '50%',
        opacity: 0.1,
        zIndex: 1
      }} />
      
      <div style={{
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <div>
            <h3 style={{
              margin: 0,
              color: '#003049',
              fontSize: '1.4rem',
              fontWeight: 'bold'
            }}>
              🏆 Your Achievements
            </h3>
            <p style={{
              margin: '0.25rem 0 0 0',
              color: '#669BBC',
              fontSize: '0.9rem'
            }}>
              Unlock badges by completing tests and challenges
            </p>
          </div>
          
          <button
            onClick={() => navigate('/achievements')}
            style={{
              background: 'linear-gradient(135deg, #669BBC 0%, #003049 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontWeight: '600'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(102, 155, 188, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            View All
          </button>
        </div>
        
        <AchievementManager compact={true} maxDisplay={4} />
      </div>
    </div>
  );
};

export default AchievementDashboard;
