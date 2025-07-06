import React, { useState } from 'react';
import { useAuth } from '../../firebase/AuthContext';
import XPService, { LEVEL_THRESHOLDS } from '../../services/XPService';

const XPTestControls = () => {
  const { user } = useAuth();
  const [xpToAdd, setXpToAdd] = useState(100);

  const addXP = () => {
    if (user) {
      XPService.addXP(user.uid, xpToAdd, 'Test XP');
      console.log(`Added ${xpToAdd} XP to user ${user.uid}`);
      
      // Try to refresh achievements if available
      if (window.refreshAchievements) {
        window.refreshAchievements();
      }
      
      // Refresh the page to see changes
      setTimeout(() => window.location.reload(), 100);
    }
  };

  const addMedalXP = (level) => {
    if (user) {
      const userXP = XPService.getUserXP(user.uid);
      const targetXP = LEVEL_THRESHOLDS[level - 1] || 0;
      const xpNeeded = Math.max(0, targetXP - userXP.totalXP + 10); // Add 10 extra to ensure level up
      
      if (xpNeeded > 0) {
        XPService.addXP(user.uid, xpNeeded, `Level ${level} Medal Test`);
        console.log(`Added ${xpNeeded} XP to reach level ${level}`);
        
        // Try to refresh achievements if available
        if (window.refreshAchievements) {
          window.refreshAchievements();
        }
        
        setTimeout(() => window.location.reload(), 100);
      } else {
        console.log(`Already at or above level ${level}`);
      }
    }
  };

  const resetXP = () => {
    if (user) {
      localStorage.removeItem(`user_xp_data_${user.uid}`);
      console.log('Reset XP for user');
      window.location.reload();
    }
  };

  if (!user) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '1rem',
      borderRadius: '8px',
      zIndex: 10000,
      fontSize: '12px'
    }}>
      <h4 style={{ margin: '0 0 0.5rem 0' }}>XP Test Controls</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="number"
            value={xpToAdd}
            onChange={(e) => setXpToAdd(parseInt(e.target.value))}
            style={{ width: '60px', padding: '2px' }}
          />
          <button onClick={addXP} style={{ padding: '2px 8px' }}>Add XP</button>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
          <button onClick={() => addMedalXP(1)} style={{ padding: '2px 4px', fontSize: '10px' }}>Lv1</button>
          <button onClick={() => addMedalXP(10)} style={{ padding: '2px 4px', fontSize: '10px' }}>Lv10</button>
          <button onClick={() => addMedalXP(25)} style={{ padding: '2px 4px', fontSize: '10px' }}>Lv25</button>
          <button onClick={() => addMedalXP(50)} style={{ padding: '2px 4px', fontSize: '10px' }}>Lv50</button>
          <button onClick={() => addMedalXP(75)} style={{ padding: '2px 4px', fontSize: '10px' }}>Lv75</button>
          <button onClick={() => addMedalXP(100)} style={{ padding: '2px 4px', fontSize: '10px' }}>Lv100</button>
        </div>
        <button onClick={resetXP} style={{ padding: '2px 8px', background: '#ff4444' }}>Reset XP</button>
      </div>
    </div>
  );
};

export default XPTestControls;
