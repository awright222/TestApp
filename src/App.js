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
  const [userAnswer, setUserAnswer] = useState({});
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    Papa.parse(SHEET_CSV_URL, {
      download: true,
      header: true,
      complete: (result) => {
        const filtered = result.data.filter(q => q.question_text);
        setQuestions(filtered);
        setOriginalQuestions(filtered); // Save the original questions
      },
    });
  }, []);

  if (questions.length === 0) return <p>Loading questions...</p>;

  const q = questions[current];
  const isLast = current >= questions.length - 1;

  // Multiple Choice
  const choices = q.choices?.split(/\r?\n|\\n|•|–|-/g).map(s => s.trim()).filter(Boolean) || [];

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

  const checkAnswer = () => {
    setChecked(true);

    let points = 0;
    let total = 0;

    if (q.question_type?.toLowerCase() === 'multiple choice') {
      // Support multiple correct answers, comma-separated
      const correct = q.correct_answer.split(',').map(s => s.trim());
      total = correct.length;

      // If userAnswer is a string (single select), convert to array
      const user = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
      points = user.filter(ans => correct.includes(ans)).length;
    } else if (q.question_type?.toLowerCase() === 'hotspot') {
      const correctEntries = Object.entries(correctHotspotAnswers);
      total = correctEntries.length;
      points = correctEntries.filter(
        ([label, correct]) => userAnswer[label] === correct
      ).length;
    }

    setScore(prev => prev + points);
  };

  const nextQuestion = () => {
    setCurrent(prev => prev + 1);
    setUserAnswer(getInitialUserAnswer(questions[current + 1]));
    setChecked(false);
    setShowExplanation(false);
  };

  const prevQuestion = () => {
    setCurrent(prev => Math.max(0, prev - 1));
    setUserAnswer(getInitialUserAnswer(questions[Math.max(0, current - 1)]));
    setChecked(false);
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

  return (
    <div className="app">
      <h1>MB-800: Microsoft Dynamics 365 Business Central Functional Consultant Practice Test</h1>
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => {
            setQuestions(shuffleArray(originalQuestions));
            setCurrent(0);
            setUserAnswer(getInitialUserAnswer(originalQuestions[0]));
            setChecked(false);
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
            setUserAnswer(getInitialUserAnswer(originalQuestions[0]));
            setChecked(false);
            setShowExplanation(false);
            setScore(0);
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
                setUserAnswer(getInitialUserAnswer(questions[val - 1]));
                setChecked(false);
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
            {choices.map((choice, idx) => (
              <label key={idx}>
                <input
                  type="checkbox"
                  name="answer"
                  value={choice}
                  checked={Array.isArray(userAnswer) ? userAnswer.includes(choice) : false}
                  onChange={e => {
                    setUserAnswer(prev => {
                      let arr = Array.isArray(prev) ? [...prev] : [];
                      if (e.target.checked) {
                        if (!arr.includes(choice)) arr.push(choice);
                      } else {
                        arr = arr.filter(c => c !== choice);
                      }
                      return arr;
                    });
                  }}
                  disabled={checked}
                />
                {choice}
              </label>
            ))}
          </div>
        )}

        {/* Hotspot with Multiple Dropdowns */}
        {q.question_type?.toLowerCase() === 'hotspot' && (
          <div className="hotspot-dropdowns">
            {Object.entries(hotspotOptions).map(([label, options], idx) => (
              <div key={idx} style={{ marginBottom: '1rem' }}>
                <strong>{label}</strong>
                <select
                  value={userAnswer[label] || ''}
                  onChange={(e) => setUserAnswer(prev => ({
                    ...prev,
                    [label]: e.target.value
                  }))}
                  disabled={checked}
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

        {/* Answer Feedback */}
        <div style={{ marginTop: '1rem' }}>
          {!checked && (
            <button onClick={checkAnswer} disabled={
              q.question_type?.toLowerCase() === 'multiple choice'
                ? !userAnswer.length
                : Object.keys(hotspotOptions).some(label => !userAnswer[label])
            }>
              Check Answer
            </button>
          )}

          {checked && (
            <>
              <div>
                {q.question_type?.toLowerCase() === 'multiple choice' && (() => {
                  const correct = q.correct_answer.split(',').map(s => s.trim());
                  const user = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
                  return (
                    <ul>
                      {choices.map((choice, idx) => (
                        <li key={idx} style={{
                          color: correct.includes(choice)
                            ? (user.includes(choice) ? 'green' : 'orange')
                            : (user.includes(choice) ? 'red' : undefined)
                        }}>
                          {choice}
                          {correct.includes(choice) && user.includes(choice) && ' ✅'}
                          {correct.includes(choice) && !user.includes(choice) && ' (missed)'}
                          {!correct.includes(choice) && user.includes(choice) && ' ❌'}
                        </li>
                      ))}
                    </ul>
                  );
                })()}
                {q.question_type?.toLowerCase() === 'hotspot' && (() => {
                  return (
                    <ul>
                      {Object.entries(hotspotOptions).map(([label, options], idx) => {
                        const correct = correctHotspotAnswers[label];
                        const user = userAnswer[label];
                        return (
                          <li key={idx} style={{
                            color: user === correct ? 'green' : 'red'
                          }}>
                            <strong>{label}:</strong> {user || '(no answer)'}
                            {user === correct ? ' ✅' : ` ❌ (Correct: ${correct})`}
                          </li>
                        );
                      })}
                    </ul>
                  );
                })()}
              </div>
              <button onClick={() => setShowExplanation(prev => !prev)}>
                {showExplanation ? 'Hide' : 'Show'} Explanation
              </button>
              {showExplanation && (
                <p className="explanation">💡 {q.explanation}</p>
              )}
            </>
          )}
        </div>

        <div style={{ marginTop: '1rem' }}>
          <button onClick={prevQuestion} disabled={current === 0}>⬅ Back</button>
          {!isLast && (
            <button onClick={nextQuestion} style={{ marginLeft: '1rem' }}>
              Next ➡
            </button>
          )}
        </div>

        {isLast && checked && (
          <p style={{ marginTop: '1rem' }}>
            🎉 You’ve completed the test! Final Score: {score} / {
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
      </div>
    </div>
  );
}

export default App;
