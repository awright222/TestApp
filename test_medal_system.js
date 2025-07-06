// Test script to verify medal system functionality
const XPService = require('./src/services/XPService.js');

console.log('Testing Medal System...\n');

// Test 1: Check medal milestones
console.log('Medal Milestones:');
const medalLevels = [1, 10, 25, 50, 75, 100];
medalLevels.forEach(level => {
  const medalInfo = XPService.MEDAL_MILESTONES[level];
  if (medalInfo) {
    console.log(`Level ${level}: ${medalInfo.icon} ${medalInfo.title} (${medalInfo.rarity})`);
  }
});

// Test 2: Simulate user progression
console.log('\nSimulating User Progression:');
const testUserId = 'test_user_medals';

// Clear previous test data
if (typeof localStorage !== 'undefined') {
  localStorage.removeItem(`user_xp_data_${testUserId}`);
}

// Add XP to reach different levels
const xpToAdd = [
  { amount: 100, source: 'Initial test completion' },
  { amount: 300, source: 'Multiple tests' },
  { amount: 1000, source: 'Achievement bonus' },
  { amount: 2000, source: 'Weekly active bonus' },
  { amount: 5000, source: 'Big milestone' }
];

xpToAdd.forEach((xp, index) => {
  const result = XPService.default.addXP(testUserId, xp.amount, xp.source);
  console.log(`\nAfter ${xp.source}:`);
  console.log(`- Total XP: ${result.xpData.totalXP}`);
  console.log(`- Level: ${result.xpData.level}`);
  console.log(`- Level up: ${result.leveledUp ? 'Yes' : 'No'}`);
  
  // Check if this level has a medal
  if (XPService.default.isMedalMilestone(result.xpData.level)) {
    const medalInfo = XPService.default.getMedalInfo(result.xpData.level);
    console.log(`- 🏅 MEDAL EARNED: ${medalInfo.icon} ${medalInfo.title}`);
  }
});

// Test 3: Check user medals
console.log('\nUser Medals Summary:');
const userMedals = XPService.default.getUserMedals(testUserId);
console.log(`Total medals earned: ${userMedals.length}`);
userMedals.forEach(medal => {
  console.log(`- ${medal.icon} ${medal.title} (Level ${medal.level})`);
});

// Test 4: Check next medal
console.log('\nNext Medal Target:');
const nextMedal = XPService.default.getNextMedal(testUserId);
if (nextMedal) {
  console.log(`- ${nextMedal.icon} ${nextMedal.title} (Level ${nextMedal.level})`);
  console.log(`- Progress: ${Math.round(nextMedal.progress * 100)}%`);
  console.log(`- Levels remaining: ${nextMedal.levelsRemaining}`);
} else {
  console.log('- All medals earned!');
}

console.log('\n✅ Medal system test completed!');
