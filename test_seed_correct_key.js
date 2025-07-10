// 🌱 SEED TEST MANUAL ADD - Test the correct localStorage key
// Paste this in browser console on localhost:3000

(function() {
    console.log('🌱 Adding seed test to correct localStorage key...');
    
    const seedTest = {
        "id": "seed-showcase-test123",
        "title": "🎓 Welcome to Formulate!",
        "description": "Your starter test showcasing all question types. Try it out to see how everything works! You can delete this anytime.",
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
            "randomizeChoices": false
        },
        "metadata": {
            "tags": ["welcome", "tutorial", "showcase", "seed", "demo"],
            "difficulty": "Beginner",
            "estimatedTime": "5-8 minutes",
            "questionCount": 5,
            "category": "Getting Started",
            "isSeedTest": true,
            "isWelcomeTest": true,
            "canDelete": true,
            "createdAt": new Date().toISOString(),
            "updatedAt": new Date().toISOString()
        },
        "visual": {
            "icon": "🎓",
            "color": "#4A90E2",
            "coverImage": null
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
    
    try {
        // Use the correct key that PublishedTestsService uses
        let publishedTests = JSON.parse(localStorage.getItem('published_tests') || '[]');
        publishedTests = publishedTests.filter(t => t.id !== seedTest.id);
        publishedTests.unshift(seedTest);
        localStorage.setItem('published_tests', JSON.stringify(publishedTests));
        
        console.log('✅ SUCCESS! Seed test added to published_tests');
        console.log('📊 Total tests now:', publishedTests.length);
        console.log('🔄 Refresh page to see in Test Library');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
})();
