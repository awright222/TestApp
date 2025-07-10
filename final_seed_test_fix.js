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
                    "question_text": "💡 What's one word that describes your feeling about learning?",
                    "question_type": "short answer",
                    "choices": "excited, curious, motivated, interested, enthusiastic, eager",
                    "correct_answer": "excited",
                    "explanation": "Any positive word about learning is perfect! Keep that enthusiasm as you explore Formulate."
                },
                {
                    "id": "welcome-q3",
                    "question_text": "🖱️ Click on the learning methods that work best for you:",
                    "question_type": "hotspot",
                    "choices": "Active Methods: Practice, Testing, Discussion, Hands-on\nPassive Methods: Reading, Listening, Watching, Reviewing",
                    "correct_answer": "Active Methods: Practice, Active Methods: Testing",
                    "explanation": "Active learning methods like practice and testing are proven to be more effective for long-term retention!"
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
                "estimatedTime": "3 minutes",
                "questionCount": 3,
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
            "questionCount": 3,
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
