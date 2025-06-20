import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SavedTestsService } from './SavedTestsService';
import { useAuth } from './firebase/AuthContext';
import SearchResults from './components/SearchResults';
import './SavedTests.css';

// Utility function to calculate progress percentage
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

function TestCard({ test, onDelete, onLoad, isSelected, onToggleSelect, showSelect }) {
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

  return (
    <div className={`test-card ${isSelected ? 'selected' : ''}`}>
      {/* Selection checkbox */}
      {showSelect && (
        <div className="test-card-select">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(test.id)}
            className="test-select-checkbox"
          />
        </div>
      )}
      
      {/* Delete button */}
      <button
        onClick={() => onDelete(test.id)}
        className="test-card-delete"
        title="Delete saved test"
        aria-label="Delete saved test"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Test type badge */}
      <div className="test-type-badge-container">
        <span className={`test-type-badge ${
          test.type === 'case-study' ? 'case-study' : 
          test.type === 'practice-test' ? 'practice-test' : 
          'regular'
        }`}>
          <span className="badge-icon">
            {test.type === 'case-study' ? '📚' : 
             test.type === 'practice-test' ? '⚡' : 
             '📝'}
          </span>
          {test.type === 'case-study' ? 'Case Study' : 
           test.type === 'practice-test' ? 'Practice Test' : 
           'Regular Test'}
        </span>
      </div>
      
      {/* Test title section */}
      <div className="test-card-titles">
        {/* Save name (primary) */}
        <h3 className="test-card-title">
          <span className="save-name-indicator">💾</span>
          {test.title}
        </h3>
        
        {/* Original test title (secondary) */}
        {test.originalTest?.title && test.originalTest.title !== test.title && (
          <p className="test-card-original-title">
            📖 Original: {test.originalTest.title}
          </p>
        )}
      </div>

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
            {calculateProgress(test.progress) === 100 ? '✅ Completed' : '📊 Progress'}: {calculateProgress(test.progress)}%
          </span>
          <span className="progress-fraction">
            {test.progress?.completedQuestions || 0} / {test.progress?.totalQuestions || 0}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="progress-bar-container">
          <div 
            className={`progress-bar-fill ${
              test.type === 'case-study' ? 'case-study' : 
              test.type === 'practice-test' ? 'practice-test' : 
              'regular'
            }`}
            style={{ width: `${calculateProgress(test.progress)}%` }}
          ></div>
        </div>
        
        <div className="current-question-info">
          {calculateProgress(test.progress) === 100 ? 
            '🎯 Test completed!' : 
            `📍 Current question: ${(test.progress?.current || 0) + 1}`
          }
        </div>
      </div>

      {/* Questions info */}
      <div className="test-info">
        <div className="test-info-item">
          <span className="info-label">Questions:</span>
          <span className="info-value">{test.questions?.length || 0}</span>
        </div>
        {test.progress && (
          <div className="test-info-item">
            <span className="info-label">Last played:</span>
            <span className="info-value">{formatDate(test.dateModified || test.dateCreated)}</span>
          </div>
        )}
      </div>

      {/* Load test button */}
      <button
        onClick={() => onLoad(test)}
        className={`load-test-btn ${
          test.type === 'case-study' ? 'case-study' : 
          test.type === 'practice-test' ? 'practice-test' : 
          'regular'
        }`}
      >
        {calculateProgress(test.progress) === 100 ? 
          (test.type === 'case-study' ? '🔄 Review Case Study' : '🔄 Review Test') :
          (test.type === 'case-study' ? '▶️ Continue Case Study' : '▶️ Continue Test')
        }
      </button>
    </div>
  );
}

