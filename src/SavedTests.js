import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SavedTestsService } from './SavedTestsService';

function TestCard({ test, onDelete, onLoad }) {
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Unknown date';
    }
  };

  const calculateProgress = (progress) => {
    if (!progress || !progress.totalQuestions) return 0;
    return Math.round((progress.completedQuestions / progress.totalQuestions) * 100);
  };

  return (
    <div
      style={{
        background: '#00243a',
        border: '2px solid #669BBC',
        borderRadius: '10px',
        padding: '1.5rem',
        position: 'relative',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      {/* Delete button */}
      <button
        onClick={() => onDelete(test.id)}
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'none',
          border: 'none',
          color: '#669BBC',
          fontSize: '1.2rem',
          cursor: 'pointer',
          padding: '0.25rem',
          borderRadius: '4px',
          lineHeight: 1
        }}
        title="Delete saved test"
        aria-label="Delete saved test"
      >
        🗑️
      </button>

      {/* Test type badge */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem',
        marginBottom: '1rem'
      }}>
        <span style={{ 
          background: test.type === 'case-study' ? '#780000' : '#669BBC',
          color: '#FDF0D5',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          fontSize: '0.8rem',
          fontWeight: 'bold'
        }}>
          {test.type === 'case-study' ? 'CASE STUDY' : 'PRACTICE TEST'}
        </span>
      </div>
      
      {/* Test title */}
      <h3 style={{ 
        margin: '0 2rem 1rem 0', 
        color: '#FDF0D5',
        fontSize: '1.2rem',
        lineHeight: '1.4'
      }}>
        {test.title}
      </h3>

      {/* Dates */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ 
          color: '#bfc9d1', 
          fontSize: '0.9rem', 
          marginBottom: '0.5rem' 
        }}>
          Created: {formatDate(test.dateCreated)}
        </div>
        {test.dateModified && (
          <div style={{ 
            color: '#bfc9d1', 
            fontSize: '0.9rem', 
            marginBottom: '0.5rem' 
          }}>
            Modified: {formatDate(test.dateModified)}
          </div>
        )}
      </div>

      {/* Progress info */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '0.5rem'
        }}>
          <span style={{ color: '#669BBC', fontWeight: 'bold' }}>
            Progress: {calculateProgress(test.progress)}%
          </span>
          <span style={{ color: '#bfc9d1', fontSize: '0.9rem' }}>
            {test.progress?.completedQuestions || 0} / {test.progress?.totalQuestions || 0}
          </span>
        </div>
        
        {/* Progress bar */}
        <div style={{
          width: '100%',
          height: '8px',
          background: '#003049',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${calculateProgress(test.progress)}%`,
            height: '100%',
            background: test.type === 'case-study' ? '#780000' : '#669BBC',
            transition: 'width 0.3s ease'
          }}></div>
        </div>
        
        <div style={{ 
          color: '#bfc9d1', 
          fontSize: '0.9rem', 
          marginTop: '0.5rem' 
        }}>
          Current question: {(test.progress?.current || 0) + 1}
        </div>
      </div>

      {/* Load test button */}
      <button
        onClick={() => onLoad(test)}
        style={{
          width: '100%',
          background: test.type === 'case-study' ? '#780000' : '#669BBC',
          color: '#FDF0D5',
          border: 'none',
          padding: '0.75rem',
          borderRadius: '6px',
          fontWeight: 'bold',
          cursor: 'pointer',
          fontSize: '1rem'
        }}
      >
        {test.type === 'case-study' ? 'Continue Case Study' : 'Continue Test'}
      </button>
    </div>
  );
}

export default function SavedTests({ onLoadTest }) {
  const [savedTests, setSavedTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadSavedTests();
  }, []);

  const loadSavedTests = () => {
    try {
      const tests = SavedTestsService.getSavedTests();
      // Sort by date created (newest first)
      tests.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
      setSavedTests(tests);
    } catch (error) {
      console.error('Error loading saved tests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group tests by type
  const groupedTests = savedTests.reduce((acc, test) => {
    const type = test.type === 'case-study' ? 'caseStudies' : 'practiceTests';
    if (!acc[type]) acc[type] = [];
    acc[type].push(test);
    return acc;
  }, {});

  const handleDeleteTest = (testId) => {
    if (window.confirm('Are you sure you want to delete this saved test?')) {
      try {
        SavedTestsService.deleteTest(testId);
        loadSavedTests(); // Refresh the list
      } catch (error) {
        alert('Failed to delete test. Please try again.');
      }
    }
  };

  const handleLoadTest = (test) => {
    if (test.type === 'case-study') {
      // For case studies, navigate to the case study page
      // Note: We'll need to implement loading progress in the case study component
      navigate(`/case-studies/${test.caseStudyId}`);
      alert(`Loading case study: ${test.caseStudyTitle}`);
    } else {
      // For regular practice tests, use the onLoadTest callback
      if (onLoadTest) {
        onLoadTest(test);
      }
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading saved tests...</div>;
  }

  return (
    <div className="saved-tests-page" style={{ padding: '2rem' }}>
      <div className="saved-tests-header">
        <h2>Saved Tests</h2>
      </div>

      {savedTests.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          background: '#00243a', 
          borderRadius: '10px',
          border: '2px solid #669BBC'
        }}>
          <h3 style={{ color: '#669BBC', marginBottom: '1rem' }}>No saved tests yet</h3>
          <p style={{ color: '#bfc9d1', marginBottom: '1.5rem' }}>
            Start a practice test or case study and save your progress to see it here.
          </p>
        </div>
      ) : (
        <div>
          {/* Practice Tests Section */}
          {groupedTests.practiceTests && groupedTests.practiceTests.length > 0 && (
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ 
                color: '#669BBC', 
                borderBottom: '2px solid #669BBC',
                paddingBottom: '0.5rem',
                marginBottom: '1.5rem'
              }}>
                Practice Tests ({groupedTests.practiceTests.length})
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                gap: '1.5rem' 
              }}>
                {groupedTests.practiceTests.map(test => (
                  <TestCard key={test.id} test={test} onDelete={handleDeleteTest} onLoad={handleLoadTest} />
                ))}
              </div>
            </div>
          )}

          {/* Case Studies Section */}
          {groupedTests.caseStudies && groupedTests.caseStudies.length > 0 && (
            <div>
              <h3 style={{ 
                color: '#780000', 
                borderBottom: '2px solid #780000',
                paddingBottom: '0.5rem',
                marginBottom: '1.5rem'
              }}>
                Case Studies ({groupedTests.caseStudies.length})
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                gap: '1.5rem' 
              }}>
                {groupedTests.caseStudies.map(test => (
                  <TestCard key={test.id} test={test} onDelete={handleDeleteTest} onLoad={handleLoadTest} />
                ))}
              </div>
            </div>
          )}

          {/* Show message if no tests in either category */}
          {(!groupedTests.practiceTests || groupedTests.practiceTests.length === 0) && 
           (!groupedTests.caseStudies || groupedTests.caseStudies.length === 0) && (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem', 
              background: '#00243a', 
              borderRadius: '10px',
              border: '2px solid #669BBC'
            }}>
              <h3 style={{ color: '#669BBC', marginBottom: '1rem' }}>No saved tests yet</h3>
              <p style={{ color: '#bfc9d1', marginBottom: '1.5rem' }}>
                Start a practice test or case study and save your progress to see it here.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
