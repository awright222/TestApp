import React, { useState, useEffect } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { CreatedTestsService } from '../services/CreatedTestsService';
import { SavedTestsService } from '../SavedTestsService';

export default function CrossDeviceDebug() {
  const { user } = useAuth();
  const [createdTests, setCreatedTests] = useState([]);
  const [savedTests, setSavedTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, [user]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [created, saved] = await Promise.all([
        CreatedTestsService.getCreatedTests(),
        SavedTestsService.getSavedTests()
      ]);
      setCreatedTests(created);
      setSavedTests(saved);
    } catch (error) {
      console.error('Error loading test data:', error);
    } finally {
      setLoading(false);
    }
  };

  const testMigration = async () => {
    if (!user) {
      alert('Please log in first');
      return;
    }
    
    try {
      await CreatedTestsService.migrateToFirebase();
      await SavedTestsService.migrateToFirebase();
      alert('Migration completed! Reloading data...');
      loadAllData();
    } catch (error) {
      alert('Migration failed: ' + error.message);
    }
  };

  const clearLocalStorage = () => {
    if (window.confirm('Clear all localStorage data? This will remove all local tests.')) {
      localStorage.removeItem('created_tests');
      localStorage.removeItem('saved_tests');
      alert('localStorage cleared! Reloading...');
      window.location.reload();
    }
  };

  return (
    <div style={{ 
      padding: '2rem', 
      background: '#FDF0D5', 
      minHeight: '100vh',
      fontFamily: 'monospace'
    }}>
      <h1 style={{ color: '#003049' }}>Cross-Device Debug Page</h1>
      
      <div style={{ 
        background: 'white', 
        padding: '1rem', 
        borderRadius: '8px', 
        marginBottom: '2rem',
        border: '2px solid #669BBC'
      }}>
        <h2 style={{ color: '#003049', marginTop: 0 }}>Authentication Status</h2>
        {user ? (
          <div>
            <p><strong>✅ Logged In</strong></p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Display Name:</strong> {user.displayName || 'Not set'}</p>
            <p><strong>UID:</strong> {user.uid}</p>
            <div style={{ color: '#28a745', fontWeight: 'bold' }}>
              🌐 Tests will sync across devices
            </div>
          </div>
        ) : (
          <div>
            <p><strong>❌ Not Logged In</strong></p>
            <div style={{ color: '#dc3545', fontWeight: 'bold' }}>
              📱 Tests are stored locally only
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div style={{ 
          background: 'white', 
          padding: '1rem', 
          borderRadius: '8px',
          border: '2px solid #28a745'
        }}>
          <h2 style={{ color: '#003049', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📝 Created Tests ({createdTests.length})
          </h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div>
              {createdTests.length === 0 ? (
                <p style={{ color: '#666' }}>No tests found</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {createdTests.map(test => (
                    <li key={test.id} style={{ 
                      background: '#f8f9fa', 
                      padding: '0.5rem', 
                      margin: '0.5rem 0',
                      borderRadius: '4px',
                      border: '1px solid #dee2e6'
                    }}>
                      <strong>{test.title}</strong><br />
                      <small>ID: {test.id}</small><br />
                      <small>Type: {test.type || 'regular'}</small><br />
                      <small>Questions: {test.questions?.length || 0}</small>
                      {test.synced && <span style={{ color: '#28a745' }}> ☁️ Synced</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div style={{ 
          background: 'white', 
          padding: '1rem', 
          borderRadius: '8px',
          border: '2px solid #ffc107'
        }}>
          <h2 style={{ color: '#003049', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            💾 Saved Test Progress ({savedTests.length})
          </h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div>
              {savedTests.length === 0 ? (
                <p style={{ color: '#666' }}>No saved progress found</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {savedTests.map(test => (
                    <li key={test.id} style={{ 
                      background: '#f8f9fa', 
                      padding: '0.5rem', 
                      margin: '0.5rem 0',
                      borderRadius: '4px',
                      border: '1px solid #dee2e6'
                    }}>
                      <strong>{test.title}</strong><br />
                      <small>ID: {test.id}</small><br />
                      <small>Progress: {test.progress?.completedQuestions || 0} / {test.progress?.totalQuestions || 0}</small>
                      {test.synced && <span style={{ color: '#28a745' }}> ☁️ Synced</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ 
        background: 'white', 
        padding: '1rem', 
        borderRadius: '8px',
        marginTop: '2rem',
        border: '2px solid #dc3545'
      }}>
        <h2 style={{ color: '#003049', marginTop: 0 }}>Debug Actions</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={loadAllData}
            style={{
              background: '#669BBC',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔄 Reload Data
          </button>
          
          <button
            onClick={testMigration}
            style={{
              background: '#28a745',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ☁️ Test Migration
          </button>
          
          <button
            onClick={clearLocalStorage}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🗑️ Clear Local Storage
          </button>
        </div>
      </div>

      <div style={{ 
        background: '#e9ecef', 
        padding: '1rem', 
        borderRadius: '8px',
        marginTop: '2rem',
        fontSize: '0.9rem'
      }}>
        <h3 style={{ marginTop: 0 }}>How to Test Cross-Device Access:</h3>
        <ol>
          <li>Create some tests while logged out (they'll be stored locally)</li>
          <li>Copy a test URL (e.g., <code>/custom-test/1234567890</code>)</li>
          <li>Open in incognito/private window (or different browser)</li>
          <li>Try to access the URL - should see login prompt</li>
          <li>Log in with the same account</li>
          <li>Should be redirected to the test (after migration)</li>
          <li>Test should now be accessible from "different device"</li>
        </ol>
      </div>
    </div>
  );
}
