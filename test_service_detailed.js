console.log('=== Testing Created Tests Service ===');

// First clear any existing data
localStorage.clear();
console.log('1. localStorage cleared');

// Import the service (this won't work in Node, but shows the structure)
// const { CreatedTestsService } = require('./src/services/CreatedTestsService');

// Simulate the CreatedTestsService functionality
const STORAGE_KEY = 'created_tests';

const CreatedTestsService = {
  async getCreatedTests() {
    try {
      console.log('CreatedTestsService.getCreatedTests called');
      const storedTests = localStorage.getItem(STORAGE_KEY);
      console.log('Raw stored data:', storedTests);
      
      if (!storedTests) {
        console.log('No stored tests found, returning empty array');
        return [];
      }
      
      const allTests = JSON.parse(storedTests);
      console.log('Parsed tests:', allTests);
      
      if (!Array.isArray(allTests)) {
        console.warn('Invalid stored tests data, resetting...');
        localStorage.removeItem(STORAGE_KEY);
        return [];
      }
      
      console.log('Returning tests:', allTests);
      return allTests;
    } catch (error) {
      console.error('Error loading created tests:', error);
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  },

  async createTest(testData) {
    try {
      console.log('CreatedTestsService.createTest called with:', testData);
      const existingTests = await this.getCreatedTests();
      console.log('Existing tests:', existingTests);
      
      const newTest = {
        id: Date.now().toString(),
        title: testData.title,
        description: testData.description || '',
        questions: testData.questions || [],
        questionCount: (testData.questions || []).length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: testData.source || 'builder',
        difficulty: testData.difficulty || 'Intermediate',
        icon: testData.icon || '📝',
        color: testData.color || '#669BBC',
        csvUrl: testData.csvUrl || null,
        isActive: true
      };

      console.log('Creating new test:', newTest);
      const updatedTests = [...existingTests, newTest];
      console.log('All tests after creation:', updatedTests);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTests));
      
      const savedData = localStorage.getItem(STORAGE_KEY);
      console.log('Saved data verification:', savedData);
      
      return newTest;
    } catch (error) {
      console.error('Error creating test:', error);
      throw new Error('Failed to create test');
    }
  }
};

// Test the functionality
(async function testService() {
  console.log('\n2. Testing getCreatedTests (should be empty):');
  const initialTests = await CreatedTestsService.getCreatedTests();
  console.log('Initial tests:', initialTests);

  console.log('\n3. Creating a test:');
  const testData = {
    title: 'Test #1',
    description: 'First test',
    questions: [{ question_text: 'What is 1+1?', correct_answer: '2' }]
  };
  
  const createdTest = await CreatedTestsService.createTest(testData);
  console.log('Created test:', createdTest);

  console.log('\n4. Getting tests again (should have 1):');
  const testsAfterCreation = await CreatedTestsService.getCreatedTests();
  console.log('Tests after creation:', testsAfterCreation);

  console.log('\n5. Creating another test:');
  const testData2 = {
    title: 'Test #2',
    description: 'Second test',
    questions: [
      { question_text: 'What is 2+2?', correct_answer: '4' },
      { question_text: 'What is 3+3?', correct_answer: '6' }
    ]
  };
  
  const createdTest2 = await CreatedTestsService.createTest(testData2);
  console.log('Created test 2:', createdTest2);

  console.log('\n6. Final test count:');
  const finalTests = await CreatedTestsService.getCreatedTests();
  console.log('Final tests:', finalTests);
  console.log('Total tests:', finalTests.length);
})();

console.log('\n=== Test Complete ===');
