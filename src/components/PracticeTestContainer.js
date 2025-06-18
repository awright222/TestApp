
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import TestSelector from './TestSelector';
import PracticeTest from './PracticeTest';
import { CreatedTestsService } from '../services/CreatedTestsService';

function PracticeTestContainer({ searchTerm, onClearSearch }) {
  const { testId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTest, setSelectedTest] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if we have a saved test from navigation state
    if (location.state?.savedTest) {
      const savedTest = location.state.savedTest;
      console.log('Loading saved test:', savedTest);
      
      // Transform saved test to the expected format and include progress
      const transformedTest = {
        title: savedTest.title,
        color: savedTest.color || '#669BBC',
        questions: savedTest.questions || [],
        savedProgress: savedTest.progress,
        isSavedTest: true
      };
      
      setSelectedTest(transformedTest);
      return;
    }

    // If no saved test, proceed with custom test loading logic
    const loadCustomTest = async () => {
      setLoading(true);
      try {
        const customTest = await CreatedTestsService.getTestById(testId);
        if (customTest && customTest.questions && Array.isArray(customTest.questions)) {
          // Transform the custom test to match the expected format
          const transformedTest = {
            title: customTest.title,
            color: customTest.color || '#669BBC',
            questions: customTest.questions.map((q, index) => ({
              ...q,
              id: index + 1
            })),
            isCustomTest: true,
            customTestId: customTest.id
          };
          setSelectedTest(transformedTest);
        } else {
          console.log('Custom test not found:', { testId, customTest });
          // Instead of alert, show an error state
          setSelectedTest({ error: 'Test not found', testId });
        }
      } catch (error) {
        console.error('Error loading custom test:', error);
        // Instead of alert, show an error state
        setSelectedTest({ error: 'Failed to load test', details: error.message, testId });
      } finally {
        setLoading(false);
      }
    };

    if (testId) {
      loadCustomTest();
    }
  }, [testId, navigate, location.state]);

  const handleBackToSelection = () => {
    if (testId) {
      // If launched from custom test, go back to My Created Tests
      navigate('/my-tests');
    } else {
      // If from normal test selection, go back to test selector
      setSelectedTest(null);
    }
  };

  if (loading) {
    return (
      <div className="practice-test-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh',
        flexDirection: 'column',
        gap: '1rem',
        background: '#FDF0D5',
        borderRadius: '16px',
        minHeight: 'calc(100vh - 4rem)',
        padding: '2rem'
      }}>
        <div style={{ fontSize: '2rem' }}>🔄</div>
        <p style={{ color: '#669BBC' }}>Loading your custom test...</p>
      </div>
    );
  }

  if (!selectedTest) {
    return (
      <div className="practice-test-container" style={{ background: '#FDF0D5', borderRadius: '16px', minHeight: 'calc(100vh - 4rem)', padding: '2rem' }}>
        <TestSelector onTestSelect={setSelectedTest} />
      </div>
    );
  }

  // Handle error state
  if (selectedTest.error) {
    return (
      <div className="practice-test-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh',
        flexDirection: 'column',
        gap: '1rem',
        background: '#FDF0D5',
        borderRadius: '16px',
        minHeight: 'calc(100vh - 4rem)',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem' }}>❌</div>
        <h2 style={{ color: '#003049', marginBottom: '1rem' }}>Test Not Found</h2>
        <p style={{ color: '#669BBC', marginBottom: '0.5rem' }}>
          The test you're trying to access doesn't exist or couldn't be loaded.
        </p>
        <p style={{ color: '#669BBC', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Test ID: {selectedTest.testId}
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => navigate('/my-tests')}
            style={{
              background: '#669BBC',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            ← Back to My Tests
          </button>
          <button 
            onClick={() => navigate('/create-test')}
            style={{
              background: '#28a745',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Create New Test
          </button>
        </div>
        {selectedTest.details && (
          <details style={{ marginTop: '2rem', color: '#669BBC', fontSize: '0.8rem' }}>
            <summary>Technical Details</summary>
            <pre style={{ marginTop: '0.5rem', background: 'rgba(255,255,255,0.5)', padding: '1rem', borderRadius: '4px' }}>
              {selectedTest.details}
            </pre>
          </details>
        )}
      </div>
    );
  }

  return (
    <div className="practice-test-container" style={{ background: '#FDF0D5', borderRadius: '16px', minHeight: 'calc(100vh - 4rem)' }}>
      <PracticeTest 
        selectedTest={selectedTest} 
        onBackToSelection={handleBackToSelection}
        searchTerm={searchTerm}
        onClearSearch={onClearSearch}
      />
    </div>
  );
}

export default PracticeTestContainer;
