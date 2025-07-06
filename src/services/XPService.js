import { SavedTestsService } from '../SavedTestsService';

// XP Point Values
export const XP_VALUES = {
  // Test Activities
  COMPLETE_TEST: 5,
  PERFECT_SCORE: 10,
  FAST_COMPLETION: 5, // Under 2 minutes
  LONG_TEST: 3, // 10+ questions
  
  // Creation Activities
  CREATE_TEST: 15,
  SHARE_TEST: 10,
  TAKE_SHARED_TEST: 8,
  
  // Engagement Activities
  DAILY_LOGIN: 2,
  WEEKLY_ACTIVE: 25,
  MONTHLY_ACTIVE: 100,
  
  // Achievement Bonuses (by rarity)
  BRONZE_ACHIEVEMENT: 10,
  SILVER_ACHIEVEMENT: 25,
  GOLD_ACHIEVEMENT: 50,
  PLATINUM_ACHIEVEMENT: 100
};

// Level Calculation
export const LEVEL_THRESHOLDS = [
  0,    // Level 1: 0-99
  100,  // Level 2: 100-249
  250,  // Level 3: 250-499
  500,  // Level 4: 500-899
  900,  // Level 5: 900-1399
  1400, // Level 6: 1400-1999
  2000, // Level 7: 2000-2699
  2700, // Level 8: 2700-3499
  3500, // Level 9: 3500-4399
  4400, // Level 10: 4400-5499
  5500, // Level 11: 5500-6799
  6800, // Level 12: 6800-8299
  8300, // Level 13: 8300-9999
  10000 // Level 14+: 10000+
];

// Level Titles
export const LEVEL_TITLES = {
  1: { title: "Novice Learner", icon: "📚", color: "#8B5A2B" },
  2: { title: "Eager Student", icon: "✏️", color: "#8B5A2B" },
  3: { title: "Quick Learner", icon: "💡", color: "#8B5A2B" },
  4: { title: "Bright Mind", icon: "🌟", color: "#8B5A2B" },
  5: { title: "Skilled Student", icon: "🎯", color: "#8B5A2B" },
  6: { title: "Dedicated Scholar", icon: "🎓", color: "#C0C0C0" },
  7: { title: "Knowledge Hunter", icon: "🔍", color: "#C0C0C0" },
  8: { title: "Wisdom Seeker", icon: "🧐", color: "#C0C0C0" },
  9: { title: "Learning Expert", icon: "🏅", color: "#C0C0C0" },
  10: { title: "Study Master", icon: "👨‍🎓", color: "#C0C0C0" },
  11: { title: "Quiz Champion", icon: "🏆", color: "#FFD700" },
  12: { title: "Knowledge Guru", icon: "🧠", color: "#FFD700" },
  13: { title: "Learning Legend", icon: "⭐", color: "#FFD700" },
  14: { title: "Education Expert", icon: "👨‍🏫", color: "#FFD700" },
  15: { title: "Wisdom Sage", icon: "🧙‍♂️", color: "#E5E4E2" }
};

export class XPService {
  static XP_STORAGE_KEY = 'user_xp_data';
  
  // Get user's XP data
  static getUserXP(userId) {
    const xpData = localStorage.getItem(`${this.XP_STORAGE_KEY}_${userId}`);
    if (!xpData) {
      return {
        totalXP: 0,
        level: 1,
        currentLevelXP: 0,
        nextLevelXP: LEVEL_THRESHOLDS[1],
        xpHistory: [],
        lastLogin: null,
        streak: 0
      };
    }
    return JSON.parse(xpData);
  }
  
  // Save user's XP data
  static saveUserXP(userId, xpData) {
    localStorage.setItem(`${this.XP_STORAGE_KEY}_${userId}`, JSON.stringify(xpData));
  }
  
