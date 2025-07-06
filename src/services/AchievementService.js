import { ACHIEVEMENTS } from '../components/achievements/achievementData';

export class AchievementService {
  static checkTestCompletionAchievements(testData, allUserSavedTests = []) {
    const newAchievements = [];
    
    // Check if this is a newly completed test
    const { progress } = testData;
    const isCompleted = progress.completedQuestions === progress.totalQuestions;
    
    if (!isCompleted) {
      return newAchievements;
    }

    // Calculate score percentage
    const correctAnswers = progress.questionScore 
      ? Object.values(progress.questionScore).filter(score => score > 0).length 
      : 0;
    const scorePercentage = (correctAnswers / progress.totalQuestions) * 100;
    
    // Check FIRST_TEST achievement
    if (allUserSavedTests.length === 0) {
      newAchievements.push(ACHIEVEMENTS.FIRST_TEST);
    }
    
    // Check PERFECT_SCORE achievement
    if (scorePercentage === 100) {
      newAchievements.push(ACHIEVEMENTS.PERFECT_SCORE);
    }
    
    // Check SPEEDSTER achievement (if completion time is tracked)
    if (testData.completionTime && testData.completionTime < 120000) { // 2 minutes
      newAchievements.push(ACHIEVEMENTS.SPEEDSTER);
    }
    
    // Check SPEED_DEMON achievement (1 minute)
    if (testData.completionTime && testData.completionTime < 60000) { // 1 minute
      newAchievements.push(ACHIEVEMENTS.SPEED_DEMON);
    }
    
    // Check time-based achievements
    const testTime = new Date(testData.dateCreated || Date.now());
    const hour = testTime.getHours();
    
    // Night Owl (after 10 PM)
    if (hour >= 22 || hour < 6) {
      newAchievements.push(ACHIEVEMENTS.NIGHT_OWL);
    }
    
    // Early Bird (before 7 AM)
    if (hour < 7) {
      newAchievements.push(ACHIEVEMENTS.EARLY_BIRD);
    }
    
    // Check for other achievements based on total completed tests
    const totalCompletedTests = allUserSavedTests.filter(test => 
      test.progress?.completedQuestions === test.progress?.totalQuestions
    ).length + 1; // +1 for the current test
    
    if (totalCompletedTests >= 10) {
      newAchievements.push(ACHIEVEMENTS.QUIZ_MASTER);
    }
    
    if (totalCompletedTests >= 50) {
      newAchievements.push(ACHIEVEMENTS.SCHOLAR);
    }
    
    // Check PERFECTIONIST achievement (10 perfect scores)
    const perfectScoreTests = allUserSavedTests.filter(test => {
      if (!test.progress?.questionScore || !test.progress?.totalQuestions) return false;
      const correct = Object.values(test.progress.questionScore).filter(score => score > 0).length;
      return (correct / test.progress.totalQuestions) === 1;
    }).length + (scorePercentage === 100 ? 1 : 0);
    
    if (perfectScoreTests >= 10) {
      newAchievements.push(ACHIEVEMENTS.PERFECTIONIST);
    }
    
    return newAchievements;
  }
  
  static checkCreationAchievements(allUserCreatedTests = []) {
    const newAchievements = [];
    
    // Check TEST_CREATOR achievement
    if (allUserCreatedTests.length === 1) {
      newAchievements.push(ACHIEVEMENTS.TEST_CREATOR);
    }
    
    // Check MENTOR achievement (10 tests created)
    if (allUserCreatedTests.length >= 10) {
      newAchievements.push(ACHIEVEMENTS.MENTOR);
    }
    
    return newAchievements;
  }
  
