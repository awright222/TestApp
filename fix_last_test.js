// Manual fix for "LAST??" test - paste this in browser console
const fixLastTest = async () => {
  console.log('🔧 Starting manual fix for LAST?? test...');
  
  // Get saved tests from localStorage
  const saved = localStorage.getItem('saved_tests');
  if (!saved) {
    console.log('❌ No saved tests found');
    return;
  }
  
  const tests = JSON.parse(saved);
  console.log('📄 Found', tests.length, 'saved tests');
  
  // Show all test titles
  console.log('📋 All saved test titles:');
  tests.forEach((test, index) => {
    console.log(`  ${index + 1}. "${test.title}" (ID: ${test.id})`);
  });
  
  // Find the LAST?? test (try different variations)
  let lastTest = tests.find(test => test.title === 'LAST??');
  if (!lastTest) {
    lastTest = tests.find(test => test.title.includes('LAST'));
  }
  if (!lastTest) {
    lastTest = tests.find(test => test.title.includes('??'));
  }
  
  if (!lastTest) {
    console.log('❌ Could not find test with LAST or ?? in the title');
    console.log('💡 Please check the titles above and run: fixSpecificTest("exact_title_here")');
    return;
  }
  
  console.log('✅ Found LAST?? test:', lastTest.id);
  console.log('📊 Questions count:', lastTest.questions?.length || 0);
  
  if (lastTest.questions && lastTest.questions.length > 0) {
    // Check first few questions for MB-800/Dynamics content
    const firstQuestions = lastTest.questions.slice(0, 3);
    const allText = firstQuestions.map(q => q.question || '').join(' ');
    
    console.log('🔍 Analyzing first 3 questions...');
    console.log('First question preview:', firstQuestions[0]?.question?.substring(0, 100) + '...');
    
    // Check for MB-800 patterns
    const hasMB800 = allText.includes('MB-800') || allText.includes('mb-800') || allText.includes('MB 800');
    const hasDynamics = allText.toLowerCase().includes('dynamics');
    const hasBusinessCentral = allText.toLowerCase().includes('business central');
    
    console.log('🔍 Pattern detection:');
    console.log('  - Has MB-800:', hasMB800);
    console.log('  - Has Dynamics:', hasDynamics);
    console.log('  - Has Business Central:', hasBusinessCentral);
    
    if (hasMB800 || (hasDynamics && hasBusinessCentral)) {
      // Update the test with proper originalTest metadata
      lastTest.originalTest = {
        title: 'MB-800: Microsoft Dynamics 365 Business Central Functional Consultant',
        color: '#669BBC',
        _manuallyFixed: true,
        _fixedAt: new Date().toISOString()
      };
      
      // Save back to localStorage
      localStorage.setItem('saved_tests', JSON.stringify(tests));
      
      console.log('✅ Successfully fixed LAST?? test!');
      console.log('🎯 Original title set to:', lastTest.originalTest.title);
      console.log('💾 Saved to localStorage');
      console.log('🔄 Refresh the page to see the changes');
      
      return true;
    } else {
      console.log('❌ Could not detect MB-800 content in questions');
      console.log('📝 Sample question text:', allText.substring(0, 200) + '...');
      return false;
    }
  } else {
    console.log('❌ No questions found in LAST?? test');
    return false;
  }
};

// Function to fix a specific test by exact title
const fixSpecificTest = async (testTitle) => {
  console.log(`🔧 Starting manual fix for "${testTitle}" test...`);
  
  const saved = localStorage.getItem('saved_tests');
  if (!saved) {
    console.log('❌ No saved tests found');
    return;
  }
  
  const tests = JSON.parse(saved);
  const targetTest = tests.find(test => test.title === testTitle);
  
  if (!targetTest) {
    console.log(`❌ Test "${testTitle}" not found`);
    return;
  }
  
  console.log('✅ Found target test:', targetTest.id);
  console.log('📊 Questions count:', targetTest.questions?.length || 0);
  
  if (targetTest.questions && targetTest.questions.length > 0) {
    const firstQuestions = targetTest.questions.slice(0, 3);
    const allText = firstQuestions.map(q => q.question || '').join(' ');
    
    console.log('🔍 Analyzing first 3 questions...');
    console.log('First question preview:', firstQuestions[0]?.question?.substring(0, 100) + '...');
    
    const hasMB800 = allText.includes('MB-800') || allText.includes('mb-800') || allText.includes('MB 800');
    const hasDynamics = allText.toLowerCase().includes('dynamics');
    const hasBusinessCentral = allText.toLowerCase().includes('business central');
    
    console.log('🔍 Pattern detection:');
    console.log('  - Has MB-800:', hasMB800);
    console.log('  - Has Dynamics:', hasDynamics);
    console.log('  - Has Business Central:', hasBusinessCentral);
    
    if (hasMB800 || (hasDynamics && hasBusinessCentral)) {
      targetTest.originalTest = {
        title: 'MB-800: Microsoft Dynamics 365 Business Central Functional Consultant',
        color: '#669BBC',
        _manuallyFixed: true,
        _fixedAt: new Date().toISOString()
      };
      
      localStorage.setItem('saved_tests', JSON.stringify(tests));
      
      console.log('✅ Successfully fixed test!');
      console.log('🎯 Original title set to:', targetTest.originalTest.title);
      console.log('💾 Saved to localStorage');
      console.log('🔄 Refresh the page to see the changes');
      
      return true;
    } else {
      console.log('❌ Could not detect MB-800 content in questions');
      console.log('📝 Sample question text:', allText.substring(0, 200) + '...');
      return false;
    }
  } else {
    console.log('❌ No questions found in test');
    return false;
  }
};

// Make function available globally
window.fixSpecificTest = fixSpecificTest;

// Run the fix
fixLastTest();
