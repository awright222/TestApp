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

  return (
    <div className="app">
      <h1>MB-800: Microsoft Dynamics 365 Business Central Functional Consultant Practice Test</h1>
      <div style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
        {submitted
          ? <>Final Score: {calculateScore()} / {
            questions.reduce((sum, q) => {
              if (q.question_type?.toLowerCase() === 'multiple choice') {
                return sum + q.correct_answer.split(',').length;
              } else if (q.question_type?.toLowerCase() === 'hotspot') {
                return sum + q.correct_answer.split(/\r?\n/).filter(Boolean).length;
              }
              return sum + 1;
            }, 0)
          }</>
          : <>Score: -- / --</>
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
                  checked={Array.isArray(userAnswers[current]) ? userAnswers[current].includes(choice) : false}
                  onChange={e => {
                    if (submitted) return;
                    updateUserAnswer(prev => {
                      let arr = Array.isArray(prev) ? [...prev] : [];
                      if (e.target.checked) {
                        if (!arr.includes(choice)) arr.push(choice);
                      } else {
                        arr = arr.filter(c => c !== choice);
                      }
                      return arr;
                    });
                  }}
                  disabled={submitted}
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
                  value={userAnswers[current]?.[label] || ''}
                  onChange={(e) => {
                    if (submitted) return;
                    updateUserAnswer(prev => ({
                      ...prev,
                      [label]: e.target.value
                    }));
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
      </div>
    </div>
  );
}

export default App;
