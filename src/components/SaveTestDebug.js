import React, { useState } from 'react';
import { SavedTestsService } from '../SavedTestsService';
import { useAuth } from '../firebase/AuthContext';

export default function SaveTestDebug() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const testSave = async () => {
    setLoading(true);
    setResult('Testing save functionality...\n');
    
    // First, let's check what's currently in localStorage
    setResult(prev => prev + '\n=== CURRENT LOCALSTORAGE STATE ===\n');
    setResult(prev => prev + `saved_tests: ${localStorage.getItem('saved_tests')}\n`);
    setResult(prev => prev + `created_tests: ${localStorage.getItem('created_tests')}\n`);
    setResult(prev => prev + `All localStorage keys: ${Object.keys(localStorage).join(', ')}\n`);
    
    const testData = {
      id: Date.now().toString(),
      title: 'Debug Test Save',
      type: 'practice-test',
      progress: {
        current: 0,
        userAnswers: [],
        questionScore: [],
        questionSubmitted: [],
        totalQuestions: 1,
        completedQuestions: 0
      },
      questions: [{
        id: 1,
        text: 'Test question',
        choices: 'A. Option 1\nB. Option 2',
        correct_answer: 'A',
        question_type: 'multiple_choice'
      }],
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString()
    };
    
    try {
      setResult(prev => prev + '\n=== TESTING SAVE ===\n');
      setResult(prev => prev + 'Attempting to save test...\n');
      const saveResult = await SavedTestsService.saveTest(testData);
      setResult(prev => prev + `Save result: ${JSON.stringify(saveResult)}\n`);
      
      // Check localStorage again after save
      setResult(prev => prev + '\n=== LOCALSTORAGE AFTER SAVE ===\n');
      setResult(prev => prev + `saved_tests: ${localStorage.getItem('saved_tests')}\n`);
      
      setResult(prev => prev + '\n=== TESTING RETRIEVAL ===\n');
      setResult(prev => prev + 'Retrieving saved tests...\n');
      const savedTests = await SavedTestsService.getSavedTests();
      setResult(prev => prev + `Retrieved ${savedTests.length} tests\n`);
      setResult(prev => prev + `Tests: ${JSON.stringify(savedTests, null, 2)}\n`);
      
      // Test individual retrieval
      setResult(prev => prev + '\n=== TESTING INDIVIDUAL RETRIEVAL ===\n');
      const individualTest = await SavedTestsService.getTest(testData.id);
      setResult(prev => prev + `Individual test: ${JSON.stringify(individualTest, null, 2)}\n`);
      
      setResult(prev => prev + '\nSUCCESS: Save functionality works!\n');
    } catch (error) {
      setResult(prev => prev + `ERROR: ${error.message}\n`);
      setResult(prev => prev + `Stack: ${error.stack}\n`);
    } finally {
      setLoading(false);
    }
  };

  const clearData = () => {
    localStorage.removeItem('saved_tests');
    setResult('Cleared localStorage data\n');
  };

  const checkCurrentData = async () => {
    setResult('=== CURRENT DATA CHECK ===\n');
    setResult(prev => prev + `saved_tests in localStorage: ${localStorage.getItem('saved_tests')}\n`);
    setResult(prev => prev + `created_tests in localStorage: ${localStorage.getItem('created_tests')}\n`);
    
    try {
      const savedTests = await SavedTestsService.getSavedTests();
      setResult(prev => prev + `SavedTestsService.getSavedTests() returned: ${JSON.stringify(savedTests, null, 2)}\n`);
    } catch (error) {
      setResult(prev => prev + `Error from getSavedTests: ${error.message}\n`);
    }
  };

  return (
    <div style={{ padding: '2rem', background: '#FDF0D5', minHeight: '100vh' }}>
      <h1 style={{ color: '#003049' }}>Save Test Debug</h1>
      
      {/* Authentication Status */}
      <div style={{
        background: user ? '#d4edda' : '#f8d7da',
        border: `2px solid ${user ? '#28a745' : '#dc3545'}`,
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#003049' }}>Authentication Status</h3>
        {user ? (
          <div>
            <p><strong>✅ Logged In</strong></p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>UID:</strong> {user.uid}</p>
            <p style={{ color: '#28a745' }}>Tests will be saved to Firebase (cloud)</p>
          </div>
        ) : (
          <div>
            <p><strong>❌ Not Logged In</strong></p>
            <p style={{ color: '#dc3545' }}>Tests will be saved to localStorage only</p>
          </div>
        )}
      </div>
      
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={testSave}
          disabled={loading}
          style={{
            background: '#669BBC',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '8px',
            cursor: 'pointer',
            marginRight: '1rem'
          }}
        >
          {loading ? 'Testing...' : 'Test Save Function'}
        </button>
        
        <button
          onClick={checkCurrentData}
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '8px',
            cursor: 'pointer',
            marginRight: '1rem'
          }}
        >
          Check Current Data
        </button>
        
        <button
          onClick={clearData}
          style={{
            background: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Clear Data
        </button>
      </div>
      
      <div style={{
        background: 'white',
        padding: '1rem',
        borderRadius: '8px',
        border: '2px solid #669BBC',
        fontFamily: 'monospace',
        whiteSpace: 'pre-wrap',
        maxHeight: '500px',
        overflow: 'auto'
      }}>
        {result || 'Click "Test Save Function" to run the test...'}
      </div>
    </div>
  );
}