  static checkStreakAchievements(allUserSavedTests = []) {
    const newAchievements = [];
    
    // Get completed tests sorted by date
    const completedTests = allUserSavedTests
      .filter(test => test.progress?.completedQuestions === test.progress?.totalQuestions)
      .filter(test => test.dateCreated)
      .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
    
    if (completedTests.length < 3) {
      return newAchievements;
    }
    
    // Check for streak
    let currentStreak = 1;
    let lastDate = new Date(completedTests[0].dateCreated);
    
    for (let i = 1; i < completedTests.length; i++) {
      const testDate = new Date(completedTests[i].dateCreated);
      const daysDiff = Math.floor((lastDate - testDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 1) {
        currentStreak++;
        lastDate = testDate;
      } else {
        break;
      }
    }
    
    if (currentStreak >= 3) {
      newAchievements.push(ACHIEVEMENTS.STREAK_STARTER);
    }
    
    if (currentStreak >= 30) {
      newAchievements.push(ACHIEVEMENTS.STREAK_MASTER);
    }
    
    return newAchievements;
  }
  
  static checkExplorationAchievements(allUserSavedTests = []) {
    const newAchievements = [];
    
    // Check KNOWLEDGE_SEEKER achievement (tests from different subjects)
    const subjects = new Set();
    allUserSavedTests.forEach(test => {
      if (test.subject) {
        subjects.add(test.subject);
      } else if (test.title) {
        // Try to infer subject from test title
        const title = test.title.toLowerCase();
        if (title.includes('math') || title.includes('algebra') || title.includes('geometry')) {
          subjects.add('math');
        } else if (title.includes('science') || title.includes('chemistry') || title.includes('physics')) {
          subjects.add('science');
        } else if (title.includes('history') || title.includes('social')) {
          subjects.add('history');
        } else if (title.includes('english') || title.includes('literature') || title.includes('reading')) {
          subjects.add('literature');
        } else if (title.includes('art') || title.includes('music')) {
          subjects.add('art');
        } else {
          subjects.add('general');
        }
      }
    });
    
    if (subjects.size >= 5) {
      newAchievements.push(ACHIEVEMENTS.KNOWLEDGE_SEEKER);
    }
    
    return newAchievements;
  }
  
  static async checkAllAchievements(testData, allUserSavedTests = [], allUserCreatedTests = []) {
    const newAchievements = [];
    
    // Check test completion achievements
    const completionAchievements = this.checkTestCompletionAchievements(testData, allUserSavedTests);
    newAchievements.push(...completionAchievements);
    
    // Check creation achievements
    const creationAchievements = this.checkCreationAchievements(allUserCreatedTests);
    newAchievements.push(...creationAchievements);
    
    // Check streak achievements
    const streakAchievements = this.checkStreakAchievements(allUserSavedTests);
    newAchievements.push(...streakAchievements);
    
    // Check exploration achievements
    const explorationAchievements = this.checkExplorationAchievements(allUserSavedTests);
    newAchievements.push(...explorationAchievements);
    
    // Remove duplicates
    const uniqueAchievements = newAchievements.filter((achievement, index, self) =>
      index === self.findIndex(a => a.id === achievement.id)
    );
    
    return uniqueAchievements;
  }

  // Check level milestone achievements
  static checkLevelAchievements(userLevel) {
    const newAchievements = [];
    
    // Level milestone achievements
    if (userLevel >= 10) {
      newAchievements.push(ACHIEVEMENTS.LEVEL_BRONZE);
    }
    
    if (userLevel >= 25) {
      newAchievements.push(ACHIEVEMENTS.LEVEL_SILVER);
    }
    
    if (userLevel >= 50) {
      newAchievements.push(ACHIEVEMENTS.LEVEL_GOLD);
    }
    
    if (userLevel >= 75) {
      newAchievements.push(ACHIEVEMENTS.LEVEL_PLATINUM);
    }
    
    if (userLevel >= 100) {
      newAchievements.push(ACHIEVEMENTS.LEVEL_DIAMOND);
    }
    
    return newAchievements;
  }

  // Check XP milestone achievements
  static checkXPAchievements(totalXP) {
    const newAchievements = [];
    
    // XP milestone achievements
    if (totalXP >= 1000) {
      newAchievements.push(ACHIEVEMENTS.XP_COLLECTOR);
    }
    
    if (totalXP >= 10000) {
      newAchievements.push(ACHIEVEMENTS.XP_HOARDER);
    }
    
    if (totalXP >= 100000) {
      newAchievements.push(ACHIEVEMENTS.XP_MASTER);
    }
    
    if (totalXP >= 1000000) {
      newAchievements.push(ACHIEVEMENTS.XP_LEGEND);
    }
    
    return newAchievements;
  }

  // Combined check for level and XP achievements
  static checkProgressAchievements(userLevel, totalXP) {
    const levelAchievements = this.checkLevelAchievements(userLevel);
    const xpAchievements = this.checkXPAchievements(totalXP);
    
    return [...levelAchievements, ...xpAchievements];
  }
}

export default AchievementService;
