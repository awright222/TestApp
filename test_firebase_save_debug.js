console.log('=== Firebase Save Test ===');

// Test to verify Firebase save is being called when user is logged in
const testFirebaseSave = async () => {
  try {
    // Mock authentication state
    console.log('Checking current auth state...');
    
    // Import Firebase modules
    const { auth } = await import('./src/firebase/config.js');
    const SavedTestsService = (await import('./src/SavedTestsService.js')).default;
    
    console.log('Current user:', auth.currentUser?.email || 'not logged in');
    
    if (!auth.currentUser) {
      console.log('❌ User not logged in - cannot test Firebase save');
      return;
    }
    
    // Create test data with questions
    const testData = {
      id: Date.now().toString(),
      title: `Firebase Save Test ${new Date().toLocaleTimeString()}`,
      type: 'practice',
      score: 85,
      totalQuestions: 2,
      correctAnswers: 1,
      timeSpent: 120,
      progress: {
        current: 1,
        answers: { 0: 'A' },
        flagged: [],
        timeSpent: 60
      },
      questions: [
        {
          id: 1,
          question: "Test question 1?",
          choices: "A. Answer A\nB. Answer B\nC. Answer C\nD. Answer D",
          correct: "A",
          explanation: "Test explanation"
        },
        {
          id: 2,
          question: "Test question 2?",
          choices: "A. Answer A\nB. Answer B\nC. Answer C\nD. Answer D",
          correct: "B",
          explanation: "Test explanation 2"
        }
      ]
    };
    
    console.log('Test data created:', {
      id: testData.id,
      title: testData.title,
      questionsCount: testData.questions.length
    });
    
    // Attempt to save
    console.log('Calling SavedTestsService.saveTest...');
    const result = await SavedTestsService.saveTest(testData);
    
    console.log('Save result:', result);
    
    // Verify it was saved to Firebase by checking saved tests
    console.log('Checking saved tests...');
    const savedTests = await SavedTestsService.getSavedTests();
    console.log('All saved tests:', savedTests.map(t => ({ id: t.id, title: t.title, synced: t.synced })));
    
    const savedTest = savedTests.find(t => t.id === testData.id);
    if (savedTest) {
      console.log('✅ Test found in saved tests:', {
        id: savedTest.id,
        title: savedTest.title,
        synced: savedTest.synced,
        hasQuestions: !!savedTest.questions,
        questionsCount: savedTest.questions?.length || 0
      });
    } else {
      console.log('❌ Test not found in saved tests');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testFirebaseSave();
