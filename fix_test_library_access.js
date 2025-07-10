// 🔧 AUTO-POPULATE ACCESS CODE - Universal fix for all accounts
// Paste this in browser console on localhost:3000

(function() {
    console.log('🔧 Auto-populating access codes for seed tests...');
    
    try {
        // 1. Get current URL and check if we're on a test page
        const currentUrl = window.location.href;
        const isTestPage = currentUrl.includes('/custom-test/') || currentUrl.includes('/shared-test/') || currentUrl.includes('/take-test/');
        
        console.log('� Current URL:', currentUrl);
        console.log('🧪 On test page:', isTestPage);
        
        // 2. If we're on a test page, auto-fill the access code
        if (isTestPage) {
            console.log('🔑 Looking for access code field...');
            
            // Find the access code input field
            const accessCodeInput = document.querySelector('input[type="text"][placeholder*="access"], input[type="text"][placeholder*="code"], input[placeholder*="share"], input[placeholder*="ABC123"]');
            
            if (accessCodeInput) {
                console.log('✅ Found access code field');
                
                // Get the test data to find the actual access code
                const publishedTests = JSON.parse(localStorage.getItem('published_tests') || '[]');
                const seedTest = publishedTests.find(test => 
                    test.title.includes('Welcome') || 
                    test.metadata?.isSeedTest ||
                    test.title.includes('🎓')
                );
                
                if (seedTest && seedTest.settings?.accessCode) {
                    // Auto-fill with the actual access code
                    accessCodeInput.value = seedTest.settings.accessCode;
                    accessCodeInput.dispatchEvent(new Event('input', { bubbles: true }));
                    accessCodeInput.dispatchEvent(new Event('change', { bubbles: true }));
                    
                    console.log('🎯 Auto-filled access code:', seedTest.settings.accessCode);
                    
                    // Also try to auto-click the start button after a delay
                    setTimeout(() => {
                        const startButton = document.querySelector('button[class*="start"], button:contains("Start"), .start-test-btn');
                        if (startButton && !startButton.disabled) {
                            console.log('🚀 Auto-clicking start button...');
                            startButton.click();
                        }
                    }, 500);
                    
                } else {
                    // If no specific access code, try common patterns
                    const commonCodes = ['DEMO', 'TEST', 'START', 'SEED', 'WELCOME'];
                    const randomCode = commonCodes[Math.floor(Math.random() * commonCodes.length)];
                    
                    accessCodeInput.value = randomCode;
                    accessCodeInput.dispatchEvent(new Event('input', { bubbles: true }));
                    
                    console.log('🎲 Tried common code:', randomCode);
                }
                
            } else {
                console.log('❌ No access code field found on this page');
                
                // Check if there are any password/code related elements
                const allInputs = document.querySelectorAll('input[type="text"], input[type="password"]');
                console.log('📝 Found inputs:', allInputs.length);
                allInputs.forEach((input, i) => {
                    console.log(`   Input ${i}:`, input.placeholder || input.name || input.id || 'no identifier');
                });
            }
        }
        
        // 3. Universal seed test creation with a simple access code
        console.log('🌱 Creating seed test with simple access code...');
        
        const universalSeedTest = {
            "id": "universal-seed-" + Date.now(),
            "title": "🎓 Welcome to Formulate!",
            "description": "Your starter guide with all question types (Access Code: START)",
            "questions": [
                {
                    "id": "u-q1",
                    "question_text": "🎯 Welcome! Ready to explore?",
                    "question_type": "multiple choice",
                    "choices": "A. Yes!\nB. Show me features\nC. Let's learn\nD. All of the above!",
                    "correct_answer": "D",
                    "explanation": "Great choice! This test shows all question types."
                },
                {
                    "id": "u-q2", 
                    "question_text": "� Best way to learn?",
                    "question_type": "short answer",
                    "choices": "practice, active, hands-on, doing",
                    "correct_answer": "practice",
                    "explanation": "Practice makes perfect!"
                }
            ],
            "settings": {
                "timeLimit": 0,
                "showExplanations": true,
                "showCorrectAnswers": true,
                "passingScore": 60,
                "accessCode": "START", // Simple, memorable access code
                "isPublic": true,
                "requireName": false,
                "requireEmail": false
            },
            "metadata": {
                "tags": ["welcome", "seed"],
                "difficulty": "Beginner", 
                "estimatedTime": "3 minutes",
                "questionCount": 2,
                "isSeedTest": true,
                "canDelete": true,
                "createdAt": new Date().toISOString()
            },
            "visual": {
                "icon": "🎓",
                "color": "#4A90E2"
            },
            "shareId": "universal-" + Math.random().toString(36).substring(2, 15),
            "publishedAt": new Date().toISOString(),
            "totalAttempts": 0,
            "completedAttempts": 0,
            "averageScore": 0,
            "questionCount": 2,
            "isActive": true,
            "type": "shared",
            "source": "Starter"
        };
        
        // 4. Update localStorage
        let publishedTests = JSON.parse(localStorage.getItem('published_tests') || '[]');
        
        // Remove old seed tests
        publishedTests = publishedTests.filter(test => 
            !test.title.includes('Welcome') && 
            !test.metadata?.isSeedTest
        );
        
        // Add new universal seed test
        publishedTests.unshift(universalSeedTest);
        localStorage.setItem('published_tests', JSON.stringify(publishedTests));
        
        console.log('✅ Universal seed test created with access code: START');
        console.log('📝 Description includes the access code for users to see');
        console.log('🔄 Auto-fill will work on test pages');
        
        // 5. Instructions
        console.log('');
        console.log('🎯 HOW IT WORKS:');
        console.log('   1. Test shows "Access Code: START" in description');
        console.log('   2. When users visit test page, code auto-fills');
        console.log('   3. Works for all accounts universally');
        console.log('   4. Simple, memorable code: START');
        
        if (!isTestPage) {
            console.log('');
            console.log('🔄 Refreshing to Test Library...');
            setTimeout(() => {
                window.location.href = '/test-library';
            }, 2000);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
})();
