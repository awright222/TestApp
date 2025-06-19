// Test console script - paste this in browser console
console.log('=== Testing TestTitleInference ===');

// Mock test data similar to what your saved test might look like
const mockSavedTest = {
  title: 'LAST??',
  questions: [
    {
      question: 'You are setting up Microsoft Dynamics 365 Business Central for a client. Which of the following is the correct way to configure the general ledger?'
    },
    {
      question: 'In MB-800 certification, what is the primary purpose of the Chart of Accounts in Business Central?'
    }
  ]
};

// Test the inference
console.log('Mock test title:', mockSavedTest.title);
console.log('Mock questions:', mockSavedTest.questions.map(q => q.question.substring(0, 50) + '...'));

// Test if patterns work
const allText = mockSavedTest.questions.map(q => q.question).join(' ');
console.log('All text contains MB-800:', allText.includes('MB-800'));
console.log('All text contains Dynamics:', allText.toLowerCase().includes('dynamics'));
console.log('All text contains Business Central:', allText.toLowerCase().includes('business central'));

// Test the MB-800 pattern
const mb800Pattern = /MB-800|Dynamics 365 Business Central/i;
console.log('MB-800 pattern test:', mb800Pattern.test(allText));

console.log('=== End Test ===');
