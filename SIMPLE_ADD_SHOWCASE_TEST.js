// 🎓 SIMPLE COPY-PASTE COMMAND TO ADD SHOWCASE TEST
// Instructions: 
// 1. Go to http://localhost:3000 in your browser
// 2. Open Developer Tools (F12)
// 3. Go to Console tab  
// 4. Copy and paste the entire command below
// 5. Press Enter
// 6. The page will refresh and show the new test!

console.log('🎓 Adding Comprehensive Learning Showcase Test...');

let showcaseTest = {
  "id": "showcase-seed-test",
  "title": "🎓 Complete Learning Showcase",
  "description": "A comprehensive test showcasing all question types - perfect for exploring the full range of features!",
  "questions": [
    {
      "id": "q1-multiple-choice",
      "question_text": "🎯 Welcome! Which learning method is most effective?",
      "question_type": "multiple choice",
      "choices": "A. Active practice and testing\nB. Passive reading only\nC. Memorizing without understanding\nD. Avoiding challenging material",
      "correct_answer": "A",
      "explanation": "Active practice and testing (like taking this quiz!) is scientifically proven to enhance learning and retention. This is called the 'testing effect'!"
    },
    {
      "id": "q2-short-answer",
      "question_text": "💡 Name two benefits of spaced repetition in learning.",
      "question_type": "short answer",
      "choices": "memory, retention, long-term learning, recall, forgetting curve, strengthens neural pathways, improved retention, better recall",
      "correct_answer": "memory, retention",
      "explanation": "Spaced repetition improves long-term memory retention and helps overcome the forgetting curve by strengthening neural pathways through repeated exposure over time."
    },
    {
      "id": "q3-hotspot",
      "question_text": "🖱️ Click on the brain regions responsible for different functions:",
      "question_type": "hotspot",
      "choices": "Memory: hippocampus, temporal lobe\nLanguage: broca area, wernicke area\nMovement: motor cortex, cerebellum",
      "correct_answer": "Memory: hippocampus, Language: broca area, Movement: motor cortex",
      "explanation": "Different brain regions specialize in different functions. The hippocampus is crucial for memory formation, Broca area for speech production, and the motor cortex for voluntary movement."
    },
    {
      "id": "q4-drag-drop",
      "question_text": "🔄 Match these learning techniques to their categories:",
      "question_type": "drag and drop",
      "choices": "Items: Flashcards, Mind Mapping, Practice Tests, Note Taking, Mnemonics\nZones: Active Recall, Visual Learning, Assessment, Documentation, Memory Aids",
      "correct_answer": "Flashcards -> Active Recall, Mind Mapping -> Visual Learning, Practice Tests -> Assessment, Note Taking -> Documentation, Mnemonics -> Memory Aids",
      "explanation": "Each learning technique serves a specific purpose: flashcards for active recall, mind maps for visual learning, practice tests for assessment, note-taking for documentation, and mnemonics as memory aids."
    },
    {
      "id": "q5-essay",
      "question_text": "📝 Describe your ideal learning environment and explain why it works best for you. Consider factors like location, time of day, tools, and methods.",
      "question_type": "essay",
      "choices": "Focus on personal preferences, environmental factors, optimal conditions, specific tools or methods, and reasoning behind choices.",
      "correct_answer": "Personal reflection on learning preferences",
      "explanation": "Everyone has unique learning preferences! Some thrive in quiet spaces, others prefer background noise. Some are morning learners, others night owls. The key is self-awareness and optimizing your environment for maximum focus and retention."
    },
    {
      "id": "q6-multiple-choice-advanced",
      "question_text": "🧠 Which principle explains why testing yourself improves learning more than re-reading?",
      "question_type": "multiple choice",
      "choices": "A. The testing effect (retrieval practice)\nB. The spacing effect\nC. The elaboration effect\nD. The generation effect",
      "correct_answer": "A",
      "explanation": "The testing effect, also known as retrieval practice, shows that actively recalling information strengthens memory more effectively than passive review. You are experiencing this right now!"
    },
    {
      "id": "q7-short-answer-application",
      "question_text": "⚡ What is the name of the learning technique where you explain concepts in simple terms as if teaching someone else?",
      "question_type": "short answer",
      "choices": "feynman technique, feynman method, teaching method, explain simply, rubber duck debugging, teach to learn",
      "correct_answer": "feynman technique",
      "explanation": "The Feynman Technique involves explaining concepts in simple language as if teaching a child. This identifies knowledge gaps and deepens understanding through active processing."
    },
    {
      "id": "q8-hotspot-advanced",
      "question_text": "🎨 Select the learning style preferences that match these activities:",
      "question_type": "hotspot",
      "choices": "Visual: diagrams, charts, mind maps, colors\nAuditory: lectures, discussions, music, recording\nKinesthetic: hands-on, movement, building, experiments",
      "correct_answer": "Visual: diagrams, Auditory: discussions, Kinesthetic: hands-on",
      "explanation": "Learning styles theory suggests people have preferences: visual learners prefer diagrams and charts, auditory learners benefit from discussions and lectures, and kinesthetic learners need hands-on experiences."
    }
  ],
  "settings": {
    "timeLimit": 0,
    "showExplanations": true,
    "showCorrectAnswers": true,
    "passingScore": 60,
    "allowReview": true,
    "showResults": true
  },
  "tags": ["learning", "education", "showcase", "comprehensive", "all-types"],
  "difficulty": "Mixed",
  "estimatedTime": "5-8 minutes",
  "questionCount": 8,
  "createdAt": new Date().toISOString(),
  "updatedAt": new Date().toISOString(),
  "source": "seed",
  "icon": "🎓",
  "color": "#4A90E2",
  "isActive": true,
  "isSeedTest": true,
  "isShowcaseTest": true,
  "category": "Sample Tests"
};

// Add to published tests
let publishedTests = JSON.parse(localStorage.getItem('publishedTests') || '[]');
publishedTests = publishedTests.filter(test => test.id !== 'showcase-seed-test');
publishedTests.unshift(showcaseTest);
localStorage.setItem('publishedTests', JSON.stringify(publishedTests));

console.log('✅ SUCCESS! Showcase test added to published tests');
console.log('📊 Test Details:');
console.log('- Title: 🎓 Complete Learning Showcase');
console.log('- Questions: 8');
console.log('- Question Types: multiple choice, short answer, hotspot, drag and drop, essay');
console.log('- Estimated Time: 5-8 minutes');
console.log('');
console.log('🏆 Achievement Opportunities:');
console.log('- ✅ First Test: Complete any test');
console.log('- 🎯 Perfect Score: Get 100% (8/8 correct)');
console.log('- ⚡ Speedster: Complete in under 2 minutes');
console.log('- 🧠 Knowledge Seeker: Try diverse question types');
console.log('- 🔥 Start a learning streak!');
console.log('');
console.log('🎓 The test will appear at the top of your test library!');
console.log('📍 Find it in: Dashboard → Take a Test → Published Tests');
console.log('');
console.log('🔄 Refreshing page in 2 seconds...');

setTimeout(() => location.reload(), 2000);
