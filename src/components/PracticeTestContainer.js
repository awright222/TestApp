
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import TestSelector from './TestSelector';
import PracticeTest from './PracticeTest';
import { CreatedTestsService } from '../services/CreatedTestsService';
import { useAuth } from '../firebase/AuthContext';

function PracticeTestContainer({ searchTerm, onClearSearch }) {
  const { testId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [selectedTest, setSelectedTest] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('=== PracticeTestContainer useEffect triggered ===');
    console.log('testId from params:', testId);
    console.log('location.state:', location.state);
    console.log('location.pathname:', location.pathname);
    
    // Check if we have a saved test from navigation state
    if (location.state?.savedTest) {
      const savedTest = location.state.savedTest;
      console.log('=== Loading saved test ===');
      console.log('Full savedTest object:', savedTest);
      console.log('savedTest.questions:', savedTest.questions);
      console.log('savedTest.progress:', savedTest.progress);
      console.log('savedTest.progress?.questions:', savedTest.progress?.questions);
      
      // Extract questions and progress from saved test structure
      const questions = savedTest.questions || savedTest.progress?.questions || [];
      const progress = savedTest.progress || null;
      
      console.log('Extracted questions:', questions);
      console.log('Questions length:', questions.length);
      console.log('Extracted progress:', progress);
      
      if (questions.length === 0) {
        console.error('❌ No questions found in saved test');
        console.error('savedTest structure:', Object.keys(savedTest));
        console.error('Full savedTest:', JSON.stringify(savedTest, null, 2));
        
        const errorMessage = 'This saved test is missing question data and cannot be continued. This can happen if the test was saved incorrectly or corrupted. Please delete this test and create a new one.';
        setSelectedTest({ 
          error: errorMessage, 
          testId: savedTest.id,
          isCorrupted: true
        });
        return;
      }
      
      console.log('✅ Questions found, transforming test...');
      
      // Transform saved test to the expected format and include progress
      const transformedTest = {
        title: savedTest.title,
        color: savedTest.originalTest?.color || '#669BBC',
        questions: questions,
        savedProgress: progress,
        isSavedTest: true
      };
      
      console.log('Transformed test:', transformedTest);
      setSelectedTest(transformedTest);
      return;
    }

    console.log('No saved test in location.state, checking for custom test...');
    console.log('testId:', testId);
    
    // If no saved test, proceed with custom test loading logic
    const loadCustomTest = async () => {
      console.log('Loading custom test with ID:', testId);
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
          console.log('Custom test not found:', { testId, customTest, user: user?.email });
          // Instead of alert, show an error state with auth context
          const errorMessage = user 
            ? 'Test not found in your account' 
            : 'Test not found - you may need to log in to access this test';
          setSelectedTest({ error: errorMessage, testId, needsAuth: !user });
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
  }, [testId, navigate, location.state, user]);

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
        <div style={{ fontSize: '3rem' }}>{selectedTest.isCorrupted ? '💥' : '❌'}</div>
        <h2 style={{ color: '#003049', marginBottom: '1rem' }}>
          {selectedTest.isCorrupted ? 'Test Data Corrupted' : 'Test Not Found'}
        </h2>
        <p style={{ color: '#669BBC', marginBottom: '0.5rem', maxWidth: '500px' }}>
          {selectedTest.error}
        </p>
        <p style={{ color: '#669BBC', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Test ID: {selectedTest.testId}
        </p>
        
        {selectedTest.isCorrupted && (
          <div style={{ 
            background: 'rgba(220, 53, 69, 0.1)', 
            border: '2px solid #dc3545', 
            borderRadius: '8px', 
            padding: '1rem', 
            marginBottom: '2rem',
            maxWidth: '500px'
          }}>
            <h3 style={{ color: '#721c24', marginBottom: '0.5rem' }}>🔧 How to Fix This</h3>
            <p style={{ color: '#721c24', fontSize: '0.9rem', marginBottom: '1rem' }}>
              This test is missing its question data. This usually happens when:
            </p>
            <ul style={{ color: '#721c24', fontSize: '0.9rem', textAlign: 'left', marginBottom: '1rem' }}>
              <li>The test was saved incorrectly</li>
              <li>Data got corrupted during sync</li>
              <li>The test was created by an old version of the app</li>
            </ul>
            <p style={{ color: '#721c24', fontSize: '0.9rem' }}>
              <strong>Solution:</strong> Delete this test and start a new practice session.
            </p>
          </div>
        )}
        
        {selectedTest.needsAuth && (
          <div style={{ 
            background: 'rgba(255, 193, 7, 0.1)', 
            border: '2px solid #ffc107', 
            borderRadius: '8px', 
            padding: '1rem', 
            marginBottom: '2rem',
            maxWidth: '500px'
          }}>
            <h3 style={{ color: '#856404', marginBottom: '0.5rem' }}>🔐 Cross-Device Access</h3>
            <p style={{ color: '#856404', fontSize: '0.9rem', marginBottom: '1rem' }}>
              To access your tests from any device, you need to be logged in. This enables cloud sync 
              so you can start a test on one device and continue on another.
            </p>
            <button 
              onClick={() => {
                // Store the current test ID in sessionStorage so we can redirect back after login
                sessionStorage.setItem('pendingTestAccess', testId);
                // Navigate to root (which will show Landing page for unauthenticated users)
                navigate('/');
              }}
              style={{
                background: '#ffc107',
                color: '#212529',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                width: '100%'
              }}
            >
              🚀 Log In to Sync Tests
            </button>
          </div>
        )}
        
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
