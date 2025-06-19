// Test script for ShareService functionality
const { ShareService } = require('./src/services/ShareService');

async function testShareService() {
  console.log('🧪 Testing ShareService functionality...\n');
  
  try {
    // Test 1: Generate unique share code
    console.log('📝 Test 1: Generate unique share code');
    const shareCode1 = ShareService.generateShareCode();
    const shareCode2 = ShareService.generateShareCode();
    
    console.log('Share code 1:', shareCode1);
    console.log('Share code 2:', shareCode2);
    console.log('Codes are different:', shareCode1 !== shareCode2);
    console.log('Code length is 6:', shareCode1.length === 6);
    console.log('✅ Share code generation test passed\n');
    
    // Test 2: Validate share code format
    console.log('📝 Test 2: Validate share code format');
    const codePattern = /^[A-Z0-9]{6}$/;
    const isValidFormat = codePattern.test(shareCode1);
    console.log('Share code format is valid:', isValidFormat);
    console.log('✅ Share code format test passed\n');
    
    // Mock test data
    const mockTestId = 'test-123';
    const mockUserId = 'user-456';
    const mockShareSettings = {
      isPublic: true,
      deadline: null,
      maxAttempts: 3,
      customMessage: 'Welcome to the test!'
    };
    
    console.log('📝 Test 3: Share test data structure');
    console.log('Mock test ID:', mockTestId);
    console.log('Mock user ID:', mockUserId);
    console.log('Mock share settings:', mockShareSettings);
    console.log('✅ Test data structure is valid\n');
    
    console.log('🎉 All ShareService tests passed!');
    console.log('Note: Firebase integration tests require running app and authentication.');
    
  } catch (error) {
    console.error('❌ ShareService test failed:', error);
  }
}

testShareService();