export default function SavedTests({ onLoadTest, searchTerm, onClearSearch }) {
  const [savedTests, setSavedTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, progress, name
  const [filterBy, setFilterBy] = useState('all'); // all, practice, case-study, completed, in-progress
  const [selectedTests, setSelectedTests] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile } = useAuth();

  const loadSavedTests = useCallback(async () => {
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
  }, [location.pathname]);

  // Only load on initial mount and when explicitly refreshed
  useEffect(() => {
    loadSavedTests();
  }, [loadSavedTests]);

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
  }, [loadSavedTests]);

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
  }, [location.pathname, loading, loadSavedTests]);

  // Group and filter tests
  const getFilteredAndSortedTests = () => {
    let filtered = [...savedTests];
    
    // Apply filters
    if (filterBy !== 'all') {
      if (filterBy === 'practice') {
        filtered = filtered.filter(test => test.type !== 'case-study');
      } else if (filterBy === 'case-study') {
        filtered = filtered.filter(test => test.type === 'case-study');
      } else if (filterBy === 'completed') {
        filtered = filtered.filter(test => calculateProgress(test.progress) >= 100);
      } else if (filterBy === 'in-progress') {
        filtered = filtered.filter(test => calculateProgress(test.progress) < 100);
      }
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.dateCreated) - new Date(b.dateCreated);
        case 'progress':
          return calculateProgress(b.progress) - calculateProgress(a.progress);
        case 'name':
          return a.title.localeCompare(b.title);
        case 'newest':
        default:
          return new Date(b.dateCreated) - new Date(a.dateCreated);
      }
    });
    
    return filtered;
  };

  const filteredTests = getFilteredAndSortedTests();

  // Group tests by type for organized display
  const groupedTests = filteredTests.reduce((acc, test) => {
    const type = test.type === 'case-study' ? 'caseStudies' : 'practiceTests';
    if (!acc[type]) acc[type] = [];
    acc[type].push(test);
    return acc;
  }, {});

  const handleDeleteTest = async (testId) => {
    if (window.confirm('Are you sure you want to delete this saved test?')) {
      try {
        await SavedTestsService.deleteTest(testId);
        setSelectedTests(prev => {
          const newSet = new Set(prev);
          newSet.delete(testId);
          return newSet;
        });
        loadSavedTests(); // Refresh the list
      } catch (error) {
        alert('Failed to delete test. Please try again.');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTests.size === 0) return;
    
    const count = selectedTests.size;
    if (window.confirm(`Are you sure you want to delete ${count} selected test${count > 1 ? 's' : ''}?`)) {
      try {
        for (const testId of selectedTests) {
          await SavedTestsService.deleteTest(testId);
        }
        setSelectedTests(new Set());
        setShowBulkActions(false);
        loadSavedTests();
      } catch (error) {
        alert('Failed to delete some tests. Please try again.');
      }
    }
  };

  const toggleTestSelection = (testId) => {
    setSelectedTests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(testId)) {
        newSet.delete(testId);
      } else {
        newSet.add(testId);
      }
      setShowBulkActions(newSet.size > 0);
      return newSet;
    });
  };

  const selectAllVisible = () => {
    const visibleTestIds = filteredTests.map(test => test.id);
    setSelectedTests(new Set(visibleTestIds));
    setShowBulkActions(true);
  };

  const clearSelection = () => {
    setSelectedTests(new Set());
    setShowBulkActions(false);
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
        <div className="header-content">
          <h2>{userProfile?.accountType === 'teacher' ? 'Practice Progress' : 'My Progress'}</h2>
          <p style={{ color: '#669BBC', margin: 0, fontSize: '0.9rem' }}>
            {userProfile?.accountType === 'teacher' 
              ? 'Track your practice test attempts and progress'
              : 'Your saved test progress is automatically synced across all devices'
            }
          </p>
        </div>
        
        {/* Controls */}
        {savedTests.length > 0 && (
          <div className="saved-tests-controls">
            <div className="controls-row">
              <div className="control-group">
                <label>Sort:</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="control-select"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="progress">Progress</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
              
              <div className="control-group">
                <label>Filter:</label>
                <select 
                  value={filterBy} 
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="control-select"
                >
                  <option value="all">All Tests</option>
                  <option value="practice">Practice Tests</option>
                  <option value="case-study">Case Studies</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div className="control-group">
                <button 
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className={`bulk-select-btn ${showBulkActions ? 'active' : ''}`}
                >
                  {showBulkActions ? '✕ Cancel' : '☑️ Select Multiple'}
                </button>
              </div>
            </div>
            
            {/* Bulk Actions */}
            {showBulkActions && (
              <div className="bulk-actions">
                <div className="bulk-actions-info">
                  {selectedTests.size > 0 ? (
                    <span>{selectedTests.size} test{selectedTests.size !== 1 ? 's' : ''} selected</span>
                  ) : (
                    <span>Select tests to perform bulk actions</span>
                  )}
                </div>
                <div className="bulk-actions-buttons">
                  <button onClick={selectAllVisible} className="bulk-btn secondary">
                    Select All ({filteredTests.length})
                  </button>
                  <button onClick={clearSelection} className="bulk-btn secondary">
                    Clear
                  </button>
                  <button 
                    onClick={handleBulkDelete} 
                    className="bulk-btn danger"
                    disabled={selectedTests.size === 0}
                  >
                    🗑️ Delete ({selectedTests.size})
                  </button>
                </div>
              </div>
            )}
            
            {/* Stats */}
            <div className="saved-tests-stats">
              <span className="stat">📊 {savedTests.length} total</span>
              <span className="stat">👁️ {filteredTests.length} showing</span>
              <span className="stat">✅ {savedTests.filter(test => calculateProgress(test.progress) >= 100).length} completed</span>
            </div>
          </div>
        )}
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
                  <TestCard 
                    key={test.id} 
                    test={test} 
                    onDelete={handleDeleteTest} 
                    onLoad={handleLoadTest}
                    isSelected={selectedTests.has(test.id)}
                    onToggleSelect={toggleTestSelection}
                    showSelect={showBulkActions}
                  />
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
                  <TestCard 
                    key={test.id} 
                    test={test} 
                    onDelete={handleDeleteTest} 
                    onLoad={handleLoadTest}
                    isSelected={selectedTests.has(test.id)}
                    onToggleSelect={toggleTestSelection}
                    showSelect={showBulkActions}
                  />
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
