import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CreatedTestsService } from '../services/CreatedTestsService';
import './CreateTest.css';

export default function CreateTest() {
  const navigate = useNavigate();
  const { testId } = useParams(); // For editing existing tests
  const isEditing = Boolean(testId);
  
  const [activeTab, setActiveTab] = useState('import'); // 'import', 'builder', 'case-study', or 'settings'
  
  // Test type state
  const [testType, setTestType] = useState('regular'); // 'regular', 'case-study', 'mixed'
  
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
  const [selectedCard, setSelectedCard] = useState(null);

  // Settings states - these should be specific to this test instance
  const [testSettings, setTestSettings] = useState({
    timeLimit: 0, // 0 = no limit
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
    visibility: 'private' // 'private', 'public', 'unlisted'
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
          visibility: 'private'
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
        result = await CreatedTestsService.createTest(testData);
        console.log('Test created:', result);
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

      const result = await CreatedTestsService.createTest(testData);
      console.log('Import test created:', result);
      
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
        <button 
          className={`tab-btn ${activeTab === 'builder' ? 'active' : ''}`}
          data-tab="builder"
          onClick={() => setActiveTab('builder')}
        >
          {testType === 'regular' ? '🔨 Build Test' : '🔨 Build Questions'}
        </button>
        {(testType === 'case-study' || testType === 'mixed') && (
          <button 
            className={`tab-btn ${activeTab === 'case-study' ? 'active' : ''}`}
            data-tab="case-study"
            onClick={() => setActiveTab('case-study')}
          >
            📚 Case Study Builder
          </button>
        )}
        <button 
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          data-tab="settings"
          onClick={() => {
            if (!testTitle.trim() && !isEditing) {
              alert('Please enter a test title before configuring settings.');
              setActiveTab('builder');
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
            
            {/* Test Type Selection */}
            <div className="test-type-section">
              <h3>📋 Test Type</h3>
              <p>Choose the type of test you want to create:</p>
              <div className="test-type-options">
                <label className={`test-type-option ${testType === 'regular' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="testType"
                    value="regular"
                    checked={testType === 'regular'}
                    onChange={(e) => setTestType(e.target.value)}
                  />
                  <div className="test-type-card">
                    <div className="test-type-icon">❓</div>
                    <h4>Regular Test</h4>
                    <p>Traditional multiple choice and hotspot questions</p>
                  </div>
                </label>
                
                <label className={`test-type-option ${testType === 'case-study' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="testType"
                    value="case-study"
                    checked={testType === 'case-study'}
                    onChange={(e) => setTestType(e.target.value)}
                  />
                  <div className="test-type-card">
                    <div className="test-type-icon">📚</div>
                    <h4>Case Study</h4>
                    <p>Scenario-based questions with background information</p>
                  </div>
                </label>
                
                <label className={`test-type-option ${testType === 'mixed' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="testType"
                    value="mixed"
                    checked={testType === 'mixed'}
                    onChange={(e) => setTestType(e.target.value)}
                  />
                  <div className="test-type-card">
                    <div className="test-type-icon">🔀</div>
                    <h4>Mixed Test</h4>
                    <p>Combination of regular questions and case studies</p>
                  </div>
                </label>
              </div>
            </div>
            
            {/* Test Info */}
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

            {/* Question Builder */}
            <div className="question-builder-section">
              <h3>Add Questions</h3>
              
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
                    onChange={(e) => setCurrentQuestion({...currentQuestion, question_type: e.target.value})}
                    className="select-input"
                  >
                    <option value="multiple choice">Multiple Choice</option>
                    <option value="hotspot">Hotspot/Interactive</option>
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor="choices">Choices</label>
                  <textarea
                    id="choices"
                    placeholder={currentQuestion.question_type === 'multiple choice' 
                      ? "A. First option\nB. Second option\nC. Third option\nD. Fourth option"
                      : "Label1: option1, option2, option3\nLabel2: optionA, optionB"}
                    value={currentQuestion.choices}
                    onChange={(e) => setCurrentQuestion({...currentQuestion, choices: e.target.value})}
                    className="textarea-input"
                    rows="4"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="correct-answer">Correct Answer</label>
                  <input
                    id="correct-answer"
                    type="text"
                    placeholder={currentQuestion.question_type === 'multiple choice' ? "A, B" : "Label1: option1\nLabel2: optionA"}
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

                <button 
                  onClick={addQuestion}
                  disabled={!currentQuestion.question_text.trim()}
                  className="add-question-btn"
                >
                  ➕ Add Question
                </button>
              </div>
            </div>

            {/* Questions List */}
            {questions.length > 0 && (
              <div className="questions-list">
                <h3>Questions ({questions.length})</h3>
                {questions.map((q, index) => (
                  <div key={q.id} className="question-item">
                    <div className="question-header">
                      <span className="question-number">Q{index + 1}</span>
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
                    className="create-test-btn"
                    onClick={createTestFromBuilder}
                  >
                    {isEditing ? '� Update Test' : '�🚀 Create Test'} ({questions.length} questions)
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
            <h2>📚 Case Study Builder</h2>
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
                  </select>
                </div>

                <div className="input-group">
                  <label>Choices</label>
                  <textarea
                    placeholder={currentCaseStudyQuestion.question_type === 'multiple choice' 
                      ? "A. First option\nB. Second option\nC. Third option\nD. Fourth option"
                      : "Label1: option1, option2, option3\nLabel2: optionA, optionB"}
                    value={currentCaseStudyQuestion.choices}
                    onChange={(e) => setCurrentCaseStudyQuestion({...currentCaseStudyQuestion, choices: e.target.value})}
                    className="textarea-input"
                    rows="4"
                  />
                </div>

                <div className="input-group">
                  <label>Correct Answer</label>
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

            {/* Preview & Create Button */}
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
    </div>
  );
}
