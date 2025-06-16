import React, { useState } from 'react';

export default function SaveModal({ 
  isOpen, 
  onClose, 
  onSave, 
  current, 
  userAnswers, 
  questionScore, 
  questionSubmitted,
  questions 
}) {
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a title for your saved test');
      return;
    }

    setIsSaving(true);
    
    const saveData = {
      id: Date.now().toString(), // Simple ID generation
      title: title.trim(),
      dateCreated: new Date().toISOString(),
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
      onClose();
    } catch (error) {
      alert('Failed to save test. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  if (!isOpen) return null;

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
        
        <h3 style={{ marginTop: 0, color: '#003049' }}>Save Test Progress</h3>
        
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
            placeholder="Enter a name for this saved test..."
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
            {isSaving ? 'Saving...' : 'Save Test'}
          </button>
        </div>
      </div>
    </div>
  );
}
