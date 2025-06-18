import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CreatedTestsService } from '../services/CreatedTestsService';
import './CreateTest.css';

export default function CreateTest() {
  const navigate = useNavigate();
  const { testId } = useParams(); // For editing existing tests
  const isEditing = Boolean(testId);
  
  const [activeTab, setActiveTab] = useState('import'); // 'import' or 'builder'
  
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

  // Load existing test data if editing
  useEffect(() => {
    const loadTestForEditing = async () => {
      try {
        const test = await CreatedTestsService.getTestById(testId);
        if (test) {
          setTestTitle(test.title);
          setTestDescription(test.description || '');
          setQuestions(test.questions || []);
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
        icon: '�',
        difficulty: 'Custom',
        color: '#28a745'
      };

      if (isEditing) {
        await CreatedTestsService.updateTest(testId, testData);
        alert(`Test "${testTitle}" updated successfully!`);
      } else {
        await CreatedTestsService.createTest(testData);
        alert(`Test "${testTitle}" created successfully!`);
      }
      
      navigate('/my-tests');
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
        difficulty: 'Imported'
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

      await CreatedTestsService.createTest(testData);
      alert(`Test "${testData.title}" created successfully!`);
      navigate('/my-tests');
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
          onClick={() => setActiveTab('import')}
        >
          📥 Import Test
        </button>
        <button 
          className={`tab-btn ${activeTab === 'builder' ? 'active' : ''}`}
          onClick={() => setActiveTab('builder')}
        >
          🔨 Build Test
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
    </div>
  );
}
