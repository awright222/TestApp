import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SavedTestsService } from './SavedTestsService';
import './SavedTests.css';

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
    <div className="test-card">
      {/* Delete button */}
      <button
        onClick={() => onDelete(test.id)}
        className="test-card-delete"
        title="Delete saved test"
        aria-label="Delete saved test"
      >
        🗑️
      </button>

      {/* Test type badge */}
      <div className="test-type-badge-container">
        <span className={`test-type-badge ${test.type === 'case-study' ? 'case-study' : 'practice-test'}`}>
          {test.type === 'case-study' ? 'Case Study' : 'Practice Test'}
        </span>
      </div>
      
      {/* Test title */}
      <h3 className="test-card-title">
        {test.title}
      </h3>

      {/* Dates */}
      <div className="test-dates">
        <div className="test-date">
          Created: {formatDate(test.dateCreated)}
        </div>
        {test.dateModified && (
          <div className="test-date">
            Modified: {formatDate(test.dateModified)}
          </div>
        )}
      </div>

      {/* Progress info */}
      <div className="progress-section">
        <div className="progress-header">
          <span className="progress-percentage">
            Progress: {calculateProgress(test.progress)}%
          </span>
          <span className="progress-fraction">
            {test.progress?.completedQuestions || 0} / {test.progress?.totalQuestions || 0}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="progress-bar-container">
          <div 
            className={`progress-bar-fill ${test.type === 'case-study' ? 'case-study' : 'practice-test'}`}
            style={{ width: `${calculateProgress(test.progress)}%` }}
          ></div>
        </div>
        
        <div className="current-question-info">
          Current question: {(test.progress?.current || 0) + 1}
        </div>
      </div>

      {/* Load test button */}
      <button
        onClick={() => onLoad(test)}
        className={`load-test-btn ${test.type === 'case-study' ? 'case-study' : 'practice-test'}`}
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

  const loadSavedTests = async () => {
    try {
      const tests = await SavedTestsService.getSavedTests();
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

  const handleDeleteTest = async (testId) => {
    if (window.confirm('Are you sure you want to delete this saved test?')) {
      try {
        await SavedTestsService.deleteTest(testId);
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
    return <div className="loading-state">Loading saved tests...</div>;
  }

  return (
    <div className="saved-tests-page">
      <div className="saved-tests-header">
        <h2>Saved Tests</h2>
      </div>

      {savedTests.length === 0 ? (
        <div className="empty-state">
          <h3 className="empty-state-title">No saved tests yet</h3>
          <p className="empty-state-text">
            Start a practice test or case study and save your progress to see it here.
          </p>
        </div>
      ) : (
        <div>
          {/* Practice Tests Section */}
          {groupedTests.practiceTests && groupedTests.practiceTests.length > 0 && (
            <div>
              <h3 className="section-header practice-tests">
                Practice Tests ({groupedTests.practiceTests.length})
              </h3>
              <div className="tests-grid">
                {groupedTests.practiceTests.map(test => (
                  <TestCard key={test.id} test={test} onDelete={handleDeleteTest} onLoad={handleLoadTest} />
                ))}
              </div>
            </div>
          )}

          {/* Case Studies Section */}
          {groupedTests.caseStudies && groupedTests.caseStudies.length > 0 && (
            <div>
              <h3 className="section-header case-studies">
                Case Studies ({groupedTests.caseStudies.length})
              </h3>
              <div className="tests-grid">
                {groupedTests.caseStudies.map(test => (
                  <TestCard key={test.id} test={test} onDelete={handleDeleteTest} onLoad={handleLoadTest} />
                ))}
              </div>
            </div>
          )}

          {/* Show message if no tests in either category */}
          {(!groupedTests.practiceTests || groupedTests.practiceTests.length === 0) && 
           (!groupedTests.caseStudies || groupedTests.caseStudies.length === 0) && (
            <div className="empty-state">
              <h3 className="empty-state-title">No saved tests yet</h3>
              <p className="empty-state-text">
                Start a practice test or case study and save your progress to see it here.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
