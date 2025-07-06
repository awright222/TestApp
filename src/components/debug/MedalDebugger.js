import React, { useState, useEffect } from 'react';
import { useAuth } from '../../firebase/AuthContext';
import XPService from '../../services/XPService';
import AchievementService from '../../services/AchievementService';

const MedalDebugger = () => {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    if (user) {
      try {
        const xpData = XPService.getUserXP(user.uid);
        const medals = XPService.getUserMedals(user.uid);
        const nextMedal = XPService.getNextMedal(user.uid);
        const isMedalLevel = XPService.isMedalMilestone(xpData.level);
        const medalInfo = XPService.getMedalInfo(xpData.level);
        
        // Check achievements
        const levelAchievements = AchievementService.checkLevelAchievements(xpData.level);
        const xpAchievements = AchievementService.checkXPAchievements(xpData.totalXP);
        const allProgressAchievements = [...levelAchievements, ...xpAchievements];

        setDebugInfo({
          xpData,
          medals,
          nextMedal,
          isMedalLevel,
          medalInfo,
          levelAchievements,
          xpAchievements,
          allProgressAchievements,
          error: null
        });
      } catch (error) {
        setDebugInfo({
          xpData: null,
          medals: [],
          nextMedal: null,
          isMedalLevel: false,
          medalInfo: null,
          levelAchievements: [],
          xpAchievements: [],
          allProgressAchievements: [],
          error: error.message
        });
      }
    }
  }, [user]);

  if (!user) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: '1rem',
      borderRadius: '8px',
      zIndex: 10000,
      fontSize: '12px',
      maxWidth: '300px',
      maxHeight: '400px',
      overflow: 'auto'
    }}>
      <h4 style={{ margin: '0 0 0.5rem 0', color: '#FFD700' }}>Medal Debug Info</h4>
      
      {debugInfo?.error && (
        <div style={{ color: '#ff4444', marginBottom: '0.5rem' }}>
          Error: {debugInfo.error}
        </div>
      )}
      
      {debugInfo && (
        <div style={{ fontSize: '10px', lineHeight: '1.2' }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Level:</strong> {debugInfo.xpData?.level || 'N/A'}
          </div>
          
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Total XP:</strong> {debugInfo.xpData?.totalXP || 0}
          </div>
          
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Is Medal Level:</strong> {debugInfo.isMedalLevel ? 'Yes' : 'No'}
          </div>
          
          {debugInfo.medalInfo && (
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Current Medal:</strong> {debugInfo.medalInfo.icon} {debugInfo.medalInfo.title}
            </div>
          )}
          
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Earned Medals:</strong> {debugInfo.medals?.length || 0}
          </div>
          
          {debugInfo.medals?.length > 0 && (
            <div style={{ marginBottom: '0.5rem' }}>
              {debugInfo.medals.map((medal, index) => (
                <div key={index} style={{ fontSize: '9px', marginLeft: '0.5rem' }}>
                  {medal.icon} Lv{medal.level} - {medal.title}
                </div>
              ))}
            </div>
          )}
          
          {debugInfo.nextMedal && (
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Next Medal:</strong> {debugInfo.nextMedal.icon} Lv{debugInfo.nextMedal.level} - {debugInfo.nextMedal.title}
            </div>
          )}
          
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Level Achievements:</strong> {debugInfo.levelAchievements?.length || 0}
          </div>
          
          {debugInfo.levelAchievements?.length > 0 && (
            <div style={{ marginBottom: '0.5rem' }}>
              {debugInfo.levelAchievements.map((achievement, index) => (
                <div key={index} style={{ fontSize: '9px', marginLeft: '0.5rem' }}>
                  🏆 {achievement.title}
                </div>
              ))}
            </div>
          )}
          
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>XP Achievements:</strong> {debugInfo.xpAchievements?.length || 0}
          </div>
          
          {debugInfo.xpAchievements?.length > 0 && (
            <div style={{ marginBottom: '0.5rem' }}>
              {debugInfo.xpAchievements.map((achievement, index) => (
                <div key={index} style={{ fontSize: '9px', marginLeft: '0.5rem' }}>
                  ⚡ {achievement.title}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MedalDebugger;
