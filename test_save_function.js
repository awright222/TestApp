// Quick test for SavedTestsService
// Run this in the browser console to test save functionality

const testSaveFunction = async () => {
  console.log('=== Testing SavedTestsService ===');
  
  // Simple test data
  const testData = {
    id: Date.now().toString(),
    title: 'Console Test Save',
    type: 'practice-test',
    progress: {
      current: 0,
      userAnswers: [],
      questionScore: [],
      questionSubmitted: [],
      totalQuestions: 1,
      completedQuestions: 0
    },
    questions: [{
      id: 1,
      text: 'Test question',
      choices: 'A. Option 1\nB. Option 2',
      correct_answer: 'A',
      question_type: 'multiple_choice'
    }],
    dateCreated: new Date().toISOString(),
    dateModified: new Date().toISOString()
  };
  
  try {
    console.log('Test data to save:', testData);
    
    // Import the service dynamically
    const { SavedTestsService } = await import('./src/SavedTestsService.js');
    
    console.log('Attempting to save...');
    const result = await SavedTestsService.saveTest(testData);
    console.log('Save result:', result);
    
    console.log('Retrieving saved tests...');
    const savedTests = await SavedTestsService.getSavedTests();
    console.log('All saved tests:', savedTests);
    
    console.log('Test completed successfully!');
    return true;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
};

// Make function available globally
window.testSaveFunction = testSaveFunction;

console.log('Test function loaded. Run testSaveFunction() in the browser console to test.');
