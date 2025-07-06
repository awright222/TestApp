import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../firebase/AuthContext';
import XPService from '../services/XPService';
import XPDashboard from './xp/XPDashboard';

const XPPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [xpData, setXpData] = useState(null);
  const [xpHistory, setXpHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  useEffect(() => {
    if (user) {
      loadXPData();
    }
  }, [user]);

  const loadXPData = async () => {
    try {
      const userXP = XPService.getUserXP(user.uid);
      const history = userXP.xpHistory || [];
      const leaderboardData = XPService.getLeaderboard(10);
      
      setXpData(userXP);
      setXpHistory(history);
      setLeaderboard(leaderboardData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading XP data:', error);
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFilteredHistory = () => {
    if (selectedPeriod === 'all') return xpHistory;
    
    const now = Date.now();
    const periods = {
      'day': 24 * 60 * 60 * 1000,
      'week': 7 * 24 * 60 * 60 * 1000,
      'month': 30 * 24 * 60 * 60 * 1000
    };
    
    const cutoff = now - periods[selectedPeriod];
    return xpHistory.filter(entry => entry.timestamp >= cutoff);
  };

  const getSourceIcon = (source) => {
    if (source.includes('Test Completion')) return '📝';
    if (source.includes('Perfect Score')) return '⭐';
    if (source.includes('Speed')) return '⚡';
    if (source.includes('Achievement')) return '🏆';
    if (source.includes('Creation')) return '🔨';
    if (source.includes('Login')) return '📅';
    return '✨';
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FDF0D5 0%, #FFFFFF 50%, #E8F4FD 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '6px solid #f3f3f3',
            borderTop: '6px solid #669BBC',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }} />
          <p style={{ marginTop: '1rem', color: '#669BBC', fontSize: '1.1rem' }}>Loading XP Data...</p>
        </div>
      </div>
    );
  }

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
              ⚡ XP & Levels
            </h1>
            <p style={{
              margin: '0.5rem 0',
              color: '#669BBC',
              fontSize: '1.1rem'
            }}>
              Track your learning progress and level up!
            </p>
          </div>
        </div>

        {/* XP Dashboard */}
        <div style={{
          marginBottom: '2rem'
        }}>
          <XPDashboard compact={false} />
        </div>

        {/* Stats and Leaderboard */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* XP Breakdown */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{
              margin: '0 0 1.5rem 0',
              color: '#003049',
              fontSize: '1.3rem'
            }}>
              📊 XP Breakdown
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                background: 'rgba(102, 155, 188, 0.1)',
                borderRadius: '8px'
              }}>
                <span style={{ color: '#003049' }}>Total XP</span>
                <span style={{ fontWeight: 'bold', color: '#669BBC' }}>
                  {xpData?.totalXP?.toLocaleString() || 0}
                </span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                background: 'rgba(255, 215, 0, 0.1)',
                borderRadius: '8px'
              }}>
                <span style={{ color: '#003049' }}>Current Level</span>
                <span style={{ fontWeight: 'bold', color: '#B8860B' }}>
                  {xpData?.level || 1}
                </span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                background: 'rgba(50, 205, 50, 0.1)',
                borderRadius: '8px'
              }}>
                <span style={{ color: '#003049' }}>Login Streak</span>
                <span style={{ fontWeight: 'bold', color: '#32CD32' }}>
                  {xpData?.streak || 0} days
                </span>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{
              margin: '0 0 1.5rem 0',
              color: '#003049',
              fontSize: '1.3rem'
            }}>
              🏆 Leaderboard
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              {leaderboard.map((entry, index) => (
                <div key={entry.userId} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: entry.userId === user.uid ? 'rgba(102, 155, 188, 0.2)' : 'rgba(248, 249, 250, 0.8)',
                  borderRadius: '8px',
                  border: entry.userId === user.uid ? '2px solid #669BBC' : '1px solid #e9ecef'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span style={{
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#669BBC'
                    }}>
                      #{index + 1}
                    </span>
                    <span style={{
                      color: '#003049',
                      fontWeight: entry.userId === user.uid ? 'bold' : 'normal'
                    }}>
                      {entry.userId === user.uid ? 'You' : `User ${entry.userId.slice(-6)}`}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <span style={{
                      fontSize: '0.9rem',
                      color: '#669BBC'
                    }}>
                      Level {entry.level}
                    </span>
                    <span style={{
                      fontWeight: 'bold',
                      color: '#003049'
                    }}>
                      {entry.totalXP.toLocaleString()} XP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* XP History */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{
              margin: 0,
              color: '#003049',
              fontSize: '1.3rem'
            }}>
              📈 XP History
            </h3>
            <div style={{
              display: 'flex',
              gap: '0.5rem'
            }}>
              {['day', 'week', 'month', 'all'].map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  style={{
                    background: selectedPeriod === period 
                      ? 'linear-gradient(135deg, #669BBC 0%, #003049 100%)' 
                      : 'transparent',
                    color: selectedPeriod === period ? 'white' : '#669BBC',
                    border: '2px solid #669BBC',
                    borderRadius: '20px',
                    padding: '0.5rem 1rem',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}
                >
                  {period === 'all' ? 'All Time' : `Past ${period}`}
                </button>
              ))}
            </div>
          </div>

          <div style={{
            maxHeight: '400px',
            overflowY: 'auto',
            paddingRight: '0.5rem'
          }}>
            {getFilteredHistory().length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#669BBC'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                <p>No XP history found for this period.</p>
                <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                  Complete tests and activities to start earning XP!
                </p>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                {getFilteredHistory()
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .map((entry, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      background: 'rgba(248, 249, 250, 0.8)',
                      borderRadius: '12px',
                      border: '1px solid #e9ecef'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}>
                        <div style={{
                          fontSize: '1.5rem',
                          width: '40px',
                          textAlign: 'center'
                        }}>
                          {getSourceIcon(entry.source)}
                        </div>
                        <div>
                          <div style={{
                            color: '#003049',
                            fontWeight: '600',
                            marginBottom: '0.25rem'
                          }}>
                            {entry.source}
                          </div>
                          <div style={{
                            fontSize: '0.9rem',
                            color: '#669BBC'
                          }}>
                            {formatDate(entry.timestamp)}
                          </div>
                          {entry.metadata?.sources && (
                            <div style={{
                              fontSize: '0.8rem',
                              color: '#28A745',
                              marginTop: '0.25rem'
                            }}>
                              {entry.metadata.sources}
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}>
                        <div style={{
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                          color: '#32CD32'
                        }}>
                          +{entry.points}
                        </div>
                        <div style={{
                          fontSize: '0.9rem',
                          color: '#669BBC'
                        }}>
                          Level {entry.level}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
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

export default XPPage;
