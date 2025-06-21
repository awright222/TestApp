// Debug script to help troubleshoot the infinite loading issue
console.log('=== PRACTICE TEST LOADING DEBUG ===');

// Check current localStorage data
function debugTestData() {
  console.log('\n🔍 CHECKING TEST DATA IN LOCALSTORAGE...');
  
  // Check published tests
  const publishedTests = localStorage.getItem('publishedTests');
  if (publishedTests) {
    try {
      const tests = JSON.parse(publishedTests);
      console.log('✅ Published Tests found:', tests.length, 'tests');
      
      tests.forEach((test, index) => {
        console.log(`Test ${index + 1}:`, {
          title: test.title,
          id: test.id,
          questionsCount: test.questions ? test.questions.length : 'NO QUESTIONS ARRAY',
          questionsPreview: test.questions ? test.questions.slice(0, 2) : 'N/A'
        });
        
        // Check specific test structure
        if (test.title && test.title.includes('MB-800')) {
          console.log('🎯 FOUND MB-800 TEST - Detailed inspection:');
          console.log('- Title:', test.title);
          console.log('- Has questions array:', !!test.questions);
          console.log('- Questions length:', test.questions ? test.questions.length : 0);
          console.log('- First question structure:', test.questions?.[0]);
          
          if (test.questions && test.questions.length > 0) {
            test.questions.forEach((q, qIndex) => {
              console.log(`  Question ${qIndex + 1}:`, {
                hasQuestionType: !!q.question_type,
                hasQuestionText: !!q.question_text,
                questionType: q.question_type,
                questionText: q.question_text?.substring(0, 50) + '...'
              });
            });
          }
        }
      });
    } catch (error) {
      console.error('❌ Error parsing published tests:', error);
    }
  } else {
    console.log('❌ No published tests found in localStorage');
  }
  
  // Check saved tests
  const savedTests = localStorage.getItem('savedTests');
  if (savedTests) {
    try {
      const tests = JSON.parse(savedTests);
      console.log('✅ Saved Tests found:', tests.length, 'tests');
    } catch (error) {
      console.error('❌ Error parsing saved tests:', error);
    }
  } else {
    console.log('ℹ️ No saved tests found in localStorage');
  }
}

// Check React component state (run this in browser console)
function debugReactState() {
  console.log('\n🔍 CHECKING REACT COMPONENT STATE...');
  console.log('This function should be run in the browser console while on the practice test page');
  console.log('Look for these console messages from PracticeTestNew:');
  console.log('- "PracticeTestNew: Component function called"');
  console.log('- "PracticeTestNew: SIMPLE useEffect triggered"');
  console.log('- "PracticeTestNew: Setting up questions"');
  console.log('- "PracticeTestNew: Initialization complete"');
}

// Manual test loading simulation
function simulateTestLoading() {
  console.log('\n🔍 SIMULATING TEST LOADING...');
  
  const publishedTests = localStorage.getItem('publishedTests');
  if (!publishedTests) {
    console.log('❌ No tests in localStorage to simulate');
    return;
  }
  
  try {
    const tests = JSON.parse(publishedTests);
    const mbTest = tests.find(test => test.title && test.title.includes('MB-800'));
    
    if (mbTest) {
      console.log('🎯 Found MB-800 test, simulating loading...');
      console.log('selectedTest:', {
        title: mbTest.title,
        hasQuestions: !!mbTest.questions,
        questionsLength: mbTest.questions?.length
      });
      
      // Simulate the useEffect logic
      if (!mbTest || !mbTest.questions) {
        console.log('❌ ISSUE: No test or no questions array');
        return;
      }
      
      console.log('✅ Test and questions found, simulating initialization...');
      console.log('Questions count:', mbTest.questions.length);
      
      // Check each question structure
      mbTest.questions.forEach((q, index) => {
        if (!q) {
          console.log(`❌ Question ${index + 1} is null/undefined`);
        } else if (!q.question_type) {
          console.log(`❌ Question ${index + 1} missing question_type`);
        } else if (!q.question_text) {
          console.log(`❌ Question ${index + 1} missing question_text`);
        } else {
          console.log(`✅ Question ${index + 1} looks valid`);
        }
      });
      
    } else {
      console.log('❌ No MB-800 test found in localStorage');
    }
  } catch (error) {
    console.error('❌ Error simulating test loading:', error);
  }
}

// Browser console helper functions
console.log('\n📋 DEBUGGING FUNCTIONS AVAILABLE:');
console.log('Run these in your browser console:');
console.log('1. debugTestData() - Check localStorage test data');
console.log('2. debugReactState() - Check React component state');
console.log('3. simulateTestLoading() - Simulate the loading process');

// Auto-run the localStorage check
debugTestData();
simulateTestLoading();

// Export for browser use
if (typeof window !== 'undefined') {
  window.debugTestData = debugTestData;
  window.debugReactState = debugReactState;
  window.simulateTestLoading = simulateTestLoading;
}

module.exports = { debugTestData, debugReactState, simulateTestLoading };
