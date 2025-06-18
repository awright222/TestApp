import React, { useState } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { SavedTestsService } from '../SavedTestsService';

export default function FirebaseSaveDebug() {
  const { user } = useAuth();
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testFirebaseSave = async () => {
    setLoading(true);
    setTestResult('');
    
    console.log('=== Firebase Save Debug Test ===');
    console.log('Current user:', user?.email || 'not logged in');
    
    if (!user) {
      setTestResult('❌ Not logged in - Firebase save cannot be tested');
      setLoading(false);
      return;
    }
    
    try {
      // Create test data with questions
      const testData = {
        id: Date.now().toString(),
        title: `Firebase Save Test ${new Date().toLocaleTimeString()}`,
        type: 'practice',
        score: 85,
        totalQuestions: 2,
        correctAnswers: 1,
        timeSpent: 120,
        progress: {
          current: 1,
          answers: { 0: 'A' },
          flagged: [],
          timeSpent: 60
        },
        questions: [
          {
            id: 1,
            question: "Test question 1?",
            choices: "A. Answer A\\nB. Answer B\\nC. Answer C\\nD. Answer D",
            correct: "A",
            explanation: "Test explanation"
          },
          {
            id: 2,
            question: "Test question 2?",
            choices: "A. Answer A\\nB. Answer B\\nC. Answer C\\nD. Answer D",
            correct: "B",
            explanation: "Test explanation 2"
          }
        ]
      };
      
      console.log('Test data created:', {
        id: testData.id,
        title: testData.title,
        questionsCount: testData.questions.length
      });
      
      // Call save
      console.log('Calling SavedTestsService.saveTest...');
      const result = await SavedTestsService.saveTest(testData);
      console.log('Save result:', result);
      
      // Wait a moment for Firebase to sync
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if it was saved
      console.log('Fetching saved tests...');
      const savedTests = await SavedTestsService.getSavedTests();
      console.log('All saved tests:', savedTests.map(t => ({ id: t.id, title: t.title, synced: t.synced })));
      
      const savedTest = savedTests.find(t => t.id === testData.id);
      if (savedTest) {
        setTestResult(`✅ Test saved successfully!\\n\\nTest ID: ${savedTest.id}\\nTitle: ${savedTest.title}\\nSynced: ${savedTest.synced}\\nQuestions: ${savedTest.questions?.length || 0}\\n\\nCheck console for detailed logs.`);
      } else {
        setTestResult(`❌ Test was not found in saved tests after saving.\\n\\nThis suggests the save didn't work properly.\\nCheck console for error details.`);
      }
      
    } catch (error) {
      console.error('❌ Save test failed:', error);
      setTestResult(`❌ Save failed: ${error.message}\\n\\nCheck console for full error details.`);
    }
    
    setLoading(false);
  };

  const checkCurrentTests = async () => {
    console.log('=== Checking Current Saved Tests ===');
    try {
      const tests = await SavedTestsService.getSavedTests();
      console.log('Current saved tests:', tests);
      setTestResult(`Current saved tests (${tests.length} total):\\n\\n${tests.map(t => `• ${t.title} (ID: ${t.id}, Synced: ${t.synced || 'N/A'})`).join('\\n')}\\n\\nCheck console for full details.`);
    } catch (error) {
      console.error('Error fetching tests:', error);
      setTestResult(`❌ Error fetching tests: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Firebase Save Debug</h1>
      
      <div style={{ 
        background: user ? '#d4edda' : '#f8d7da', 
        border: `1px solid ${user ? '#c3e6cb' : '#f1b0b7'}`,
        color: user ? '#155724' : '#721c24',
        padding: '10px', 
        borderRadius: '5px',
        marginBottom: '20px'
      }}>
        <strong>Auth Status:</strong> {user ? `✅ Logged in as ${user.email}` : '❌ Not logged in'}
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testFirebaseSave}
          disabled={loading || !user}
          style={{
            padding: '10px 20px',
            backgroundColor: user ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: user ? 'pointer' : 'not-allowed',
            marginRight: '10px'
          }}
        >
          {loading ? 'Testing...' : 'Test Firebase Save'}
        </button>
        
        <button 
          onClick={checkCurrentTests}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Check Current Tests
        </button>
      </div>
      
      {testResult && (
        <div style={{
          background: '#f8f9fa',
          border: '1px solid #dee2e6',
          padding: '15px',
          borderRadius: '5px',
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace'
        }}>
          {testResult}
        </div>
      )}
      
      <div style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
        <p><strong>Instructions:</strong></p>
        <ol>
          <li>Make sure you're logged in (use the test login page if needed)</li>
          <li>Click "Test Firebase Save" to create and save a test</li>
          <li>Check the browser console for detailed logs</li>
          <li>Click "Check Current Tests" to see all saved tests</li>
        </ol>
      </div>
    </div>
  );
}
