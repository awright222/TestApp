import React, { useState, useEffect } from 'react';
import { SavedTestsService } from '../SavedTestsService';

export default function NoAuthDebug() {
  const [savedTests, setSavedTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState({
    title: 'Debug Test ' + new Date().toLocaleTimeString(),
    type: 'practice-test',
    progress: {
      current: 1,
      completed: [0],
      answers: { 0: 'A' },
      totalQuestions: 3,
      completedQuestions: 1
    },
    questions: [
      {
        id: 1,
        question: 'Debug test question 1?',
        choices: 'A. Answer A\nB. Answer B\nC. Answer C\nD. Answer D',
        correct_answer: 'A'
      },
      {
        id: 2,
        question: 'Debug test question 2?',
        choices: 'A. Answer A\nB. Answer B\nC. Answer C\nD. Answer D',
        correct_answer: 'B'
      },
      {
        id: 3,
        question: 'Debug test question 3?',
        choices: 'A. Answer A\nB. Answer B\nC. Answer C\nD. Answer D',
        correct_answer: 'C'
      }
    ],
    dateCreated: new Date().toISOString(),
    dateModified: new Date().toISOString()
  });

  const loadTests = async () => {
    setLoading(true);
    try {
      const tests = await SavedTestsService.getSavedTests();
      setSavedTests(tests);
      console.log('Loaded tests:', tests);
    } catch (error) {
      console.error('Error loading tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTest = async () => {
    try {
      const dataToSave = {
        ...testData,
        id: Date.now().toString(),
        title: 'Debug Test ' + new Date().toLocaleTimeString()
      };
      console.log('Saving test data:', dataToSave);
      await SavedTestsService.saveTest(dataToSave);
      alert('Test saved successfully!');
      await loadTests(); // Refresh list
    } catch (error) {
      console.error('Error saving test:', error);
      alert('Error saving test: ' + error.message);
    }
  };

  const clearAll = async () => {
    if (window.confirm('Clear all saved tests?')) {
      try {
        await SavedTestsService.clearAllTests();
        await loadTests();
        alert('All tests cleared!');
      } catch (error) {
        console.error('Error clearing tests:', error);
        alert('Error clearing tests: ' + error.message);
      }
    }
  };

  const simulateContinue = (test) => {
    console.log('=== Simulating Continue Test ===');
    console.log('Test data structure:', test);
    console.log('Questions at root:', test.questions?.length || 'No questions at root');
    console.log('Questions in progress:', test.progress?.questions?.length || 'No questions in progress');
    console.log('Progress data:', test.progress);
    
    // Mimic the PracticeTestContainer logic
    const questions = test.questions || test.progress?.questions || [];
    const progress = test.progress || null;
    
    console.log('Extracted questions:', questions);
    console.log('Extracted progress:', progress);
    
    if (questions.length === 0) {
      alert('❌ Test has no questions - this would cause "Continue Test" to fail\n\nQuestions at root: ' + (test.questions?.length || 0) + '\nQuestions in progress: ' + (test.progress?.questions?.length || 0));
      return;
    }
    
    if (!progress) {
      alert('❌ Test has no progress data - this would cause continue to fail');
      return;
    }
    
    alert('✅ Test structure looks good for Continue Test functionality\n\nQuestions: ' + questions.length + '\nProgress: Current = ' + progress.current + ', Completed = ' + progress.completedQuestions + '/' + progress.totalQuestions);
  };

  useEffect(() => {
    loadTests();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>No-Auth Debug - Saved Tests</h1>
      <p>This debug page works without authentication to test localStorage save/load functionality.</p>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          onClick={saveTest}
          style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}
        >
          💾 Save New Test
        </button>
        <button 
          onClick={loadTests}
          disabled={loading}
          style={{ background: '#2196F3', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}
        >
          🔄 {loading ? 'Loading...' : 'Refresh Tests'}
        </button>
        <button 
          onClick={clearAll}
          style={{ background: '#f44336', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}
        >
          🗑️ Clear All Tests
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Found {savedTests.length} saved test{savedTests.length !== 1 ? 's' : ''}</h3>
        
        {savedTests.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No saved tests found. Click "Save New Test" to create one.</p>
        ) : (
          <div>
            {savedTests.map((test, index) => (
              <div key={test.id || index} style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                padding: '15px', 
                margin: '10px 0',
                backgroundColor: '#f9f9f9'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>{test.title}</h4>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                  <div><strong>Type:</strong> {test.type}</div>
                  <div><strong>Questions:</strong> {test.questions?.length || 'No questions'}</div>
                  <div><strong>Progress:</strong> {test.progress?.completedQuestions || 0} / {test.progress?.totalQuestions || 0}</div>
                  <div><strong>Current:</strong> Question {(test.progress?.current || 0) + 1}</div>
                  <div><strong>Created:</strong> {test.dateCreated ? new Date(test.dateCreated).toLocaleString() : 'Unknown'}</div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => simulateContinue(test)}
                    style={{ background: '#FF9800', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    🔍 Test Continue Structure
                  </button>
                  <button 
                    onClick={() => console.log('Full test data:', test)}
                    style={{ background: '#9C27B0', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    📋 Log to Console
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '30px', padding: '15px', background: '#e3f2fd', borderRadius: '8px' }}>
        <h4 style={{ margin: '0 0 10px 0' }}>Debug Info:</h4>
        <div style={{ fontSize: '14px', color: '#666' }}>
          <div><strong>Auth Status:</strong> No authentication (testing localStorage only)</div>
          <div><strong>Storage Key:</strong> {SavedTestsService.STORAGE_KEY}</div>
          <div><strong>Browser:</strong> {navigator.userAgent.split(' ').slice(-2).join(' ')}</div>
          <div><strong>Local Storage Available:</strong> {typeof(Storage) !== "undefined" ? '✅ Yes' : '❌ No'}</div>
        </div>
      </div>
    </div>
  );
}
