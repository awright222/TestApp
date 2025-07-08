// 🔍 SIMPLE DEBUGGING COMMANDS
// Copy and paste these ONE AT A TIME in the browser console

// 1. First check if you're on the right page and localStorage works:
console.log('Page URL:', window.location.href); console.log('LocalStorage works:', typeof localStorage !== 'undefined');

// 2. Check what's currently in publishedTests:
console.log('Current publishedTests:', JSON.parse(localStorage.getItem('publishedTests') || '[]'));

// 3. Simple test addition (copy this as ONE BLOCK):
var simpleTest = {id: "test-123", title: "Simple Test", questions: [{id: 1, question_text: "Test?", question_type: "multiple choice", choices: "A. Yes\nB. No", correct_answer: "A"}], questionCount: 1, createdAt: new Date().toISOString()}; var tests = JSON.parse(localStorage.getItem('publishedTests') || '[]'); tests.unshift(simpleTest); localStorage.setItem('publishedTests', JSON.stringify(tests)); console.log('Test added, refreshing...'); location.reload();

// 4. If that works, then try the full showcase test (copy the SIMPLE_ADD_SHOWCASE_TEST.js file)
