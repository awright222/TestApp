import React, { useState } from 'react';
import { SavedTestsService } from '../SavedTestsService';
import { TestTitleInference } from '../utils/testTitleInference';

export default function SavedTestDebugger() {
  const [debugData, setDebugData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDebugSavedTests = async () => {
    setLoading(true);
    try {
      const savedTests = await SavedTestsService.getSavedTests();
      
      const debugInfo = savedTests.map(test => {
        const inferredTitle = TestTitleInference.inferTitle(test);
        const firstQuestion = test.questions?.[0]?.question || 'No questions';
        
        return {
          id: test.id,
          saveTitle: test.title,
          originalTestTitle: test.originalTest?.title || 'None',
          inferredTitle: inferredTitle,
          questionsCount: test.questions?.length || 0,
          firstQuestionPreview: firstQuestion.substring(0, 100) + '...',
          hasOriginalTest: !!test.originalTest,
          structure: Object.keys(test)
        };
      });
      
      setDebugData(debugInfo);
    } catch (error) {
      console.error('Debug error:', error);
      setDebugData([{ error: error.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', background: '#f5f5f5', borderRadius: '8px', margin: '2rem' }}>
      <h2>Saved Test Debugger</h2>
      <button 
        onClick={handleDebugSavedTests}
        disabled={loading}
        style={{
          background: '#007bff',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '6px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1
        }}
      >
        {loading ? 'Analyzing...' : 'Debug Saved Tests'}
      </button>
      
      {debugData && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Debug Results:</h3>
          <pre style={{ background: 'white', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
            {JSON.stringify(debugData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
