import SEO from "../components/SEO";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Hearts from "../components/Hearts";
import { supabase } from "../lib/supabaseClient";
import { useSound } from "../context/SoundContext";

const DIGITS = 5;
const MAX_ATTEMPTS = 5;

function generateSecret() {
    return Array.from(
        { length: DIGITS },
        () => Math.floor(Math.random() * 10)
    ).join("");
}

function checkGuess(secret, guess) {
    const s = secret.split("");
    const g = guess.split("");
    const result = Array(DIGITS).fill("grey");
    const remaining = [];

    for (let i = 0; i < DIGITS; i++) {
        if (g[i] === s[i]) {
            result[i] = "green";
        } else {
            remaining.push(s[i]);
        }
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
    const [rows, setRows] = useState([]);
    const [digitValues, setDigitValues] = useState(() => Array(DIGITS).fill(""));
    const guess = digitValues.join("");
    const [paused, setPaused] = useState(false);
    const [over, setOver] = useState(false);
    const [message, setMessage] = useState("");
    const [celebrate, setCelebrate] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const { playCorrect, playWrong, playWin, playLose, playTileFlip, playHeartLoss, setMusicTrack } = useSound();

    const digitInputRefs = useRef([]);

    useEffect(() => {
        if (!paused && !over) {
            // After a guess is recorded, return focus to the first digit box
            // so the next round can be entered without an extra click.
            digitInputRefs.current[0]?.focus();
        }
    }, [paused, over, rows.length]);

    // Save Single Player Result to Supabase
    async function saveSinglePlayerResult(won, attemptsUsed) {
        try {
            const {
                data: { user },
                error: userError
            } = await supabase.auth.getUser();

            if (userError) throw userError;

            if (!user) {
                console.log("Guest game result: Not saved to Supabase.");
                return;
            }

            const { error } = await supabase.rpc(
                "save_single_player_result",
                {
                    p_won: won,
                    p_attempts_used: attemptsUsed
                }
            );

            if (error) throw error;

            console.log("Single Player Result Saved Successfully!");
        } catch (error) {
            console.error(
                "Saving Single Player Result Error:",
                error
            );
        }
    }

    // Submit Guess
    async function submitGuess() {
        if (over || paused || submitting) return;

        if (!/^[0-9]{5}$/.test(guess)) {
            setMessage("Enter exactly 5 digits (0-9).");
            playWrong();
            return;
        }

        setSubmitting(true);
        try {
            const result = checkGuess(secret, guess);
            setRows(prev => [...prev, { guess, result }]);
            playTileFlip();

            const next = attemptsLeft - 1;
            setAttemptsLeft(next);

            // Player Wins
            if (guess === secret) {
                const used = MAX_ATTEMPTS - next;

                setMessage("🎉 You cracked the code!");
                setOver(true);
                setCelebrate(true);
                playWin();
                setMusicTrack("victory");

                // Save Supabase statistics
                await saveSinglePlayerResult(true, used);

                // Existing LocalStorage Best Score
                const best = Number(
                    localStorage.getItem("bestScore") || Infinity
                );

                if (used < best) {
                    localStorage.setItem("bestScore", String(used));
                }
            }

            // Player Loses
            else if (next === 0) {
                setMessage(`❌ Game over! Code was ${secret}`);
                setOver(true);
                playHeartLoss();
                playLose();

                // Save losing result
                await saveSinglePlayerResult(false, MAX_ATTEMPTS);
            }

            // Game Continues
            else {
                setMessage(
                    `${next} ${next === 1 ? "attempt" : "attempts"} left`
                );

                playHeartLoss();
                if (result.some((status) => status === "green" || status === "yellow")) {
                    playCorrect();
                } else {
                    playWrong();
                }
            }

            setDigitValues(Array(DIGITS).fill(""));
        } finally {
            setSubmitting(false);
        }
    }

    // Restart Game
    function restart() {
        setMusicTrack("gameplay");
        setSecret(generateSecret());
        setAttemptsLeft(MAX_ATTEMPTS);
        setRows([]);
        setDigitValues(Array(DIGITS).fill(""));
        setPaused(false);
        setOver(false);
        setMessage("");
        setCelebrate(false);
        setSubmitting(false);

        digitInputRefs.current[0]?.focus();
    }

    // Individual digit input: keyboard navigation, backspace and paste support.
    function updateDigit(index, rawValue) {
        const digits = rawValue.replace(/\D/g, "");
        const nextDigit = digits ? digits[digits.length - 1] : "";
        setDigitValues(prev => prev.map((digit, digitIndex) => digitIndex === index ? nextDigit : digit));
        if (nextDigit && index < DIGITS - 1) digitInputRefs.current[index + 1]?.focus();
        else if (!nextDigit && index > 0) digitInputRefs.current[index - 1]?.focus();
    }

    function handleDigitKeyDown(e, index) {
        if (e.key === "Enter") {
            e.preventDefault();
            submitGuess();
            return;
        }
        if (e.key === "Escape" && !over) {
            setPaused(p => !p);
            return;
        }
        if (e.key === "Backspace" && !e.currentTarget.value && index > 0) {
            digitInputRefs.current[index - 1]?.focus();
            return;
        }
        if (e.key === "ArrowLeft" && index > 0) {
            e.preventDefault();
            digitInputRefs.current[index - 1]?.focus();
        }
        if (e.key === "ArrowRight" && index < DIGITS - 1) {
            e.preventDefault();
            digitInputRefs.current[index + 1]?.focus();
        }
    }

    function handleDigitPaste(e, index) {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, DIGITS);
        if (!pasted) return;
        setDigitValues(prev => {
            const chars = [...prev];
            [...pasted].forEach((digit, offset) => {
                if (index + offset < DIGITS) chars[index + offset] = digit;
            });
            return chars;
        });
        digitInputRefs.current[Math.min(index + pasted.length, DIGITS - 1)]?.focus();
    }

    return (
        <>
            <SEO
                title="Play Number Guessing Game Online | Guess The Number"
                description="Challenge yourself with a free online number guessing game. Find the secret 5-digit code using logic and five attempts."
                canonicalPath="/game"
            />
            <main className={`container game-screen neon-game${paused ? " is-paused" : ""}${over ? " is-over" : ""}${celebrate ? " is-victory" : ""}`}>
                <header className="neon-game__header">
                    <div className="neon-game__heading">
                        <span className="neon-game__eyebrow"><i /> SOLO CHALLENGE</span>
                        <h1 className="title">Number <span>Guesser</span></h1>
                        <p>Read the clues. Trust your logic. Crack the code.</p>
                    </div>
                    <button className="btn ghost neon-game__menu" type="button" onClick={() => navigate("/")}>
                        <span aria-hidden="true">⌂</span> Main Menu
                    </button>
                </header>

                <section className="neon-game__statusbar" aria-label="Game status">
                    <div className="neon-game__lives">
                        <span className="neon-game__label">YOUR LIVES</span>
                        <Hearts lives={attemptsLeft} />
                        <span className="neon-game__lives-count">{attemptsLeft}/{MAX_ATTEMPTS}</span>
                    </div>
                    <div className={`neon-game__status ${paused ? "is-paused" : ""}`} aria-live="polite">
                        <span className="neon-game__status-dot" />
                        {paused ? "Game paused" : message || "Your mission is ready"}
                    </div>
                    <span className="neon-game__attempt-count">ATTEMPT {Math.min(rows.length + (over ? 0 : 1), MAX_ATTEMPTS)} <b>/ 5</b></span>
                </section>

                <section className="neon-game__arena">
                    <div className="neon-game__arena-heading">
                        <div>
                            <span className="neon-game__label">CODE BREAKER</span>
                            <h2>Guess history</h2>
                        </div>
                        <span className="neon-game__round-tag">ROUND 01</span>
                    </div>

                    <div className="neon-game__board" aria-label="Guess history">
                        {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIndex) => {
                            const row = rows[rowIndex];
                            return (
                                <div className={`neon-game__guess-row${row ? " has-result" : " is-empty"}`} key={rowIndex}>
                                    <span className="neon-game__row-number">0{rowIndex + 1}</span>
                                    <div className="guess-row">
                                        {Array.from({ length: DIGITS }).map((__, digitIndex) => (
                                            <div
                                                key={digitIndex}
                                                className={`guess-box ${row ? `${row.result[digitIndex]} flip-in tile-reveal` : "neon-game__empty-tile"}`}
                                                style={{ "--tile-index": digitIndex }}
                                                aria-label={row ? `Digit ${row.guess[digitIndex]}, ${row.result[digitIndex]}` : `Attempt ${rowIndex + 1}, empty digit ${digitIndex + 1}`}
                                            >
                                                {row ? row.guess[digitIndex] : ""}
                                            </div>
                                        ))}
                                    </div>
                                    <span className="neon-game__row-state">{row ? "CHECKED" : rowIndex === rows.length && !over ? "CURRENT" : "WAITING"}</span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="neon-game__legend" aria-label="Feedback legend">
                        <span><i className="is-green" /> Correct spot</span>
                        <span><i className="is-yellow" /> Wrong spot</span>
                        <span><i className="is-grey" /> Not in code</span>
                    </div>
                </section>

                <section className="neon-game__input-panel" aria-labelledby="guess-entry-title">
                    <div className="neon-game__input-copy">
                        <span className="neon-game__label">MAKE YOUR MOVE</span>
                        <h2 id="guess-entry-title">Enter your code</h2>
                        <p>Choose five digits from 0 to 9.</p>
                    </div>

                    <div className="neon-game__digit-inputs" role="group" aria-label="Enter your five-digit guess">
                        {Array.from({ length: DIGITS }).map((_, index) => (
                            <input
                                key={index}
                                ref={element => { digitInputRefs.current[index] = element; }}
                                className="neon-game__digit-input"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                autoComplete={index === 0 ? "one-time-code" : "off"}
                                maxLength={1}
                                value={digitValues[index]}
                                disabled={paused || over || submitting}
                                aria-label={`Digit ${index + 1} of 5`}
                                onChange={e => updateDigit(index, e.target.value)}
                                onKeyDown={e => handleDigitKeyDown(e, index)}
                                onPaste={e => handleDigitPaste(e, index)}
                            />
                        ))}
                    </div>
                    <p className="game-input-hint" aria-live="polite">{digitValues.filter(Boolean).length}/5 digits entered <span>·</span> Enter to submit</p>

                    <div className="game-controls neon-game__controls">
                        {!over ? (
                            <>
                                <button className="btn btn-primary neon-game__submit" type="button" onClick={submitGuess} disabled={paused || submitting || digitValues.some(digit => !digit)}>
                                    <span>{submitting ? "Checking code..." : "Submit Guess"}</span>
                                    <span aria-hidden="true">↗</span>
                                </button>
                                <button className="btn btn-orange neon-game__pause" type="button" onClick={() => setPaused(p => !p)} disabled={submitting}>
                                    <span aria-hidden="true">{paused ? "▶" : "Ⅱ"}</span>
                                    {paused ? "Resume" : "Pause"}
                                </button>
                            </>
                        ) : (
                            <button className="btn btn-danger neon-game__submit" type="button" onClick={restart}>
                                <span>Play Again</span><span aria-hidden="true">↻</span>
                            </button>
                        )}
                    </div>

                    {paused && <div className="neon-game__pause-note" role="status"><strong>Take your time.</strong> Your progress is safe. Resume when you're ready.</div>}
                    {over && <div className={`neon-game__result ${celebrate ? "is-win" : "is-loss"}`} role="status"><strong>{celebrate ? "Code cracked!" : "Challenge complete"}</strong><span>{message}</span></div>}
                </section>

                {celebrate && (
                    <div className="confetti" aria-hidden="true">
                        {Array.from({ length: 60 }).map((_, i) => <span key={i} className="confetti-piece" />)}
                    </div>
                )}
            </main>
        </>
    );
}
