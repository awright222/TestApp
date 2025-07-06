import React, { useState, useEffect } from 'react';
import { useAuth } from '../../firebase/AuthContext';
import AchievementBadge from './AchievementBadge';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES } from './achievementData';
import { SavedTestsService } from '../../SavedTestsService';
import { CreatedTestsService } from '../../services/CreatedTestsService';
import XPService from '../../services/XPService';
import AchievementService from '../../services/AchievementService';

const AchievementManager = ({ compact = false, maxDisplay = 4 }) => {
  const { user } = useAuth();
  const [userAchievements, setUserAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (user) {
      checkAchievements();
    }
  }, [user]);

  // Add a method to manually refresh achievements (for testing)
  const refreshAchievements = () => {
    checkAchievements();
  };

  // Expose refresh function globally for debugging
  useEffect(() => {
    window.refreshAchievements = refreshAchievements;
    return () => {
      delete window.refreshAchievements;
    };
  }, []);

  const checkAchievements = async () => {
    try {
      const earnedAchievements = [];
      
      // Get user's test data
      const savedTests = await SavedTestsService.getSavedTests();
      const userSavedTests = savedTests.filter(test => test.userId === user.uid);
      const createdTests = await CreatedTestsService.getCreatedTests();
      const userCreatedTests = createdTests.filter(test => test.createdBy === user.uid);

      // Get user's XP data
      const xpData = XPService.getUserXP(user.uid);
      
      // Check level milestone achievements
      const levelAchievements = AchievementService.checkLevelAchievements(xpData.level);
      levelAchievements.forEach(achievement => {
        earnedAchievements.push(achievement.id.toUpperCase());
      });
      
      // Check XP milestone achievements
      const xpAchievements = AchievementService.checkXPAchievements(xpData.totalXP);
      xpAchievements.forEach(achievement => {
        earnedAchievements.push(achievement.id.toUpperCase());
      });

      // Check FIRST_TEST achievement
      if (userSavedTests.length > 0) {
        earnedAchievements.push('FIRST_TEST');
      }

      // Check PERFECT_SCORE achievement
      const perfectScores = userSavedTests.filter(test => 
        test.score === test.totalQuestions || 
        (test.score / test.totalQuestions) === 1
      );
      if (perfectScores.length > 0) {
        earnedAchievements.push('PERFECT_SCORE');
      }

      // Check SPEEDSTER achievement (assuming we track completion time)
      const fastCompletions = userSavedTests.filter(test => 
        test.completionTime && test.completionTime < 120000 // 2 minutes in ms
      );
      if (fastCompletions.length > 0) {
        earnedAchievements.push('SPEEDSTER');
      }

      // Check QUIZ_MASTER achievement
      if (userSavedTests.length >= 10) {
        earnedAchievements.push('QUIZ_MASTER');
      }

      // Check STREAK_STARTER achievement
      const recentTests = userSavedTests
        .filter(test => test.dateCompleted)
        .sort((a, b) => new Date(b.dateCompleted) - new Date(a.dateCompleted));
      
      let currentStreak = 0;
      let maxStreak = 0;
      let lastDate = null;
      
      for (const test of recentTests) {
        const testDate = new Date(test.dateCompleted);
        if (lastDate) {
          const daysDiff = Math.floor((lastDate - testDate) / (1000 * 60 * 60 * 24));
          if (daysDiff === 1) {
            currentStreak++;
          } else {
            maxStreak = Math.max(maxStreak, currentStreak);
            currentStreak = 1;
          }
        } else {
          currentStreak = 1;
        }
        lastDate = testDate;
      }
      maxStreak = Math.max(maxStreak, currentStreak);
      
      if (maxStreak >= 3) {
        earnedAchievements.push('STREAK_STARTER');
      }

      // Check TEST_CREATOR achievement
      if (userCreatedTests.length > 0) {
        earnedAchievements.push('TEST_CREATOR');
      }

      setUserAchievements(earnedAchievements);
      setLoading(false);
    } catch (error) {
      console.error('Error checking achievements:', error);
      setLoading(false);
    }
  };

  const getAllAchievements = () => {
    return Object.values(ACHIEVEMENTS).map(achievement => ({
      ...achievement,
      isEarned: userAchievements.includes(achievement.id.toUpperCase())
    }));
  };

  const getDisplayedAchievements = () => {
    const allAchievements = getAllAchievements();
    
    // Filter by category if not 'all'
    const filteredAchievements = selectedCategory === 'all' 
      ? allAchievements 
      : allAchievements.filter(a => a.type === selectedCategory);
    
    if (compact && !showAll) {
      // Show earned achievements first, then most recent locked ones
      const earned = filteredAchievements.filter(a => a.isEarned);
      const locked = filteredAchievements.filter(a => !a.isEarned);
      const displayed = [...earned, ...locked].slice(0, maxDisplay);
      return displayed;
    }
    
    return filteredAchievements;
  };

  const filteredAchievements = getDisplayedAchievements();

  const earnedCount = userAchievements.length;
  const totalCount = Object.keys(ACHIEVEMENTS).length;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ 
          display: 'inline-block', 
          width: '40px', 
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #669BBC',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ marginTop: '1rem', color: '#669BBC' }}>Loading achievements...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: compact ? '1rem' : '2rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h2 style={{ 
            margin: 0, 
            color: '#003049',
            fontSize: compact ? '1.5rem' : '2rem'
          }}>
            🏆 Achievements
          </h2>
          <p style={{ 
            margin: '0.5rem 0', 
            color: '#669BBC',
            fontSize: compact ? '0.9rem' : '1rem'
          }}>
            {earnedCount} of {totalCount} earned
          </p>
        </div>
        
        {compact && (
          <button
            onClick={() => setShowAll(!showAll)}
            style={{
              background: 'linear-gradient(135deg, #669BBC 0%, #003049 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
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
            {showAll ? 'Show Less' : 'View All'}
          </button>
        )}
      </div>

      {/* Category Filter */}
      {!compact && (
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => setSelectedCategory('all')}
            style={{
              background: selectedCategory === 'all' 
                ? 'linear-gradient(135deg, #669BBC 0%, #003049 100%)' 
                : 'transparent',
              color: selectedCategory === 'all' ? 'white' : '#669BBC',
              border: '2px solid #669BBC',
              borderRadius: '20px',
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontWeight: '600'
            }}
          >
            🏆 All ({totalCount})
          </button>
          {Object.entries(ACHIEVEMENT_CATEGORIES).map(([key, category]) => {
            const categoryCount = Object.values(ACHIEVEMENTS).filter(a => a.type === key).length;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                style={{
                  background: selectedCategory === key 
                    ? `linear-gradient(135deg, ${category.color} 0%, ${category.color}AA 100%)` 
                    : 'transparent',
                  color: selectedCategory === key ? 'white' : category.color,
                  border: `2px solid ${category.color}`,
                  borderRadius: '20px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontWeight: '600'
                }}
              >
                {category.icon} {category.name} ({categoryCount})
              </button>
            );
          })}
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: `repeat(auto-fit, minmax(${compact ? '160px' : '200px'}, 1fr))`,
        gap: '1.5rem',
        justifyItems: 'center'
      }}>
        {filteredAchievements.map(achievement => (
          <AchievementBadge
            key={achievement.id}
            achievement={achievement}
            isEarned={achievement.isEarned}
            size={compact ? 80 : 120}
            showLabel={true}
          />
        ))}
      </div>

      {earnedCount > 0 && (
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'linear-gradient(135deg, #FDF0D5 0%, #FFFFFF 100%)',
          borderRadius: '12px',
          border: '2px solid #FFD700',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#003049', margin: '0 0 0.5rem 0' }}>
            🎉 Great job! You've earned {earnedCount} achievement{earnedCount !== 1 ? 's' : ''}!
          </h3>
          <p style={{ color: '#669BBC', margin: 0 }}>
            Keep taking tests to unlock more badges and show off your progress!
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AchievementManager;
