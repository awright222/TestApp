// 🧹 FIX DEMO TEST ISSUES - Remove multiple tests and access codes
// Paste this in browser console on localhost:3000

(function() {
    console.log('🧹 Fixing demo test issues...');
    
    try {
        // 1. Clear ALL existing tests first
        let publishedTests = JSON.parse(localStorage.getItem('published_tests') || '[]');
        console.log(`📋 Found ${publishedTests.length} existing tests`);
        
        // Remove all demo tests, seed tests, and Microsoft tests
        publishedTests = publishedTests.filter(test => 
            !test.title.includes('🎓') &&
            !test.title.includes('Welcome') &&
            !test.title.includes('Sample:') &&
            !test.title.includes('Microsoft') &&
            !test.title.includes('MB-800') &&
            !test.title.includes('📐') &&
            !test.title.includes('🔬') &&
            !test.metadata?.isSeedTest &&
            !test.metadata?.isDemoSample
        );
        
        console.log(`🗑️ After cleanup: ${publishedTests.length} tests remaining`);
        
        // 2. Add ONE single, clean seed test with NO access code
        const cleanSeedTest = {
            "id": "single-seed-" + Date.now(),
            "title": "🎓 Welcome to Formulate!",
            "description": "Your complete starter guide - no password needed!",
            "questions": [
                {
                    "id": "welcome-q1",
                    "question_text": "🎯 Welcome! What makes Formulate special?",
                    "question_type": "multiple choice",
                    "choices": "A. All question types in one platform\nB. Gamification with XP and achievements\nC. Powerful analytics and insights\nD. All of the above!",
                    "correct_answer": "D",
                    "explanation": "Formulate combines multiple question types, engaging gamification, and detailed analytics!"
                },
                {
                    "id": "welcome-q2",
                    "question_text": "💡 What learning method works best?",
                    "question_type": "short answer",
                    "choices": "active, practice, engagement, hands-on, interactive",
                    "correct_answer": "active",
                    "explanation": "Active learning methods are more effective than passive reading."
                },
                {
                    "id": "welcome-q3",
                    "question_text": "🖱️ Click on effective study methods:",
                    "question_type": "hotspot",
                    "choices": "Good Methods: practice, testing, feedback\nPoor Methods: cramming, passive reading",
                    "correct_answer": "Good Methods: practice, Good Methods: testing",
                    "explanation": "Practice and testing are proven to improve learning retention."
                },
                {
                    "id": "welcome-q4",
                    "question_text": "🔄 Match tools to their purposes:",
                    "question_type": "drag and drop",
                    "choices": "Items: Flashcards, Quizzes, Essays\nZones: Memory, Testing, Analysis",
                    "correct_answer": "Flashcards -> Memory, Quizzes -> Testing, Essays -> Analysis",
                    "explanation": "Different tools serve different learning purposes."
                },
                {
                    "id": "welcome-q5",
                    "question_text": "📝 What are your learning goals?",
                    "question_type": "essay",
                    "choices": "Share your thoughts about what you want to achieve.",
                    "correct_answer": "Personal reflection",
                    "explanation": "Reflecting on goals helps focus your learning efforts."
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
                "requiresPassword": false,
                "passwordProtected": false
            },
            "metadata": {
                "tags": ["welcome", "tutorial", "seed"],
                "difficulty": "Beginner",
                "estimatedTime": "5 minutes",
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
            "shareId": "clean-seed-" + Math.random().toString(36).substring(2, 15),
            "publishedAt": new Date().toISOString(),
            "totalAttempts": 0,
            "completedAttempts": 0,
            "averageScore": 0,
            "questionCount": 5,
            "createdAt": new Date().toISOString(),
            "isActive": true
        };
        
        // Add the single clean test
        publishedTests.unshift(cleanSeedTest);
        localStorage.setItem('published_tests', JSON.stringify(publishedTests));
        
        // 3. Also clean up any demo-specific localStorage
        Object.keys(localStorage).forEach(key => {
            if (key.includes('demo_tests_') || key.includes('demo_') || key.includes('seed_')) {
                localStorage.removeItem(key);
                console.log(`🗑️ Removed: ${key}`);
            }
        });
        
        console.log('✅ FIXED! Now you have:');
        console.log('   📚 ONE seed test only');
        console.log('   🔓 NO access code required');
        console.log('   🎯 All question types included');
        console.log('   🔗 Direct URL:', `${window.location.origin}/take-test/${cleanSeedTest.shareId}`);
        
        console.log('🔄 Refreshing in 2 seconds...');
        setTimeout(() => {
            window.location.reload();
        }, 2000);
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
})();
