import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SavedTestsService } from './SavedTestsService';
import { useAuth } from './firebase/AuthContext';
import SearchResults from './components/SearchResults';
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
    if (!progress || !progress.totalQuestions || progress.totalQuestions === 0) {
      console.log('SavedTests: Invalid progress data:', progress);
      return 0;
    }
    const completed = progress.completedQuestions || 0;
    const total = progress.totalQuestions;
    console.log('SavedTests: Calculating progress:', { completed, total, percentage: Math.round((completed / total) * 100) });
    return Math.round((completed / total) * 100);
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

export default function SavedTests({ onLoadTest, searchTerm, onClearSearch }) {
  const [savedTests, setSavedTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const loadSavedTests = async () => {
    try {
      console.log('📥 Loading saved tests...', new Date().toISOString());
      console.log('📊 Current page:', location.pathname);
      const tests = await SavedTestsService.getSavedTests();
      console.log('📊 Loaded saved tests:', tests);
      console.log('📊 Number of tests loaded:', tests.length);
      
      // Sort by date created (newest first)
      tests.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
      setSavedTests(tests);
      console.log('📊 Set saved tests in state, count:', tests.length);
    } catch (error) {
      console.error('❌ Error loading saved tests:', error);
      setSavedTests([]);
    } finally {
      setLoading(false);
    }
  };

  // Only load on initial mount and when explicitly refreshed
  useEffect(() => {
    loadSavedTests();
  }, []);

  // Listen for custom events when tests are saved
  useEffect(() => {
    const handleTestSaved = () => {
      console.log('🔄 testSaved event received in SavedTests, refreshing...');
      loadSavedTests();
    };

    console.log('📡 SavedTests: Setting up testSaved event listener');
    window.addEventListener('testSaved', handleTestSaved);
    return () => {
      console.log('📡 SavedTests: Removing testSaved event listener');
      window.removeEventListener('testSaved', handleTestSaved);
    };
  }, []);

  // Simple refresh on focus (only if not already loading)
  useEffect(() => {
    const handleFocus = () => {
      if (location.pathname === '/saved-tests' && !loading) {
        console.log('Window gained focus, refreshing saved tests...');
        loadSavedTests();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [location.pathname, loading]);

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
    console.log('=== handleLoadTest called ===');
    console.log('Test data:', test);
    console.log('Test type:', test.type);
    console.log('Questions count:', test.questions?.length || 0);
    console.log('Progress:', test.progress);
    
    if (test.type === 'case-study') {
      // For case studies, navigate to the case study page
      // Note: We'll need to implement loading progress in the case study component
      navigate(`/case-studies/${test.caseStudyId}`);
      alert(`Loading case study: ${test.caseStudyTitle}`);
    } else {
      // For regular practice tests, navigate to practice with saved state
      console.log('Navigating to /practice with saved test state...');
      console.log('Navigation state will be:', { savedTest: test });
      navigate('/practice', { state: { savedTest: test } });
    }
  };

  if (loading) {
    return <div className="loading-state">Loading saved tests...</div>;
  }

  return (
    <div className="saved-tests-page">
      <div className="saved-tests-header">
        <h2>Saved Tests</h2>
        <p style={{ color: '#669BBC', margin: 0, fontSize: '0.9rem' }}>
          {savedTests.length} saved test{savedTests.length !== 1 ? 's' : ''} found
        </p>
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

      {/* Search Results */}
      {searchTerm && (
        <SearchResults
          searchTerm={searchTerm}
          onClose={onClearSearch}
          currentPage="saved-tests"
        />
      )}
    </div>
  );
}
