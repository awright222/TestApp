// Test script to demonstrate the updated point system for multiple choice and hotspot
const testWithMultipleCorrectAnswers = {
  id: 'test-multiple-correct',
  title: 'Multiple Correct Answers Demo',
  description: 'Demonstrates 1 point per correct answer for multiple choice and hotspot questions',
  questions: [
    {
      id: 'mc-single',
      question_type: 'multiple choice',
      question: 'What is the capital of France?',
      choices: 'A. London\nB. Paris\nC. Berlin\nD. Madrid',
      correct_answer: 'B',
      explanation: 'Paris is the capital of France',
      // No custom points - auto calculates to 1 point (1 correct answer)
    },
    {
      id: 'mc-multiple',
      question_type: 'multiple choice',
      question: 'Which of the following are programming languages? (Select all that apply)',
      choices: 'A. JavaScript\nB. HTML\nC. Python\nD. CSS\nE. Java',
      correct_answer: 'A, C, E',
      explanation: 'JavaScript, Python, and Java are programming languages. HTML and CSS are markup/styling languages.',
      // No custom points - auto calculates to 3 points (3 correct answers)
    },
    {
      id: 'hotspot-demo',
      question_type: 'hotspot',
      question: 'Click on the correct body parts for each function:',
      choices: 'Heart: pumping blood\nBrain: thinking\nLungs: breathing',
      correct_answer: 'Heart: pump\nBrain: think\nLungs: breathe',
      explanation: 'Each organ has its primary function',
      // No custom points - auto calculates to 3 points (3 hotspots)
    },
    {
      id: 'mc-weighted',
      question_type: 'multiple choice',
      question: 'Which of the following are renewable energy sources?',
      choices: 'A. Solar\nB. Coal\nC. Wind\nD. Oil\nE. Hydroelectric',
      correct_answer: 'A, C, E',
      explanation: 'Solar, wind, and hydroelectric are renewable energy sources',
      points: 5 // Custom weighting - all or nothing for 5 points
    }
  ],
  instructions: 'Notice how questions with multiple correct answers are worth more points automatically.',
  time_limit: null,
  created_by: 'test-user',
  created_at: new Date().toISOString()
};

console.log('=== UPDATED POINT SYSTEM DEMONSTRATION ===');
console.log('Point calculation for each question:');

let totalPoints = 0;
testWithMultipleCorrectAnswers.questions.forEach((q, index) => {
  let questionPoints;
  
  if (q.points) {
    questionPoints = q.points;
    console.log(`Q${index + 1}: ${q.question_type} - ${questionPoints} points (CUSTOM - all or nothing)`);
  } else {
    // Auto-calculate using new logic
    if (q.question_type === 'multiple choice') {
      const correctAnswers = q.correct_answer.split(',').map(ans => ans.trim()).filter(ans => ans);
      questionPoints = correctAnswers.length;
      console.log(`Q${index + 1}: ${q.question_type} - ${questionPoints} points (AUTO - ${correctAnswers.length} correct answers)`);
    } else if (q.question_type === 'hotspot') {
      const hotspots = q.correct_answer.split('\n').filter(line => line.trim().includes(':'));
      questionPoints = hotspots.length;
      console.log(`Q${index + 1}: ${q.question_type} - ${questionPoints} points (AUTO - ${hotspots.length} hotspots)`);
    } else {
      questionPoints = 1;
      console.log(`Q${index + 1}: ${q.question_type} - ${questionPoints} points (AUTO - default)`);
    }
  }
  
  totalPoints += questionPoints;
});

console.log(`\nTOTAL TEST POINTS: ${totalPoints}`);
console.log('\nScoring behavior:');
console.log('- Single correct MC: 1 point (all or nothing)');
console.log('- Multiple correct MC: 3 points with partial credit (1 point each, minus wrong answers)');
console.log('- Hotspot: 3 points with partial credit (1 point per hotspot)');
console.log('- Custom weighted MC: 5 points (all or nothing)');

console.log('\n=== EXAMPLE SCORING ===');
console.log('If student answers multiple choice question "A, C, E" (all correct): 3/3 points');
console.log('If student answers multiple choice question "A, C" (2 correct, 1 missing): 2/3 points');
console.log('If student answers multiple choice question "A, C, B" (2 correct, 1 wrong): 1/3 points');
console.log('If student answers multiple choice question "B, D" (0 correct, 2 wrong): 0/3 points');

console.log('\n=== TO ADD THIS TEST ===');
console.log('Run this in browser console:');
console.log(`
let publishedTests = JSON.parse(localStorage.getItem('publishedTests') || '[]');
publishedTests.push(${JSON.stringify(testWithMultipleCorrectAnswers)});
localStorage.setItem('publishedTests', JSON.stringify(publishedTests));
location.reload();
`);

module.exports = testWithMultipleCorrectAnswers;
