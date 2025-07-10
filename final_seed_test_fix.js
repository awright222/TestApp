// 🎯 FINAL SEED TEST FIX - Sets seed test as practice type to bypass access codes
// Run this script in browser console on localhost:3000

(function() {
    console.log('🎯 FINAL SEED TEST FIX - Starting...');
    
    try {
        // 1. Clean up old tests first
        console.log('🧹 Cleaning up old tests...');
        localStorage.removeItem('published_tests');
        localStorage.removeItem('saved_tests');
        localStorage.removeItem('created_tests');
        localStorage.removeItem('sharedTests');
        localStorage.removeItem('shared_tests');
        localStorage.removeItem('test_results');
        localStorage.removeItem('user_test_results');
        localStorage.removeItem('quiz_results');
        localStorage.removeItem('practice_results');
        
        // Clean up any seed tests
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.includes('seed') || key.includes('demo') || key.includes('sample')) {
                localStorage.removeItem(key);
            }
        });
        
        console.log('✅ Cleanup complete');
        
        // 2. Create the perfect seed test with type: "practice"
        console.log('🌱 Creating perfect seed test...');
        
        const perfectSeedTest = {
            "id": "perfect-seed-" + Date.now(),
            "title": "🎓 Welcome to Formulate!",
            "description": "Your starter test showcasing all question types. Try it out to see how everything works!",
            "questions": [
                {
                    "id": "welcome-q1",
                    "question_text": "🎯 Welcome! What makes a great learning platform?",
                    "question_type": "multiple choice",
                    "choices": "A. Interactive questions\nB. Immediate feedback\nC. Multiple question types\nD. All of the above!",
                    "correct_answer": "D",
                    "explanation": "Great learning platforms combine interactive questions, immediate feedback, and variety to keep learners engaged!"
                },
                {
                    "id": "welcome-q2",
                    "question_text": "💡 What's your favorite learning technique?",
                    "question_type": "short answer",
                    "choices": "practice, testing, reading, discussion, visual, hands-on, repetition",
                    "correct_answer": "practice",
                    "explanation": "Any learning technique you prefer is valid! Different methods work for different people."
                },
                {
                    "id": "welcome-q3",
                    "question_text": "🖱️ Match these learning strategies to their benefits:",
                    "question_type": "hotspot",
                    "choices": "Active Learning: practice, testing, discussion, hands-on\nPassive Learning: reading, listening, watching, reviewing\nRetention Boost: quizzing, spaced practice, teaching others",
                    "correct_answer": "Active Learning: practice\nPassive Learning: reading\nRetention Boost: quizzing",
                    "explanation": "Active learning methods like practice are more effective than passive methods like reading, and techniques like quizzing boost retention!"
                },
                {
                    "id": "welcome-q4",
                    "question_text": "🎯 Drag learning tools to their primary purposes:",
                    "question_type": "drag and drop",
                    "choices": "Items: Flashcards, Quizzes, Essays, Projects, Discussions\nZones: Memory Practice, Knowledge Testing, Deep Thinking, Application, Collaboration",
                    "correct_answer": "Flashcards -> Memory Practice, Quizzes -> Knowledge Testing, Essays -> Deep Thinking, Projects -> Application, Discussions -> Collaboration",
                    "explanation": "Each tool serves a different purpose: Flashcards for memory, Quizzes for testing knowledge, Essays for deep thinking, Projects for application, and Discussions for collaboration!"
                },
                {
                    "id": "welcome-q5",
                    "question_text": "📝 What are your learning goals with this platform?",
                    "question_type": "essay",
                    "choices": "Consider your objectives, preferred learning style, and what you hope to achieve",
                    "correct_answer": "Personal learning goals",
                    "explanation": "Thank you for sharing your learning goals! Reflecting on your objectives helps create a more personalized learning experience."
                },
                {
                    "id": "welcome-q6",
                    "question_text": "🧠 What is the 'Testing Effect' in learning science?",
                    "question_type": "multiple choice",
                    "choices": "A. Tests make students anxious\nB. Retrieval practice strengthens memory\nC. Multiple choice is the best format\nD. Testing should be avoided",
                    "correct_answer": "B",
                    "explanation": "The Testing Effect shows that actively retrieving information from memory (like taking this quiz!) strengthens neural pathways and improves long-term retention."
                },
                {
                    "id": "welcome-q7",
                    "question_text": "🎨 Select the best study techniques for different learning goals:",
                    "question_type": "hotspot",
                    "choices": "Memory Building: flashcards, repetition, mnemonics\nUnderstanding: explanation, examples, connections\nApplication: practice problems, projects, real-world use",
                    "correct_answer": "Memory Building: flashcards\nUnderstanding: explanation\nApplication: practice problems",
                    "explanation": "Different goals require different techniques: flashcards for memory, explanations for understanding, and practice problems for application!"
                }
            ],
            "settings": {
                "timeLimit": 0,
                "showExplanations": true,
                "showCorrectAnswers": true,
                "passingScore": 60,
                "allowReview": true,
                "showResults": true,
                "randomizeQuestions": false,
                "randomizeChoices": false,
                "accessCode": null,
                "isPublic": true,
                "requireName": false,
                "requireEmail": false,
                "maxAttempts": 0
            },
            "metadata": {
                "tags": ["welcome", "tutorial", "seed"],
                "difficulty": "Beginner",
                "estimatedTime": "8 minutes",
                "questionCount": 7,
                "category": "Getting Started",
                "isSeedTest": true,
                "isWelcomeTest": true,
                "canDelete": true,
                "createdAt": new Date().toISOString(),
                "updatedAt": new Date().toISOString()
            },
            "visual": {
                "icon": "🎓",
                "color": "#4A90E2"
            },
            "type": "practice", // KEY: This makes it bypass access codes!
            "source": "seed",
            "isActive": true,
            "shareId": "welcome-" + Math.random().toString(36).substring(2, 15),
            "publishedAt": new Date().toISOString(),
            "totalAttempts": 0,
            "completedAttempts": 0,
            "averageScore": 0,
            "questionCount": 7,
            "createdAt": new Date().toISOString()
        };
        
        // 3. Save the test to published_tests
        localStorage.setItem('published_tests', JSON.stringify([perfectSeedTest]));
        
        console.log('✅ Perfect seed test created with type: "practice"');
        console.log('🎯 Test details:', perfectSeedTest);
        
        // 4. Force a page refresh to reload the test library
        console.log('🔄 Refreshing page to load new test...');
        
        setTimeout(() => {
            window.location.reload();
        }, 2000);
        
        console.log('');
        console.log('🎉 SUCCESS! The seed test is now set as type "practice"');
        console.log('📝 This means it will bypass the access code requirement');
        console.log('🚀 Click the test in Test Library and it should work immediately!');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
})();
