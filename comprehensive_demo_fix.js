// 🔧 COMPREHENSIVE FIX - Single test, no access code, no issues
// Paste this in browser console on localhost:3000

(function() {
    console.log('🔧 Comprehensive demo test fix...');
    
    try {
        // 1. COMPLETE CLEANUP - Remove everything
        console.log('🧹 Step 1: Complete cleanup...');
        
        // Clear all localStorage demo data
        Object.keys(localStorage).forEach(key => {
            if (key.includes('demo_') || key.includes('seed_') || key.includes('test_')) {
                localStorage.removeItem(key);
                console.log(`   Removed: ${key}`);
            }
        });
        
        // Clear published tests and start fresh
        localStorage.removeItem('published_tests');
        console.log('   Cleared published_tests');
        
        // 2. CREATE SINGLE PERFECT TEST
        console.log('🎯 Step 2: Creating single perfect test...');
        
        const perfectTest = {
            "id": "perfect-seed-" + Date.now(),
            "title": "🎓 Welcome to Formulate!",
            "description": "Your complete starter guide with all question types. No password needed!",
            "questions": [
                {
                    "id": "perfect-q1",
                    "question_text": "🎯 Ready to explore Formulate?",
                    "question_type": "multiple choice",
                    "choices": "A. Yes, let's start!\nB. Show me the features\nC. I'm excited to learn\nD. All of the above!",
                    "correct_answer": "D",
                    "explanation": "Great! This test will show you all the different question types available in Formulate."
                },
                {
                    "id": "perfect-q2",
                    "question_text": "💡 What's the best way to learn?",
                    "question_type": "short answer",
                    "choices": "practice, active, hands-on, doing, experience",
                    "correct_answer": "practice",
                    "explanation": "Practice and active learning are much more effective than passive reading."
                },
                {
                    "id": "perfect-q3",
                    "question_text": "🖱️ Click on effective learning methods:",
                    "question_type": "hotspot",
                    "choices": "Effective: testing, practice, feedback\nLess Effective: cramming, highlighting",
                    "correct_answer": "Effective: testing, Effective: practice",
                    "explanation": "Testing and practice are proven to improve long-term retention."
                },
                {
                    "id": "perfect-q4",
                    "question_text": "🔄 Match these study tools:",
                    "question_type": "drag and drop",
                    "choices": "Items: Flashcards, Quizzes\nZones: Memory, Assessment",
                    "correct_answer": "Flashcards -> Memory, Quizzes -> Assessment",
                    "explanation": "Different tools serve different purposes in learning."
                },
                {
                    "id": "perfect-q5",
                    "question_text": "📝 What do you hope to achieve with Formulate?",
                    "question_type": "essay",
                    "choices": "Share your learning goals and what you want to accomplish.",
                    "correct_answer": "Personal learning goals",
                    "explanation": "Setting clear goals helps focus your learning efforts effectively."
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
                "passwordProtected": false,
                "maxAttempts": 0
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
            "shareId": "perfect-" + Math.random().toString(36).substring(2, 15),
            "publishedAt": new Date().toISOString(),
            "totalAttempts": 0,
            "completedAttempts": 0,
            "averageScore": 0,
            "questionCount": 5,
            "createdAt": new Date().toISOString(),
            "isActive": true
        };
        
        // 3. SAVE THE PERFECT TEST
        console.log('💾 Step 3: Saving perfect test...');
        
        localStorage.setItem('published_tests', JSON.stringify([perfectTest]));
        
        // 4. VERIFICATION
        console.log('✅ Step 4: Verification...');
        
        const saved = JSON.parse(localStorage.getItem('published_tests') || '[]');
        console.log(`   Tests saved: ${saved.length}`);
        console.log(`   Test title: ${saved[0]?.title}`);
        console.log(`   Access code: ${saved[0]?.settings?.accessCode || 'NONE'}`);
        console.log(`   Share ID: ${saved[0]?.shareId}`);
        
        // 5. DIRECT ACCESS
        const directUrl = `${window.location.origin}/take-test/${perfectTest.shareId}`;
        console.log(`🔗 Direct URL: ${directUrl}`);
        
        console.log('');
        console.log('🎉 PERFECT! You now have:');
        console.log('   ✅ ONE test only');
        console.log('   ✅ NO access code required');
        console.log('   ✅ All 5 question types');
        console.log('   ✅ Clean localStorage');
        console.log('   ✅ Direct access available');
        
        console.log('');
        console.log('🔄 Auto-refreshing in 3 seconds...');
        setTimeout(() => {
            window.location.reload();
        }, 3000);
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
})();
