// Test script to verify achievement filtering works correctly
const { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES } = require('./src/components/achievements/achievementData.js');

console.log('Testing Achievement Category Filtering...\n');

// Test 1: Count achievements per category
console.log('Achievement counts per category:');
Object.keys(ACHIEVEMENT_CATEGORIES).forEach(categoryKey => {
  const count = Object.values(ACHIEVEMENTS).filter(achievement => achievement.type === categoryKey).length;
  console.log(`${categoryKey}: ${count} achievements`);
});

// Test 2: Verify all achievements have valid categories
console.log('\nVerifying all achievements have valid categories:');
let allValid = true;
Object.values(ACHIEVEMENTS).forEach(achievement => {
  if (!ACHIEVEMENT_CATEGORIES[achievement.type]) {
    console.log(`❌ Achievement ${achievement.id} has invalid category: ${achievement.type}`);
    allValid = false;
  }
});

if (allValid) {
  console.log('✅ All achievements have valid categories!');
}

// Test 3: List achievements by category
console.log('\nAchievements by category:');
Object.keys(ACHIEVEMENT_CATEGORIES).forEach(categoryKey => {
  const categoryAchievements = Object.values(ACHIEVEMENTS).filter(achievement => achievement.type === categoryKey);
  console.log(`\n${ACHIEVEMENT_CATEGORIES[categoryKey].name} (${categoryKey}):`);
  categoryAchievements.forEach(achievement => {
    console.log(`  - ${achievement.title} (${achievement.id})`);
  });
});

console.log('\n✅ Achievement filtering test completed!');
