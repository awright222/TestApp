import React, { useState, useEffect } from 'react';
import { SavedTestsService } from './SavedTestsService';
import './SaveModal.css';

export default function SaveModal({ 
  isOpen, 
  onClose, 
  onSave, 
  current, 
  userAnswers, 
  questionScore, 
  questionSubmitted,
  questions,
  existingSavedTest = null // New prop to pass existing saved test data
}) {
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);
  const [allSavedTests, setAllSavedTests] = useState([]);

  // Auto-populate title when modal opens with existing saved test
  useEffect(() => {
    if (isOpen && existingSavedTest) {
      setTitle(existingSavedTest.title);
    } else if (isOpen && !existingSavedTest) {
      setTitle('');
    }
  }, [isOpen, existingSavedTest]);

  // Fetch all saved tests when modal opens for duplicate checking
  useEffect(() => {
    if (isOpen) {
      console.log('SaveModal opened with props:', {
        current,
        questionsLength: questions?.length,
        questionSubmittedLength: questionSubmitted?.length,
        userAnswersLength: userAnswers ? Object.keys(userAnswers).length : 0,
        existingSavedTest
      });
      
      const fetchSavedTests = async () => {
        try {
          const tests = await SavedTestsService.getSavedTests();
          setAllSavedTests(tests);
        } catch (error) {
          console.error('Error fetching saved tests for duplicate checking:', error);
          setAllSavedTests([]);
        }
      };

      fetchSavedTests();
    }
  }, [isOpen, current, questions, questionSubmitted, userAnswers, existingSavedTest]);

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a title for your saved test');
      return;
    }

    // Check if there's already a saved test with this title
    const duplicateTest = allSavedTests.find(test => 
      test.title.toLowerCase() === title.trim().toLowerCase() &&
      test.id !== existingSavedTest?.id // Don't count the current test being updated
    );

    if (duplicateTest) {
      setShowOverwriteConfirm(true);
      return;
    }

    await performSave();
  };

  const performSave = async () => {
    setIsSaving(true);
    
    const saveData = {
      id: existingSavedTest?.id || Date.now().toString(), // Use existing ID if available
      title: title.trim(),
      dateCreated: existingSavedTest?.dateCreated || new Date().toISOString(),
      progress: {
        current: current || 0,
        userAnswers: userAnswers || {},
        questionScore: questionScore || {},
        questionSubmitted: questionSubmitted || [],
        totalQuestions: (questions || []).length,
        completedQuestions: (questionSubmitted || []).filter(Boolean).length
      }
    };

    try {
      await onSave(saveData);
      setTitle('');
      setShowOverwriteConfirm(false);
      onClose();
    } catch (error) {
      console.error('SaveModal error:', error);
      alert(`Failed to save test: ${error.message}\n\nCheck the browser console for more details.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOverwriteConfirm = () => {
    setShowOverwriteConfirm(false);
    performSave();
  };

  const handleOverwriteCancel = () => {
    setShowOverwriteConfirm(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  if (!isOpen) return null;

  // Show overwrite confirmation dialog
  if (showOverwriteConfirm) {
    return (
      <div className="save-modal-overlay" onClick={handleOverwriteCancel}>
        <div className="save-modal-content" onClick={e => e.stopPropagation()}>
          <h3 className="save-modal-header">Overwrite Existing Save?</h3>
          
          <p className="overwrite-warning">
            A saved test with the name "{title}" already exists. Do you want to overwrite it with your current progress?
          </p>

          <div className="save-modal-buttons">
            <button
              onClick={handleOverwriteCancel}
              disabled={isSaving}
              className="save-modal-btn save-modal-btn-secondary"
            >
              No, Cancel
            </button>
            <button
              onClick={handleOverwriteConfirm}
              disabled={isSaving}
              className="save-modal-btn save-modal-btn-danger"
            >
              {isSaving ? 'Saving...' : 'Yes, Overwrite'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="save-modal-overlay" onClick={onClose}>
      <div className="save-modal-content" onClick={e => e.stopPropagation()}>
        <h3 className="save-modal-header">
          {existingSavedTest ? 'Update Saved Test' : 'Save Test Progress'}
        </h3>
        
        {existingSavedTest && (
          <div className="save-progress-info">
            <p className="save-progress-title">
              📝 Updating existing save: "{existingSavedTest.title}"
            </p>
          </div>
        )}
        
        <div className="save-progress-stats">
          <p>
            Progress: {(questionSubmitted || []).filter(Boolean).length} of {(questions || []).length} questions completed
          </p>
          <p>
            Current question: {(current || 0) + 1}
          </p>
          {/* Debug info - remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
              Debug: current={current}, questions.length={questions?.length}, questionSubmitted.length={questionSubmitted?.length}
            </p>
          )}
        </div>

        <div className="save-title-section">
          <label 
            htmlFor="save-title" 
            className="save-title-label"
          >
            Test Title:
          </label>
          <input
            id="save-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={existingSavedTest ? existingSavedTest.title : "Enter a name for this saved test..."}
            className="save-title-input"
            autoFocus
            disabled={isSaving}
          />
          <p className="save-title-hint">
            Choose a descriptive name to help you identify this test later
          </p>
        </div>

        <div className="save-modal-buttons">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="save-modal-btn save-modal-btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className="save-modal-btn save-modal-btn-primary"
          >
            {isSaving ? 'Saving...' : existingSavedTest ? 'Update Test' : 'Save Test'}
          </button>
        </div>
      </div>
    </div>
  );
}
