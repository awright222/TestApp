import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TestSelector.css';

const AVAILABLE_TESTS = [
  // Microsoft 365 tests removed - only available in personal accounts
  // Add more tests here in the future
];

function TestSelector({ onTestSelect }) {
  const navigate = useNavigate();
  
  const handleOptionSelect = (test, option) => {
    if (option === 'practice') {
      onTestSelect({ ...test, type: 'practice' });
    } else if (option === 'casestudy') {
      navigate('/case-studies');
    }
  };

  return (
    <div className="test-selector">
      <div className="test-selector-header">
        <h1>Practice Tests</h1>
        <p>Choose your certification preparation method: practice questions or case studies</p>
      </div>

      <div className="test-grid">
        {AVAILABLE_TESTS.map((test) => (
          <div key={test.id} className="test-card">
            <div className="test-card-background" style={{ background: `linear-gradient(135deg, ${test.color}10, ${test.color}05)` }} />
            
            <div className="test-icon">{test.icon}</div>

            <h3 className="test-title" style={{ color: test.color }}>
              {test.title}
            </h3>

            <p className="test-description">{test.description}</p>

            <div className="test-badges">
              <span className="test-badge" style={{ background: `${test.color}10`, color: test.color }}>
                {test.questionCount}
              </span>
              {test.hasCaseStudies && (
                <span className="test-badge" style={{ background: `${test.color}10`, color: test.color }}>
                  {test.caseStudyCount}
                </span>
              )}
              <span className="test-badge difficulty-badge">
                {test.difficulty}
              </span>
            </div>

            <div className="test-actions">
              <button 
                onClick={() => handleOptionSelect(test, 'practice')}
                className="test-btn primary"
                style={{ background: `linear-gradient(135deg, ${test.color} 0%, ${test.color}dd 100%)` }}
              >
                📝 Practice Questions
              </button>
              
              {test.hasCaseStudies && (
                <button 
                  onClick={() => handleOptionSelect(test, 'casestudy')}
                  className="test-btn secondary"
                  style={{ 
                    color: test.color, 
                    borderColor: test.color,
                    '--hover-bg': test.color 
                  }}
                >
                  📚 Case Studies
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="coming-soon">
        <div className="coming-soon-icon">🚀</div>
        <h3>More Tests Coming Soon!</h3>
        <p>We're working on adding more certification practice tests. Stay tuned!</p>
      </div>
    </div>
  );
}

export default TestSelector;
