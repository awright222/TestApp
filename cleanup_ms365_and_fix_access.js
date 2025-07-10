// 🧹 CLEANUP SCRIPT - Remove MS365 tests and fix seed test access
// Paste this in browser console on localhost:3000

(function() {
    console.log('🧹 Cleaning up Microsoft 365 tests and fixing seed test access...');
    
    try {
        // 1. Remove Microsoft 365 tests from published_tests
        let publishedTests = JSON.parse(localStorage.getItem('published_tests') || '[]');
        const originalLength = publishedTests.length;
        
        publishedTests = publishedTests.filter(test => 
            !test.title.includes('MB-800') && 
            !test.title.includes('Microsoft') && 
            !test.title.includes('Dynamics 365')
        );
        
        console.log(`🗑️ Removed ${originalLength - publishedTests.length} Microsoft 365 tests`);
        
        // 2. Add clean seed test with no access code
        const seedTest = {
            "id": "seed-welcome-no-code",
            "title": "🎓 Welcome to Formulate!",
            "description": "Your starter test showcasing all question types. No access code needed!",
            "questions": [
                {
                    "id": "seed-q1",
                    "question_text": "🎯 Welcome! What makes Formulate special?",
                    "question_type": "multiple choice",
                    "choices": "A. All question types in one platform\nB. Gamification with XP and achievements\nC. Powerful analytics and insights\nD. All of the above!",
                    "correct_answer": "D",
                    "explanation": "Formulate combines multiple question types, engaging gamification, and detailed analytics to create the ultimate learning experience!"
                },
                {
                    "id": "seed-q2",
                    "question_text": "💡 What are two key benefits of active learning?",
                    "question_type": "short answer",
                    "choices": "retention, memory, engagement, understanding, recall, comprehension, participation, interaction",
                    "correct_answer": "retention, engagement",
                    "explanation": "Active learning improves retention by engaging students directly with the material, leading to better understanding and long-term memory formation."
                },
                {
                    "id": "seed-q3",
                    "question_text": "🖱️ Click on the elements that make learning effective:",
                    "question_type": "hotspot",
                    "choices": "Active Elements: practice, testing, feedback, interaction\nPassive Elements: reading, listening, watching, memorizing",
                    "correct_answer": "Active Elements: practice, Active Elements: testing, Active Elements: feedback",
                    "explanation": "Active learning elements like practice, testing, and feedback are more effective than passive methods for long-term retention."
                },
                {
                    "id": "seed-q4",
                    "question_text": "🔄 Match these learning tools to their purposes:",
                    "question_type": "drag and drop",
                    "choices": "Items: Flashcards, Quizzes, Essays, Projects, Discussions\nZones: Memory Practice, Knowledge Testing, Deep Thinking, Application, Collaboration",
                    "correct_answer": "Flashcards -> Memory Practice, Quizzes -> Knowledge Testing, Essays -> Deep Thinking, Projects -> Application, Discussions -> Collaboration",
                    "explanation": "Different learning tools serve different purposes: flashcards for memory, quizzes for testing, essays for analysis, projects for application, and discussions for collaboration."
                },
                {
                    "id": "seed-q5",
                    "question_text": "📝 Reflect on your learning goals. What do you hope to achieve with this platform?",
                    "question_type": "essay",
                    "choices": "Consider your learning style, goals, preferred methods, and what you want to accomplish.",
                    "correct_answer": "Personal reflection on learning goals and preferences",
                    "explanation": "Self-reflection on learning goals helps you understand your preferences and create more effective study strategies tailored to your needs."
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
                "isPublic": true
            },
            "metadata": {
                "tags": ["welcome", "tutorial", "showcase", "seed"],
                "difficulty": "Beginner",
                "estimatedTime": "5-8 minutes",
                "questionCount": 5,
                "category": "Getting Started",
                "isSeedTest": true,
                "canDelete": true,
                "createdAt": new Date().toISOString()
            },
            "visual": {
                "icon": "🎓",
                "color": "#4A90E2"
            },
            "shareId": "seed-" + Math.random().toString(36).substring(2, 15),
            "publishedAt": new Date().toISOString(),
            "totalAttempts": 0,
            "completedAttempts": 0,
            "averageScore": 0,
            "questionCount": 5,
            "createdAt": new Date().toISOString(),
            "isActive": true
        };
        
        // Remove any existing seed tests and add the new one
        publishedTests = publishedTests.filter(test => !test.title.includes('Welcome to Formulate'));
        publishedTests.unshift(seedTest);
        
        localStorage.setItem('published_tests', JSON.stringify(publishedTests));
        
        console.log('✅ Cleanup complete!');
        console.log(`📊 Total tests now: ${publishedTests.length}`);
        console.log('🎓 Added seed test with NO ACCESS CODE required');
        console.log('🗑️ Removed all Microsoft 365 tests');
        console.log('🔄 Refresh page to see changes');
        
        // Auto refresh after a delay
        setTimeout(() => {
            console.log('🔄 Auto-refreshing...');
            window.location.reload();
        }, 2000);
        
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    }
})();
