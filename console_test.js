// Console test script
// Copy and paste this into the browser console to test

console.log('=== MANUAL TEST ===');

// Check localStorage directly
console.log('localStorage.getItem("saved_tests"):', localStorage.getItem('saved_tests'));
console.log('localStorage.getItem("created_tests"):', localStorage.getItem('created_tests'));

// Check all localStorage keys
console.log('All localStorage keys:', Object.keys(localStorage));

// Test manual save
const testData = {
  id: Date.now().toString(),
  title: 'Manual Console Test',
  type: 'practice-test',
  dateCreated: new Date().toISOString(),
  dateModified: new Date().toISOString()
};

console.log('Saving test data:', testData);

// Manual localStorage save
const currentTests = JSON.parse(localStorage.getItem('saved_tests') || '[]');
currentTests.push(testData);
localStorage.setItem('saved_tests', JSON.stringify(currentTests));

console.log('After manual save:', localStorage.getItem('saved_tests'));

// Test retrieval
const retrievedTests = JSON.parse(localStorage.getItem('saved_tests') || '[]');
console.log('Retrieved tests:', retrievedTests);
