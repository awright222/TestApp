// 🎯 SIMPLE DEMO TEST - Paste in browser console on localhost:3000

console.log('🎯 Testing Demo System...');

// 1. Test seed test exists
const tests = JSON.parse(localStorage.getItem('publishedTests') || '[]');
const seedTest = tests.find(t => t.isSeedTest || t.title.includes('Welcome'));
console.log(seedTest ? '✅ Seed test found' : '❌ No seed test');

// 2. Check demo button availability  
const buttons = [...document.querySelectorAll('button')];
const demoBtn = buttons.find(b => b.textContent.includes('Demo'));
console.log(demoBtn ? '✅ Demo button available' : '⚠️ Open Sign In modal first');

// 3. Quick seed test creation for verification
const quickSeed = {
  id: 'quick-test-' + Date.now(),
  title: '🧪 Quick Verification',
  description: 'Testing seed functionality',
  questions: [{
    id: 'q1',
    question_text: 'Demo system working?',
    question_type: 'multiple choice', 
    choices: 'A. Yes\nB. No',
    correct_answer: 'A',
    explanation: 'Success!'
  }],
  settings: { timeLimit: 0 },
  questionCount: 1,
  createdAt: new Date().toISOString(),
  isSeedTest: true
};

const currentTests = JSON.parse(localStorage.getItem('publishedTests') || '[]');
currentTests.unshift(quickSeed);
localStorage.setItem('publishedTests', JSON.stringify(currentTests));

console.log('✅ Quick test added - refresh to see!');
console.log('🎉 Demo system ready!');
