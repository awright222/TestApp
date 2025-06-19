import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreatedTestsService } from '../services/CreatedTestsService';
import ShareTest from './ShareTest';

export default function MyCreatedTests() {
  const navigate = useNavigate();
  const location = useLocation();
  const [createdTests, setCreatedTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

  useEffect(() => {
    console.log('MyCreatedTests component mounted');
    loadCreatedTests();
  }, []);

  // Reload tests when navigating to this page
  useEffect(() => {
    if (location.pathname === '/my-tests') {
      console.log('Navigated to My Tests page, reloading...');
      setLoading(true); // Show loading state
      loadCreatedTests();
    }
  }, [location.pathname]);

  const loadCreatedTests = async () => {
    try {
      console.log('Loading created tests...', new Date().toISOString());
      const tests = await CreatedTestsService.getCreatedTests();
      console.log('Loaded tests:', tests);
      setCreatedTests(tests);
      setLastRefresh(Date.now());
    } catch (error) {
      console.error('Error loading created tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTest = async (testId, testTitle) => {
    if (window.confirm(`Are you sure you want to delete "${testTitle}"?`)) {
      try {
        await CreatedTestsService.deleteTest(testId);
        await loadCreatedTests(); // Reload the list
        alert('Test deleted successfully!');
      } catch (error) {
        console.error('Error deleting test:', error);
        alert('Failed to delete test. Please try again.');
      }
    }
  };

  const launchTest = (testId) => {
    navigate(`/custom-test/${testId}`);
  };

  const editTest = (testId) => {
    navigate(`/create-test/${testId}`);
  };

  const exportTest = (test) => {
    try {
      const exportData = {
        id: test.id,
        title: test.title,
        description: test.description,
        questions: test.questions,
        source: test.source,
        settings: test.settings,
        exportedAt: new Date().toISOString(),
        version: "1.0"
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${test.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('Test exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export test. Please try again.');
    }
  };

  const shareTest = (test) => {
    setSelectedTest(test);
    setShareModalOpen(true);
  };

  const importTest = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const importData = JSON.parse(text);
        
        // Validate import data
        if (!importData.title || !importData.questions || !Array.isArray(importData.questions)) {
          throw new Error('Invalid test file format');
        }
        
        // Create new test with imported data
        const newTest = {
          title: `${importData.title} (Imported)`,
          description: importData.description || '',
          questions: importData.questions,
          source: 'import',
          settings: importData.settings || {},
          color: '#669BBC',
          icon: '📥'
        };
        
        await CreatedTestsService.createTest(newTest);
        
        // Refresh the list
        await new Promise(resolve => setTimeout(resolve, 100));
        await loadCreatedTests();
        
        alert(`Test "${newTest.title}" imported successfully!`);
      } catch (error) {
        console.error('Import failed:', error);
        alert('Failed to import test. Please check the file format and try again.');
      }
    };
    input.click();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
        <p style={{ color: '#669BBC' }}>Loading your tests...</p>
      </div>
    );
  }

  return (
    <div className="my-created-tests-container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', background: '#FDF0D5', borderRadius: '16px', minHeight: 'calc(100vh - 4rem)' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem' 
      }}>
        <div>
          <h1 style={{ color: '#003049', marginBottom: '0.5rem' }}>📝 My Created Tests</h1>
          <p style={{ color: '#669BBC', margin: 0 }}>
            {createdTests.length} test{createdTests.length !== 1 ? 's' : ''} created
            <small style={{ marginLeft: '1rem', opacity: 0.7 }}>
              Last updated: {new Date(lastRefresh).toLocaleTimeString()}
            </small>
          </p>
          <p style={{ color: '#28a745', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
            ☁️ Tests are automatically synced across all your devices
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={importTest}
            style={{
              background: '#28a745',
              color: '#FDF0D5',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            📥 Import Test
          </button>
          <button
            onClick={() => navigate('/create-test')}
            style={{
              background: '#780000',
              color: '#FDF0D5',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            ➕ Create New Test
          </button>
        </div>
      </div>

      {createdTests.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem 2rem',
          background: 'linear-gradient(135deg, #FDF0D5 0%, #FFFFFF 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(102, 155, 188, 0.2)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
          <h3 style={{ color: '#003049', marginBottom: '1rem' }}>No tests created yet</h3>
          <p style={{ color: '#669BBC', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Create your first custom test to get started!
          </p>
          <button
            onClick={() => navigate('/create-test')}
            style={{
              background: '#669BBC',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            🚀 Create Your First Test
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          {createdTests.map((test) => (
            <div
              key={test.id}
              style={{
                background: 'linear-gradient(135deg, #FDF0D5 0%, #FFFFFF 100%)',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '1px solid rgba(102, 155, 188, 0.2)',
                boxShadow: '0 4px 16px rgba(0, 48, 73, 0.08)',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 48, 73, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 48, 73, 0.08)';
              }}
            >
              {/* Test Header */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>{test.icon}</span>
                    <span style={{
                      background: `${test.color}20`,
                      color: test.color,
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      {test.difficulty}
                    </span>
                  </div>
                  <h3 style={{ 
                    color: test.color, 
                    margin: 0,
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    lineHeight: '1.3'
                  }}>
                    {test.title}
                  </h3>
                </div>
                <button
                  onClick={() => deleteTest(test.id, test.title)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#dc3545',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    borderRadius: '4px',
                    fontSize: '1.2rem'
                  }}
                  title="Delete test"
                >
                  🗑️
                </button>
              </div>

              {/* Test Description */}
              {test.description && (
                <p style={{ 
                  color: '#669BBC', 
                  margin: '0 0 1rem 0',
                  fontSize: '0.9rem',
                  lineHeight: '1.4'
                }}>
                  {test.description}
                </p>
              )}

              {/* Test Stats */}
              <div style={{ 
                display: 'flex', 
                gap: '1rem',
                marginBottom: '1rem',
                flexWrap: 'wrap'
              }}>
                <span style={{
                  background: 'rgba(102, 155, 188, 0.1)',
                  color: '#669BBC',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: '500'
                }}>
                  📊 {test.questionCount} questions
                </span>
                <span style={{
                  background: 'rgba(102, 155, 188, 0.1)',
                  color: '#669BBC',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: '500'
                }}>
                  📅 {formatDate(test.createdAt)}
                </span>
              </div>

              {/* Source Badge */}
              <div style={{ marginBottom: '1rem' }}>
                <span style={{
                  background: test.source === 'builder' ? '#28a745' : 
                             test.source === 'google-sheets' ? '#4285f4' : '#fd7e14',
                  color: 'white',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  {test.source === 'builder' ? '🔨 Built' : 
                   test.source === 'google-sheets' ? '🔗 Google Sheets' : '📥 Imported'}
                </span>
              </div>

              {/* Actions */}
              <div style={{ 
                display: 'flex', 
                gap: '0.5rem',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => launchTest(test.id)}
                  style={{
                    background: test.color,
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  🚀 Launch Test
                </button>
                <button
                  onClick={() => editTest(test.id)}
                  style={{
                    background: 'transparent',
                    color: test.color,
                    border: `2px solid ${test.color}`,
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => shareTest(test)}
                  style={{
                    background: 'transparent',
                    color: '#669BBC',
                    border: '2px solid #669BBC',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  🔗 Share
                </button>
                <button
                  onClick={() => exportTest(test)}
                  style={{
                    background: 'transparent',
                    color: '#28a745',
                    border: '2px solid #28a745',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  📤 Export
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share Modal */}
      {shareModalOpen && selectedTest && (
        <ShareTest
          test={selectedTest}
          onClose={() => {
            setShareModalOpen(false);
            setSelectedTest(null);
          }}
        />
      )}
    </div>
  );
}
