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

// Level Calculation - Exponential progression to Level 100
export const LEVEL_THRESHOLDS = (() => {
  const thresholds = [0]; // Level 1 starts at 0
  let currentXP = 100; // Level 2 starts at 100
  
  for (let level = 2; level <= 100; level++) {
    thresholds.push(currentXP);
    
    // Exponential scaling with slower growth after milestones
    let increment;
    if (level <= 10) {
      increment = Math.floor(currentXP * 0.6); // 60% increase for early levels
    } else if (level <= 25) {
      increment = Math.floor(currentXP * 0.4); // 40% increase for early-mid levels
    } else if (level <= 50) {
      increment = Math.floor(currentXP * 0.3); // 30% increase for mid levels
    } else if (level <= 75) {
      increment = Math.floor(currentXP * 0.25); // 25% increase for high levels
    } else {
      increment = Math.floor(currentXP * 0.2); // 20% increase for final levels
    }
    
    currentXP += Math.max(increment, 100); // Minimum 100 XP increase per level
  }
  
  return thresholds;
})();

// Medal Milestones - Special achievements for major level milestones
export const MEDAL_MILESTONES = {
  1: { 
    title: "First Steps Medal", 
    icon: "🥉", 
    color: "#CD7F32",
    description: "Welcome to your learning journey!",
    rarity: "bronze"
  },
  10: { 
    title: "Bronze Dedication Medal", 
    icon: "🥉", 
    color: "#CD7F32",
    description: "10 levels of consistent learning!",
    rarity: "bronze"
  },
  25: { 
    title: "Silver Achiever Medal", 
    icon: "🥈", 
    color: "#C0C0C0",
    description: "Quarter-century of knowledge mastery!",
    rarity: "silver"
  },
  50: { 
    title: "Gold Scholar Medal", 
    icon: "🥇", 
    color: "#FFD700",
    description: "Halfway to mastery - incredible dedication!",
    rarity: "gold"
  },
  75: { 
    title: "Platinum Expert Medal", 
    icon: "🏆", 
    color: "#E5E4E2",
    description: "Elite learner status achieved!",
    rarity: "platinum"
  },
  100: { 
    title: "Diamond Master Medal", 
    icon: "💎", 
    color: "#B9F2FF",
    description: "Ultimate mastery - you are a learning legend!",
    rarity: "diamond"
  }
};

