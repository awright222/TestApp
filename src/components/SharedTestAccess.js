import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../firebase/AuthContext';
import { ShareService } from '../services/ShareService';
import { CreatedTestsService } from '../services/CreatedTestsService';
import PracticeTestContainer from './PracticeTestContainer';

export default function SharedTestAccess() {
  const { testId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [sharedTest, setSharedTest] = useState(null);
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accessValidated, setAccessValidated] = useState(false);
  const [shareCode, setShareCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setShareCode(code);
      validateAccess(testId, code);
    } else {
      setShowCodeInput(true);
      setLoading(false);
    }
  }, [testId, searchParams]);

  const validateAccess = async (testId, code) => {
    setLoading(true);
    setError('');
    
    try {
      // Get shared test data
      let sharedTestData;
      
      if (code) {
        sharedTestData = await ShareService.getSharedTestByCode(code);
      } else {
        sharedTestData = await ShareService.getSharedTest(testId);
      }

      if (!sharedTestData) {
        setError('Invalid share code or test not found.');
        setLoading(false);
        return;
      }

      // Validate access permissions
      const validation = await ShareService.validateTestAccess(sharedTestData, user?.uid);
      
      if (!validation.valid) {
        setError(validation.reason);
        setLoading(false);
        return;
      }

      // Get the actual test data
      const actualTestData = await CreatedTestsService.getTest(sharedTestData.testId);
      
      if (!actualTestData) {
        setError('Test data not found or no longer available.');
        setLoading(false);
        return;
      }

      // Track access
      await ShareService.trackTestAccess(sharedTestData.testId, user?.uid, {
        shareCode: sharedTestData.shareCode,
        accessMethod: code ? 'link' : 'code'
      });

      setSharedTest(sharedTestData);
      setTestData(actualTestData);
      setAccessValidated(true);
    } catch (error) {
      console.error('Error validating access:', error);
      setError('Failed to access test. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (shareCode.trim()) {
      validateAccess(testId, shareCode.trim().toUpperCase());
    }
  };

  const handleTestCompletion = async (results) => {
    if (sharedTest && testData) {
      try {
        await ShareService.trackTestCompletion(testData.id, user?.uid, results);
      } catch (error) {
        console.error('Error tracking test completion:', error);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        background: '#FDF0D5',
        color: '#003049'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔄</div>
        <h2>Loading Test...</h2>
        <p>Please wait while we prepare your test.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        background: '#FDF0D5',
        color: '#003049',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
        <h2>Access Denied</h2>
        <p style={{ marginBottom: '2rem', maxWidth: '500px' }}>{error}</p>
        <button
          onClick={() => navigate('/')}
          style={{
            background: '#669BBC',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Return Home
        </button>
      </div>
    );
  }

  if (showCodeInput && !accessValidated) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        background: '#FDF0D5',
        color: '#003049',
        padding: '2rem'
      }}>
        <div style={{ 
          background: 'white',
          padding: '3rem',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
          <h2 style={{ marginBottom: '1rem' }}>Enter Share Code</h2>
          <p style={{ marginBottom: '2rem', color: '#669BBC' }}>
            Please enter the 6-character share code to access this test.
          </p>
          
          <form onSubmit={handleCodeSubmit}>
            <input
              type="text"
              value={shareCode}
              onChange={(e) => setShareCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength="6"
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1.5rem',
                textAlign: 'center',
                letterSpacing: '0.2em',
                border: '2px solid #669BBC',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                fontWeight: 'bold'
              }}
              autoFocus
            />
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                onClick={() => navigate('/')}
                style={{
                  flex: 1,
                  background: 'transparent',
                  color: '#669BBC',
                  border: '2px solid #669BBC',
                  padding: '1rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={shareCode.length !== 6}
                style={{
                  flex: 1,
                  background: shareCode.length === 6 ? '#669BBC' : '#ccc',
                  color: 'white',
                  border: 'none',
                  padding: '1rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: shareCode.length === 6 ? 'pointer' : 'not-allowed'
                }}
              >
                Access Test
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (accessValidated && testData) {
    return (
      <PracticeTestContainer
        test={testData}
        onTestComplete={handleTestCompletion}
        isSharedTest={true}
        sharedTestInfo={sharedTest}
      />
    );
  }

  return null;
}
