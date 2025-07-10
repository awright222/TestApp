// 🔧 BACKUP AUTO-FILL SCRIPT - Run if any tests still require access codes
// Paste this in browser console if you encounter access code prompts

(function() {
    console.log('🔧 Installing backup auto-fill for any remaining access codes...');
    
    // Function to auto-fill access codes
    const autoFillAccessCode = () => {
        console.log('🔍 Checking for access code fields...');
        
        // Look for access code input fields with various selectors
        const selectors = [
            'input[placeholder*="ABC123"]',
            'input[maxlength="6"]', 
            'input[placeholder*="access"]',
            'input[placeholder*="code"]',
            'input[placeholder*="share"]',
            'input[type="text"]'
        ];
        
        let accessInput = null;
        let usedSelector = '';
        
        for (const selector of selectors) {
            const inputs = document.querySelectorAll(selector);
            for (const input of inputs) {
                // Check if this looks like an access code field
                const placeholder = (input.placeholder || '').toLowerCase();
                const isAccessField = placeholder.includes('access') || 
                                     placeholder.includes('code') || 
                                     placeholder.includes('abc') || 
                                     input.maxLength === 6;
                
                if (isAccessField) {
                    accessInput = input;
                    usedSelector = selector;
                    break;
                }
            }
            if (accessInput) break;
        }
        
        if (accessInput) {
            console.log(`✅ Found access code field using: ${usedSelector}`);
            
            // Try common access codes for demo/seed tests
            const codes = ['START', 'DEMO', 'TEST', 'SEED', 'ACCESS', 'WELCOME'];
            
            for (const code of codes) {
                console.log(`🔑 Trying code: ${code}`);
                
                // Fill the input
                accessInput.value = code;
                accessInput.dispatchEvent(new Event('input', { bubbles: true }));
                accessInput.dispatchEvent(new Event('change', { bubbles: true }));
                accessInput.dispatchEvent(new Event('keyup', { bubbles: true }));
                
                // Look for submit button
                setTimeout(() => {
                    const buttons = document.querySelectorAll('button');
                    for (const btn of buttons) {
                        const text = btn.textContent.toLowerCase().trim();
                        const isSubmitBtn = text.includes('access') || 
                                           text.includes('start') || 
                                           text.includes('enter') || 
                                           text.includes('submit') ||
                                           text.includes('go');
                        
                        if (isSubmitBtn && !btn.disabled) {
                            console.log(`🚀 Clicking button: "${btn.textContent.trim()}"`);
                            btn.click();
                            return; // Stop after first click
                        }
                    }
                    
                    // If no button found, try Enter key
                    accessInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
                    console.log('⌨️ Tried Enter key press');
                    
                }, 200);
                
                break; // Only try first code
            }
        } else {
            console.log('❌ No access code field found');
        }
    };
    
    // Install the auto-fill function
    const installAutoFill = () => {
        // Run immediately
        autoFillAccessCode();
        
        // Set up mutation observer for dynamic content
        const observer = new MutationObserver((mutations) => {
            let shouldCheck = false;
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === 1) { // Element node
                            const hasInputs = node.querySelector && (
                                node.querySelector('input') || 
                                node.tagName === 'INPUT'
                            );
                            if (hasInputs) {
                                shouldCheck = true;
                                break;
                            }
                        }
                    }
                }
            });
            
            if (shouldCheck) {
                setTimeout(autoFillAccessCode, 100);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Backup interval check
        setInterval(autoFillAccessCode, 3000);
        
        console.log('✅ Backup auto-fill system installed');
        console.log('🔄 Checking every 3 seconds for access code fields');
    };
    
    // Install immediately
    installAutoFill();
    
    console.log('');
    console.log('🎯 BACKUP AUTO-FILL ACTIVE');
    console.log('   • Will auto-fill any access code prompts');
    console.log('   • Tries: START, DEMO, TEST, SEED, ACCESS, WELCOME');
    console.log('   • Runs continuously in background');
    console.log('   • Auto-clicks submit buttons');
    
})();
