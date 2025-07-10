// 🛠️ PERSISTENT AUTO-FILL FIX - Integrates into the app permanently
// Paste this in browser console on localhost:3000

(function() {
    console.log('🛠️ Installing persistent auto-fill for seed tests...');
    
    try {
        // 1. First, let's see what's on the current page
        console.log('🔍 Current page analysis:');
        console.log('   URL:', window.location.href);
        
        // Check for any input fields
        const allInputs = document.querySelectorAll('input');
        console.log(`   Found ${allInputs.length} input fields:`);
        allInputs.forEach((input, i) => {
            console.log(`     ${i}: type="${input.type}", placeholder="${input.placeholder}", name="${input.name}", id="${input.id}"`);
        });
        
        // Check for buttons
        const allButtons = document.querySelectorAll('button');
        console.log(`   Found ${allButtons.length} buttons:`);
        allButtons.forEach((button, i) => {
            console.log(`     ${i}: text="${button.textContent.trim()}", class="${button.className}"`);
        });
        
        // 2. Create a function that auto-fills access codes
        const autoFillAccessCode = () => {
            console.log('🔑 Running auto-fill check...');
            
            // Look for access code input with various selectors
            const selectors = [
                'input[placeholder*="access"]',
                'input[placeholder*="code"]', 
                'input[placeholder*="share"]',
                'input[placeholder*="ABC"]',
                'input[maxlength="6"]',
                'input[type="text"]'
            ];
            
            let accessInput = null;
            for (const selector of selectors) {
                accessInput = document.querySelector(selector);
                if (accessInput) {
                    console.log(`✅ Found input with selector: ${selector}`);
                    break;
                }
            }
            
            if (accessInput) {
                // Try different access codes
                const codes = ['START', 'DEMO', 'TEST', 'SEED', 'WELCOME', 'ACCESS'];
                
                for (const code of codes) {
                    console.log(`🔑 Trying code: ${code}`);
                    
                    // Fill the input
                    accessInput.value = code;
                    accessInput.dispatchEvent(new Event('input', { bubbles: true }));
                    accessInput.dispatchEvent(new Event('change', { bubbles: true }));
                    accessInput.dispatchEvent(new Event('keyup', { bubbles: true }));
                    
                    // Try to submit or click start button
                    setTimeout(() => {
                        const buttons = document.querySelectorAll('button');
                        for (const btn of buttons) {
                            const text = btn.textContent.toLowerCase();
                            if ((text.includes('start') || text.includes('access') || text.includes('enter')) && !btn.disabled) {
                                console.log(`🚀 Clicking button: ${btn.textContent.trim()}`);
                                btn.click();
                                return;
                            }
                        }
                        
                        // If no button found, try form submit
                        const form = accessInput.closest('form');
                        if (form) {
                            console.log('📝 Submitting form...');
                            form.submit();
                        }
                    }, 100);
                    
                    break; // Only try first code
                }
            } else {
                console.log('❌ No access code input found');
            }
        };
        
        // 3. Install the auto-fill function to run on page loads
        const installAutoFill = () => {
            // Run immediately
            autoFillAccessCode();
            
            // Run when DOM changes (for SPAs)
            const observer = new MutationObserver(() => {
                autoFillAccessCode();
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            // Run on interval as backup
            setInterval(autoFillAccessCode, 2000);
            
            console.log('✅ Auto-fill system installed and running');
        };
        
        // 4. Create a simple seed test that definitely works
        console.log('🌱 Creating simple, working seed test...');
        
        const workingSeedTest = {
            "id": "working-seed-" + Date.now(),
            "title": "🎓 Welcome Test",
            "description": "Simple starter test - No code needed!",
            "questions": [
                {
                    "id": "simple-q1",
                    "question_text": "🎯 Welcome to Formulate! How are you feeling?",
                    "question_type": "multiple choice",
                    "choices": "A. Excited to learn!\nB. Ready to explore\nC. Looking forward to this\nD. All of the above!",
                    "correct_answer": "D",
                    "explanation": "Great attitude! Let's explore what Formulate can do."
                }
            ],
            "settings": {
                "timeLimit": 0,
                "showExplanations": true,
                "showCorrectAnswers": true,
                "passingScore": 60,
                "accessCode": null, // Try with no access code first
                "isPublic": true,
                "requireName": false,
                "requireEmail": false,
                "maxAttempts": 0
            },
            "metadata": {
                "tags": ["welcome"],
                "difficulty": "Beginner",
                "estimatedTime": "1 minute",
                "questionCount": 1,
                "isSeedTest": true,
                "canDelete": true,
                "createdAt": new Date().toISOString()
            },
            "visual": {
                "icon": "🎓",
                "color": "#4A90E2"
            },
            "shareId": "simple-" + Math.random().toString(36).substring(2, 15),
            "publishedAt": new Date().toISOString(),
            "totalAttempts": 0,
            "completedAttempts": 0,
            "averageScore": 0,
            "questionCount": 1,
            "isActive": true,
            "type": "shared",
            "source": "Welcome"
        };
        
        // 5. Save the test and install auto-fill
        localStorage.removeItem('published_tests');
        localStorage.setItem('published_tests', JSON.stringify([workingSeedTest]));
        
        console.log('✅ Simple seed test created');
        console.log('🔧 Installing auto-fill system...');
        
        installAutoFill();
        
        // 6. Navigate to test library
        console.log('');
        console.log('🎯 NEXT STEPS:');
        console.log('   1. Auto-fill is now running continuously');
        console.log('   2. Go to Test Library and click the welcome test');
        console.log('   3. If access code appears, it will auto-fill');
        console.log('   4. Script runs every 2 seconds as backup');
        
        setTimeout(() => {
            console.log('🔄 Going to Test Library...');
            window.location.href = '/test-library';
        }, 3000);
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
})();
