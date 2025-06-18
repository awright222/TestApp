import React, { useState } from 'react';
import { SavedTestsService } from '../SavedTestsService';

export default function SaveTestDebug() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testSave = async () => {
    setLoading(true);
    setResult('Testing save functionality...\n');
    
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
      setResult(prev => prev + 'Attempting to save test...\n');
      const saveResult = await SavedTestsService.saveTest(testData);
      setResult(prev => prev + `Save result: ${JSON.stringify(saveResult)}\n`);
      
      setResult(prev => prev + 'Retrieving saved tests...\n');
      const savedTests = await SavedTestsService.getSavedTests();
      setResult(prev => prev + `Retrieved ${savedTests.length} tests\n`);
      setResult(prev => prev + `Tests: ${JSON.stringify(savedTests, null, 2)}\n`);
      
      setResult(prev => prev + 'SUCCESS: Save functionality works!\n');
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

  return (
    <div style={{ padding: '2rem', background: '#FDF0D5', minHeight: '100vh' }}>
      <h1 style={{ color: '#003049' }}>Save Test Debug</h1>
      
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
