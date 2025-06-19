// Simple debug script to check saved test structure
const testStructure = () => {
  const saved = localStorage.getItem('saved_tests');
  if (saved) {
    const tests = JSON.parse(saved);
    console.log('Found saved tests:', tests.length);
    
    tests.forEach((test, index) => {
      console.log(`\n=== Test ${index + 1}: ${test.title} ===`);
      console.log('ID:', test.id);
      console.log('Type:', test.type);
      console.log('Questions count:', test.questions?.length || 0);
      console.log('Original test metadata:', test.originalTest);
      
      if (test.questions && test.questions.length > 0) {
        const firstQuestion = test.questions[0];
        console.log('First question preview:', firstQuestion.question?.substring(0, 100) + '...');
        
        // Check for Microsoft exam patterns
        const allText = test.questions.slice(0, 3).map(q => q.question || '').join(' ');
        console.log('Contains MB-800:', allText.includes('MB-800'));
        console.log('Contains Dynamics:', allText.toLowerCase().includes('dynamics'));
        console.log('Contains Business Central:', allText.toLowerCase().includes('business central'));
      }
    });
  } else {
    console.log('No saved tests found in localStorage');
  }
};

testStructure();
