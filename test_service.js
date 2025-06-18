// Test the CreatedTestsService directly
const { CreatedTestsService } = require('./src/services/CreatedTestsService');

async function testService() {
  console.log('Testing CreatedTestsService...');
  
  // Clear any existing data
  localStorage.clear();
  
  // Test creating a test
  const testData = {
    title: 'Debug Test',
    description: 'A test created for debugging',
    questions: [
      {
        question_text: 'What is 2+2?',
        question_type: 'multiple choice',
        choices: 'A) 3\nB) 4\nC) 5\nD) 6',
        correct_answer: 'B',
        explanation: '2+2=4'
      }
    ]
  };
  
  try {
    const result = await CreatedTestsService.createTest(testData);
    console.log('Test created:', result);
    
    // Now test retrieving tests
    const allTests = await CreatedTestsService.getCreatedTests();
    console.log('Retrieved tests:', allTests);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testService();
