// 🎯 DIRECT ACCESS TO SEED TEST
// If you still can't access the seed test, paste this in browser console

(function() {
    console.log('🎯 Finding and accessing seed test...');
    
    try {
        // Check for seed test
        const publishedTests = JSON.parse(localStorage.getItem('published_tests') || '[]');
        const seedTest = publishedTests.find(test => 
            test.title.includes('Welcome to Formulate') || 
            test.metadata?.isSeedTest ||
            test.title.includes('🎓')
        );
        
        if (seedTest) {
            console.log('✅ Found seed test:', seedTest.title);
            console.log('🔑 Access Code Required:', seedTest.settings?.accessCode || 'NONE');
            console.log('🔗 Share ID:', seedTest.shareId);
            
            // Direct link to test
            const testUrl = `${window.location.origin}/take-test/${seedTest.shareId}`;
            console.log('🔗 Direct test URL:', testUrl);
            
            // Auto-navigate to test
            console.log('🚀 Opening test in 2 seconds...');
            setTimeout(() => {
                window.location.href = testUrl;
            }, 2000);
            
        } else {
            console.log('❌ No seed test found. Creating one...');
            
            // Create and add seed test
            const newSeedTest = {
                "id": "direct-seed-" + Date.now(),
                "title": "🎓 Welcome to Formulate!",
                "description": "No access code needed!",
                "questions": [
                    {
                        "id": "q1",
                        "question_text": "🎯 Welcome! Ready to explore all question types?",
                        "question_type": "multiple choice",
                        "choices": "A. Yes, let's go!\nB. Show me more\nC. I'm excited!\nD. All of the above!",
                        "correct_answer": "D",
                        "explanation": "Welcome to Formulate! This test shows you all the different question types."
                    }
                ],
                "settings": {
                    "timeLimit": 0,
                    "showExplanations": true,
                    "accessCode": null,
                    "isPublic": true
                },
                "shareId": "direct-seed-" + Math.random().toString(36).substring(2, 15),
                "publishedAt": new Date().toISOString(),
                "totalAttempts": 0,
                "completedAttempts": 0,
                "averageScore": 0,
                "questionCount": 1,
                "isActive": true
            };
            
            publishedTests.unshift(newSeedTest);
            localStorage.setItem('published_tests', JSON.stringify(publishedTests));
            
            console.log('✅ Created new seed test');
            console.log('🔗 Direct URL:', `${window.location.origin}/take-test/${newSeedTest.shareId}`);
            
            setTimeout(() => {
                window.location.href = `/take-test/${newSeedTest.shareId}`;
            }, 1000);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
})();
