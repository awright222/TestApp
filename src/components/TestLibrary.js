import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../firebase/AuthContext';
import { SavedTestsService } from '../SavedTestsService';
import { CreatedTestsService } from '../services/CreatedTestsService';
import { PublishedTestsService } from '../services/PublishedTestsService';
import Papa from 'papaparse';
import './TestLibrary.css';

const META_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTDO68GqAelFKS2G6SwiUWdPs2tw5Gt62D5xLiB_9zyLyBPLSZm5gTthaQz9yCpmDKuymWMc83PV5a2/pub?gid=2042421471&single=true&output=csv';

function TestLibrary({ searchTerm, onClearSearch }) {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('practice');
  const [loading, setLoading] = useState(true);
  const [practiceTests, setPracticeTests] = useState([]);
  const [caseStudies, setCaseStudies] = useState([]);
  const [sharedTests, setSharedTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);

  useEffect(() => {
    loadAllTests();
  }, []);

  useEffect(() => {
    // Filter tests based on search term and active tab
    let testsToFilter = [];
    
    switch (activeTab) {
      case 'practice':
        testsToFilter = practiceTests;
        break;
      case 'case-studies':
        testsToFilter = caseStudies;
        break;
      case 'shared':
        testsToFilter = sharedTests;
        break;
      default:
        testsToFilter = [...practiceTests, ...caseStudies, ...sharedTests];
    }

    if (searchTerm) {
      testsToFilter = testsToFilter.filter(test =>
        test.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.topics?.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredTests(testsToFilter);
  }, [searchTerm, activeTab, practiceTests, caseStudies, sharedTests]);

  const loadAllTests = async () => {
    setLoading(true);
    
    try {
      // Load original practice tests (from TestSelector)
      const originalPracticeTests = [
        {
          id: 'mb800-practice',
          title: 'MB-800: Microsoft Dynamics 365 Business Central Functional Consultant',
          description: 'Complete certification preparation with practice questions',
          questionCount: '65+ Questions',
          difficulty: 'Intermediate',
          topics: ['Microsoft Dynamics 365', 'Business Central', 'Functional Consultant'],
          type: 'practice',
          source: 'Certification Prep',
          csvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTDO68GqAelFKS2G6SwiUWdPs2tw5Gt62D5xLiB_9zyLyBPLSZm5gTthaQz9yCpmDKuymWMc83PV5a2/pub?gid=0&single=true&output=csv',
          color: '#003049',
          icon: '💼'
        }
      ];

      // Load practice tests (existing saved tests logic)
      const savedTests = await SavedTestsService.getSavedTests();
      const savedPracticeTests = savedTests.map(test => ({
        ...test,
        type: 'practice',
        source: 'Saved Practice'
      }));

      // Combine original practice tests with saved tests
      const allPracticeTests = [...originalPracticeTests, ...savedPracticeTests];

      // Load case studies from Google Sheets
      const caseStudiesData = await loadCaseStudies();

      // Load shared/published tests
      const sharedTestsData = await loadSharedTests();

      setPracticeTests(allPracticeTests);
      setCaseStudies(caseStudiesData);
      setSharedTests(sharedTestsData);
    } catch (error) {
      console.error('Error loading tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCaseStudies = async () => {
    try {
      const response = await fetch(META_URL);
      const csv = await response.text();
      const metaData = Papa.parse(csv, { header: true }).data
        .filter(row => row.id && row.title && row.title.toLowerCase() !== 'title');
      
      return metaData.map(study => ({
        id: study.id,
        title: study.title,
        description: study.description || 'MB-800 Case Study',
        topics: study.topics ? study.topics.split(',').map(t => t.trim()) : ['Case Study'],
        type: 'case-study',
        source: 'MB-800 Certification',
        difficulty: study.difficulty || 'Intermediate',
        questionCount: parseInt(study.questionCount) || 'Multiple'
      }));
    } catch (error) {
      console.error('Error loading case studies:', error);
      return [];
    }
  };

  const loadSharedTests = async () => {
    try {
      const publishedTests = await PublishedTestsService.getPublishedTests();
      return publishedTests.map(test => ({
        ...test,
        type: 'shared',
        source: 'Community',
        topics: test.tags || []
      }));
    } catch (error) {
      console.error('Error loading shared tests:', error);
      return [];
    }
  };

  const handleTestClick = (test) => {
    switch (test.type) {
      case 'practice':
        if (test.csvUrl) {
          // Original practice test - navigate to practice container with test selection
          navigate('/practice', { state: { selectedTest: test } });
        } else {
          // Saved practice test
          navigate('/practice', { state: { savedTest: test } });
        }
        break;
      case 'case-study':
        navigate(`/case-studies/${test.id}`);
        break;
      case 'shared':
        navigate(`/shared-test/${test.id}`);
        break;
      default:
        navigate('/practice');
    }
  };

  const getTabConfig = () => {
    if (userProfile?.accountType === 'student') {
      return [
        { id: 'practice', label: 'Practice Tests', icon: '📝', count: practiceTests.length },
        { id: 'case-studies', label: 'Case Studies', icon: '📖', count: caseStudies.length },
        { id: 'shared', label: 'Available Tests', icon: '📤', count: sharedTests.length }
      ];
    } else {
      return [
        { id: 'practice', label: 'Practice Tests', icon: '📝', count: practiceTests.length },
        { id: 'case-studies', label: 'Case Studies', icon: '📖', count: caseStudies.length },
        { id: 'shared', label: 'Shared Tests', icon: '📤', count: sharedTests.length }
      ];
    }
  };

  if (loading) {
    return (
      <div className="test-library-loading">
        <div className="loading-spinner">📚</div>
        <div className="loading-text">Loading Test Library...</div>
      </div>
    );
  }

  const tabs = getTabConfig();

  return (
    <div className="test-library-container">
      {/* Header */}
      <div className="test-library-header">
        <div className="test-library-title">
          <h1>📚 Test Library</h1>
          <p className="test-library-subtitle">
            {userProfile?.accountType === 'student' 
              ? 'Access practice tests, case studies, and assigned materials'
              : 'Browse practice tests, case studies, and shared content'
            }
          </p>
        </div>
        
        {searchTerm && (
          <div className="search-info">
            <span>Searching for: <strong>"{searchTerm}"</strong></span>
            <button onClick={onClearSearch} className="clear-search-btn">
              Clear Search
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="test-library-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
            <span className="tab-count">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Test Grid */}
      <div className="test-library-content">
        {filteredTests.length === 0 ? (
          <div className="no-tests-message">
            <div className="no-tests-icon">🔍</div>
            <h3>No tests found</h3>
            <p>
              {searchTerm 
                ? `No tests match "${searchTerm}" in the ${tabs.find(t => t.id === activeTab)?.label} category.`
                : `No tests available in the ${tabs.find(t => t.id === activeTab)?.label} category.`
              }
            </p>
            {searchTerm && (
              <button onClick={onClearSearch} className="clear-search-btn">
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="test-grid">
            {filteredTests.map((test, index) => (
              <div
                key={test.id || index}
                className={`test-card ${test.type}`}
                onClick={() => handleTestClick(test)}
              >
                <div className="test-card-header">
                  <div className="test-type-badge">
                    {test.type === 'practice' && '📝'}
                    {test.type === 'case-study' && '📖'}
                    {test.type === 'shared' && '📤'}
                  </div>
                  <div className="test-source">{test.source}</div>
                </div>
                
                <div className="test-card-content">
                  <h3 className="test-title">{test.title}</h3>
                  {test.description && (
                    <p className="test-description">{test.description}</p>
                  )}
                  
                  <div className="test-meta">
                    {test.questionCount && (
                      <span className="meta-item">
                        📊 {test.questionCount}
                      </span>
                    )}
                    {test.difficulty && (
                      <span className="meta-item">
                        ⭐ {test.difficulty}
                      </span>
                    )}
                    {test.lastTaken && (
                      <span className="meta-item">
                        📅 Last taken: {new Date(test.lastTaken).toLocaleDateString()}
                      </span>
                    )}
                    {test.csvUrl && (
                      <span className="meta-item">
                        🔗 Online Questions
                      </span>
                    )}
                  </div>

                  {test.topics && test.topics.length > 0 && (
                    <div className="test-topics">
                      {test.topics.slice(0, 3).map((topic, i) => (
                        <span key={i} className="topic-tag">{topic}</span>
                      ))}
                      {test.topics.length > 3 && (
                        <span className="topic-tag more">+{test.topics.length - 3} more</span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="test-card-footer">
                  <button className="test-action-btn">
                    {test.type === 'practice' 
                      ? (test.csvUrl ? 'Start Practice Test' : 'Continue Practice')
                      : 'Start Test'
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TestLibrary;
