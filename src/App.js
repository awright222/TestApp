import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import './App.css';

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTDO68GqAelFKS2G6SwiUWdPs2tw5Gt62D5xLiB_9zyLyBPLSZm5gTthaQz9yCpmDKuymWMc83PV5a2/pub?output=csv';

function App() {
  const [questions, setQuestions] = useState([]);
  const [originalQuestions, setOriginalQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]); // Store answers for all questions
  const [submitted, setSubmitted] = useState(false);
  const [questionScore, setQuestionScore] = useState(Array(questions.length).fill(null)); // Track per-question score
  const [questionSubmitted, setQuestionSubmitted] = useState(Array(questions.length).fill(false)); // Track if question was submitted

  useEffect(() => {
    Papa.parse(SHEET_CSV_URL, {
      download: true,
      header: true,
      complete: (result) => {
        const filtered = result.data.filter(q => q.question_text);
        setQuestions(filtered);
        setOriginalQuestions(filtered);
        setUserAnswers(filtered.map(getInitialUserAnswer)); // Initialize answers
      },
    });
  }, []);

  if (questions.length === 0) return <p>Loading questions...</p>;

  const q = questions[current];
  const isLast = current >= questions.length - 1;

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

  function getChoiceLabel(choice) {
    const match = choice.match(/^([A-Z])\./);
    return match ? match[1] : null;
  }

  // Update answer for current question
  const updateUserAnswer = (answer) => {
    setUserAnswers(prev => {
      const updated = [...prev];
      updated[current] = answer;
      return updated;
    });
  };

  // Calculate score on submit
  const calculateScore = () => {
    let totalScore = 0;
    questions.forEach((q, idx) => {
      if (q.question_type?.toLowerCase() === 'multiple choice') {
        const correct = q.correct_answer.split(',').map(s => s.trim());
        const user = Array.isArray(userAnswers[idx]) ? userAnswers[idx] : [userAnswers[idx]];
        const userLabels = user.map(getChoiceLabel);
        totalScore += userLabels.filter(label => correct.includes(label)).length;
      } else if (q.question_type?.toLowerCase() === 'hotspot') {
        const correctHotspotAnswers = {};
        const lines = q.correct_answer.split(/\r?\n/).filter(Boolean);
        for (const line of lines) {
          const [label, answer] = line.split(':');
          if (label && answer) {
            correctHotspotAnswers[label.trim()] = answer.trim();
          }
        }
        const correctEntries = Object.entries(correctHotspotAnswers);
        totalScore += correctEntries.filter(
          ([label, correct]) => userAnswers[idx][label] === correct
        ).length;
      }
    });
    return totalScore;
  };

  const nextQuestion = () => {
    setCurrent(prev => prev + 1);
    setShowExplanation(false);
  };

  const prevQuestion = () => {
    setCurrent(prev => Math.max(0, prev - 1));
    setShowExplanation(false);
  };

  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function getInitialUserAnswer(q) {
    if (q?.question_type?.toLowerCase() === 'multiple choice') {
      return [];
    } else if (q?.question_type?.toLowerCase() === 'hotspot') {
      return {};
    }
    return '';
  }

  // Add this function to check and score the current question
  const submitCurrentQuestion = () => {
    let points = 0;
    if (q.question_type?.toLowerCase() === 'multiple choice') {
      const correct = q.correct_answer.split(',').map(s => s.trim());
      const user = Array.isArray(userAnswers[current]) ? userAnswers[current] : [userAnswers[current]];
      const userLabels = user.map(getChoiceLabel);
      // Count how many correct answers the user selected
      points = userLabels.filter(label => correct.includes(label)).length;
    } else if (q.question_type?.toLowerCase() === 'hotspot') {
      const correctHotspotAnswers = {};
      const lines = q.correct_answer.split(/\r?\n/).filter(Boolean);
      for (const line of lines) {
        const [label, answer] = line.split(':');
        if (label && answer) {
          correctHotspotAnswers[label.trim()] = answer.trim();
        }
      }
      // Count how many dropdowns are correct
      points = Object.entries(correctHotspotAnswers).filter(
        ([label, correct]) => userAnswers[current][label] === correct
      ).length;
    }
    setShowExplanation(true);
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

  // Calculate running score
  const runningScore = questionScore.reduce((sum, val) => sum + (val || 0), 0);

  return (
    <div className="app">
      <h1>MB-800: Microsoft Dynamics 365 Business Central Functional Consultant Practice Test</h1>
      <div style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
        Score: {runningScore} / {
          questions.reduce((sum, q) => {
            if (q.question_type?.toLowerCase() === 'multiple choice') {
              return sum + q.correct_answer.split(',').length;
            } else if (q.question_type?.toLowerCase() === 'hotspot') {
              return sum + q.correct_answer.split(/\r?\n/).filter(Boolean).length;
            }
            return sum + 1;
          }, 0)
        }
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => {
            setQuestions(shuffleArray(originalQuestions));
            setCurrent(0);
            setShowExplanation(false);
            setScore(0);
          }}
          style={{ marginRight: 8 }}
        >
          Shuffle Questions
        </button>
        <button
          onClick={() => {
            setQuestions(originalQuestions);
            setCurrent(0);
            setShowExplanation(false);
            setSubmitted(false);
            setUserAnswers(originalQuestions.map(getInitialUserAnswer));
            setQuestionScore(Array(originalQuestions.length).fill(null));
            setQuestionSubmitted(Array(originalQuestions.length).fill(false));
          }}
        >
          Reset
        </button>
      </div>
      {/* Jump to Question */}
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Jump to question:&nbsp;
          <input
            type="number"
            min={1}
            max={questions.length}
            value={current + 1}
            onChange={e => {
              const val = Number(e.target.value);
              if (val >= 1 && val <= questions.length) {
                setCurrent(val - 1);
                setShowExplanation(false);
              }
            }}
            style={{ width: 60 }}
          />
          &nbsp;/ {questions.length}
        </label>
      </div>

      <div className="question-box">
        <h2>Question {current + 1} of {questions.length}</h2>
        <p>{q.question_text}</p>

        {/* Multiple Choice Rendering */}
        {q.question_type?.toLowerCase() === 'multiple choice' && (
          <div className="choices">
            {choices.map((choice, idx) => {
              const isSingle = q.correct_answer.split(',').length === 1;
              const correctLabels = q.correct_answer.split(',').map(s => s.trim());
              const choiceLabel = getChoiceLabel(choice);
              const userSelected = isSingle
                ? userAnswers[current]?.[0] === choice
                : Array.isArray(userAnswers[current]) && userAnswers[current].includes(choice);

              // Determine feedback after question is submitted
              let feedbackIcon = null;
              let feedbackStyle = {};
              if (questionSubmitted[current]) {
                if (correctLabels.includes(choiceLabel)) {
                  // Correct answer
                  if (userSelected) {
                    feedbackIcon = <span style={{ color: 'green', marginLeft: 8 }}>✅</span>;
                    feedbackStyle = { color: 'green', fontWeight: 'bold' };
                  } else {
                    // Missed correct answer
                    feedbackIcon = <span style={{ color: 'green', marginLeft: 8 }}>✅</span>;
                    feedbackStyle = { color: 'green' };
                  }
                } else if (userSelected) {
                  // Incorrect selection
                  feedbackIcon = <span style={{ color: 'red', marginLeft: 8 }}>❌</span>;
                  feedbackStyle = { color: 'red', fontWeight: 'bold' };
                }
              }

              return (
                <label key={idx} style={feedbackStyle}>
                  <input
                    type={isSingle ? "radio" : "checkbox"}
                    name={`answer-${current}`}
                    value={choice}
                    checked={userSelected}
                    onChange={e => {
                      if (submitted) return;
                      if (isSingle) {
                        updateUserAnswer([choice]);
                      } else {
                        let arr = Array.isArray(userAnswers[current]) ? [...userAnswers[current]] : [];
                        if (e.target.checked) {
                          // Limit selection to the number of correct answers
                          const maxSelections = correctLabels.length;
                          if (arr.length < maxSelections) {
                            if (!arr.includes(choice)) arr.push(choice);
                          }
                        } else {
                          arr = arr.filter(c => c !== choice);
                        }
                        updateUserAnswer(arr);
                      }
                    }}
                    disabled={submitted}
                  />
                  {choice}
                  {feedbackIcon}
                </label>
              );
            })}
          </div>
        )}

        {/* Hotspot with Multiple Dropdowns */}
        {q.question_type?.toLowerCase() === 'hotspot' && (
          <div className="hotspot-dropdowns">
            {Object.entries(hotspotOptions).map(([label, options], idx) => (
              <div key={idx} style={{ marginBottom: '1rem' }}>
                <strong>{label}</strong>
                <select
                  value={userAnswers[current]?.[label] || ''}
                  onChange={(e) => {
                    if (submitted) return;
                    const prev = userAnswers[current] || {};
                    updateUserAnswer({
                      ...prev,
                      [label]: e.target.value
                    });
                  }}
                  disabled={submitted}
                >
                  <option value="">-- Select an option --</option>
                  {options.map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '1rem' }}>
          <button onClick={prevQuestion} disabled={current === 0 || submitted}>⬅ Back</button>
          {!isLast && (
            <button onClick={nextQuestion} style={{ marginLeft: '1rem' }} disabled={submitted}>
              Next ➡
            </button>
          )}
        </div>

        {/* Submit Button */}
        {isLast && !submitted && (
          <button
            style={{ marginTop: '2rem', fontWeight: 'bold' }}
            onClick={() => setSubmitted(true)}
          >
            Submit Test
          </button>
        )}

        {/* Show score after submit */}
        {submitted && (
          <p style={{ marginTop: '2rem', fontWeight: 'bold' }}>
            🎉 You’ve completed the test! Final Score: {calculateScore()} / {
              questions.reduce((sum, q) => {
                if (q.question_type?.toLowerCase() === 'multiple choice') {
                  return sum + q.correct_answer.split(',').length;
                } else if (q.question_type?.toLowerCase() === 'hotspot') {
                  return sum + q.correct_answer.split(/\r?\n/).filter(Boolean).length;
                }
                return sum + 1;
              }, 0)
            }
          </p>
        )}

        {/* Explanation Section */}
        {!submitted && (
          <div style={{ marginTop: '1rem' }}>
            <button onClick={() => setShowExplanation(true)}>Check Answer</button>
          </div>
        )}
        {showExplanation && (
          <div style={{ marginTop: '1rem', backgroundColor: '#f0f0f0', color: '#003049', padding: '1rem', borderRadius: 8 }}>
            <strong>Explanation:</strong>
            <p>{q.explanation || 'No explanation provided.'}</p>
            <p><strong>Correct Answer:</strong> {q.correct_answer}</p>
          </div>
        )}

        {/* Submit Question Button */}
        {!submitted && !questionSubmitted[current] && (
          <div style={{ marginTop: '1rem' }}>
            <button onClick={submitCurrentQuestion}>Submit Question</button>
          </div>
        )}
        {questionSubmitted[current] && (
          <div style={{ marginTop: '1rem', backgroundColor: '#f0f0f0', color: '#003049', padding: '1rem', borderRadius: 8 }}>
            <strong>
              {questionScore[current] === 1 ? "✅ Correct!" : "❌ Incorrect."}
            </strong>
            <p><strong>Explanation:</strong> {q.explanation || 'No explanation provided.'}</p>
            <p><strong>Correct Answer:</strong> {q.correct_answer}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
