// Test script to demonstrate the points system functionality
const testWithCustomPoints = {
  id: 'test-custom-points',
  title: 'Custom Points Demo Test',
  description: 'Demonstrates the flexible point system with different weightings',
  questions: [
    {
      id: 'mc-1',
      question_type: 'multiple choice',
      question: 'What is 2 + 2?',
      choices: 'A. 3\nB. 4\nC. 5\nD. 6',
      correct_answer: 'B',
      explanation: 'Basic arithmetic: 2 + 2 = 4',
      points: 1 // Standard 1 point for easy question
    },
    {
      id: 'dd-1',
      question_type: 'drag and drop',
      question: 'Match the animals to their habitats:',
      choices: 'Items: Fish, Bird, Bear\nZones: Ocean, Sky, Forest',
      correct_answer: 'Fish->Ocean, Bird->Sky, Bear->Forest',
      explanation: 'Each animal lives in its natural habitat',
      points: 5 // Custom higher weight for drag and drop
    },
    {
      id: 'essay-1',
      question_type: 'essay',
      question: 'Explain the impact of climate change on global ecosystems. Discuss at least three specific examples and potential solutions.',
      explanation: 'This requires critical thinking and detailed analysis',
      points: 10 // High point value for complex essay
    },
    {
      id: 'short-1',
      question_type: 'short answer',
      question: 'Name three renewable energy sources.',
      expected_keywords: 'solar, wind, hydro, geothermal, biomass',
      explanation: 'Any three renewable sources are acceptable',
      points: 2 // Slightly weighted short answer
    },
    {
      id: 'dd-2',
      question_type: 'drag and drop',
      question: 'Match programming languages to their primary use:',
      choices: 'Items: JavaScript, Python, SQL\nZones: Web Development, Data Science, Database Queries',
      correct_answer: 'JavaScript->Web Development, Python->Data Science, SQL->Database Queries',
      explanation: 'Each language has its common application domain'
      // No custom points - will auto-calculate to 3 points (1 per match)
    }
  ],
  instructions: 'This test demonstrates the flexible point system. Notice how different questions have different point values based on complexity and importance.',
  time_limit: null,
  created_by: 'test-user',
  created_at: new Date().toISOString()
};

console.log('=== CUSTOM POINTS DEMONSTRATION ===');
console.log('Total possible points calculation:');

let totalPoints = 0;
testWithCustomPoints.questions.forEach((q, index) => {
  let questionPoints;
  
  if (q.points) {
    questionPoints = q.points;
    console.log(`Q${index + 1}: ${q.question_type} - ${questionPoints} points (CUSTOM)`);
  } else {
    // Auto-calculate
    if (q.question_type === 'drag and drop') {
      const choices = q.choices || '';
      const lines = choices.split('\n');
      for (const line of lines) {
        if (line.startsWith('Items:')) {
          const items = line.replace('Items:', '').split(',').map(item => item.trim()).filter(item => item);
          questionPoints = items.length;
          break;
        }
      }
    } else {
      questionPoints = 1;
    }
    console.log(`Q${index + 1}: ${q.question_type} - ${questionPoints} points (AUTO)`);
  }
  
  totalPoints += questionPoints;
});

console.log(`\nTOTAL TEST POINTS: ${totalPoints}`);
console.log('\nPoint distribution:');
console.log('- Multiple Choice (easy): 1 point');
console.log('- Drag & Drop (custom): 5 points');
console.log('- Essay (complex): 10 points');
console.log('- Short Answer (medium): 2 points');
console.log('- Drag & Drop (auto): 3 points');

console.log('\n=== TO ADD THIS TEST ===');
console.log('Run this in browser console:');
console.log(`
let publishedTests = JSON.parse(localStorage.getItem('publishedTests') || '[]');
publishedTests.push(${JSON.stringify(testWithCustomPoints)});
localStorage.setItem('publishedTests', JSON.stringify(publishedTests));
location.reload();
`);

module.exports = testWithCustomPoints;
