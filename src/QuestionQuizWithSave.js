import React, { useState } from 'react';
import SaveModal from './SaveModal';

export default function QuestionQuizWithSave({ 
  questions, 
  onSaveProgress, 
  caseStudyTitle,
  showSaveButton = true,
  initialProgress = null,
  existingSavedTest = null // New prop to track if this is loaded from a saved test
}) {
  const [current, setCurrent] = useState(initialProgress?.current || 0);
  const [userAnswers, setUserAnswers] = useState(
    initialProgress?.userAnswers || questions.map(getInitialUserAnswer)
  );
  const [questionScore, setQuestionScore] = useState(
    initialProgress?.questionScore || Array(questions.length).fill(null)
  );
  const [questionSubmitted, setQuestionSubmitted] = useState(
    initialProgress?.questionSubmitted || Array(questions.length).fill(false)
  );
  const [showModal, setShowModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  function getChoiceLabel(choice) {
    const match = choice.match(/^([A-Z])\./);
    return match ? match[1] : null;
  }

  function getInitialUserAnswer(q) {
    if (q?.question_type?.toLowerCase() === 'multiple choice') {
      return [];
    } else if (q?.question_type?.toLowerCase() === 'hotspot') {
      return {};
    }
    return '';
  }

  const q = questions[current];

  // Multiple Choice
  const choices = q.choices?.match(/^[A-Z]\..+?(?=\n[A-Z]\.|$)/gms)?.map(s => s.trim()) || [];

  // Hotspot: parse as label: option1, option2, ...
  const hotspotOptions = {};
  if (q.question_type?.toLowerCase() === 'hotspot') {
    const lines = q.choices.split(/\r?\n/).filter(Boolean);
    for (const line of lines) {
      const [label, rest] = line.split(':');
      if (label && rest) {
        hotspotOptions[label.trim()] = rest.split(',').map(opt => opt.trim()).filter(Boolean);
      }
    }
  }

  // Correct answers for hotspot
  const correctHotspotAnswers = {};
  if (q.question_type?.toLowerCase() === 'hotspot') {
    const lines = q.correct_answer.split(/\r?\n/).filter(Boolean);
    for (const line of lines) {
      const [label, answer] = line.split(':');
      if (label && answer) {
        correctHotspotAnswers[label.trim()] = answer.trim();
      }
    }
  }

  // Update answer for current question
  const updateUserAnswer = (answer) => {
    setUserAnswers(prev => {
      const updated = [...prev];
      updated[current] = answer;
      return updated;
    });
  };

  // Submit current question
  const submitCurrentQuestion = () => {
    let points = 0;
    if (q.question_type?.toLowerCase() === 'multiple choice') {
      const correct = q.correct_answer.split(',').map(s => s.trim());
      const user = Array.isArray(userAnswers[current]) ? userAnswers[current] : [userAnswers[current]];
      const userLabels = user.map(getChoiceLabel);
      points = userLabels.filter(label => correct.includes(label)).length;
    } else if (q.question_type?.toLowerCase() === 'hotspot') {
      points = Object.entries(correctHotspotAnswers).filter(
        ([label, correct]) => userAnswers[current][label] === correct
      ).length;
    }
    setQuestionSubmitted(prev => {
      const updated = [...prev];
      updated[current] = true;
      return updated;
    });
    setQuestionScore(prev => {
      const updated = [...prev];
      updated[current] = points;
      return updated;
    });
  };

  // Navigation
  const prevQuestion = () => setCurrent(c => Math.max(0, c - 1));
  const nextQuestion = () => setCurrent(c => Math.min(questions.length - 1, c + 1));

  // Handle answer change
  const handleChoiceChange = (val) => {
    updateUserAnswer([val]);
  };

  const handleHotspotChange = (label, val) => {
    setUserAnswers(prev => {
      const updated = [...prev];
      updated[current] = { ...updated[current], [label]: val };
      return updated;
    });
  };

  function calculateScore() {
    return questionScore.reduce((sum, val) => sum + (val || 0), 0);
  }

  function maxScore() {
    return questions.reduce((sum, q) => {
      if (q.question_type?.toLowerCase() === 'multiple choice') {
        return sum + q.correct_answer.split(',').length;
      } else if (q.question_type?.toLowerCase() === 'hotspot') {
        return sum + q.correct_answer.split(/\r?\n/).filter(Boolean).length;
      }
      return sum + 1;
    }, 0);
  }

  const handleSave = (saveData) => {
    if (onSaveProgress) {
      onSaveProgress(saveData);
    }
  };

  return (
    <div>
      {/* Save Progress Button */}
      {showSaveButton && (
        <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
          <button
            onClick={() => setShowSaveModal(true)}
            style={{ 
              background: '#669BBC',
              color: '#003049',
              marginBottom: '1rem'
            }}
          >
            Save Progress
          </button>
        </div>
      )}

      <div className="question-box">
        <div className="question-header">
          <h2>
            Question {current + 1} of {questions.length}
          </h2>
          <button
            className="info-btn"
            onClick={() => setShowModal(true)}
            aria-label="Show explanation"
            title="Show explanation"
          >
            <span className="info-circle">i</span>
          </button>
        </div>
        <p>{q.question_text}</p>

        {/* Multiple Choice */}
        {q.question_type?.toLowerCase() === 'multiple choice' && (
          <div className="choices">
            {choices.map((choice, idx) => (
              <label key={idx} style={{ display: 'block', marginBottom: 8 }}>
                <input
                  type="radio"
                  name={`choice-${current}`}
                  value={choice}
                  checked={userAnswers[current]?.includes(choice)}
                  onChange={() => handleChoiceChange(choice)}
                  disabled={questionSubmitted[current]}
                />
                {choice}
              </label>
            ))}
          </div>
        )}

        {/* Hotspot */}
        {q.question_type?.toLowerCase() === 'hotspot' && (
          <div className="hotspot-dropdowns">
            {Object.entries(hotspotOptions).map(([label, options], idx) => {
              const userValue = userAnswers[current]?.[label] || '';
              const correctValue = correctHotspotAnswers[label];
              const isSubmitted = questionSubmitted[current];
              const isCorrect = userValue && userValue === correctValue;
              const showFeedback = isSubmitted && userValue;

              return (
                <div key={idx} style={{ marginBottom: '1rem' }}>
                  <strong>{label}</strong>
                  <div className="dropdown-container">
                    <select
                      value={userValue}
                      onChange={e => handleHotspotChange(label, e.target.value)}
                      disabled={isSubmitted}
                      style={
                        showFeedback
                          ? isCorrect
                            ? { borderColor: 'green', color: 'green', fontWeight: 'bold' }
                            : { borderColor: 'red', color: 'red', fontWeight: 'bold' }
                          : {}
                      }
                    >
                      <option value="">-- Select an option --</option>
                      {options.map((opt, i) => (
                        <option key={i} value={opt} title={opt}>{opt}</option>
                      ))}
                    </select>
                    {showFeedback && (
                      <div style={{ marginTop: '0.25rem' }}>
                        {isCorrect
                          ? <span style={{ color: 'green' }}>✅</span>
                          : (
                            <>
                              <span style={{ color: 'red' }}>❌</span>
                              <span style={{ color: 'green', marginLeft: 8, fontWeight: 'bold' }}>
                                Correct: {correctValue}
                              </span>
                            </>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Navigation */}
        <div className="nav-row">
          <button onClick={prevQuestion} disabled={current === 0}>⬅ Back</button>
          {current < questions.length - 1 && (
            <button onClick={nextQuestion}>Next ➡</button>
          )}
        </div>

        {/* Submit and feedback */}
        {!questionSubmitted[current] && (
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
            <button onClick={submitCurrentQuestion}>Submit Question</button>
          </div>
        )}
        {questionSubmitted[current] && (
          <div style={{ marginTop: '1rem', backgroundColor: '#f0f0f0', color: '#003049', padding: '1rem', borderRadius: 8 }}>
            <strong>
              {questionScore[current] > 0 ? '✅ Correct!' : '❌ Incorrect.'}
            </strong>
            <p><strong>Explanation:</strong> {q.explanation || 'No explanation provided.'}</p>
            <p><strong>Correct Answer:</strong> {q.correct_answer}</p>
          </div>
        )}

        {/* Score summary */}
        <div style={{ marginTop: '2rem', textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
          Score: {calculateScore()} / {maxScore()}
        </div>

        {/* Modal for explanation */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowModal(false)} aria-label="Close">&times;</button>
              <strong>Explanation</strong>
              <p style={{ marginTop: '1rem' }}>{q.explanation || 'No explanation provided.'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Save Modal */}
      <SaveModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSave}
        current={current}
        userAnswers={userAnswers}
        questionScore={questionScore}
        questionSubmitted={questionSubmitted}
        questions={questions}
        existingSavedTest={existingSavedTest}
      />
    </div>
  );
}