  // Calculate level from total XP
  static calculateLevel(totalXP) {
    let level = 1;
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (totalXP >= LEVEL_THRESHOLDS[i]) {
        level = i + 1;
        break;
      }
    }
    return Math.min(level, 15); // Cap at level 15
  }
  
  // Get XP needed for next level
  static getXPForNextLevel(currentLevel) {
    if (currentLevel >= 15) return null; // Max level
    return LEVEL_THRESHOLDS[currentLevel] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + (currentLevel - 14) * 2000;
  }
  
  // Get current level XP (XP within current level)
  static getCurrentLevelXP(totalXP, level) {
    const levelStart = LEVEL_THRESHOLDS[level - 1] || 0;
    return totalXP - levelStart;
  }
  
  // Add XP to user
  static addXP(userId, points, source, metadata = {}) {
    const xpData = this.getUserXP(userId);
    const oldLevel = xpData.level;
    
    // Add XP
    xpData.totalXP += points;
    xpData.level = this.calculateLevel(xpData.totalXP);
    xpData.currentLevelXP = this.getCurrentLevelXP(xpData.totalXP, xpData.level);
    xpData.nextLevelXP = this.getXPForNextLevel(xpData.level);
    
    // Add to history
    xpData.xpHistory.push({
      points,
      source,
      timestamp: Date.now(),
      metadata,
      totalXP: xpData.totalXP,
      level: xpData.level
    });
    
    // Keep only last 100 history entries
    if (xpData.xpHistory.length > 100) {
      xpData.xpHistory = xpData.xpHistory.slice(-100);
    }
    
    this.saveUserXP(userId, xpData);
    
    // Return level up info
    return {
      xpData,
      leveledUp: xpData.level > oldLevel,
      oldLevel,
      newLevel: xpData.level,
      pointsGained: points
    };
  }
  
  // Award XP for test completion
  static awardTestCompletionXP(userId, testData) {
    let totalPoints = 0;
    let sources = [];
    
    // Base test completion
    totalPoints += XP_VALUES.COMPLETE_TEST;
    sources.push('Test Completed');
    
    // Perfect score bonus
    if (testData.score === testData.totalQuestions || (testData.score / testData.totalQuestions) === 1) {
      totalPoints += XP_VALUES.PERFECT_SCORE;
      sources.push('Perfect Score');
    }
    
    // Fast completion bonus (under 2 minutes)
    if (testData.completionTime && testData.completionTime < 120000) {
      totalPoints += XP_VALUES.FAST_COMPLETION;
      sources.push('Speed Bonus');
    }
    
    // Long test bonus (10+ questions)
    if (testData.totalQuestions >= 10) {
      totalPoints += XP_VALUES.LONG_TEST;
      sources.push('Long Test');
    }
    
    return this.addXP(userId, totalPoints, 'Test Completion', {
      testId: testData.id,
      score: testData.score,
      totalQuestions: testData.totalQuestions,
      completionTime: testData.completionTime,
      sources: sources.join(', ')
    });
  }
  
  // Award XP for test creation
  static awardTestCreationXP(userId, testData) {
    return this.addXP(userId, XP_VALUES.CREATE_TEST, 'Test Creation', {
      testId: testData.id,
      title: testData.title,
      questionCount: testData.questions?.length || 0
    });
  }
  
  // Award XP for achievement unlock
  static awardAchievementXP(userId, achievementData) {
    const rarityPoints = {
      'bronze': XP_VALUES.BRONZE_ACHIEVEMENT,
      'silver': XP_VALUES.SILVER_ACHIEVEMENT,
      'gold': XP_VALUES.GOLD_ACHIEVEMENT,
      'platinum': XP_VALUES.PLATINUM_ACHIEVEMENT
    };
    
    const points = rarityPoints[achievementData.rarity] || XP_VALUES.BRONZE_ACHIEVEMENT;
    
    return this.addXP(userId, points, 'Achievement Unlocked', {
      achievementId: achievementData.id,
      title: achievementData.title,
      rarity: achievementData.rarity
    });
  }
  
  // Check and award daily login XP
  static checkDailyLogin(userId) {
    const xpData = this.getUserXP(userId);
    const today = new Date().toDateString();
    const lastLogin = xpData.lastLogin ? new Date(xpData.lastLogin).toDateString() : null;
    
    if (lastLogin !== today) {
      // Award daily login XP
      const result = this.addXP(userId, XP_VALUES.DAILY_LOGIN, 'Daily Login');
      
      // Update streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();
      
      if (lastLogin === yesterdayStr) {
        result.xpData.streak += 1;
      } else if (lastLogin !== today) {
        result.xpData.streak = 1;
      }
      
      result.xpData.lastLogin = Date.now();
      this.saveUserXP(userId, result.xpData);
      
      return result;
    }
    
    return null;
  }
  
  // Get level title and info
  static getLevelInfo(level) {
    return LEVEL_TITLES[Math.min(level, 15)] || LEVEL_TITLES[15];
  }
  
  // Get XP progress percentage for current level
  static getLevelProgress(xpData) {
    if (xpData.level >= 15) return 100; // Max level
    
    const levelStart = LEVEL_THRESHOLDS[xpData.level - 1] || 0;
    const levelEnd = LEVEL_THRESHOLDS[xpData.level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    const levelSize = levelEnd - levelStart;
    const progress = (xpData.currentLevelXP / levelSize) * 100;
    
    return Math.min(progress, 100);
  }
  
  // Get recent XP gains (last 24 hours)
  static getRecentXPGains(userId, hours = 24) {
    const xpData = this.getUserXP(userId);
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    
    return xpData.xpHistory
      .filter(entry => entry.timestamp >= cutoff)
      .sort((a, b) => b.timestamp - a.timestamp);
  }
  
  // Get XP leaderboard (top users)
  static getLeaderboard(limit = 10) {
    const leaderboard = [];
    
    // Get all user XP data from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.XP_STORAGE_KEY)) {
        const userId = key.replace(`${this.XP_STORAGE_KEY}_`, '');
        const xpData = this.getUserXP(userId);
        leaderboard.push({
          userId,
          totalXP: xpData.totalXP,
          level: xpData.level,
          streak: xpData.streak
        });
      }
    }
    
    return leaderboard
      .sort((a, b) => b.totalXP - a.totalXP)
      .slice(0, limit);
  }
}

export default XPService;
