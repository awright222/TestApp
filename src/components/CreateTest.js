import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CreatedTestsService } from '../services/CreatedTestsService';
import { useAuth } from '../firebase/AuthContext';
import './CreateTest.css';

export default function CreateTest() {
  console.log('CreateTest component loaded');
  const navigate = useNavigate();
  const { testId } = useParams(); // For editing existing tests
  const { userProfile, canPerformAction, trackUsage, loading } = useAuth();
  const isEditing = Boolean(testId);
  
  const [activeTab, setActiveTab] = useState('import'); // 'import', 'builder', 'case-study', or 'settings'
  
  // Test type state
  const [testType, setTestType] = useState(''); // '', 'regular', 'case-study', 'mixed'
  
  // Import states
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [testPreview, setTestPreview] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  
  // Builder states
  const [testTitle, setTestTitle] = useState('');
  const [testDescription, setTestDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    question_text: '',
    question_type: 'multiple choice',
    choices: '',
    correct_answer: '',
    explanation: ''
  });

  // Debug log for currentQuestion changes
  useEffect(() => {
    console.log('CurrentQuestion changed:', currentQuestion);
  }, [currentQuestion]);

  // Case Study states
  const [caseStudyTabs, setCaseStudyTabs] = useState([
    {
      id: 1,
      title: 'Background',
      cards: [
        { id: 1, title: 'Company Overview', content: '' }
      ]
    }
  ]);
  const [caseStudyQuestions, setCaseStudyQuestions] = useState([]);
  const [currentCaseStudyQuestion, setCurrentCaseStudyQuestion] = useState({
    question_text: '',
    question_type: 'multiple choice',
    choices: '',
    correct_answer: '',
    explanation: ''
  });
  const [activeTabEditor, setActiveTabEditor] = useState(1);

  // Settings states - these should be specific to this test instance
  const [testSettings, setTestSettings] = useState({
    timeLimit: 0, // 0 = no limit
    autoSubmitOnTimeout: true,
    showTimer: true,
    timerWarnings: true,
    gracePeriod: 30,
    allowSaveAndReturn: false,
    showExplanations: true,
    showCorrectAnswers: false,
    randomizeQuestions: false,
    randomizeChoices: false,
    maxAttempts: 1,
    isPublished: false,
    requireName: true,
    requireEmail: false,
    passingScore: 70,
    showResults: true,
    allowReview: true,
    accessCode: '',
    visibility: 'private', // 'private', 'public', 'unlisted'
    // Security & Navigation settings
    browserLockdown: false,
    fullScreenRequired: false,
    linearMode: false,
    noBacktrack: false,
    oneTimeOnly: false
  });

  // Reset settings when creating a new test (not editing)
  useEffect(() => {
    if (!isEditing) {
      // For new tests, check if we have temporary settings in sessionStorage
      const savedTempSettings = sessionStorage.getItem('current_test_settings');
      
      if (savedTempSettings) {
        try {
          const parsedSettings = JSON.parse(savedTempSettings);
          setTestSettings(parsedSettings);
        } catch (e) {
          console.warn('Failed to parse temporary settings, using defaults');
        }
      } else {
        // Reset to defaults for new test
        setTestSettings({
          timeLimit: 0,
          autoSubmitOnTimeout: true,
          showTimer: true,
          timerWarnings: true,
          gracePeriod: 30,
          allowSaveAndReturn: false,
          showExplanations: true,
          showCorrectAnswers: false,
          randomizeQuestions: false,
          randomizeChoices: false,
          maxAttempts: 1,
          isPublished: false,
          requireName: true,
          requireEmail: false,
          passingScore: 70,
          showResults: true,
          allowReview: true,
          accessCode: '',
          visibility: 'private',
          // Security & Navigation settings
          browserLockdown: false,
          fullScreenRequired: false,
          linearMode: false,
          noBacktrack: false,
          oneTimeOnly: false
        });
      }
    }
  }, [isEditing, testId]); // Reset when switching between new/edit modes

  // Save settings temporarily when they change (for current test creation session)
  useEffect(() => {
    if (!isEditing) {
      sessionStorage.setItem('current_test_settings', JSON.stringify(testSettings));
    }
  }, [testSettings, isEditing]);

  // Permission check - redirect if user can't create tests
  useEffect(() => {
    // Wait for auth to finish loading before checking permissions
    if (loading) {
      console.log('CreateTest: Auth still loading...');
      return;
    }
    
    // Only run permission check if userProfile is loaded
    if (!userProfile) {
      console.log('CreateTest: No userProfile found');
      return;
    }
    
    console.log('CreateTest: Checking permissions...', {
      userProfile: userProfile,
      accountType: userProfile.accountType,
      subscription: userProfile.subscription,
      usage: userProfile.usage,
      isEditing: isEditing,
      canCreateTest: canPerformAction('create_test')
    });
    
    // Allow teachers to always create tests in development (bypass limits)
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isTeacher = userProfile.accountType === 'teacher';
    
    if (isDevelopment && isTeacher) {
      console.log('CreateTest: Development mode - allowing teacher to create tests');
      return; // Skip all permission checks in development for teachers
    }
    
    if (!isEditing && !canPerformAction('create_test')) {
      // User has reached their test creation limit
      console.log('CreateTest: Cannot create test - redirecting to my-tests');
      navigate('/my-tests?showUpgrade=true');
      return;
    }
    
    if (userProfile.accountType === 'student') {
      // Students can't create tests at all
      console.log('CreateTest: Student account - redirecting to dashboard');
      navigate('/dashboard');
      return;
    }
    
    console.log('CreateTest: Permission check passed');
  }, [userProfile, canPerformAction, isEditing, navigate, loading]);

  // Clear temporary settings when component unmounts or test is created
  useEffect(() => {
    return () => {
      if (!isEditing) {
        sessionStorage.removeItem('current_test_settings');
      }
    };
  }, [isEditing]);
  // Load existing test data if editing
  useEffect(() => {
    const loadTestForEditing = async () => {
      try {
        const test = await CreatedTestsService.getTestById(testId);
        if (test) {
          setTestTitle(test.title);
          setTestDescription(test.description || '');
          setQuestions(test.questions || []);
          
          // Load test settings if they exist
          if (test.settings) {
            setTestSettings(prevSettings => ({
              ...prevSettings,
              ...test.settings
            }));
          }
          
          // If it was built manually, switch to builder tab
          if (test.source === 'builder') {
            setActiveTab('builder');
          }
        } else {
          alert('Test not found!');
          navigate('/my-tests');
        }
      } catch (error) {
        console.error('Error loading test for editing:', error);
        alert('Failed to load test for editing.');
        navigate('/my-tests');
      }
    };

    if (isEditing && testId) {
      loadTestForEditing();
    }
  }, [isEditing, testId, navigate]);

  const downloadTemplate = () => {
    const csvContent = `question_text,question_type,choices,correct_answer,explanation
"What is Microsoft Azure?","multiple choice","A. Cloud computing platform
B. Database software
C. Operating system
D. Web browser","A","Microsoft Azure is a cloud computing platform that provides various cloud services."
"Configure user permissions for...","hotspot","Department: IT, Sales, Marketing
Role: Admin, User, Guest","Department: IT
Role: Admin","Proper configuration requires setting the department and role correctly."`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'test-template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      // Here you would validate and parse the file
      validateAndPreviewFile(file);
    }
  };

  const validateAndPreviewFile = async (file) => {
    setIsValidating(true);
    // Simulate file validation
    setTimeout(() => {
      setTestPreview({
        title: file.name.replace(/\.[^/.]+$/, ""),
        questionCount: 25,
        valid: true,
        errors: []
      });
      setIsValidating(false);
    }, 1500);
  };

  const validateGoogleSheet = async () => {
    if (!googleSheetUrl) return;
    
    setIsValidating(true);
    // Simulate Google Sheets validation
    setTimeout(() => {
      setTestPreview({
        title: "Custom Test from Google Sheets",
        questionCount: 30,
        valid: true,
        errors: []
      });
      setIsValidating(false);
    }, 2000);
  };

  const addQuestion = () => {
    if (currentQuestion.question_text.trim()) {
      setQuestions([...questions, { ...currentQuestion, id: Date.now() }]);
      setCurrentQuestion({
        question_text: '',
        question_type: 'multiple choice',
        choices: '',
        correct_answer: '',
        explanation: ''
      });
    }
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  // Create test from builder
  const createTestFromBuilder = async () => {
    if (!testTitle.trim() || questions.length === 0) {
      alert('Please enter a test title and add at least one question.');
      return;
    }

    try {
      const testData = {
        title: testTitle,
        description: testDescription,
        questions: questions.map(q => ({
          question_text: q.question_text,
          question_type: q.question_type,
          choices: q.choices,
          correct_answer: q.correct_answer,
          explanation: q.explanation
        })),
        source: 'builder',
        icon: '🔨',
        difficulty: 'Custom',
        color: '#28a745',
        // Include all settings
        settings: testSettings
      };

      console.log('Creating test with data:', testData);

      let result;
      if (isEditing) {
        result = await CreatedTestsService.updateTest(testId, testData);
        console.log('Test updated:', result);
      } else {
        // Check permission before creating
        if (!canPerformAction('create_test')) {
          alert('You have reached your test creation limit. Please upgrade to continue.');
          navigate('/my-tests?showUpgrade=true');
          return;
        }
        
        result = await CreatedTestsService.createTest(testData);
        console.log('Test created:', result);
        
        // Track usage for new test creation
        await trackUsage('test_created', 1);
      }
      
      // Wait a moment to ensure localStorage write is complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Clear temporary settings since test is now created
      if (!isEditing) {
        sessionStorage.removeItem('current_test_settings');
      }
      
      alert(`Test "${testTitle}" ${isEditing ? 'updated' : 'created'} successfully!`);
      
      // Navigate after the alert is dismissed
      setTimeout(() => {
        navigate('/my-tests');
      }, 100);
      
    } catch (error) {
      console.error('Error saving test:', error);
      alert('Failed to save test. Please try again.');
    }
  };

  // Create test from import
  const createTestFromImport = async () => {
    if (!testPreview) {
      alert('Please validate your import first.');
      return;
    }

    try {
      let testData = {
        title: testPreview.title,
        description: `Imported test with ${testPreview.questionCount} questions`,
        source: 'import',
        icon: '📥',
        difficulty: 'Imported',
        // Include all settings
        settings: testSettings
      };

      if (uploadedFile) {
        // For file upload, parse the file
        const fileContent = await readFileAsText(uploadedFile);
        const questions = CreatedTestsService.parseCSVToQuestions(fileContent);
        testData.questions = questions;
      } else if (googleSheetUrl) {
        // For Google Sheets, store the URL
        testData.csvUrl = googleSheetUrl;
        testData.source = 'google-sheets';
        // In a real implementation, you'd fetch and parse the sheet here
        testData.questions = []; // Placeholder
      }

      // Check permission before creating
      if (!canPerformAction('create_test')) {
        alert('You have reached your test creation limit. Please upgrade to continue.');
        navigate('/my-tests?showUpgrade=true');
        return;
      }

      const result = await CreatedTestsService.createTest(testData);
      console.log('Import test created:', result);
      
      // Track usage for new test creation
      await trackUsage('test_created', 1);
      
      // Wait a moment to ensure localStorage write is complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Clear temporary settings since test is now created
      if (!isEditing) {
        sessionStorage.removeItem('current_test_settings');
      }
      
      alert(`Test "${testData.title}" created successfully!`);
      
      // Navigate after the alert is dismissed
      setTimeout(() => {
        navigate('/my-tests');
      }, 100);
      
    } catch (error) {
      console.error('Error creating test:', error);
      alert('Failed to create test. Please try again.');
    }
  };

  // Handle test type selection
  const handleTestTypeChange = (newType) => {
    setTestType(newType);
    // Auto-switch to appropriate tab based on test type
    if (newType === 'case-study') {
      setActiveTab('case-study');
    } else if (newType === 'regular' || newType === 'mixed') {
      setActiveTab('builder');
    } else if (newType === '') {
      // When clearing test type, go back to builder tab to show type selection
      setActiveTab('builder');
    }
  };

  // Helper function to read file as text
  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  return (
    <div className="create-test-container">
      {/* Show loading while auth is initializing */}
      {loading && (
        <div className="loading-container" style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="loading-spinner">🔄</div>
          <p>Loading...</p>
        </div>
      )}
      
      {/* Show content only when auth is loaded */}
      {!loading && (
        <>
          <div className="create-test-header">
            <h1>{isEditing ? '✏️ Edit Test' : '✨ Create New Test'}</h1>
            <p>{isEditing ? 'Update your custom test' : 'Build custom tests with your own questions and answers'}</p>
          </div>

      {/* Tab Navigation */}
      <div className="create-test-tabs">
        <button 
          className={`tab-btn ${activeTab === 'import' ? 'active' : ''}`}
          data-tab="import"
          onClick={() => setActiveTab('import')}
        >
          📥 Import Test
        </button>
        
        {/* Build Test Tab - Always show, but content changes based on test type */}
        {!testType && (
          <button 
            className={`tab-btn ${activeTab === 'builder' ? 'active' : ''}`}
            data-tab="builder"
            onClick={() => setActiveTab('builder')}
          >
            🔨 Build Test
          </button>
        )}
        
        {/* Regular Questions Tab - Show for Regular and Mixed */}
        {(testType === 'regular' || testType === 'mixed') && (
          <button 
            className={`tab-btn ${activeTab === 'builder' ? 'active' : ''}`}
            data-tab="builder"
            onClick={() => setActiveTab('builder')}
          >
            {testType === 'mixed' ? '📝 Build Questions' : '🔨 Build Test'}
          </button>
        )}
        
        {/* Case Study Tab - Show for Case Study and Mixed */}
        {(testType === 'case-study' || testType === 'mixed') && (
          <button 
            className={`tab-btn ${activeTab === 'case-study' ? 'active' : ''}`}
            data-tab="case-study"
            onClick={() => setActiveTab('case-study')}
          >
            📚 Build Case Study
          </button>
        )}
        
        {/* Preview Tab - Show only when test has content */}
        {(testTitle.trim() && (questions.length > 0 || caseStudyTabs.some(tab => tab.cards.some(card => card.content)))) && (
          <button 
            className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
            data-tab="preview"
            onClick={() => setActiveTab('preview')}
          >
            👁️ Preview Test
          </button>
        )}
        
        <button 
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          data-tab="settings"
          onClick={() => {
            if (!testTitle.trim() && !isEditing) {
              alert('Please enter a test title before configuring settings.');
              setActiveTab(testType === 'case-study' ? 'case-study' : 'builder');
            } else {
              setActiveTab('settings');
            }
          }}
        >
          ⚙️ Settings & Publishing
          {(testSettings.timeLimit > 0 || testSettings.isPublished || testSettings.accessCode) && (
            <span className="settings-badge">•</span>
          )}
        </button>
      </div>

      {/* Import Tab */}
      {activeTab === 'import' && (
        <div className="tab-content">
          <div className="import-options">
            <h2>Import Your Test</h2>
            <p>Choose how you'd like to import your test questions:</p>

            <div className="import-methods">
              {/* Template Download */}
              <div className="import-method">
                <div className="method-icon">📋</div>
                <h3>Download Template</h3>
                <p>Get a CSV template with the correct format for your questions</p>
                <button onClick={downloadTemplate} className="method-btn template-btn">
                  📥 Download CSV Template
                </button>
              </div>

              {/* File Upload */}
              <div className="import-method">
                <div className="method-icon">�</div>
                <h3>Upload File</h3>
                <p>Upload a CSV or Excel file with your questions</p>
                <div className="file-upload-area">
                  <input 
                    type="file" 
                    accept=".csv,.xlsx,.xls" 
                    onChange={handleFileUpload}
                    id="file-upload"
                    className="file-input"
                  />
                  <label htmlFor="file-upload" className="file-upload-label">
                    {uploadedFile ? uploadedFile.name : 'Choose File'}
                  </label>
                </div>
              </div>

              {/* Google Sheets Link */}
              <div className="import-method">
                <div className="method-icon">🔗</div>
                <h3>Link Google Sheet</h3>
                <p>Connect a Google Sheets document with your questions</p>
                <div className="link-input-group">
                  <input
                    type="url"
                    placeholder="Paste your Google Sheets publish URL here..."
                    value={googleSheetUrl}
                    onChange={(e) => setGoogleSheetUrl(e.target.value)}
                    className="link-input"
                  />
                  <button 
                    onClick={validateGoogleSheet}
                    disabled={!googleSheetUrl || isValidating}
                    className="validate-btn"
                  >
                    {isValidating ? 'Validating...' : 'Validate'}
                  </button>
                </div>
                <div className="help-text">
                  <details>
                    <summary>How to get your Google Sheets URL</summary>
                    <ol>
                      <li>Open your Google Sheet</li>
                      <li>Go to File → Publish to the web</li>
                      <li>Select "Comma-separated values (.csv)"</li>
                      <li>Click "Publish" and copy the URL</li>
                    </ol>
                  </details>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            {testPreview && (
              <div className="test-preview">
                <h3>Test Preview</h3>
                <div className="preview-card">
                  <div className="preview-header">
                    <span className="preview-title">{testPreview.title}</span>
                    <span className={`preview-status ${testPreview.valid ? 'valid' : 'invalid'}`}>
                      {testPreview.valid ? '✅ Valid' : '❌ Invalid'}
                    </span>
                  </div>
                  <div className="preview-details">
                    <p>📊 {testPreview.questionCount} questions found</p>
                    {testPreview.errors.length > 0 && (
                      <div className="preview-errors">
                        <p>⚠️ Issues found:</p>
                        <ul>
                          {testPreview.errors.map((error, i) => (
                            <li key={i}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  {testPreview.valid && (
                    <button className="create-test-btn" onClick={createTestFromImport}>
                      🚀 Create Test
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Builder Tab */}
      {activeTab === 'builder' && (
        <div className="tab-content">
          <div className="test-builder">
            <h2>Build Your Test</h2>
            
            {/* Test Type Selection - Only show if no type selected */}
            {!testType && (
              <div className="test-type-section">
                <h3>📋 Test Type</h3>
                <p>Choose the type of test you want to create:</p>
                <div className="test-type-options">
                  <label className="test-type-option">
                    <input
                      type="radio"
                      name="testType"
                      value="regular"
                      onChange={(e) => handleTestTypeChange(e.target.value)}
                    />
                    <div className="test-type-card">
                      <div className="test-type-icon">❓</div>
                      <h4>Regular Test</h4>
                      <p>Traditional multiple choice and hotspot questions</p>
                    </div>
                  </label>
                  
                  <label className="test-type-option">
                    <input
                      type="radio"
                      name="testType"
                      value="case-study"
                      onChange={(e) => handleTestTypeChange(e.target.value)}
                    />
                    <div className="test-type-card">
                      <div className="test-type-icon">📚</div>
                      <h4>Case Study</h4>
                      <p>Scenario-based questions with background information</p>
                    </div>
                  </label>
                  
                  <label className="test-type-option">
                    <input
                      type="radio"
                      name="testType"
                      value="mixed"
                      onChange={(e) => handleTestTypeChange(e.target.value)}
                    />
                    <div className="test-type-card">
                      <div className="test-type-icon">🔀</div>
                      <h4>Mixed Test</h4>
                      <p>Combination of regular questions and case studies</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Test Type Confirmation - Show once type is selected */}
            {testType && (
              <div className="test-type-confirmation">
                <div className="selected-type-info">
                  <span className="type-icon">
                    {testType === 'regular' ? '❓' : testType === 'case-study' ? '📚' : '🔀'}
                  </span>
                  <div className="type-details">
                    <h4>
                      {testType === 'regular' ? 'Regular Test' : 
                       testType === 'case-study' ? 'Case Study Test' : 'Mixed Test'}
                    </h4>
                    <p>
                      {testType === 'regular' ? 'Building traditional multiple choice and hotspot questions' :
                       testType === 'case-study' ? 'Building scenario-based questions with background information' :
                       'Building both regular questions and case study sections'}
                    </p>
                  </div>
                </div>
                <button 
                  className="change-type-btn"
                  onClick={() => handleTestTypeChange('')}
                >
                  Change Type
                </button>
              </div>
            )}
                
            {/* Test Info - Show when type is selected */}
            {testType && (
              <div className="test-info-section">
                <div className="input-group">
                  <label htmlFor="test-title">Test Title</label>
                  <input
                    id="test-title"
                    type="text"
                    placeholder="Enter your test title..."
                    value={testTitle}
                    onChange={(e) => setTestTitle(e.target.value)}
                    className="text-input"
                  />
                </div>
                
                <div className="input-group">
                  <label htmlFor="test-description">Description (Optional)</label>
                  <textarea
                    id="test-description"
                    placeholder="Describe what this test covers..."
                    value={testDescription}
                    onChange={(e) => setTestDescription(e.target.value)}
                    className="textarea-input"
                    rows="3"
                  />
                </div>
              </div>
            )}

            {/* Show regular question builder only for regular/mixed types */}
            {(testType === 'regular' || testType === 'mixed') && (
              <div className="question-builder-section">
                <h3>{testType === 'mixed' ? 'Add Regular Questions' : 'Add Questions'}</h3>
                
                <div className="question-form">
                <div className="input-group">
                  <label htmlFor="question-text">Question</label>
                  <textarea
                    id="question-text"
                    placeholder="Enter your question..."
                    value={currentQuestion.question_text}
                    onChange={(e) => setCurrentQuestion({...currentQuestion, question_text: e.target.value})}
                    className="textarea-input"
                    rows="3"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="question-type">Question Type</label>
                  <select
                    id="question-type"
                    value={currentQuestion.question_type}
                    onChange={(e) => {
                      console.log('Question type changed to:', e.target.value);
                      setCurrentQuestion({...currentQuestion, question_type: e.target.value});
                    }}
                    className="select-input"
                  >
                    <option value="multiple choice">Multiple Choice</option>
                    <option value="hotspot">Hotspot/Interactive</option>
                    <option value="essay">Essay Question</option>
                    <option value="short answer">Short Answer</option>
                    <option value="drag and drop">Drag and Drop</option>
                  </select>
                </div>

                <div className="input-group">
                  <div className="label-with-info">
                    <label>
                      {(() => {
                        const label = currentQuestion.question_type === 'essay' ? 'Grading Rubric (Optional)' :
                                     currentQuestion.question_type === 'short answer' ? 'Expected Keywords/Phrases' :
                                     currentQuestion.question_type === 'drag and drop' ? 'Drag Items & Drop Zones' :
                                     'Choices';
                        console.log('Current question type:', currentQuestion.question_type, 'Label:', label);
                        return label;
                      })()}
                    </label>
                    <button 
                      type="button"
                      className="info-btn"
                      title={
                        currentQuestion.question_type === 'multiple choice' ? 
                          'Format: A. First option\nB. Second option\nC. Third option\nD. Fourth option\n\nEach choice should be on a new line with a letter prefix.' :
                        currentQuestion.question_type === 'hotspot' ?
                          'Format: Label1: option1, option2, option3\nLabel2: optionA, optionB\n\nCreate labeled groups of clickable options separated by commas.' :
                        currentQuestion.question_type === 'essay' ?
                          'Optional grading criteria to help evaluate responses:\n- Key points to address\n- Quality of arguments\n- Grammar and structure\n\nThis helps maintain consistency when grading.' :
                        currentQuestion.question_type === 'short answer' ?
                          'List acceptable keywords and phrases that indicate a correct answer:\nkeyword1, keyword2\nphrase example\nalternative answer\n\nSeparate alternatives with commas or new lines.' :                      currentQuestion.question_type === 'drag and drop' ?
                        'Define draggable items and drop zones:\nItems: item1, item2, item3\nZones: zone1, zone2, zone3\n\nDo NOT include correct matches here - use the field below for that.' :
                          'Standard answer choices for the question.'
                      }
                    >
                      i
                    </button>
                  </div>
                  <textarea
                    id="choices"
                    placeholder={
                      currentQuestion.question_type === 'multiple choice' ? 
                        "A. First option\nB. Second option\nC. Third option\nD. Fourth option" :
                      currentQuestion.question_type === 'hotspot' ?
                        "Label1: option1, option2, option3\nLabel2: optionA, optionB" :
                      currentQuestion.question_type === 'essay' ?
                        "Grading criteria (optional):\n- Key points to address\n- Quality of arguments\n- Grammar and structure" :
                      currentQuestion.question_type === 'short answer' ?
                        "Acceptable keywords/phrases:\nkeyword1, keyword2\nphrase example\nalternative answer" :
                      currentQuestion.question_type === 'drag and drop' ?
                        "Items: item1, item2, item3\nZones: zone1, zone2, zone3" :
                        "Enter choices..."
                    }
                    value={currentQuestion.choices}
                    onChange={(e) => setCurrentQuestion({...currentQuestion, choices: e.target.value})}
                    className="textarea-input"
                    rows="4"
                  />
                </div>

                <div className="input-group">
                  <div className="label-with-info">
                    <label>
                      {(() => {
                        const label = currentQuestion.question_type === 'essay' ? 'Sample Answer (Optional)' :
                                     currentQuestion.question_type === 'short answer' ? 'Correct Keywords/Phrases' :
                                     currentQuestion.question_type === 'drag and drop' ? 'Correct Matches' :
                                     'Correct Answer';
                        console.log('Correct answer field label:', label);
                        return label;
                      })()}
                    </label>
                    <button 
                      type="button"
                      className="info-btn"
                      title={
                        currentQuestion.question_type === 'multiple choice' ? 
                          'Enter the letter(s) of the correct answer(s):\nSingle answer: A\nMultiple answers: A, C\n\nUse the letter that corresponds to the correct choice(s).' :
                        currentQuestion.question_type === 'hotspot' ?
                          'Specify correct selections for each hotspot area:\nLabel1: option1\nLabel2: optionA\n\nMatch each label to its correct clickable option.' :
                        currentQuestion.question_type === 'essay' ?
                          'Provide a sample answer or key points for reference:\n- What a good answer should include\n- Main concepts to address\n- Quality indicators\n\nThis helps with consistent grading.' :
                        currentQuestion.question_type === 'short answer' ?
                          'List acceptable answers separated by commas:\nkeyword1, phrase example, alternative\n\nStudents need to match one of these to be correct.' :
                        currentQuestion.question_type === 'drag and drop' ?
                          'Define correct item-to-zone matches:\nitem1->zone1, item2->zone2, item3->zone3\n\nUse -> to show which item belongs in which zone.' :
                          'Specify the correct answer for this question.'
                      }
                    >
                      i
                    </button>
                  </div>
                  <input
                    id="correct-answer"
                    type="text"
                    placeholder={
                      currentQuestion.question_type === 'multiple choice' ? 
                        "A" :
                      currentQuestion.question_type === 'hotspot' ?
                        "Label1: option1\nLabel2: optionA" :
                      currentQuestion.question_type === 'essay' ?
                        "Sample answer or key points (for reference only)" :
                      currentQuestion.question_type === 'short answer' ?
                        "keyword1, phrase example, alternative" :
                      currentQuestion.question_type === 'drag and drop' ?
                        "item1->zone1, item2->zone2, item3->zone3" :
                        "Enter correct answer..."
                    }
                    value={currentQuestion.correct_answer}
                    onChange={(e) => setCurrentQuestion({...currentQuestion, correct_answer: e.target.value})}
                    className="text-input"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="explanation">Explanation</label>
                  <textarea
                    id="explanation"
                    placeholder="Explain why this is the correct answer..."
                    value={currentQuestion.explanation}
                    onChange={(e) => setCurrentQuestion({...currentQuestion, explanation: e.target.value})}
                    className="textarea-input"
                    rows="3"
                  />
                </div>

                <div className="input-group">
                  <div className="label-with-info">
                    <label htmlFor="points">Points</label>
                    <button 
                      type="button"
                      className="info-btn"
                      title="Set custom points for this question. Default is based on question type:
• Multiple Choice: 1 point per correct answer
• Hotspot: 1 point per hotspot area
• Drag & Drop: 1 point per correct match
• Essay/Short Answer: 1 point

You can override to weight questions differently (e.g., make essay questions worth more points)."
                    >
                      i
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      id="points"
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="Auto-calculated"
                      value={currentQuestion.points || ''}
                      onChange={(e) => setCurrentQuestion({...currentQuestion, points: e.target.value ? parseFloat(e.target.value) : null})}
                      className="text-input"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => setCurrentQuestion({...currentQuestion, points: null})}
                      className="auto-points-btn"
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9em'
                      }}
                      title="Reset to auto-calculated points based on question type"
                    >
                      Auto
                    </button>
                  </div>
                  <div style={{ fontSize: '0.8em', color: '#6c757d', marginTop: '4px' }}>
                    {currentQuestion.points ? 
                      `Custom: ${currentQuestion.points} points` : 
                      `Auto: ${(() => {
                        if (currentQuestion.question_type === 'drag and drop') {
                          const choices = currentQuestion.choices || '';
                          const lines = choices.split('\n');
                          for (const line of lines) {
                            if (line.startsWith('Items:')) {
                              const items = line.replace('Items:', '').split(',').map(item => item.trim()).filter(item => item);
                              return `${items.length} points (1 per correct match)`;
                            }
                          }
                          return '1 point (default)';
                        } else if (currentQuestion.question_type === 'multiple choice') {
                          const correctAnswer = currentQuestion.correct_answer || '';
                          const correctCount = correctAnswer.split(',').map(ans => ans.trim()).filter(ans => ans).length;
                          return correctCount > 0 ? `${correctCount} points (1 per correct answer)` : '1 point (default)';
                        } else if (currentQuestion.question_type === 'hotspot') {
                          const correctAnswer = currentQuestion.correct_answer || '';
                          const hotspotCount = correctAnswer.split('\n').filter(line => line.trim().includes(':')).length;
                          return hotspotCount > 0 ? `${hotspotCount} points (1 per hotspot)` : '1 point (default)';
                        }
                        return '1 point (default)';
                      })()} `
                    }
                  </div>
                </div>

                <button 
                  onClick={addQuestion}
                  disabled={!currentQuestion.question_text.trim()}
                  className="add-question-btn"
                >
                  ➕ Add Question
                </button>
              </div>
            </div>
            )}

            {/* Questions List */}
            {questions.length > 0 && (
              <div className="questions-list">
                <h3>Questions ({questions.length}) - Total Points: {questions.reduce((total, q) => {
                  if (q.points) return total + q.points;
                  // Auto-calculate points for questions without custom points
                  if (q.question_type === 'drag and drop') {
                    const choices = q.choices || '';
                    const lines = choices.split('\n');
                    for (const line of lines) {
                      if (line.startsWith('Items:')) {
                        const items = line.replace('Items:', '').split(',').map(item => item.trim()).filter(item => item);
                        return total + items.length;
                      }
                    }
                  }
                  return total + 1; // Default 1 point
                }, 0)}</h3>
                {questions.map((q, index) => (
                  <div key={q.id} className="question-item">
                    <div className="question-header">
                      <span className="question-number">Q{index + 1}</span>
                      <span className="question-points" style={{
                        backgroundColor: '#e3f2fd',
                        color: '#1565c0',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.8em',
                        fontWeight: 'bold'
                      }}>
                        {q.points || (() => {
                          if (q.question_type === 'drag and drop') {
                            const choices = q.choices || '';
                            const lines = choices.split('\n');
                            for (const line of lines) {
                              if (line.startsWith('Items:')) {
                                const items = line.replace('Items:', '').split(',').map(item => item.trim()).filter(item => item);
                                return items.length;
                              }
                            }
                          } else if (q.question_type === 'multiple choice') {
                            const correctAnswer = q.correct_answer || '';
                            const correctCount = correctAnswer.split(',').map(ans => ans.trim()).filter(ans => ans).length;
                            return correctCount > 0 ? correctCount : 1;
                          } else if (q.question_type === 'hotspot') {
                            const correctAnswer = q.correct_answer || '';
                            const hotspotCount = correctAnswer.split('\n').filter(line => line.trim().includes(':')).length;
                            return hotspotCount > 0 ? hotspotCount : 1;
                          }
                          return 1;
                        })()} pts
                      </span>
                      <button 
                        onClick={() => removeQuestion(q.id)}
                        className="remove-question-btn"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="question-preview">
                      <p><strong>{q.question_text}</strong></p>
                      <p><em>Type: {q.question_type}</em></p>
                    </div>
                  </div>
                ))}
              </div>
            )}
                
            {/* Settings Summary - only show if test has a title */}
            {testTitle.trim() && (
              <div className="settings-summary">
                <h4>⚙️ Settings for "{testTitle}"</h4>
                <div className="settings-preview">
                  <span>Time: {testSettings.timeLimit > 0 ? `${testSettings.timeLimit} min` : 'No limit'}</span>
                  <span>Attempts: {testSettings.maxAttempts}</span>
                  <span>Visibility: {testSettings.visibility}</span>
                  {testSettings.accessCode && <span>Access Code: ✓</span>}
                  {testSettings.isPublished && <span className="published">Published</span>}
                </div>
                <button 
                  className="edit-settings-btn"
                  onClick={() => setActiveTab('settings')}
                >
                  Edit Settings
                </button>
              </div>
            )}

            <div className="builder-actions">
              <button 
                disabled={questions.length === 0 || !testTitle.trim()}
                className="preview-test-btn"
                onClick={() => setActiveTab('preview')}
              >
                👁️ Preview Test
              </button>
              <button 
                disabled={questions.length === 0 || !testTitle.trim()}
                className="create-test-btn"
                onClick={createTestFromBuilder}
              >
                {isEditing ? '💾 Update Test' : '🚀 Create Test'} ({questions.length} questions)
              </button>
            </div>

            {/* Case Study Builder - Show when Case Study type is selected */}
            {testType === 'case-study' && (
              <div className="case-study-builder-inline">
                <h3>📚 Case Study Builder</h3>
                <p>Create scenario-based tests with custom tabs and information cards</p>
                
                {/* Tab Management */}
                <div className="case-study-tabs-section">
                  <div className="section-header">
                    <h4>📑 Information Tabs</h4>
                    <button 
                      className="add-tab-btn"
                      onClick={() => {
                        const newTab = {
                          id: Date.now(),
                          title: `Tab ${caseStudyTabs.length + 1}`,
                          cards: [
                            { id: Date.now() + 1, title: 'Card 1', content: '' }
                          ]
                        };
                        setCaseStudyTabs([...caseStudyTabs, newTab]);
                      }}
                    >
                      ➕ Add Tab
                    </button>
                  </div>
                  
                  {/* Simplified Tab Editor for inline view */}
                  <div className="tabs-editor-inline">
                    <div className="tabs-list-inline">
                      {caseStudyTabs.map(tab => (
                        <div 
                          key={tab.id}
                          className={`tab-editor-item-inline ${activeTabEditor === tab.id ? 'active' : ''}`}
                          onClick={() => setActiveTabEditor(tab.id)}
                        >
                          <div className="tab-header-inline">
                            <input
                              type="text"
                              value={tab.title}
                              onChange={(e) => {
                                setCaseStudyTabs(caseStudyTabs.map(t => 
                                  t.id === tab.id ? { ...t, title: e.target.value } : t
                                ));
                              }}
                              onClick={(e) => e.stopPropagation()}
                              placeholder="Tab title"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCaseStudyTabs(caseStudyTabs.filter(t => t.id !== tab.id));
                                if (activeTabEditor === tab.id && caseStudyTabs.length > 1) {
                                  setActiveTabEditor(caseStudyTabs[0].id);
                                }
                              }}
                              className="delete-tab-btn"
                              disabled={caseStudyTabs.length === 1}
                            >
                              🗑️
                            </button>
                          </div>
                          <div className="tab-info-inline">
                            {tab.cards.length} card{tab.cards.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Card Editor for Active Tab */}
                    {caseStudyTabs.find(tab => tab.id === activeTabEditor) && (
                      <div className="cards-editor-inline">
                        <div className="cards-header-inline">
                          <h5>Cards for "{caseStudyTabs.find(tab => tab.id === activeTabEditor)?.title}"</h5>
                          <button
                            className="add-card-btn"
                            onClick={() => {
                              const activeTab = caseStudyTabs.find(tab => tab.id === activeTabEditor);
                              if (activeTab && activeTab.cards.length < 10) {
                                const newCard = {
                                  id: Date.now(),
                                  title: `Card ${activeTab.cards.length + 1}`,
                                  content: ''
                                };
                                setCaseStudyTabs(caseStudyTabs.map(tab =>
                                  tab.id === activeTabEditor 
                                    ? { ...tab, cards: [...tab.cards, newCard] }
                                    : tab
                                ));
                              }
                            }}
                            disabled={caseStudyTabs.find(tab => tab.id === activeTabEditor)?.cards.length >= 10}
                          >
                            ➕ Add Card
                          </button>
                        </div>
                        
                        <div className="cards-list-inline">
                          {caseStudyTabs.find(tab => tab.id === activeTabEditor)?.cards.map(card => (
                            <div key={card.id} className="card-editor-inline">
                              <div className="card-header-inline">
                                <input
                                  type="text"
                                  value={card.title}
                                  onChange={(e) => {
                                    setCaseStudyTabs(caseStudyTabs.map(tab =>
                                      tab.id === activeTabEditor
                                        ? {
                                            ...tab,
                                            cards: tab.cards.map(c =>
                                              c.id === card.id ? { ...c, title: e.target.value } : c
                                            )
                                          }
                                        : tab
                                    ));
                                  }}
                                  placeholder="Card title"
                                />
                                <button
                                  onClick={() => {
                                    setCaseStudyTabs(caseStudyTabs.map(tab =>
                                      tab.id === activeTabEditor
                                        ? {
                                            ...tab,
                                            cards: tab.cards.filter(c => c.id !== card.id)
                                          }
                                        : tab
                                    ));
                                  }}
                                  className="delete-card-btn"
                                  disabled={caseStudyTabs.find(tab => tab.id === activeTabEditor)?.cards.length === 1}
                                >
                                  🗑️
                                </button>
                              </div>
                              <textarea
                                value={card.content}
                                onChange={(e) => {
                                  setCaseStudyTabs(caseStudyTabs.map(tab =>
                                    tab.id === activeTabEditor
                                      ? {
                                          ...tab,
                                          cards: tab.cards.map(c =>
                                            c.id === card.id ? { ...c, content: e.target.value } : c
                                          )
                                        }
                                      : tab
                                  ));
                                }}
                                placeholder="Card content - this will be shown in a modal when the card is clicked"
                                rows="3"
                                className="card-content-textarea-inline"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Case Study Questions */}
                <div className="case-study-questions-section">
                  <h4>❓ Case Study Questions</h4>
                  <p>Add questions that reference the case study information above</p>
                  
                  {/* Question Form */}
                  <div className="question-form">
                    <div className="input-group">
                      <label>Question</label>
                      <textarea
                        placeholder="Enter your question..."
                        value={currentCaseStudyQuestion.question_text}
                        onChange={(e) => setCurrentCaseStudyQuestion({...currentCaseStudyQuestion, question_text: e.target.value})}
                        className="textarea-input"
                        rows="3"
                      />
                    </div>

                    <div className="input-group">
                      <label>Question Type</label>
                      <select
                        value={currentCaseStudyQuestion.question_type}
                        onChange={(e) => setCurrentCaseStudyQuestion({...currentCaseStudyQuestion, question_type: e.target.value})}
                        className="select-input"
                      >
                        <option value="multiple choice">Multiple Choice</option>
                        <option value="hotspot">Hotspot/Interactive</option>
                        <option value="essay">Essay Question</option>
                        <option value="short answer">Short Answer</option>
                        <option value="drag and drop">Drag and Drop</option>
                      </select>
                    </div>

                    <div className="input-group">
                      <div className="label-with-info">
                        <label>
                          {currentCaseStudyQuestion.question_type === 'essay' ? 'Grading Rubric (Optional)' :
                           currentCaseStudyQuestion.question_type === 'short answer' ? 'Expected Keywords/Phrases' :
                           currentCaseStudyQuestion.question_type === 'drag and drop' ? 'Drag Items & Drop Zones' :
                           'Choices'}
                        </label>
                        <button 
                          type="button"
                          className="info-btn"
                          title={
                            currentCaseStudyQuestion.question_type === 'multiple choice' ? 
                              'Format: A. First option\nB. Second option\nC. Third option\nD. Fourth option\n\nEach choice should be on a new line with a letter prefix.' :
                            currentCaseStudyQuestion.question_type === 'hotspot' ?
                              'Format: Label1: option1, option2, option3\nLabel2: optionA, optionB\n\nCreate labeled groups of clickable options separated by commas.' :
                            currentCaseStudyQuestion.question_type === 'essay' ?
                              'Optional grading criteria to help evaluate responses:\n- Key points to address\n- Quality of arguments\n- Grammar and structure\n\nThis helps maintain consistency when grading.' :
                            currentCaseStudyQuestion.question_type === 'short answer' ?
                              'List acceptable keywords and phrases that indicate a correct answer:\nkeyword1, keyword2\nphrase example\nalternative answer\n\nSeparate alternatives with commas or new lines.' :
                            currentCaseStudyQuestion.question_type === 'drag and drop' ?
                              'Define draggable items and drop zones:\nItems: item1, item2, item3\nZones: zone1, zone2, zone3\nCorrect matches: item1->zone1, item2->zone2\n\nClearly specify what items match which zones.' :
                              'Standard answer choices for the question.'
                          }
                        >
                          i
                        </button>
                      </div>
                      <textarea
                        placeholder={
                          currentCaseStudyQuestion.question_type === 'multiple choice' ? 
                            "A. First option\nB. Second option\nC. Third option\nD. Fourth option" :
                          currentCaseStudyQuestion.question_type === 'hotspot' ?
                            "Label1: option1, option2, option3\nLabel2: optionA, optionB" :
                          currentCaseStudyQuestion.question_type === 'essay' ?
                            "Grading criteria (optional):\n- Key points to address\n- Quality of arguments\n- Grammar and structure" :
                          currentCaseStudyQuestion.question_type === 'short answer' ?
                            "Acceptable keywords/phrases:\nkeyword1, keyword2\nphrase example\nalternative answer" :
                          currentCaseStudyQuestion.question_type === 'drag and drop' ?
                            "Items: item1, item2, item3\nZones: zone1, zone2, zone3\nCorrect matches: item1->zone1, item2->zone2" :
                            "Enter choices..."
                        }
                        value={currentCaseStudyQuestion.choices}
                        onChange={(e) => setCurrentCaseStudyQuestion({...currentCaseStudyQuestion, choices: e.target.value})}
                        className="textarea-input"
                        rows="4"
                      />
                    </div>

                    <div className="input-group">
                      <div className="label-with-info">
                        <label>Correct Answer</label>
                        <button 
                          type="button" 
                          className="info-btn"
                          title={currentCaseStudyQuestion.question_type === 'multiple choice' ? 
                            'Enter the letter(s) of the correct answer(s):\nSingle answer: A\nMultiple answers: A, C\n\nUse the letter that corresponds to the correct choice(s).' :
                            currentCaseStudyQuestion.question_type === 'hotspot' ?
                            'Specify the coordinates or regions for correct hotspots:\nFormat: x1,y1 x2,y2\nExample: 150,200 300,400\n\nEach coordinate pair represents a clickable area.' :
                            currentCaseStudyQuestion.question_type === 'essay' ?
                            'List acceptable keywords and phrases that indicate a correct answer:\nkeyword1, keyword2\nphrase example\nalternative answer\n\nSeparate alternatives with commas or new lines.' :
                            currentCaseStudyQuestion.question_type === 'short answer' ?
                            'List acceptable keywords and phrases that indicate a correct answer:\nkeyword1, keyword2\nphrase example\nalternative answer\n\nSeparate alternatives with commas or new lines.' :
                            currentCaseStudyQuestion.question_type === 'drag and drop' ?
                            'Specify correct matches between items:\nItem1: Target1\nItem2: Target2\n\nFormat as item-target pairs, one per line.' :
                            'Specify the correct answer for this question.'
                          }
                        >
                          i
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder={currentCaseStudyQuestion.question_type === 'multiple choice' ? "A" : "Label1: option1\nLabel2: optionA"}
                        value={currentCaseStudyQuestion.correct_answer}
                        onChange={(e) => setCurrentCaseStudyQuestion({...currentCaseStudyQuestion, correct_answer: e.target.value})}
                        className="text-input"
                      />
                    </div>

                    <div className="input-group">
                      <label>Explanation</label>
                      <textarea
                        placeholder="Explain why this is the correct answer..."
                        value={currentCaseStudyQuestion.explanation}
                        onChange={(e) => setCurrentCaseStudyQuestion({...currentCaseStudyQuestion, explanation: e.target.value})}
                        className="textarea-input"
                        rows="3"
                      />
                    </div>

                    <div className="input-group">
                      <div className="label-with-info">
                        <label htmlFor="case-study-points">Points</label>
                        <button 
                          type="button"
                          className="info-btn"
                          title="Set custom points for this question. Default is based on question type:
• Multiple Choice: 1 point
• Drag & Drop: 1 point per correct match
• Essay/Short Answer: 1 point

You can override to weight questions differently."
                        >
                          i
                        </button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          id="case-study-points"
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="Auto-calculated"
                          value={currentCaseStudyQuestion.points || ''}
                          onChange={(e) => setCurrentCaseStudyQuestion({...currentCaseStudyQuestion, points: e.target.value ? parseFloat(e.target.value) : null})}
                          className="text-input"
                          style={{ flex: 1 }}
                        />
                        <button
                          type="button"
                          onClick={() => setCurrentCaseStudyQuestion({...currentCaseStudyQuestion, points: null})}
                          className="auto-points-btn"
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #dee2e6',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.9em'
                          }}
                          title="Reset to auto-calculated points based on question type"
                        >
                          Auto
                        </button>
                      </div>
                      <div style={{ fontSize: '0.8em', color: '#6c757d', marginTop: '4px' }}>
                        {currentCaseStudyQuestion.points ? 
                          `Custom: ${currentCaseStudyQuestion.points} points` : 
                          `Auto: ${(() => {
                            if (currentCaseStudyQuestion.question_type === 'drag and drop') {
                              const choices = currentCaseStudyQuestion.choices || '';
                              const lines = choices.split('\n');
                              for (const line of lines) {
                                if (line.startsWith('Items:')) {
                                  const items = line.replace('Items:', '').split(',').map(item => item.trim()).filter(item => item);
                                  return `${items.length} points (1 per correct match)`;
                                }
                              }
                              return '1 point (default)';
                            }
                            return '1 point (default)';
                          })()} `
                        }
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        if (currentCaseStudyQuestion.question_text && currentCaseStudyQuestion.choices && currentCaseStudyQuestion.correct_answer) {
                          setCaseStudyQuestions([...caseStudyQuestions, { ...currentCaseStudyQuestion, id: Date.now() }]);
                          setCurrentCaseStudyQuestion({
                            question_text: '',
                            question_type: 'multiple choice',
                            choices: '',
                            correct_answer: '',
                            explanation: ''
                          });
                        } else {
                          alert('Please fill in all required fields.');
                        }
                      }}
                      className="add-question-btn"
                    >
                      ➕ Add Question
                    </button>
                  </div>

                  {/* Questions List */}
                  {caseStudyQuestions.length > 0 && (
                    <div className="questions-list">
                      <h5>Questions ({caseStudyQuestions.length})</h5>
                      {caseStudyQuestions.map((q, index) => (
                        <div key={q.id} className="question-item">
                          <div className="question-header">
                            <span className="question-number">Q{index + 1}</span>
                            <span className="question-type">{q.question_type}</span>
                            <button 
                              onClick={() => setCaseStudyQuestions(caseStudyQuestions.filter(qs => qs.id !== q.id))}
                              className="delete-question-btn"
                            >
                              🗑️
                            </button>
                          </div>
                          <div className="question-text">{q.question_text}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="case-study-actions-inline">
                  <button 
                    className="preview-test-btn"
                    onClick={() => setActiveTab('preview')}
                    disabled={!testTitle || (caseStudyQuestions.length === 0 && !caseStudyTabs.some(tab => tab.cards.some(card => card.content)))}
                  >
                    👁️ Preview Test
                  </button>
                  <button 
                    className="create-case-study-btn"
                    onClick={() => {
                      // TODO: Implement save functionality
                      alert('Save functionality coming soon!');
                    }}
                    disabled={!testTitle || caseStudyQuestions.length === 0}
                  >
                    💾 Save Case Study
                  </button>
                </div>
              </div>
            )}

            {/* Mixed Test - Show both builders */}
            {testType === 'mixed' && (
              <div className="mixed-test-builder">
                <h3>🔀 Mixed Question Builder</h3>
                <p>Add both regular questions and case study sections</p>
                
                <div className="mixed-sections">
                  <div className="section-indicator">
                    <h4>📋 Regular Questions Section</h4>
                    <p>{questions.length} questions added</p>
                  </div>
                  
                  <div className="section-indicator">
                    <h4>📚 Case Study Section</h4>
                    <p>{caseStudyQuestions.length} questions added</p>
                  </div>
                </div>
                
                <div className="mixed-actions">
                  <button 
                    className="switch-to-case-study-btn"
                    onClick={() => setActiveTab('case-study')}
                  >
                    📚 Build Case Study Section
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Case Study Tab */}
      {activeTab === 'case-study' && (
        <div className="tab-content">
          <div className="case-study-builder">
            <h2>📚 Build Case Study</h2>
            
            {/* Test Type Confirmation for Case Study */}
            {testType && (
              <div className="test-type-confirmation">
                <div className="selected-type-info">
                  <span className="type-icon">
                    {testType === 'case-study' ? '📚' : '🔀'}
                  </span>
                  <div className="type-details">
                    <h4>
                      {testType === 'case-study' ? 'Case Study Test' : 'Mixed Test - Case Study Section'}
                    </h4>
                    <p>
                      {testType === 'case-study' ? 'Building scenario-based questions with background information' :
                       'Building the case study section of your mixed test'}
                    </p>
                  </div>
                </div>
                <button 
                  className="change-type-btn"
                  onClick={() => {
                    handleTestTypeChange('');
                  }}
                >
                  Change Type
                </button>
              </div>
            )}

            {/* Test Info for Case Study */}
            {testType && (
              <div className="test-info-section">
                <div className="input-group">
                  <label htmlFor="test-title-cs">Test Title</label>
                  <input
                    id="test-title-cs"
                    type="text"
                    placeholder="Enter your test title..."
                    value={testTitle}
                    onChange={(e) => setTestTitle(e.target.value)}
                    className="text-input"
                  />
                </div>
                
                <div className="input-group">
                  <label htmlFor="test-description-cs">Description (Optional)</label>
                  <textarea
                    id="test-description-cs"
                    placeholder="Describe what this test covers..."
                    value={testDescription}
                    onChange={(e) => setTestDescription(e.target.value)}
                    className="textarea-input"
                    rows="3"
                  />
                </div>
              </div>
            )}

            {/* Case Study Builder Content */}
            {testType && (
              <div className="case-study-content">
                <p>Create scenario-based tests with custom tabs and information cards</p>
                
                {/* Tab Management */}
                <div className="case-study-tabs-section">
                  <div className="section-header">
                    <h3>📑 Information Tabs</h3>
                    <button 
                      className="add-tab-btn"
                      onClick={() => {
                        const newTab = {
                          id: Date.now(),
                          title: `Tab ${caseStudyTabs.length + 1}`,
                          cards: [
                            { id: Date.now() + 1, title: 'Card 1', content: '' }
                          ]
                        };
                        setCaseStudyTabs([...caseStudyTabs, newTab]);
                      }}
                    >
                      ➕ Add Tab
                    </button>
                  </div>
                  
                  {/* Tab Editor */}
                  <div className="tabs-editor">
                    <div className="tabs-list">
                      {caseStudyTabs.map(tab => (
                        <div 
                          key={tab.id}
                          className={`tab-editor-item ${activeTabEditor === tab.id ? 'active' : ''}`}
                          onClick={() => setActiveTabEditor(tab.id)}
                        >
                          <div className="tab-header">
                            <input
                              type="text"
                              value={tab.title}
                              onChange={(e) => {
                                setCaseStudyTabs(caseStudyTabs.map(t => 
                                  t.id === tab.id ? { ...t, title: e.target.value } : t
                                ));
                              }}
                              onClick={(e) => e.stopPropagation()}
                              placeholder="Tab title"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCaseStudyTabs(caseStudyTabs.filter(t => t.id !== tab.id));
                                if (activeTabEditor === tab.id && caseStudyTabs.length > 1) {
                                  setActiveTabEditor(caseStudyTabs[0].id);
                                }
                              }}
                              className="delete-tab-btn"
                              disabled={caseStudyTabs.length === 1}
                            >
                              🗑️
                            </button>
                          </div>
                          <div className="tab-info">
                            {tab.cards.length} card{tab.cards.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Card Editor for Active Tab */}
                    {caseStudyTabs.find(tab => tab.id === activeTabEditor) && (
                      <div className="cards-editor">
                        <div className="cards-header">
                          <h4>Cards for "{caseStudyTabs.find(tab => tab.id === activeTabEditor)?.title}"</h4>
                          <button
                            className="add-card-btn"
                            onClick={() => {
                              const activeTab = caseStudyTabs.find(tab => tab.id === activeTabEditor);
                              if (activeTab && activeTab.cards.length < 10) {
                                const newCard = {
                                  id: Date.now(),
                                  title: `Card ${activeTab.cards.length + 1}`,
                                  content: ''
                                };
                                setCaseStudyTabs(caseStudyTabs.map(tab =>
                                  tab.id === activeTabEditor 
                                    ? { ...tab, cards: [...tab.cards, newCard] }
                                    : tab
                                ));
                              }
                            }}
                            disabled={caseStudyTabs.find(tab => tab.id === activeTabEditor)?.cards.length >= 10}
                          >
                            ➕ Add Card
                          </button>
                        </div>
                        
                        <div className="cards-list">
                          {caseStudyTabs.find(tab => tab.id === activeTabEditor)?.cards.map(card => (
                            <div key={card.id} className="card-editor">
                              <div className="card-header">
                                <input
                                  type="text"
                                  value={card.title}
                                  onChange={(e) => {
                                    setCaseStudyTabs(caseStudyTabs.map(tab =>
                                      tab.id === activeTabEditor
                                        ? {
                                            ...tab,
                                            cards: tab.cards.map(c =>
                                              c.id === card.id ? { ...c, title: e.target.value } : c
                                            )
                                          }
                                        : tab
                                    ));
                                  }}
                                  placeholder="Card title"
                                />
                                <button
                                  onClick={() => {
                                    setCaseStudyTabs(caseStudyTabs.map(tab =>
                                      tab.id === activeTabEditor
                                        ? {
                                            ...tab,
                                            cards: tab.cards.filter(c => c.id !== card.id)
                                          }
                                        : tab
                                    ));
                                  }}
                                  className="delete-card-btn"
                                  disabled={caseStudyTabs.find(tab => tab.id === activeTabEditor)?.cards.length === 1}
                                >
                                  🗑️
                                </button>
                              </div>
                              <textarea
                                value={card.content}
                                onChange={(e) => {
                                  setCaseStudyTabs(caseStudyTabs.map(tab =>
                                    tab.id === activeTabEditor
                                      ? {
                                          ...tab,
                                          cards: tab.cards.map(c =>
                                            c.id === card.id ? { ...c, content: e.target.value } : c
                                          )
                                        }
                                      : tab
                                  ));
                                }}
                                placeholder="Card content - this will be shown in a modal when the card is clicked"
                                rows="4"
                                className="card-content-textarea"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Case Study Questions */}
                <div className="case-study-questions-section">
                  <h3>❓ Case Study Questions</h3>
                  <p>Add questions that reference the case study information above</p>
                  
                  {/* Question Form */}
                  <div className="question-form">
                    <div className="input-group">
                      <label>Question</label>
                      <textarea
                        placeholder="Enter your question..."
                        value={currentCaseStudyQuestion.question_text}
                        onChange={(e) => setCurrentCaseStudyQuestion({...currentCaseStudyQuestion, question_text: e.target.value})}
                        className="textarea-input"
                        rows="3"
                      />
                    </div>

                    <div className="input-group">
                      <label>Question Type</label>
                      <select
                        value={currentCaseStudyQuestion.question_type}
                        onChange={(e) => setCurrentCaseStudyQuestion({...currentCaseStudyQuestion, question_type: e.target.value})}
                        className="select-input"
                      >
                        <option value="multiple choice">Multiple Choice</option>
                        <option value="hotspot">Hotspot/Interactive</option>
                        <option value="essay">Essay Question</option>
                        <option value="short answer">Short Answer</option>
                        <option value="drag and drop">Drag and Drop</option>
                      </select>
                    </div>

                    <div className="input-group">
                      <div className="label-with-info">
                        <label>
                          {currentCaseStudyQuestion.question_type === 'essay' ? 'Grading Rubric (Optional)' :
                           currentCaseStudyQuestion.question_type === 'short answer' ? 'Expected Keywords/Phrases' :
                           currentCaseStudyQuestion.question_type === 'drag and drop' ? 'Drag Items & Drop Zones' :
                           'Choices'}
                        </label>
                        <button 
                          type="button"
                          className="info-btn"
                          title={
                            currentCaseStudyQuestion.question_type === 'multiple choice' ? 
                              'Format: A. First option\nB. Second option\nC. Third option\nD. Fourth option\n\nEach choice should be on a new line with a letter prefix.' :
                            currentCaseStudyQuestion.question_type === 'hotspot' ?
                              'Format: Label1: option1, option2, option3\nLabel2: optionA, optionB\n\nCreate labeled groups of clickable options separated by commas.' :
                            currentCaseStudyQuestion.question_type === 'essay' ?
                              'Optional grading criteria to help evaluate responses:\n- Key points to address\n- Quality of arguments\n- Grammar and structure\n\nThis helps maintain consistency when grading.' :
                            currentCaseStudyQuestion.question_type === 'short answer' ?
                              'List acceptable keywords and phrases that indicate a correct answer:\nkeyword1, keyword2\nphrase example\nalternative answer\n\nSeparate alternatives with commas or new lines.' :
                            currentCaseStudyQuestion.question_type === 'drag and drop' ?
                              'Define draggable items and drop zones:\nItems: item1, item2, item3\nZones: zone1, zone2, zone3\nCorrect matches: item1->zone1, item2->zone2\n\nClearly specify what items match which zones.' :
                              'Standard answer choices for the question.'
                          }
                        >
                          i
                        </button>
                      </div>
                      <textarea
                        placeholder={
                          currentCaseStudyQuestion.question_type === 'multiple choice' ? 
                            "A. First option\nB. Second option\nC. Third option\nD. Fourth option" :
                          currentCaseStudyQuestion.question_type === 'hotspot' ?
                            "Label1: option1, option2, option3\nLabel2: optionA, optionB" :
                          currentCaseStudyQuestion.question_type === 'essay' ?
                            "Grading criteria (optional):\n- Key points to address\n- Quality of arguments\n- Grammar and structure" :
                          currentCaseStudyQuestion.question_type === 'short answer' ?
                            "Acceptable keywords/phrases:\nkeyword1, keyword2\nphrase example\nalternative answer" :
                          currentCaseStudyQuestion.question_type === 'drag and drop' ?
                            "Items: item1, item2, item3\nZones: zone1, zone2, zone3\nCorrect matches: item1->zone1, item2->zone2" :
                            "Enter choices..."
                        }
                        value={currentCaseStudyQuestion.choices}
                        onChange={(e) => setCurrentCaseStudyQuestion({...currentCaseStudyQuestion, choices: e.target.value})}
                        className="textarea-input"
                        rows="4"
                      />
                    </div>

                    <div className="input-group">
                      <div className="label-with-info">
                        <label>Correct Answer</label>
                        <button 
                          type="button" 
                          className="info-btn"
                          title={currentCaseStudyQuestion.question_type === 'multiple choice' ? 
                            'Enter the letter(s) of the correct answer(s):\nSingle answer: A\nMultiple answers: A, C\n\nUse the letter that corresponds to the correct choice(s).' :
                            currentCaseStudyQuestion.question_type === 'hotspot' ?
                            'Specify the coordinates or regions for correct hotspots:\nFormat: x1,y1 x2,y2\nExample: 150,200 300,400\n\nEach coordinate pair represents a clickable area.' :
                            currentCaseStudyQuestion.question_type === 'essay' ?
                            'List acceptable keywords and phrases that indicate a correct answer:\nkeyword1, keyword2\nphrase example\nalternative answer\n\nSeparate alternatives with commas or new lines.' :
                            currentCaseStudyQuestion.question_type === 'short answer' ?
                            'List acceptable keywords and phrases that indicate a correct answer:\nkeyword1, keyword2\nphrase example\nalternative answer\n\nSeparate alternatives with commas or new lines.' :
                            currentCaseStudyQuestion.question_type === 'drag and drop' ?
                            'Specify correct matches between items:\nItem1: Target1\nItem2: Target2\n\nFormat as item-target pairs, one per line.' :
                            'Specify the correct answer for this question.'
                          }
                        >
                          i
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder={currentCaseStudyQuestion.question_type === 'multiple choice' ? "A" : "Label1: option1\nLabel2: optionA"}
                        value={currentCaseStudyQuestion.correct_answer}
                        onChange={(e) => setCurrentCaseStudyQuestion({...currentCaseStudyQuestion, correct_answer: e.target.value})}
                        className="text-input"
                      />
                    </div>

                    <div className="input-group">
                      <label>Explanation</label>
                      <textarea
                        placeholder="Explain why this is the correct answer..."
                        value={currentCaseStudyQuestion.explanation}
                        onChange={(e) => setCurrentCaseStudyQuestion({...currentCaseStudyQuestion, explanation: e.target.value})}
                        className="textarea-input"
                        rows="3"
                      />
                    </div>

                    <div className="input-group">
                      <div className="label-with-info">
                        <label htmlFor="case-study-points">Points</label>
                        <button 
                          type="button"
                          className="info-btn"
                          title="Set custom points for this question. Default is based on question type:
• Multiple Choice: 1 point
• Drag & Drop: 1 point per correct match
• Essay/Short Answer: 1 point

You can override to weight questions differently."
                        >
                          i
                        </button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          id="case-study-points"
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="Auto-calculated"
                          value={currentCaseStudyQuestion.points || ''}
                          onChange={(e) => setCurrentCaseStudyQuestion({...currentCaseStudyQuestion, points: e.target.value ? parseFloat(e.target.value) : null})}
                          className="text-input"
                          style={{ flex: 1 }}
                        />
                        <button
                          type="button"
                          onClick={() => setCurrentCaseStudyQuestion({...currentCaseStudyQuestion, points: null})}
                          className="auto-points-btn"
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #dee2e6',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.9em'
                          }}
                          title="Reset to auto-calculated points based on question type"
                        >
                          Auto
                        </button>
                      </div>
                      <div style={{ fontSize: '0.8em', color: '#6c757d', marginTop: '4px' }}>
                        {currentCaseStudyQuestion.points ? 
                          `Custom: ${currentCaseStudyQuestion.points} points` : 
                          `Auto: ${(() => {
                            if (currentCaseStudyQuestion.question_type === 'drag and drop') {
                              const choices = currentCaseStudyQuestion.choices || '';
                              const lines = choices.split('\n');
                              for (const line of lines) {
                                if (line.startsWith('Items:')) {
                                  const items = line.replace('Items:', '').split(',').map(item => item.trim()).filter(item => item);
                                  return `${items.length} points (1 per correct match)`;
                                }
                              }
                              return '1 point (default)';
                            }
                            return '1 point (default)';
                          })()} `
                        }
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        if (currentCaseStudyQuestion.question_text && currentCaseStudyQuestion.choices && currentCaseStudyQuestion.correct_answer) {
                          setCaseStudyQuestions([...caseStudyQuestions, { ...currentCaseStudyQuestion, id: Date.now() }]);
                          setCurrentCaseStudyQuestion({
                            question_text: '',
                            question_type: 'multiple choice',
                            choices: '',
                            correct_answer: '',
                            explanation: ''
                          });
                        } else {
                          alert('Please fill in all required fields.');
                        }
                      }}
                      className="add-question-btn"
                    >
                      ➕ Add Question
                    </button>
                  </div>

                  {/* Questions List */}
                  {caseStudyQuestions.length > 0 && (
                    <div className="questions-list">
                      <h4>Questions ({caseStudyQuestions.length})</h4>
                      {caseStudyQuestions.map((q, index) => (
                        <div key={q.id} className="question-item">
                          <div className="question-header">
                            <span className="question-number">Q{index + 1}</span>
                            <span className="question-type">{q.question_type}</span>
                            <button 
                              onClick={() => setCaseStudyQuestions(caseStudyQuestions.filter(qs => qs.id !== q.id))}
                              className="delete-question-btn"
                            >
                              🗑️
                            </button>
                          </div>
                          <div className="question-text">{q.question_text}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Case Study Actions */}
                <div className="case-study-actions">
                  <button 
                    className="preview-btn"
                    onClick={() => {
                      // TODO: Implement preview functionality
                      alert('Preview functionality coming soon!');
                    }}
                  >
                    👁️ Preview Case Study
                  </button>
                  
                  <button 
                    className="create-case-study-btn"
                    onClick={() => {
                      // TODO: Implement save functionality
                      alert('Save functionality coming soon!');
                    }}
                    disabled={!testTitle || caseStudyQuestions.length === 0}
                  >
                    💾 Save Case Study
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview Tab */}
      {activeTab === 'preview' && (
        <div className="tab-content">
          <div className="preview-content">
            <div className="preview-header">
              <h2>👁️ Test Preview</h2>
              <p>This is how your test will appear to students</p>
              <div className="preview-controls">
                <button 
                  className="back-to-builder-btn"
                  onClick={() => setActiveTab(testType === 'case-study' ? 'case-study' : 'builder')}
                >
                  ← Back to Builder
                </button>
              </div>
            </div>

            <div className="preview-test-container">
              {/* Test Header */}
              <div className="preview-test-header">
                <h1>{testTitle || 'Untitled Test'}</h1>
                {testDescription && <p className="test-description">{testDescription}</p>}
                
                <div className="test-info">
                  <div className="info-item">
                    <span className="info-label">Questions:</span>
                    <span className="info-value">{questions.length + caseStudyQuestions.length}</span>
                  </div>
                  {testSettings.timeLimit > 0 && (
                    <div className="info-item">
                      <span className="info-label">Time Limit:</span>
                      <span className="info-value">{testSettings.timeLimit} minutes</span>
                    </div>
                  )}
                  <div className="info-item">
                    <span className="info-label">Attempts:</span>
                    <span className="info-value">{testSettings.maxAttempts}</span>
                  </div>
                </div>
              </div>

              {/* Regular Questions Preview */}
              {questions.length > 0 && (
                <div className="preview-questions-section">
                  <h3>📝 Questions</h3>
                  {questions.map((question, index) => (
                    <div key={question.id} className="preview-question">
                      <div className="question-header-preview">
                        <span className="question-number-preview">Question {index + 1}</span>
                        <span className="question-type-badge">{question.question_type}</span>
                      </div>
                      
                      <div className="question-content-preview">
                        <p className="question-text-preview">{question.question_text}</p>
                        
                        {/* Multiple Choice Questions */}
                        {question.question_type === 'multiple choice' && question.choices && (
                          <div className="choices-preview">
                            {question.choices.split('\n').filter(choice => choice.trim()).map((choice, choiceIndex) => (
                              <div key={choiceIndex} className="choice-preview">
                                <input type="radio" disabled />
                                <span>{choice.trim()}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Essay Questions */}
                        {question.question_type === 'essay' && (
                          <div className="essay-preview">
                            <div className="preview-textarea">
                              <span className="preview-placeholder">Essay answer will be typed here...</span>
                            </div>
                          </div>
                        )}

                        {/* Short Answer Questions */}
                        {question.question_type === 'short answer' && (
                          <div className="short-answer-preview">
                            <div className="preview-input">
                              <span className="preview-placeholder">Short answer will be typed here...</span>
                            </div>
                          </div>
                        )}

                        {/* Drag and Drop Questions */}
                        {question.question_type === 'drag and drop' && question.choices && (() => {
                          // Parse drag and drop data for preview
                          console.log('=== DRAG AND DROP PREVIEW PARSING ===');
                          console.log('Question choices:', question.choices);
                          const lines = question.choices.split('\n').filter(line => line.trim());
                          const items = [];
                          const zones = [];
                          
                          let currentSection = '';
                          
                          lines.forEach(line => {
                            const trimmed = line.trim().toLowerCase();
                            if (trimmed.startsWith('items:')) {
                              currentSection = 'items';
                              const itemsText = line.substring(line.indexOf(':') + 1);
                              if (itemsText.trim()) {
                                items.push(...itemsText.split(',').map(item => item.trim()).filter(item => item));
                              }
                            } else if (trimmed.startsWith('zones:')) {
                              currentSection = 'zones';
                              const zonesText = line.substring(line.indexOf(':') + 1);
                              if (zonesText.trim()) {
                                zones.push(...zonesText.split(',').map(zone => zone.trim()).filter(zone => zone));
                              }
                            } else if (currentSection === 'items' && line.trim()) {
                              items.push(...line.split(',').map(item => item.trim()).filter(item => item));
                            } else if (currentSection === 'zones' && line.trim()) {
                              zones.push(...line.split(',').map(zone => zone.trim()).filter(zone => zone));
                            }
                          });
                          
                          console.log('Final items:', items);
                          console.log('Final zones:', zones);
                          console.log('=== END DRAG AND DROP PREVIEW PARSING ===');

                          return (
                            <div className="drag-drop-preview">
                              <div className="preview-instructions">
                                <p><em>Drag and drop interface - students will drag items to zones</em></p>
                              </div>
                              <div className="drag-drop-preview-workspace">
                                <div className="preview-items-panel">
                                  <h5>Items to Match:</h5>
                                  <div className="preview-items">
                                    {items.map((item, index) => (
                                      <div key={index} className="preview-draggable-item">
                                        {item}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="preview-zones-panel">
                                  <h5>Drop Zones:</h5>
                                  <div className="preview-zones">
                                    {zones.map((zone, index) => (
                                      <div key={index} className="preview-drop-zone">
                                        <div className="preview-zone-label">{zone}</div>
                                        <div className="preview-zone-content">
                                          <span className="preview-drop-hint">Drop items here</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Hotspot Questions - DISABLED FOR NOW */}
                        {/* {question.question_type === 'hotspot' && (
                          <div className="hotspot-preview">
                            <div className="preview-hotspot-area">
                              <span className="preview-placeholder">Interactive hotspot areas will be displayed here</span>
                            </div>
                          </div>
                        )} */}
                        
                        {question.explanation && testSettings.showExplanations && (
                          <div className="explanation-preview">
                            <strong>Explanation:</strong> {question.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Case Study Preview */}
              {caseStudyTabs.length > 0 && caseStudyTabs.some(tab => tab.cards.some(card => card.content)) && (
                <div className="preview-case-study-section">
                  <h3>📚 Case Study</h3>
                  <div className="preview-case-study-tabs">
                    {caseStudyTabs.map(tab => (
                      <div key={tab.id} className="preview-tab">
                        <h4>{tab.title}</h4>
                        <div className="preview-cards">
                          {tab.cards.filter(card => card.content).map(card => (
                            <div key={card.id} className="preview-card">
                              <h5>{card.title}</h5>
                              <div className="preview-card-content">
                                {card.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {caseStudyQuestions.length > 0 && (
                    <div className="preview-case-study-questions">
                      <h4>Case Study Questions</h4>
                      {caseStudyQuestions.map((question, index) => (
                        <div key={question.id} className="preview-question">
                          <div className="question-header-preview">
                            <span className="question-number-preview">Question {questions.length + index + 1}</span>
                            <span className="question-type-badge">{question.question_type}</span>
                          </div>
                          
                          <div className="question-content-preview">
                            <p className="question-text-preview">{question.question_text}</p>
                            
                            {/* Multiple Choice Questions */}
                            {question.question_type === 'multiple choice' && question.choices && (
                              <div className="choices-preview">
                                {question.choices.split('\n').filter(choice => choice.trim()).map((choice, choiceIndex) => (
                                  <div key={choiceIndex} className="choice-preview">
                                    <input type="radio" disabled />
                                    <span>{choice.trim()}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Essay Questions */}
                            {question.question_type === 'essay' && (
                              <div className="essay-preview">
                                <div className="preview-textarea">
                                  <span className="preview-placeholder">Essay answer will be typed here...</span>
                                </div>
                              </div>
                            )}

                            {/* Short Answer Questions */}
                            {question.question_type === 'short answer' && (
                              <div className="short-answer-preview">
                                <div className="preview-input">
                                  <span className="preview-placeholder">Short answer will be typed here...</span>
                                </div>
                              </div>
                            )}

                            {/* Drag and Drop Questions */}
                            {question.question_type === 'drag and drop' && question.choices && (() => {
                              // Parse drag and drop data for preview
                              console.log('=== CASE STUDY DRAG AND DROP PREVIEW PARSING ===');
                              console.log('Question choices:', question.choices);
                              const lines = question.choices.split('\n').filter(line => line.trim());
                              const items = [];
                              const zones = [];
                              
                              let currentSection = '';
                              
                              lines.forEach(line => {
                                const trimmed = line.trim().toLowerCase();
                                if (trimmed.startsWith('items:')) {
                                  currentSection = 'items';
                                  const itemsText = line.substring(line.indexOf(':') + 1);
                                  if (itemsText.trim()) {
                                    items.push(...itemsText.split(',').map(item => item.trim()).filter(item => item));
                                  }
                                } else if (trimmed.startsWith('zones:')) {
                                  currentSection = 'zones';
                                  const zonesText = line.substring(line.indexOf(':') + 1);
                                  if (zonesText.trim()) {
                                    zones.push(...zonesText.split(',').map(zone => zone.trim()).filter(zone => zone));
                                  }
                                } else if (currentSection === 'items' && line.trim()) {
                                  items.push(...line.split(',').map(item => item.trim()).filter(item => item));
                                } else if (currentSection === 'zones' && line.trim()) {
                                  zones.push(...line.split(',').map(zone => zone.trim()).filter(zone => zone));
                                }
                              });
                              
                              console.log('Case Study Final items:', items);
                              console.log('Case Study Final zones:', zones);
                              console.log('=== END CASE STUDY DRAG AND DROP PREVIEW PARSING ===');

                              return (
                                <div className="drag-drop-preview">
                                  <div className="preview-instructions">
                                    <p><em>Drag and drop interface - students will drag items to zones</em></p>
                                  </div>
                                  <div className="drag-drop-preview-workspace">
                                    <div className="preview-items-panel">
                                      <h5>Items to Match:</h5>
                                      <div className="preview-items">
                                        {items.map((item, index) => (
                                          <div key={index} className="preview-draggable-item">
                                            {item}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="preview-zones-panel">
                                      <h5>Drop Zones:</h5>
                                      <div className="preview-zones">
                                        {zones.map((zone, index) => (
                                          <div key={index} className="preview-drop-zone">
                                            <div className="preview-zone-label">{zone}</div>
                                            <div className="preview-zone-content">
                                              <span className="preview-drop-hint">Drop items here</span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Hotspot Questions */}
                            {question.question_type === 'hotspot' && (
                              <div className="hotspot-preview">
                                <div className="preview-hotspot-area">
                                  <span className="preview-placeholder">Interactive hotspot areas will be displayed here</span>
                                </div>
                              </div>
                            )}
                            
                            {question.explanation && testSettings.showExplanations && (
                              <div className="explanation-preview">
                                <strong>Explanation:</strong> {question.explanation}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Preview Footer */}
              <div className="preview-footer">
                <div className="preview-actions">
                  <button className="preview-submit-btn" disabled>
                    Submit Test (Preview Mode)
                  </button>
                </div>
                <p className="preview-note">
                  This is a preview - students will see a similar interface when taking your test.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="tab-content">
          <div className="settings-content">
            <h2>⚙️ Test Settings & Publishing</h2>
            {testTitle && (
              <div className="settings-test-info">
                <p>Configuring settings for: <strong>"{testTitle}"</strong></p>
              </div>
            )}
            <p>Configure advanced settings for your test including time limits, visibility, and publishing options.</p>

            <div className="settings-sections">
              {/* Basic Settings */}
              <div className="settings-section">
                <h3>⏱️ Time & Attempts</h3>
                <div className="setting-group">
                  <label>
                    <span>Time Limit (minutes)</span>
                    <input
                      type="number"
                      min="0"
                      value={testSettings.timeLimit}
                      onChange={(e) => setTestSettings({...testSettings, timeLimit: parseInt(e.target.value) || 0})}
                      placeholder="0 = No limit"
                    />
                    <small>Set to 0 for no time limit</small>
                  </label>
                </div>
                <div className="setting-group">
                  <label>
                    <span>Maximum Attempts</span>
                    <input
                      type="number"
                      min="1"
                      value={testSettings.maxAttempts}
                      onChange={(e) => setTestSettings({...testSettings, maxAttempts: parseInt(e.target.value) || 1})}
                    />
                  </label>
                </div>
                <div className="setting-group">
                  <label>
                    <span>Passing Score (%)</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={testSettings.passingScore}
                      onChange={(e) => setTestSettings({...testSettings, passingScore: parseInt(e.target.value) || 70})}
                    />
                  </label>
                </div>
              </div>

              {/* Test Behavior */}
              <div className="settings-section">
                <h3>🎯 Test Behavior</h3>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={testSettings.allowSaveAndReturn}
                      onChange={(e) => setTestSettings({...testSettings, allowSaveAndReturn: e.target.checked})}
                    />
                    <span>Allow save and return later</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={testSettings.randomizeQuestions}
                      onChange={(e) => setTestSettings({...testSettings, randomizeQuestions: e.target.checked})}
                    />
                    <span>Randomize question order</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={testSettings.randomizeChoices}
                      onChange={(e) => setTestSettings({...testSettings, randomizeChoices: e.target.checked})}
                    />
                    <span>Randomize answer choices</span>
                  </label>
                </div>
              </div>

              {/* Results & Feedback */}
              <div className="settings-section">
                <h3>📊 Results & Feedback</h3>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={testSettings.showResults}
                      onChange={(e) => setTestSettings({...testSettings, showResults: e.target.checked})}
                    />
                    <span>Show results to test taker</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={testSettings.showExplanations}
                      onChange={(e) => setTestSettings({...testSettings, showExplanations: e.target.checked})}
                    />
                    <span>Show answer explanations</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={testSettings.showCorrectAnswers}
                      onChange={(e) => setTestSettings({...testSettings, showCorrectAnswers: e.target.checked})}
                    />
                    <span>Show correct answers</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={testSettings.allowReview}
                      onChange={(e) => setTestSettings({...testSettings, allowReview: e.target.checked})}
                    />
                    <span>Allow review after completion</span>
                  </label>
                </div>
              </div>

              {/* Access Control */}
              <div className="settings-section">
                <h3>🔒 Access Control</h3>
                <div className="setting-group">
                  <label>
                    <span>Visibility</span>
                    <select
                      value={testSettings.visibility}
                      onChange={(e) => setTestSettings({...testSettings, visibility: e.target.value})}
                    >
                      <option value="private">Private (only you can access)</option>
                      <option value="unlisted">Unlisted (accessible via link)</option>
                      <option value="public">Public (discoverable)</option>
                    </select>
                  </label>
                </div>
                <div className="setting-group">
                  <label>
                    <span>Access Code (optional)</span>
                    <input
                      type="text"
                      value={testSettings.accessCode}
                      onChange={(e) => setTestSettings({...testSettings, accessCode: e.target.value})}
                      placeholder="Leave empty for no access code"
                    />
                    <small>Require test takers to enter this code</small>
                  </label>
                </div>
              </div>

              {/* Timer Settings */}
              <div className="settings-section">
                <h3>⏰ Timer Settings</h3>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={testSettings.autoSubmit}
                      onChange={(e) => setTestSettings({...testSettings, autoSubmit: e.target.checked})}
                    />
                    <span>Auto-submit when time expires</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={testSettings.showTimer}
                      onChange={(e) => setTestSettings({...testSettings, showTimer: e.target.checked})}
                    />
                    <span>Show timer to students</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={testSettings.timerWarnings}
                      onChange={(e) => setTestSettings({...testSettings, timerWarnings: e.target.checked})}
                    />
                    <span>Show timer warnings (10, 5, 1 min remaining)</span>
                  </label>
                </div>
                <div className="setting-group">
                  <label>
                    <span>Grace Period (seconds)</span>
                    <input
                      type="number"
                      min="0"
                      max="300"
                      value={testSettings.gracePeriod}
                      onChange={(e) => setTestSettings({...testSettings, gracePeriod: parseInt(e.target.value) || 0})}
                      placeholder="0"
                    />
                    <small>Extra time after expiration to finish current answer</small>
                  </label>
                </div>
              </div>

              {/* Security & Navigation Settings */}
              <div className="settings-section">
                <h3>🔒 Security & Navigation</h3>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={testSettings.browserLockdown}
                      onChange={(e) => setTestSettings({...testSettings, browserLockdown: e.target.checked})}
                    />
                    <span>Browser lockdown (disable copy/paste, right-click, tab switching)</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={testSettings.fullScreenRequired}
                      onChange={(e) => setTestSettings({...testSettings, fullScreenRequired: e.target.checked})}
                    />
                    <span>Require full screen mode</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={testSettings.linearMode}
                      onChange={(e) => setTestSettings({...testSettings, linearMode: e.target.checked})}
                    />
                    <span>Linear mode (must answer questions in order)</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={testSettings.noBacktrack}
                      onChange={(e) => setTestSettings({...testSettings, noBacktrack: e.target.checked})}
                    />
                    <span>No backtracking (cannot return to previous questions)</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={testSettings.oneTimeOnly}
                      onChange={(e) => setTestSettings({...testSettings, oneTimeOnly: e.target.checked})}
                    />
                    <span>One-time only (test can only be taken once)</span>
                  </label>
                </div>
              </div>

              {/* Test Taker Info */}
              <div className="settings-section">
                <h3>👤 Test Taker Information</h3>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={testSettings.requireName}
                      onChange={(e) => setTestSettings({...testSettings, requireName: e.target.checked})}
                    />
                    <span>Require name</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={testSettings.requireEmail}
                      onChange={(e) => setTestSettings({...testSettings, requireEmail: e.target.checked})}
                    />
                    <span>Require email address</span>
                  </label>
                </div>
              </div>

              {/* Publishing */}
              <div className="settings-section">
                <h3>🚀 Publishing</h3>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={testSettings.isPublished}
                      onChange={(e) => setTestSettings({...testSettings, isPublished: e.target.checked})}
                    />
                    <span>Publish test (make available to test takers)</span>
                  </label>
                </div>
                {testSettings.isPublished && (
                  <div className="publish-info">
                    <p>✅ Test will be published and accessible to test takers</p>
                    <p>🔗 Shareable link will be generated after saving</p>
                  </div>
                )}
              </div>

              {/* Quick Presets */}
              <div className="settings-section">
                <h3>⚡ Quick Presets</h3>
                <p style={{ color: '#669BBC', marginBottom: '1rem' }}>
                  Apply common configurations quickly:
                </p>
                <div className="preset-buttons">
                  <button 
                    className="preset-btn"
                    onClick={() => setTestSettings({
                      ...testSettings,
                      timeLimit: 60,
                      maxAttempts: 1,
                      showResults: true,
                      showExplanations: true,
                      allowReview: true,
                      visibility: 'private',
                      requireName: true,
                      isPublished: false
                    })}
                  >
                    📚 Study Mode
                    <small>60 min, explanations, review allowed</small>
                  </button>
                  <button 
                    className="preset-btn"
                    onClick={() => setTestSettings({
                      ...testSettings,
                      timeLimit: 30,
                      maxAttempts: 1,
                      showResults: false,
                      showExplanations: false,
                      allowReview: false,
                      randomizeQuestions: true,
                      visibility: 'unlisted',
                      requireName: true,
                      isPublished: true
                    })}
                  >
                    🎯 Exam Mode
                    <small>30 min, no review, randomized</small>
                  </button>
                  <button 
                    className="preset-btn"
                    onClick={() => setTestSettings({
                      ...testSettings,
                      timeLimit: 0,
                      maxAttempts: 999,
                      showResults: true,
                      showExplanations: true,
                      allowReview: true,
                      allowSaveAndReturn: true,
                      visibility: 'public',
                      requireName: false,
                      isPublished: true
                    })}
                  >
                    🌐 Practice Mode
                    <small>No time limit, unlimited attempts</small>
                  </button>
                </div>
              </div>
            </div>

            <div className="settings-actions">
              <button 
                className="save-settings-btn"
                onClick={() => {
                  // Apply settings and go back to builder or import
                  alert('Settings saved! You can now create your test.');
                  setActiveTab(questions.length > 0 ? 'builder' : 'import');
                }}
              >
                💾 Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
      
      </>
      )}
    </div>
  );
}
