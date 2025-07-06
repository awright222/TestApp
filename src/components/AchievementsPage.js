import React from 'react';
import { useNavigate } from 'react-router-dom';
import AchievementManager from './achievements/AchievementManager';

const AchievementsPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FDF0D5 0%, #FFFFFF 50%, #E8F4FD 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              marginRight: '1rem',
              color: '#669BBC',
              padding: '0.5rem',
              borderRadius: '8px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(102, 155, 188, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'none';
            }}
          >
            ← Back
          </button>
          <div>
            <h1 style={{
              margin: 0,
              color: '#003049',
              fontSize: '2.5rem',
              fontWeight: 'bold'
            }}>
              🏆 Achievement Gallery
            </h1>
            <p style={{
              margin: '0.5rem 0',
              color: '#669BBC',
              fontSize: '1.1rem'
            }}>
              Unlock badges by completing tests and reaching milestones
            </p>
          </div>
        </div>

        {/* Achievement Manager */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <AchievementManager compact={false} />
        </div>

        {/* Tips Section */}
        <div style={{
          marginTop: '3rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #669BBC 0%, #003049 100%)',
            borderRadius: '16px',
            padding: '2rem',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
            <h3 style={{ margin: '0 0 1rem 0' }}>How to Earn Badges</h3>
            <p style={{ margin: 0, opacity: 0.9 }}>
              Complete tests, achieve perfect scores, and maintain learning streaks to unlock new achievements and show off your progress!
            </p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            borderRadius: '16px',
            padding: '2rem',
            color: '#003049',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
            <h3 style={{ margin: '0 0 1rem 0' }}>Challenge Yourself</h3>
            <p style={{ margin: 0, opacity: 0.9 }}>
              Try different test types, aim for perfect scores, and complete tests quickly to unlock rare and impressive badges!
            </p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #28A745 0%, #20C997 100%)',
            borderRadius: '16px',
            padding: '2rem',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌟</div>
            <h3 style={{ margin: '0 0 1rem 0' }}>Share Your Success</h3>
            <p style={{ margin: 0, opacity: 0.9 }}>
              Show off your earned badges to friends and classmates. Each badge represents your dedication to learning!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementsPage;
