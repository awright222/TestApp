import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreatedTestsService } from '../services/CreatedTestsService';

export default function Debug() {
  const navigate = useNavigate();
  const [storageData, setStorageData] = useState({});
  const [tests, setTests] = useState([]);

  useEffect(() => {
    loadDebugInfo();
  }, []);

  const loadDebugInfo = async () => {
    // Get all localStorage data
    const storage = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      try {
        storage[key] = JSON.parse(localStorage.getItem(key));
      } catch {
        storage[key] = localStorage.getItem(key);
      }
    }
    setStorageData(storage);

    // Get tests via service
    try {
      const tests = await CreatedTestsService.getCreatedTests();
      setTests(tests);
    } catch (error) {
      console.error('Error loading tests:', error);
    }
  };

  const clearStorage = () => {
    localStorage.clear();
    loadDebugInfo();
    alert('Storage cleared!');
  };

  const createTestTest = async () => {
    try {
      const testData = {
        title: 'Debug Test ' + Date.now(),
        description: 'Test created from debug page',
        questions: [
          {
            question_text: 'What is 1+1?',
            question_type: 'multiple choice',
            choices: 'A) 1\nB) 2\nC) 3\nD) 4',
            correct_answer: 'B',
            explanation: 'Basic math'
          }
        ]
      };
      
      console.log('Creating test with data:', testData);
      const result = await CreatedTestsService.createTest(testData);
      console.log('Debug test created:', result);
      
      // Force reload the debug info
      await loadDebugInfo();
      alert('Debug test created! Check the console for logs.');
    } catch (error) {
      console.error('Error creating debug test:', error);
      alert('Error creating test: ' + error.message);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Debug Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={loadDebugInfo} style={{ marginRight: '10px' }}>
          Refresh Data
        </button>
        <button onClick={clearStorage} style={{ marginRight: '10px' }}>
          Clear Storage
        </button>
        <button onClick={createTestTest}>
          Create Debug Test
        </button>
        <button onClick={() => navigate('/my-tests')} style={{ marginLeft: '10px' }}>
          Go to My Tests
        </button>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <h2>Tests from Service ({tests.length})</h2>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '10px', 
            borderRadius: '4px',
            fontSize: '12px',
            overflow: 'auto',
            maxHeight: '400px'
          }}>
            {JSON.stringify(tests, null, 2)}
          </pre>
        </div>

        <div style={{ flex: 1 }}>
          <h2>Raw LocalStorage</h2>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '10px', 
            borderRadius: '4px',
            fontSize: '12px',
            overflow: 'auto',
            maxHeight: '400px'
          }}>
            {JSON.stringify(storageData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
