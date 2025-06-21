// Run this in your browser console to diagnose the loading issue

console.log('=== PRACTICE TEST LOADING DIAGNOSTIC ===');

// Function to check all test storage locations
function diagnosticCheck() {
  console.log('\n🔍 1. CHECKING ALL TEST STORAGE LOCATIONS...');
  
  // Check published tests (localStorage)
  const publishedTests = localStorage.getItem('publishedTests');
  console.log('\n📚 Published Tests (localStorage):');
  if (publishedTests) {
    try {
      const tests = JSON.parse(publishedTests);
      console.log(`Found ${tests.length} published tests`);
      tests.forEach((test, i) => {
        console.log(`  ${i+1}. "${test.title}" (${test.questions?.length || 0} questions)`);
        if (test.title && test.title.includes('MB-800')) {
          console.log(`    🎯 FOUND MB-800 TEST!`);
          console.log(`    - ID: ${test.id}`);
          console.log(`    - Questions: ${test.questions ? test.questions.length : 'MISSING'}`);
          console.log(`    - First question:`, test.questions?.[0]);
        }
      });
    } catch (e) {
      console.error('Error parsing publishedTests:', e);
    }
  } else {
    console.log('No published tests found');
  }
  
  // Check created tests (localStorage)
  const createdTests = localStorage.getItem('created_tests');
  console.log('\n🔧 Created Tests (localStorage):');
  if (createdTests) {
    try {
      const tests = JSON.parse(createdTests);
      console.log(`Found ${tests.length} created tests`);
      tests.forEach((test, i) => {
        console.log(`  ${i+1}. "${test.title}" (${test.questions?.length || 0} questions)`);
      });
    } catch (e) {
      console.error('Error parsing created_tests:', e);
    }
  } else {
    console.log('No created tests found');
  }
  
  // Check current URL
  console.log('\n🌐 Current URL Analysis:');
  console.log(`URL: ${window.location.href}`);
  console.log(`Pathname: ${window.location.pathname}`);
  
  // Check if URL has test ID
  const pathMatch = window.location.pathname.match(/\/practice\/(.+)/);
  if (pathMatch) {
    const testId = pathMatch[1];
    console.log(`🎯 Test ID from URL: "${testId}"`);
    
    // Check if this ID exists in any storage
    let foundInPublished = false;
    let foundInCreated = false;
    
    if (publishedTests) {
      const published = JSON.parse(publishedTests);
      foundInPublished = published.some(test => test.id === testId);
    }
    
    if (createdTests) {
      const created = JSON.parse(createdTests);
      foundInCreated = created.some(test => test.id === testId);
    }
    
    console.log(`❌ Test ID "${testId}" found in publishedTests: ${foundInPublished}`);
    console.log(`❌ Test ID "${testId}" found in created_tests: ${foundInCreated}`);
    
    if (!foundInPublished && !foundInCreated) {
      console.log('🚨 ISSUE FOUND: Test ID not found in any storage!');
      console.log('This explains the infinite loading - the test cannot be loaded');
    }
  } else {
    console.log('No test ID found in URL');
  }
}

// Function to check React component state
function checkReactState() {
  console.log('\n🔍 2. CHECKING REACT COMPONENT STATE...');
  console.log('Open browser console and look for these messages:');
  console.log('- "PracticeTestContainer: Loaded custom test:"');
  console.log('- "PracticeTestNew: SIMPLE useEffect triggered"');
  console.log('- "PracticeTestNew: selectedTest object:"');
  console.log('- "PracticeTestNew: Initialization complete"');
}

// Function to simulate the loading process
function simulateLoading() {
  console.log('\n🔍 3. SIMULATING LOADING PROCESS...');
  
  const pathMatch = window.location.pathname.match(/\/practice\/(.+)/);
  if (!pathMatch) {
    console.log('❌ No test ID in URL - cannot simulate');
    return;
  }
  
  const testId = pathMatch[1];
  console.log(`Simulating load for test ID: "${testId}"`);
  
  // Check created tests (this is what CreatedTestsService.getTestById does)
  const createdTests = localStorage.getItem('created_tests');
  if (createdTests) {
    try {
      const tests = JSON.parse(createdTests);
      const foundTest = tests.find(test => test.id === testId);
      
      if (foundTest) {
        console.log('✅ Test found in created_tests:', foundTest);
        if (foundTest.questions && Array.isArray(foundTest.questions)) {
          console.log(`✅ Test has ${foundTest.questions.length} questions`);
          console.log('✅ Loading should work');
        } else {
          console.log('❌ Test missing questions array');
        }
      } else {
        console.log('❌ Test NOT found in created_tests');
        console.log('🚨 This causes the infinite loading!');
        
        // Check if it exists in published tests instead
        const publishedTests = localStorage.getItem('publishedTests');
        if (publishedTests) {
          const published = JSON.parse(publishedTests);
          const foundInPublished = published.find(test => test.id === testId);
          if (foundInPublished) {
            console.log('ℹ️ BUT test found in publishedTests!');
            console.log('🔧 SOLUTION: The app is looking in wrong storage location');
          }
        }
      }
    } catch (e) {
      console.error('Error checking created_tests:', e);
    }
  } else {
    console.log('❌ No created_tests in localStorage at all');
  }
}

// Function to provide solutions
function provideSolutions() {
  console.log('\n🔧 4. POSSIBLE SOLUTIONS...');
  
  const pathMatch = window.location.pathname.match(/\/practice\/(.+)/);
  if (pathMatch) {
    const testId = pathMatch[1];
    
    console.log('If test is found in publishedTests but not created_tests:');
    console.log('SOLUTION 1: Update PracticeTestContainer to also check publishedTests');
    console.log('SOLUTION 2: Move test from publishedTests to created_tests');
    console.log('');
    console.log('If test is not found anywhere:');
    console.log('SOLUTION 3: The test ID in URL is wrong or test was deleted');
    console.log('SOLUTION 4: Go back to test selection and choose test again');
    console.log('');
    console.log('To manually fix localStorage:');
    console.log(`// Copy test from publishedTests to created_tests
const published = JSON.parse(localStorage.getItem('publishedTests') || '[]');
const created = JSON.parse(localStorage.getItem('created_tests') || '[]');
const testToCopy = published.find(t => t.id === '${testId}');
if (testToCopy) {
  created.push(testToCopy);
  localStorage.setItem('created_tests', JSON.stringify(created));
  location.reload();
}`);
  }
}

// Run all diagnostics
diagnosticCheck();
checkReactState();
simulateLoading();
provideSolutions();

// Make functions available globally
window.diagnosticCheck = diagnosticCheck;
window.checkReactState = checkReactState;
window.simulateLoading = simulateLoading;
window.provideSolutions = provideSolutions;
