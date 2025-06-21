
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Papa from 'papaparse';
import TestSelector from './TestSelector';
import PracticeTest from './PracticeTest';
import { CreatedTestsService } from '../services/CreatedTestsService';
import { useAuth } from '../firebase/AuthContext';

function PracticeTestContainer({ 
  searchTerm, 
  onClearSearch, 
  test, 
  onTestComplete, 
  isSharedTest = false, 
  sharedTestInfo = null 
}) {
  console.log('🚀 PracticeTestContainer: Component function called!');
  console.log('🚀 PracticeTestContainer: Props received:', { searchTerm, test, isSharedTest, sharedTestInfo });
  
  const { testId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [selectedTest, setSelectedTest] = useState(null);
  const [loading, setLoading] = useState(false);

  console.log('🚀 PracticeTestContainer: Hooks initialized');
  console.log('🚀 PracticeTestContainer: testId from params:', testId);
  console.log('🚀 PracticeTestContainer: location:', location);
  console.log('🚀 PracticeTestContainer: user:', !!user);

  useEffect(() => {
    console.log('🔥 PracticeTestContainer: useEffect triggered!');
    console.log('🔥 PracticeTestContainer: testId:', testId);
    console.log('🔥 PracticeTestContainer: test prop:', test);
    console.log('🔥 PracticeTestContainer: isSharedTest:', isSharedTest);
    console.log('🔥 PracticeTestContainer: location.state:', location.state);
    console.log('🔥 PracticeTestContainer: selectedTest state:', selectedTest);
    
    // Prevent infinite loops by checking if we already have a selectedTest
    if (selectedTest) {
      console.log('🔥 PracticeTestContainer: selectedTest already set, skipping useEffect');
      return;
    }
    
    // If test is passed as prop (for shared tests), use it directly
    if (test && isSharedTest) {
      const transformedTest = {
        title: test.title,
        color: test.color || '#669BBC',
        questions: test.questions.map((q, index) => ({
          ...q,
          id: index + 1
        })),
        isSharedTest: true,
        sharedTestInfo
      };
      setSelectedTest(transformedTest);
      return;
    }

    // Check if we have a selected test from Test Library (original practice test)
    if (location.state?.selectedTest) {
      const selectedTestFromLibrary = location.state.selectedTest;
      console.log('🔥 PracticeTestContainer: Found selectedTest in location.state:', selectedTestFromLibrary);
      
      // This is an original practice test with csvUrl - treat it like a test selection
      if (selectedTestFromLibrary.csvUrl) {
        console.log('🔥 PracticeTestContainer: selectedTest has csvUrl, loading CSV questions...');
        
        // Load questions from CSV using Papa Parse
        setLoading(true);
        Papa.parse(selectedTestFromLibrary.csvUrl, {
          download: true,
          header: true,
          complete: (result) => {
            console.log('🔥 PracticeTestContainer: CSV parse complete for selectedTest');
            const filtered = result.data.filter(q => q.question_text && q.question_text.trim());
            
            if (filtered.length > 0) {
              const transformedTest = {
                title: selectedTestFromLibrary.title,
                color: selectedTestFromLibrary.color || '#669BBC',
                questions: filtered.map((q, index) => ({
                  ...q,
                  id: index + 1
                })),
                type: 'practice',
                csvUrl: selectedTestFromLibrary.csvUrl,
                originalTest: selectedTestFromLibrary
              };
              setSelectedTest(transformedTest);
            } else {
              setSelectedTest({ error: 'No valid questions found in the test file.' });
            }
            setLoading(false);
          },
          error: (error) => {
            console.error('🔥 PracticeTestContainer: Error loading CSV for selectedTest:', error);
            setSelectedTest({ error: 'Failed to load test questions from CSV file.' });
            setLoading(false);
          }
        });
        return;
      } else {
        // Transform it to the format expected by PracticeTest (no CSV)
        const transformedTest = {
          ...selectedTestFromLibrary,
          type: 'practice'
        };
        setSelectedTest(transformedTest);
        return;
      }
    }
    
    // Check if we have a saved test from navigation state
    if (location.state?.savedTest) {
      const savedTest = location.state.savedTest;
      
      // Extract questions and progress from saved test structure
      const questions = savedTest.questions || savedTest.progress?.questions || [];
      const progress = savedTest.progress || null;
      
      if (questions.length === 0) {
        console.error('❌ No questions found in saved test');
        
        const errorMessage = 'This saved test is missing question data and cannot be continued. This can happen if the test was saved incorrectly or corrupted. Please delete this test and create a new one.';
        setSelectedTest({ 
          error: errorMessage, 
          testId: savedTest.id,
          isCorrupted: true
        });
        return;
      }
      
      // Transform saved test to the expected format and include progress
      // Determine if we have a reliable original title vs. just the save name
      const hasReliableOriginalTitle = !!savedTest.originalTest?.title;
      const originalTitle = savedTest.originalTest?.title || savedTest.title;
      
      const transformedTest = {
        title: originalTitle,
        color: savedTest.originalTest?.color || '#669BBC',
        questions: questions,
        savedProgress: progress,
        savedTestInfo: {
          id: savedTest.id,
          title: savedTest.title, // This is the save name
          dateCreated: savedTest.dateCreated,
          dateModified: savedTest.dateModified
        },
        originalTest: savedTest.originalTest, // Include original test metadata
        isSavedTest: true,
        // Flag to indicate if we should show the save name separately
        showSaveName: hasReliableOriginalTitle && originalTitle !== savedTest.title
      };
      
      setSelectedTest(transformedTest);
      return;
    }
    
    // If no saved test, proceed with custom test loading logic
    const loadCustomTest = async () => {
      console.log('🔍 PracticeTestContainer: Starting loadCustomTest for testId:', testId);
      setLoading(true);
      try {
        console.log('🔍 PracticeTestContainer: Calling CreatedTestsService.getTestById...');
        const customTest = await CreatedTestsService.getTestById(testId);
        console.log('🔍 PracticeTestContainer: Loaded custom test:', customTest);
        
        if (customTest) {
          console.log('🔍 PracticeTestContainer: Test found! Checking for CSV URL...');
          console.log('🔍 PracticeTestContainer: customTest.csvUrl:', customTest.csvUrl);
          console.log('🔍 PracticeTestContainer: customTest.questions:', customTest.questions);
          
          // Check if test has CSV URL (needs to load questions from CSV)
          if (customTest.csvUrl && !customTest.questions) {
            console.log('🚀 PracticeTestContainer: CSV LOADING TRIGGERED! URL:', customTest.csvUrl);
            // Keep loading state true while CSV loads - don't set it to false yet
            
            // Load questions from CSV using Papa Parse
            Papa.parse(customTest.csvUrl, {
              download: true,
              header: true,
              complete: (result) => {
                console.log('✅ PracticeTestContainer: CSV parse complete, raw data:', result.data);
                const filtered = result.data.filter(q => q.question_text && q.question_text.trim());
                console.log('✅ PracticeTestContainer: Filtered CSV questions:', filtered.length);
                
                if (filtered.length > 0) {
                  // Transform the test with loaded questions
                  const transformedTest = {
                    title: customTest.title,
                    color: customTest.color || '#669BBC',
                    questions: filtered.map((q, index) => ({
                      ...q,
                      id: index + 1
                    })),
                    isCustomTest: true,
                    customTestId: customTest.id,
                    csvUrl: customTest.csvUrl,
                    originalTest: customTest
                  };
                  
                  console.log('🎉 PracticeTestContainer: CSV test loaded successfully:', transformedTest);
                  console.log('🎉 PracticeTestContainer: Questions loaded from CSV:', transformedTest.questions.length);
                  setSelectedTest(transformedTest);
                } else {
                  console.error('❌ PracticeTestContainer: No valid questions found in CSV');
                  setSelectedTest({ error: 'No valid questions found in the test file.', testId, isCorrupted: true });
                }
                setLoading(false); // Only set loading to false after CSV is processed
              },
              error: (error) => {
                console.error('❌ PracticeTestContainer: Error loading CSV:', error);
                setSelectedTest({ error: 'Failed to load test questions from CSV file.', details: error.message, testId });
                setLoading(false); // Set loading to false on error too
              }
            });
            return; // Don't continue with the rest of the function - CSV loading will handle setLoading(false)
          }
          
          // Test has direct questions array
          if (customTest.questions && Array.isArray(customTest.questions)) {
            console.log('PracticeTestContainer: Custom test has questions array with length:', customTest.questions.length);
            console.log('PracticeTestContainer: First question in custom test:', customTest.questions[0]);
            
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
            
            console.log('PracticeTestContainer: Transformed test:', transformedTest);
            console.log('PracticeTestContainer: Transformed test questions length:', transformedTest.questions.length);
            console.log('PracticeTestContainer: About to set selectedTest with proper object');
            setSelectedTest(transformedTest);
            setLoading(false); // Set loading to false for direct questions
          } else {
            console.error('PracticeTestContainer: Test found but missing questions and csvUrl:', customTest);
            const errorMessage = 'This test is missing question data and cannot be loaded.';
            setSelectedTest({ error: errorMessage, testId, isCorrupted: true });
            setLoading(false); // Set loading to false for error case
          }
        } else {
          console.error('PracticeTestContainer: No test found for ID:', testId);
          // Instead of alert, show an error state with auth context
          const errorMessage = user 
            ? 'Test not found in your account' 
            : 'Test not found - you may need to log in to access this test';
          setSelectedTest({ error: errorMessage, testId, needsAuth: !user });
          setLoading(false); // Set loading to false when no test found
        }
      } catch (error) {
        console.error('Error loading custom test:', error);
        // Instead of alert, show an error state
        setSelectedTest({ error: 'Failed to load test', details: error.message, testId });
        setLoading(false); // Only set loading to false on error - CSV loading handles its own loading state
      }
      // Remove finally block - CSV loading manages its own loading state
      // For non-CSV tests, loading was already set to false in the direct path
    };

    if (testId) {
      console.log('🔥 PracticeTestContainer: testId exists, calling loadCustomTest');
      loadCustomTest();
    } else {
      console.log('🔥 PracticeTestContainer: No testId, skipping loadCustomTest');
    }
  }, [testId]);

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
      {/* Check if we have a complete test with questions OR if it's a CSV test that's still loading */}
      {selectedTest.questions && Array.isArray(selectedTest.questions) && selectedTest.questions.length > 0 ? (
        <PracticeTest 
          selectedTest={selectedTest} 
          onBackToSelection={handleBackToSelection}
          searchTerm={searchTerm}
          onClearSearch={onClearSearch}
          onTestComplete={onTestComplete}
        />
      ) : selectedTest.csvUrl && !selectedTest.questions ? (
        // This is a CSV test that's still loading
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '60vh',
          flexDirection: 'column',
          gap: '1rem',
          padding: '2rem'
        }}>
          <div style={{ fontSize: '2rem' }}>📊</div>
          <p style={{ color: '#669BBC' }}>Loading questions from CSV file...</p>
          <p style={{ color: '#999', fontSize: '0.9rem' }}>Parsing test data, please wait...</p>
        </div>
      ) : (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '60vh',
          flexDirection: 'column',
          gap: '1rem',
          padding: '2rem'
        }}>
          <div style={{ fontSize: '2rem' }}>⚠️</div>
          <p style={{ color: '#669BBC' }}>Test data is incomplete. Missing questions array.</p>
          <pre style={{ fontSize: '0.8rem', color: '#666', background: 'rgba(255,255,255,0.5)', padding: '1rem', borderRadius: '4px' }}>
            {JSON.stringify(selectedTest, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default PracticeTestContainer;
