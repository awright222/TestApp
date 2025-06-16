import React, { useState, useRef } from "react";
import "./Timer.css";

function pad(n) {
  return n.toString().padStart(2, "0");
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function Timer({ onClose }) {
  const [inputMinutes, setInputMinutes] = useState(90);
  const [mode, setMode] = useState("down");
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(90 * 60);
  const [startTime, setStartTime] = useState(90 * 60);
  const [minimized, setMinimized] = useState(false);
  const intervalRef = useRef();

  // Drag state
  const [dragging, setDragging] = useState(false);
  const [pos, setPos] = useState({ x: window.innerWidth - 300, y: 24 });
  const offset = useRef({ x: 0, y: 0 });

  // Drag handlers
  const onMouseDown = (e) => {
    setDragging(true);
    offset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
    document.body.style.userSelect = "none";
  };

  const onMouseMove = (e) => {
    if (!dragging) return;
    setPos({
      x: e.clientX - offset.current.x,
      y: Math.max(0, e.clientY - offset.current.y),
    });
  };

  const onMouseUp = () => {
    setDragging(false);
    document.body.style.userSelect = "";
  };

  React.useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    } else {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    // eslint-disable-next-line
  }, [dragging]);

  // Timer logic
  const start = () => {
    if (running) return;
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setTime(prev => {
        if (mode === "down") {
          if (prev <= 0) {
            clearInterval(intervalRef.current);
            setRunning(false);
            return 0;
          }
          return prev - 1;
        } else {
          return prev + 1;
        }
      });
    }, 1000);
  };

  const pause = () => {
    setRunning(false);
    clearInterval(intervalRef.current);
  };

  const clearTimer = () => {
    setRunning(false);
    clearInterval(intervalRef.current);
    setTime(mode === "down" ? startTime : 0);
  };

  const handleInput = e => {
    const val = Math.max(0, Number(e.target.value));
    setInputMinutes(val);
    setStartTime(val * 60);
    if (mode === "down") setTime(val * 60);
  };

  const handleMode = e => {
    const newMode = e.target.value;
    setMode(newMode);
    setRunning(false);
    clearInterval(intervalRef.current);
    if (newMode === "down") {
      setTime(inputMinutes * 60);
      setStartTime(inputMinutes * 60);
    } else {
      setTime(0);
    }
  };

  React.useEffect(() => () => clearInterval(intervalRef.current), []);

  return (
    <div
      className={`timer-container ${dragging ? "dragging" : ""} ${minimized ? "minimized" : ""}`}
      style={{ position: "fixed", left: pos.x, top: pos.y }}
      onPointerDown={onMouseDown}
    >
      <div className="timer-header">
        <span>Timer</span>
        <div className="timer-header-buttons">
          <button onClick={e => { e.stopPropagation(); setMinimized(m => !m); }} className="icon-button">
            {minimized ? "▣" : "—"}
          </button>
          <button onClick={onClose} className="icon-button">×</button>
        </div>
      </div>
      {!minimized && (
        <>
          <div className="timer-controls">
            <select value={mode} onChange={handleMode}>
              <option value="down">Countdown</option>
              <option value="up">Count Up</option>
            </select>
            {mode === "down" && (
              <>
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={inputMinutes}
                  onChange={handleInput}
                />
                <span>min</span>
              </>
            )}
          </div>
          <div className="timer-time">
            {formatTime(time)}
          </div>
          <div className="timer-buttons">
            {!running && (
              <button onClick={start}>Start</button>
            )}
            {running && (
              <button onClick={pause}>Pause</button>
            )}
            <button onClick={clearTimer}>Clear</button>
          </div>
        </>
      )}
      {minimized && (
        <div style={{ fontWeight: "bold", fontSize: "1.1rem", letterSpacing: 1, margin: "0 auto" }}>
          {formatTime(time)}
        </div>
      )}
    </div>
  );
}