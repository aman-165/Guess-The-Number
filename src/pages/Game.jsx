import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Hearts from "../components/Hearts";

const DIGITS = 5;
const MAX_ATTEMPTS = 5;

function generateSecret() {
  return Array.from({ length: DIGITS }, () => Math.floor(Math.random() * 10)).join("");
}

function checkGuess(secret, guess) {
  const s = secret.split("");
  const g = guess.split("");
  const result = Array(DIGITS).fill("grey");
  const remaining = [];

  for (let i = 0; i < DIGITS; i++) {
    if (g[i] === s[i]) result[i] = "green";
    else remaining.push(s[i]);
  }
  for (let i = 0; i < DIGITS; i++) {
    if (result[i] === "green") continue;
    const idx = remaining.indexOf(g[i]);
    if (idx > -1) {
      result[i] = "yellow";
      remaining.splice(idx, 1);
    }
  }
  return result;
}

export default function Game() {
  const navigate = useNavigate();
  const [secret, setSecret] = useState(generateSecret);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [rows, setRows] = useState([]); // {guess, result}
  const [guess, setGuess] = useState("");
  const [paused, setPaused] = useState(false);
  const [over, setOver] = useState(false);
  const [message, setMessage] = useState("");
  const [celebrate, setCelebrate] = useState(false);

  // sounds
  const sClick = useMemo(() => new Audio("/sounds/click.mp3"), []);
  const sSuccess = useMemo(() => new Audio("/sounds/success.mp3"), []);
  const sError = useMemo(() => new Audio("/sounds/error.mp3"), []);
  const sLose = useMemo(() => new Audio("/sounds/lose.mp3"), []);
  [sClick, sSuccess, sError, sLose].forEach(a => a && (a.volume = 0.5));

  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [paused, over]);

  function submitGuess() {
    if (over || paused) return;
    if (!/^\d{5}$/.test(guess)) {
      setMessage("Enter exactly 5 digits (0‑9).");
      sError?.play().catch(() => {});
      return;
    }

    const result = checkGuess(secret, guess);
    setRows(prev => [...prev, { guess, result }]);

    const next = attemptsLeft - 1;
    setAttemptsLeft(next);

    if (guess === secret) {
      setMessage("🎉 You cracked the code!");
      setOver(true);
      setCelebrate(true);
      sSuccess?.play().catch(() => {});
      // best score (fewer attempts used is better)
      const used = MAX_ATTEMPTS - next;
      const best = Number(localStorage.getItem("bestScore") || Infinity);
      if (used < best) localStorage.setItem("bestScore", String(used));
    } else if (next === 0) {
      setMessage(`❌ Game over! Code was ${secret}`);
      setOver(true);
      sLose?.play().catch(() => {});
    } else {
      setMessage(`${next} ${next === 1 ? "attempt" : "attempts"} left`);
      sClick?.play().catch(() => {});
    }

    setGuess("");
  }

  function restart() {
    setSecret(generateSecret());
    setAttemptsLeft(MAX_ATTEMPTS);
    setRows([]);
    setGuess("");
    setPaused(false);
    setOver(false);
    setMessage("");
    setCelebrate(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") submitGuess();
    if (e.key === "Escape") setPaused(p => !p);
  }

  return (
    <div className="container">
      <h1 className="title">Number Guesser</h1>

      <div className="topbar">
        <Hearts lives={attemptsLeft} />
        <div className={`status ${paused ? "paused" : ""}`} aria-live="polite">{message}</div>
        <button className="btn ghost" onClick={() => navigate("/")}>Main Menu</button>
      </div>

      <div className="game-container">
        <div className="guess-container">
          {rows.map((row, i) => (
            <div key={i} className="guess-row">
              {row.guess.split("").map((d, j) => (
                <div key={j} className={`guess-box ${row.result[j]} flip-in`}>
                  {d}
                </div>
              ))}
            </div>
          ))}
        </div>

        <input
          ref={inputRef}
          id="guess-input"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="Enter 5 digits"
          maxLength={5}
          value={guess}
          disabled={paused || over}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 5);
            setGuess(v);
          }}
          onKeyDown={handleKeyDown}
        />

        <div className="game-controls">
          {!over && (
            <>
              <button className="btn btn-primary" onClick={submitGuess}><span>Submit Guess</span></button>
              <button className="btn btn-orange" onClick={() => setPaused(p => !p)}>
                <span>{paused ? "Resume" : "Pause"}</span>
              </button>
            </>
          )}
          {over && (
            <button className="btn btn-danger" onClick={restart}><span>New Game</span></button>
          )}
        </div>
      </div>

      {/* confetti on win */}
      {celebrate && (
        <div className="confetti" aria-hidden="true">
          {Array.from({ length: 60 }).map((_, i) => (
            <span key={i} className="confetti-piece" />
          ))}
        </div>
      )}
    </div>
  );
}
