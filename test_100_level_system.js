// Test to verify level thresholds for 100-level system
console.log('Testing 100-Level XP System...\n');

// Import the level thresholds - for testing purposes we'll recreate the logic
const LEVEL_THRESHOLDS = (() => {
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

console.log('Level thresholds for key levels:');
console.log('Level 1:', LEVEL_THRESHOLDS[0]?.toLocaleString() || 0);
console.log('Level 10:', LEVEL_THRESHOLDS[9]?.toLocaleString() || 0);
console.log('Level 25:', LEVEL_THRESHOLDS[24]?.toLocaleString() || 0);
console.log('Level 50:', LEVEL_THRESHOLDS[49]?.toLocaleString() || 0);
console.log('Level 75:', LEVEL_THRESHOLDS[74]?.toLocaleString() || 0);
console.log('Level 100:', LEVEL_THRESHOLDS[99]?.toLocaleString() || 0);

console.log('\nTotal levels created:', LEVEL_THRESHOLDS.length);
console.log('Final level XP requirement:', LEVEL_THRESHOLDS[99]?.toLocaleString() || 0);

// Test medal milestones
const medalLevels = [1, 10, 25, 50, 75, 100];
console.log('\nMedal Milestones:');
medalLevels.forEach(level => {
  const xpNeeded = LEVEL_THRESHOLDS[level - 1] || 0;
  console.log(`Level ${level}: ${xpNeeded.toLocaleString()} XP`);
});

console.log('\n✅ 100-level system test completed!');