// Level Titles - Expanded for 100 levels with themed progressions
export const LEVEL_TITLES = (() => {
  const titles = {};
  
  // Levels 1-10: Beginner Journey (📚 Bronze Theme)
  const beginnerTitles = [
    { title: "Novice Learner", icon: "📚", color: "#8B5A2B" },
    { title: "Eager Student", icon: "✏️", color: "#8B5A2B" },
    { title: "Quick Learner", icon: "💡", color: "#8B5A2B" },
    { title: "Bright Mind", icon: "🌟", color: "#8B5A2B" },
    { title: "Skilled Student", icon: "🎯", color: "#8B5A2B" },
    { title: "Rising Scholar", icon: "📖", color: "#8B5A2B" },
    { title: "Knowledge Seeker", icon: "🔍", color: "#8B5A2B" },
    { title: "Study Enthusiast", icon: "📝", color: "#8B5A2B" },
    { title: "Learning Adept", icon: "🎓", color: "#8B5A2B" },
    { title: "Dedicated Scholar", icon: "👨‍🎓", color: "#CD7F32" } // Bronze Medal Level
  ];
  
  // Levels 11-25: Intermediate Journey (🥈 Silver Theme)
  const intermediateTitles = [
    { title: "Knowledge Hunter", icon: "🔍", color: "#C0C0C0" },
    { title: "Wisdom Seeker", icon: "🧐", color: "#C0C0C0" },
    { title: "Study Master", icon: "👨‍🎓", color: "#C0C0C0" },
    { title: "Learning Expert", icon: "🏅", color: "#C0C0C0" },
    { title: "Academic Achiever", icon: "🎖️", color: "#C0C0C0" },
    { title: "Quiz Specialist", icon: "❓", color: "#C0C0C0" },
    { title: "Test Conqueror", icon: "⚔️", color: "#C0C0C0" },
    { title: "Knowledge Warrior", icon: "🛡️", color: "#C0C0C0" },
    { title: "Learning Champion", icon: "�", color: "#C0C0C0" },
    { title: "Skill Virtuoso", icon: "🎭", color: "#C0C0C0" },
    { title: "Academic Star", icon: "⭐", color: "#C0C0C0" },
    { title: "Study Prodigy", icon: "🧠", color: "#C0C0C0" },
    { title: "Knowledge Artisan", icon: "🎨", color: "#C0C0C0" },
    { title: "Learning Maverick", icon: "🚀", color: "#C0C0C0" },
    { title: "Silver Scholar", icon: "🥈", color: "#C0C0C0" } // Silver Medal Level
  ];
  
  // Levels 26-50: Advanced Journey (🥇 Gold Theme)
  const advancedTitles = [
    { title: "Gold Seeker", icon: "💰", color: "#FFD700" },
    { title: "Elite Learner", icon: "👑", color: "#FFD700" },
    { title: "Master Scholar", icon: "🧙‍♂️", color: "#FFD700" },
    { title: "Knowledge Sage", icon: "🦉", color: "#FFD700" },
    { title: "Academic Titan", icon: "⚡", color: "#FFD700" },
    { title: "Learning Genius", icon: "🧠", color: "#FFD700" },
    { title: "Quiz Master", icon: "🎯", color: "#FFD700" },
    { title: "Test Dominator", icon: "👨‍💼", color: "#FFD700" },
    { title: "Knowledge Oracle", icon: "🔮", color: "#FFD700" },
    { title: "Study Legend", icon: "📚", color: "#FFD700" },
    { title: "Academic Hero", icon: "🦸‍♂️", color: "#FFD700" },
    { title: "Learning Virtuoso", icon: "🎼", color: "#FFD700" },
    { title: "Wisdom Guardian", icon: "🛡️", color: "#FFD700" },
    { title: "Knowledge Emperor", icon: "👑", color: "#FFD700" },
    { title: "Elite Scholar", icon: "🎖️", color: "#FFD700" },
    { title: "Golden Mind", icon: "🧠", color: "#FFD700" },
    { title: "Learning Architect", icon: "🏗️", color: "#FFD700" },
    { title: "Quiz Overlord", icon: "👨‍💼", color: "#FFD700" },
    { title: "Study Mastermind", icon: "🧠", color: "#FFD700" },
    { title: "Knowledge Deity", icon: "⚡", color: "#FFD700" },
    { title: "Academic Luminary", icon: "🌟", color: "#FFD700" },
    { title: "Learning Phoenix", icon: "🔥", color: "#FFD700" },
    { title: "Wisdom Incarnate", icon: "👨‍🏫", color: "#FFD700" },
    { title: "Golden Scholar", icon: "🥇", color: "#FFD700" },
    { title: "Elite Gold Master", icon: "🏆", color: "#FFD700" } // Gold Medal Level
  ];
  
  // Levels 51-75: Expert Journey (🏆 Platinum Theme)
  const expertTitles = [
    { title: "Platinum Aspirant", icon: "💍", color: "#E5E4E2" },
    { title: "Supreme Learner", icon: "👑", color: "#E5E4E2" },
    { title: "Grandmaster Scholar", icon: "🧙‍♂️", color: "#E5E4E2" },
    { title: "Transcendent Mind", icon: "🌌", color: "#E5E4E2" },
    { title: "Ultimate Sage", icon: "🦉", color: "#E5E4E2" },
    { title: "Legendary Learner", icon: "🗿", color: "#E5E4E2" },
    { title: "Apex Scholar", icon: "⛰️", color: "#E5E4E2" },
    { title: "Supreme Master", icon: "👨‍💼", color: "#E5E4E2" },
    { title: "Eternal Student", icon: "♾️", color: "#E5E4E2" },
    { title: "Knowledge Immortal", icon: "🌟", color: "#E5E4E2" },
    { title: "Platinum Mind", icon: "🧠", color: "#E5E4E2" },
    { title: "Elite Grandmaster", icon: "👑", color: "#E5E4E2" },
    { title: "Supreme Intellect", icon: "🧠", color: "#E5E4E2" },
    { title: "Learning Paragon", icon: "⚡", color: "#E5E4E2" },
    { title: "Wisdom Ascendant", icon: "🌟", color: "#E5E4E2" },
    { title: "Platinum Prodigy", icon: "💫", color: "#E5E4E2" },
    { title: "Transcendent Scholar", icon: "🌌", color: "#E5E4E2" },
    { title: "Ultimate Master", icon: "🏆", color: "#E5E4E2" },
    { title: "Supreme Sage", icon: "�", color: "#E5E4E2" },
    { title: "Legendary Mind", icon: "🧠", color: "#E5E4E2" },
    { title: "Apex Learner", icon: "⛰️", color: "#E5E4E2" },
    { title: "Elite Immortal", icon: "♾️", color: "#E5E4E2" },
    { title: "Platinum Oracle", icon: "🔮", color: "#E5E4E2" },
    { title: "Supreme Deity", icon: "⚡", color: "#E5E4E2" },
    { title: "Platinum Master", icon: "🏆", color: "#E5E4E2" } // Platinum Medal Level
  ];
  
  // Levels 76-100: Legendary Journey (💎 Diamond Theme)
  const legendaryTitles = [
    { title: "Diamond Seeker", icon: "💎", color: "#B9F2FF" },
    { title: "Cosmic Scholar", icon: "🌌", color: "#B9F2FF" },
    { title: "Universal Mind", icon: "🌍", color: "#B9F2FF" },
    { title: "Infinite Learner", icon: "♾️", color: "#B9F2FF" },
    { title: "Omniscient Sage", icon: "👁️", color: "#B9F2FF" },
    { title: "Reality Bender", icon: "🌀", color: "#B9F2FF" },
    { title: "Knowledge God", icon: "⚡", color: "#B9F2FF" },
    { title: "Dimensional Scholar", icon: "🌌", color: "#B9F2FF" },
    { title: "Quantum Learner", icon: "⚛️", color: "#B9F2FF" },
    { title: "Celestial Mind", icon: "🌟", color: "#B9F2FF" },
    { title: "Eternal Wisdom", icon: "♾️", color: "#B9F2FF" },
    { title: "Diamond Intellect", icon: "💎", color: "#B9F2FF" },
    { title: "Cosmic Master", icon: "🌌", color: "#B9F2FF" },
    { title: "Universal Sage", icon: "🌍", color: "#B9F2FF" },
    { title: "Infinite Scholar", icon: "♾️", color: "#B9F2FF" },
    { title: "Transcendent God", icon: "⚡", color: "#B9F2FF" },
    { title: "Reality Master", icon: "🌀", color: "#B9F2FF" },
    { title: "Quantum Sage", icon: "⚛️", color: "#B9F2FF" },
    { title: "Dimensional Lord", icon: "🌌", color: "#B9F2FF" },
    { title: "Cosmic Deity", icon: "⚡", color: "#B9F2FF" },
    { title: "Diamond Oracle", icon: "💎", color: "#B9F2FF" },
    { title: "Universal God", icon: "🌍", color: "#B9F2FF" },
    { title: "Infinite Master", icon: "♾️", color: "#B9F2FF" },
    { title: "Legendary Sage", icon: "🗿", color: "#B9F2FF" },
    { title: "Diamond Emperor", icon: "👑", color: "#B9F2FF" } // Diamond Medal Level
  ];
  
  // Assign titles to levels
  beginnerTitles.forEach((title, index) => titles[index + 1] = title);
  intermediateTitles.forEach((title, index) => titles[index + 11] = title);
  advancedTitles.forEach((title, index) => titles[index + 26] = title);
  expertTitles.forEach((title, index) => titles[index + 51] = title);
  legendaryTitles.forEach((title, index) => titles[index + 76] = title);
  
  return titles;
})();

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
    return Math.min(level, 100); // Cap at level 100
  }
  
  // Get XP needed for next level
  static getXPForNextLevel(currentLevel) {
    if (currentLevel >= 100) return null; // Max level
    return LEVEL_THRESHOLDS[currentLevel] || null;
  }
  
  // Check if level is a medal milestone
  static isMedalMilestone(level) {
    return MEDAL_MILESTONES.hasOwnProperty(level);
  }
  
  // Get medal information for a level
  static getMedalInfo(level) {
    return MEDAL_MILESTONES[level] || null;
  }
  
  // Get all medals earned by user
  static getUserMedals(userId) {
    const xpData = this.getUserXP(userId);
    const medals = [];
    
    // Check each medal milestone
    Object.keys(MEDAL_MILESTONES).forEach(level => {
      const levelNum = parseInt(level);
      if (xpData.level >= levelNum) {
        medals.push({
          level: levelNum,
          ...MEDAL_MILESTONES[level],
          earned: true,
          earnedAt: this.findMedalEarnedDate(userId, levelNum)
        });
      }
    });
    
    return medals.sort((a, b) => a.level - b.level);
  }
  
  // Get next medal to earn
  static getNextMedal(userId) {
    const xpData = this.getUserXP(userId);
    const medalLevels = Object.keys(MEDAL_MILESTONES).map(l => parseInt(l)).sort((a, b) => a - b);
    
    for (let level of medalLevels) {
      if (xpData.level < level) {
        return {
          level,
          ...MEDAL_MILESTONES[level],
          progress: xpData.level / level,
          levelsRemaining: level - xpData.level
        };
      }
    }
    
    return null; // All medals earned
  }
  
  // Find when a medal was earned (approximate from XP history)
  static findMedalEarnedDate(userId, medalLevel) {
    const xpData = this.getUserXP(userId);
    
    // Find the history entry where the user first reached this level
    const historyEntry = xpData.xpHistory.find(entry => entry.level >= medalLevel);
    
    return historyEntry ? historyEntry.timestamp : null;
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
    return LEVEL_TITLES[Math.min(level, 100)] || LEVEL_TITLES[100];
  }
  
  // Get XP progress percentage for current level
  static getLevelProgress(xpData) {
    if (xpData.level >= 100) return 100; // Max level
    
    const levelStart = LEVEL_THRESHOLDS[xpData.level - 1] || 0;
    const levelEnd = LEVEL_THRESHOLDS[xpData.level] || null;
    
    if (!levelEnd) return 100; // If no next level, show complete
    
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
