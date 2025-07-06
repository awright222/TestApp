import React, { useState, useEffect } from 'react';
import { useAuth } from '../../firebase/AuthContext';
import XPService from '../../services/XPService';

const XPDashboard = ({ compact = false }) => {
  const { user } = useAuth();
  const [xpData, setXpData] = useState(null);
  const [recentGains, setRecentGains] = useState([]);
  const [userMedals, setUserMedals] = useState([]);
  const [nextMedal, setNextMedal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadXPData();
    }
  }, [user]);

  const loadXPData = async () => {
    try {
      // Check for daily login bonus
      const loginResult = XPService.checkDailyLogin(user.uid);
      
      // Load XP data
      const userXP = XPService.getUserXP(user.uid);
      const recent = XPService.getRecentXPGains(user.uid, 24);
      const medals = XPService.getUserMedals(user.uid);
      const nextMedalInfo = XPService.getNextMedal(user.uid);
      
      setXpData(userXP);
      setRecentGains(recent);
      setUserMedals(medals);
      setNextMedal(nextMedalInfo);
      setLoading(false);
      
      // Show login bonus notification if earned
      if (loginResult && loginResult.pointsGained > 0) {
        // Could trigger a notification here
        console.log(`Daily login bonus: +${loginResult.pointsGained} XP`);
      }
    } catch (error) {
      console.error('Error loading XP data:', error);
      setLoading(false);
    }
  };

  const getLevelInfo = () => {
    if (!xpData) return null;
    return XPService.getLevelInfo(xpData.level);
  };

  const getProgressPercentage = () => {
    if (!xpData) return 0;
    return XPService.getLevelProgress(xpData);
  };

  const formatXP = (xp) => {
    return xp?.toLocaleString() || '0';
  };

  if (loading) {
    return (
      <div style={{
        padding: compact ? '1rem' : '2rem',
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #669BBC',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }} />
        <p style={{ marginTop: '1rem', color: '#669BBC' }}>Loading XP...</p>
      </div>
    );
  }

  if (!xpData) {
    return null;
  }

  const levelInfo = getLevelInfo();
  const progressPercentage = getProgressPercentage();

  return (
    <div style={{
      padding: compact ? '1.5rem' : '2rem',
      background: 'linear-gradient(135deg, #669BBC 0%, #003049 100%)',
      borderRadius: '20px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100px',
        height: '100px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        transform: 'translate(30px, -30px)'
      }} />
      
      <div style={{
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem'
        }}>
          <div>
            <h3 style={{
              margin: 0,
              fontSize: compact ? '1.2rem' : '1.5rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {levelInfo.icon} Level {xpData.level}
            </h3>
            <p style={{
              margin: '0.25rem 0 0 0',
              fontSize: compact ? '0.9rem' : '1rem',
              opacity: 0.9
            }}>
              {levelInfo.title}
            </p>
          </div>
          <div style={{
            textAlign: 'right'
          }}>
            <div style={{
              fontSize: compact ? '1.2rem' : '1.5rem',
              fontWeight: 'bold'
            }}>
              {formatXP(xpData.totalXP)} XP
            </div>
            {xpData.streak > 1 && (
              <div style={{
                fontSize: '0.8rem',
                opacity: 0.9,
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                🔥 {xpData.streak} day streak
              </div>
            )}
          </div>
        </div>

        {/* Medal Display */}
        {userMedals.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{
              margin: '0 0 1rem 0',
              fontSize: '1rem',
              opacity: 0.9,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              🏅 Medals Earned ({userMedals.length})
            </h4>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              {userMedals.slice(0, compact ? 3 : 6).map((medal, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  border: `1px solid ${medal.color}33`
                }}>
                  <span style={{ fontSize: '1.2rem' }}>{medal.icon}</span>
                  <span style={{ color: medal.color, fontWeight: 'bold' }}>
                    Lv {medal.level}
                  </span>
                </div>
              ))}
              {userMedals.length > (compact ? 3 : 6) && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  minWidth: '40px'
                }}>
                  +{userMedals.length - (compact ? 3 : 6)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Next Medal Progress */}
        {nextMedal && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>
              <span style={{ 
                fontSize: '0.9rem', 
                opacity: 0.9,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {nextMedal.icon} Next: {nextMedal.title}
              </span>
              <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                {nextMedal.levelsRemaining} levels to go
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${(nextMedal.progress * 100)}%`,
                height: '100%',
                backgroundColor: nextMedal.color,
                borderRadius: '2px',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div style={{
          marginBottom: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem'
          }}>
            <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              {formatXP(xpData.currentLevelXP)} / {formatXP(xpData.nextLevelXP || xpData.currentLevelXP)} XP
            </span>
            <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progressPercentage}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)',
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Recent Activity */}
        {!compact && recentGains.length > 0 && (
          <div>
            <h4 style={{
              margin: '0 0 1rem 0',
              fontSize: '1rem',
              opacity: 0.9
            }}>
              Recent XP Gains
            </h4>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              {recentGains.slice(0, 3).map((gain, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}>
                  <span>{gain.source}</span>
                  <span style={{
                    color: '#FFD700',
                    fontWeight: 'bold'
                  }}>
                    +{gain.points} XP
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compact Recent Activity */}
        {compact && recentGains.length > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            fontSize: '0.9rem'
          }}>
            <span>Recent: {recentGains[0].source}</span>
            <span style={{
              color: '#FFD700',
              fontWeight: 'bold'
            }}>
              +{recentGains[0].points} XP
            </span>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default XPDashboard;
