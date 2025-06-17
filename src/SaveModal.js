import React, { useState, useEffect } from 'react';

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

  // Auto-populate title when modal opens with existing saved test
  useEffect(() => {
    if (isOpen && existingSavedTest) {
      setTitle(existingSavedTest.title);
    } else if (isOpen && !existingSavedTest) {
      setTitle('');
    }
  }, [isOpen, existingSavedTest]);

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a title for your saved test');
      return;
    }

    // Check if this is an overwrite (existing saved test with same title)
    if (existingSavedTest && existingSavedTest.title === title.trim()) {
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
        current,
        userAnswers,
        questionScore,
        questionSubmitted,
        totalQuestions: questions.length,
        completedQuestions: questionSubmitted.filter(Boolean).length
      }
    };

    try {
      onSave(saveData);
      setTitle('');
      setShowOverwriteConfirm(false);
      onClose();
    } catch (error) {
      alert('Failed to save test. Please try again.');
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
      <div className="modal-overlay" onClick={handleOverwriteCancel}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <button 
            className="modal-close" 
            onClick={handleOverwriteCancel} 
            aria-label="Close"
          >
            &times;
          </button>
          
          <h3 style={{ marginTop: 0, color: '#003049' }}>Overwrite Existing Save?</h3>
          
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            A saved test with the name "{title}" already exists. Do you want to overwrite it with your current progress?
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              onClick={handleOverwriteCancel}
              disabled={isSaving}
              style={{
                background: '#ccc',
                color: '#666',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              No, Cancel
            </button>
            <button
              onClick={handleOverwriteConfirm}
              disabled={isSaving}
              style={{
                background: '#780000',
                color: '#FDF0D5',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {isSaving ? 'Saving...' : 'Yes, Overwrite'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button 
          className="modal-close" 
          onClick={onClose} 
          aria-label="Close"
        >
          &times;
        </button>
        
        <h3 style={{ marginTop: 0, color: '#003049' }}>
          {existingSavedTest ? 'Update Saved Test' : 'Save Test Progress'}
        </h3>
        
        {existingSavedTest && (
          <div style={{ 
            background: '#e7f3ff', 
            padding: '0.75rem', 
            borderRadius: '6px', 
            marginBottom: '1rem',
            border: '1px solid #669BBC'
          }}>
            <p style={{ color: '#003049', fontSize: '0.9rem', margin: 0 }}>
              📝 Updating existing save: "{existingSavedTest.title}"
            </p>
          </div>
        )}
        
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>
            Progress: {questionSubmitted.filter(Boolean).length} of {questions.length} questions completed
          </p>
          <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 1rem 0' }}>
            Current question: {current + 1}
          </p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label 
            htmlFor="save-title" 
            style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: 'bold',
              color: '#003049'
            }}
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
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #669BBC',
              borderRadius: '6px',
              fontSize: '1rem',
              color: '#003049',
              backgroundColor: '#FDF0D5',
              boxSizing: 'border-box'
            }}
            autoFocus
            disabled={isSaving}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={isSaving}
            style={{
              background: '#ccc',
              color: '#666',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            style={{
              background: isSaving || !title.trim() ? '#ccc' : '#780000',
              color: '#FDF0D5',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              cursor: isSaving || !title.trim() ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {isSaving ? 'Saving...' : existingSavedTest ? 'Update Test' : 'Save Test'}
          </button>
        </div>
      </div>
    </div>
  );
}
