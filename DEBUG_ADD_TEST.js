// 🔧 DEBUG VERSION - Step by Step Test Addition
// Try this simpler approach if the main script isn't working

// STEP 1: First, run this to check if localStorage is working
console.log('🔍 Checking localStorage...');
console.log('Current publishedTests:', localStorage.getItem('publishedTests'));
console.log('localStorage is working:', typeof localStorage !== 'undefined');

// STEP 2: If that works, then run this to add the test
console.log('🎓 Adding test...');

var showcaseTest = {
  id: "showcase-seed-test",
  title: "🎓 Complete Learning Showcase", 
  description: "A comprehensive test showcasing all question types - perfect for exploring the full range of features!",
  questions: [
    {
      id: "q1",
      question_text: "🎯 Welcome! Which learning method is most effective?",
      question_type: "multiple choice",
      choices: "A. Active practice and testing\nB. Passive reading only\nC. Memorizing without understanding\nD. Avoiding challenging material",
      correct_answer: "A",
      explanation: "Active practice and testing is scientifically proven to enhance learning!"
    },
    {
      id: "q2", 
      question_text: "💡 Name one benefit of spaced repetition.",
      question_type: "short answer",
      choices: "memory, retention, recall, learning",
      correct_answer: "memory",
      explanation: "Spaced repetition improves memory retention over time."
    },
    {
      id: "q3",
      question_text: "🖱️ Click on memory-related brain regions:",
      question_type: "hotspot", 
      choices: "Memory: hippocampus, temporal lobe\nLanguage: broca area",
      correct_answer: "Memory: hippocampus",
      explanation: "The hippocampus is crucial for memory formation."
    },
    {
      id: "q4",
      question_text: "🔄 Match learning techniques:",
      question_type: "drag and drop",
      choices: "Items: Flashcards, Tests\nZones: Active Recall, Assessment", 
      correct_answer: "Flashcards -> Active Recall, Tests -> Assessment",
      explanation: "Each technique serves a specific learning purpose."
    },
    {
      id: "q5",
      question_text: "📝 Describe your ideal study environment.",
      question_type: "essay",
      choices: "Personal preferences and reasoning",
      correct_answer: "Personal reflection",
      explanation: "Everyone has unique learning preferences!"
    }
  ],
  settings: {
    timeLimit: 0,
    showExplanations: true,
    showCorrectAnswers: true,
    passingScore: 60
  },
  questionCount: 5,
  createdAt: new Date().toISOString(),
  icon: "🎓",
  color: "#4A90E2",
  isActive: true
};

// Add to localStorage
var publishedTests = JSON.parse(localStorage.getItem('publishedTests') || '[]');
publishedTests = publishedTests.filter(function(test) { return test.id !== 'showcase-seed-test'; });
publishedTests.unshift(showcaseTest);
localStorage.setItem('publishedTests', JSON.stringify(publishedTests));

console.log('✅ Test added! Total tests:', publishedTests.length);
console.log('🔄 Refreshing...');
setTimeout(function() { location.reload(); }, 1000);
