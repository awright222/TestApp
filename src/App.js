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
    let isCorrect = false;

    if (q.question_type?.toLowerCase() === 'multiple choice') {
      isCorrect = userAnswer === q.correct_answer.trim();
    } else if (q.question_type?.toLowerCase() === 'hotspot') {
      isCorrect = Object.entries(correctHotspotAnswers).every(
        ([label, correct]) => userAnswer[label] === correct
      );
    }

    if (isCorrect) setScore(prev => prev + 1);
  };

  const nextQuestion = () => {
    setCurrent(prev => prev + 1);
    setUserAnswer({});
    setChecked(false);
    setShowExplanation(false);
  };

  const prevQuestion = () => {
    setCurrent(prev => Math.max(0, prev - 1));
    setUserAnswer({});
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

  return (
    <div className="app">
      <h1>MB-800: Microsoft Dynamics 365 Business Central Functional Consultant Practice Test</h1>
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => {
            setQuestions(shuffleArray(originalQuestions));
            setCurrent(0);
            setUserAnswer({});
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
            setUserAnswer({});
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
                setUserAnswer({});
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
                  type="radio"
                  name="answer"
                  value={choice}
                  checked={userAnswer === choice}
                  onChange={() => setUserAnswer(choice)}
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
                ? !userAnswer
                : Object.keys(hotspotOptions).some(label => !userAnswer[label])
            }>
              Check Answer
            </button>
          )}

          {checked && (
            <>
              <p>
                {(() => {
                  if (q.question_type?.toLowerCase() === 'multiple choice') {
                    return userAnswer === q.correct_answer.trim()
                      ? '✅ Correct!'
                      : `❌ Incorrect. Correct answer: ${q.correct_answer}`;
                  } else if (q.question_type?.toLowerCase() === 'hotspot') {
                    const missed = Object.entries(correctHotspotAnswers).filter(
                      ([label, correct]) => userAnswer[label] !== correct
                    );
                    if (missed.length === 0) return '✅ All selections correct!';
                    return (
                      <>
                        ❌ Some selections incorrect:
                        <ul>
                          {missed.map(([label, correct], i) => (
                            <li key={i}>
                              <strong>{label}:</strong> Correct answer is <em>{correct}</em>
                            </li>
                          ))}
                        </ul>
                      </>
                    );
                  }
                })()}
              </p>
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
            🎉 You’ve completed the test! Final Score: {score} / {questions.length}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
