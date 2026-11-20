
// import { useEffect, useState } from "react";
// import { supabase } from "../lib/supabaseClient";
// import { useSound } from "../context/SoundContext";

// export default function DailyChallenge() {
//     const [loading, setLoading] = useState(true);
//     const [attemptsUsed, setAttemptsUsed] = useState(0);
//     const [guessHistory, setGuessHistory] = useState([]);
//     const [message, setMessage] = useState("");

//     const [guess, setGuess] = useState("");
//     const [submitting, setSubmitting] = useState(false);
//     const [completed, setCompleted] = useState(false);
//     const [won, setWon] = useState(false);
//     const { playAchievement, playWrong, playTileFlip, playHeartLoss, playChallengeComplete } = useSound();

//     useEffect(() => {
//         let isMounted = true;

//         async function loadDailyChallenge() {
//             setLoading(true);
//             setMessage("");

//             try {
//                 const { data, error } = await supabase.rpc(
//                     "get_daily_challenge_status"
//                 );

//                 if (!isMounted) return;

//                 if (error) {
//                     setMessage(error.message);
//                     return;
//                 }

//                 setAttemptsUsed(data.attemptsUsed ?? 0);
//                 setGuessHistory(data.history ?? []);
//                 setCompleted(data.completed ?? false);
//                 setWon(data.won ?? false);

//                 if (data.completed) {
//                     setMessage(
//                         data.won
//                             ? "You already won today's challenge!"
//                             : "Today's challenge is completed."
//                     );
//                 }
//             } catch {
//                 if (isMounted) {
//                     setMessage("Unable to connect. Please try again.");
//                 }
//             } finally {
//                 if (isMounted) {
//                     setLoading(false);
//                 }
//             }
//         }

//         loadDailyChallenge();

//         return () => {
//             isMounted = false;
//         };
//     }, []);

//     async function handleSubmitGuess() {
//         if (!/^[0-9]{5}$/.test(guess)) {
//             setMessage("Please enter a valid 5-digit number.");
//             playWrong();
//             return;
//         }

//         if (completed || attemptsUsed >= 5) {
//             setMessage("Today's challenge is already completed.");
//             return;
//         }

//         setSubmitting(true);
//         setMessage("");

//         try {
//             const { data, error } = await supabase.rpc(
//                 "submit_daily_challenge_guess",
//                 {
//                     p_guess: guess,
//                 }
//             );

//             if (error) {
//                 setMessage(error.message);
//                 return;
//             }

//             setAttemptsUsed(data.attemptsUsed);
//             setGuessHistory(data.history);
//             setCompleted(data.completed);
//             setWon(data.won);
//             setGuess("");

//             if (data.won) {
//                 setMessage("Congratulations! You won today's challenge!");
//                 playAchievement();
//             } else if (data.completed) {
//                 setMessage("Game over! Better luck tomorrow.");
//             } else {
//                 setMessage("Guess submitted successfully!");
//             }
//         } catch {
//             setMessage("Unable to submit guess. Please try again.");
//         } finally {
//             setSubmitting(false);
//         }
//     }

//     return (
//         <div className="container">
//             <h1 className="title">Daily Challenge</h1>

//             <p className="subtitle">
//                 Guess today's shared 5-digit secret number in 5 attempts.
//             </p>

//             <div className="stats-card">
//                 <h3>Today's Challenge</h3>

//                 {loading ? (
//                     <p>Loading challenge...</p>
//                 ) : (
//                     <p>
//                         {won
//                             ? "Challenge Won!"
//                             : completed
//                                 ? "Challenge Completed"
//                                 : "Challenge page connected."}
//                     </p>
//                 )}

//                 <p>Attempts Used: {attemptsUsed}/5</p>

//                 <div className="daily-input-section">
//                     <input
//                         id="guess-input"
//                         type="text"
//                         inputMode="numeric"
//                         autoComplete="off"
//                         maxLength={5}
//                         placeholder="Enter 5-digit number"
//                         value={guess}
//                         onChange={(e) => {
//                             const value = e.target.value.replace(/[^0-9]/g, "");
//                             setGuess(value.slice(0, 5));
//                         }}
//                         onKeyDown={(e) => {
//                             if (e.key === "Enter" && guess.length === 5) {
//                                 handleSubmitGuess();
//                             }
//                         }}
//                         disabled={loading || submitting || completed}
//                     />

//                     <button
//                         className="btn btn-primary"
//                         onClick={handleSubmitGuess}
//                         disabled={
//                             loading ||
//                             submitting ||
//                             completed ||
//                             guess.length !== 5
//                         }
//                     >
//                         {submitting ? "Submitting..." : "Submit Guess"}
//                     </button>
//                 </div>

//                 {message && <p>{message}</p>}

//                 {guessHistory.length > 0 && (
//                     <div className="daily-history">
//                         <h3>Your Previous Guesses</h3>

//                         {guessHistory.map((item, index) => (
//                             <div className="guess-row" key={index}>
//                                 {item.guess.split("").map((digit, digitIndex) => (
//                                     <div
//                                         key={digitIndex}
//                                         className={`guess-box ${item.feedback[digitIndex]}`}
//                                     >
//                                         {digit}
//                                     </div>
//                                 ))}
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useSound } from "../context/SoundContext";
import "../styles/daily-challenge.css";

const MAX_ATTEMPTS = 5;
const DIGIT_COUNT = 5;

function StatusIcon({ type }) {
    if (type === "won") {
        return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>;
    }
    if (type === "completed") {
        return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8v4l3 2" /><circle cx="12" cy="12" r="9" /></svg>;
    }
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M3 12h18" /></svg>;
}

export default function DailyChallenge() {
    const [loading, setLoading] = useState(true);
    const [attemptsUsed, setAttemptsUsed] = useState(0);
    const [guessHistory, setGuessHistory] = useState([]);
    const [message, setMessage] = useState("");
    const [guess, setGuess] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [won, setWon] = useState(false);
    const { playAchievement, playWrong, playTileFlip, playHeartLoss, playChallengeComplete } = useSound();

    useEffect(() => {
        let isMounted = true;

        async function loadDailyChallenge() {
            setLoading(true);
            setMessage("");
            try {
                const { data, error } = await supabase.rpc("get_daily_challenge_status");
                if (!isMounted) return;
                if (error) {
                    setMessage(error.message);
                    return;
                }
                setAttemptsUsed(data.attemptsUsed ?? 0);
                setGuessHistory(data.history ?? []);
                setCompleted(data.completed ?? false);
                setWon(data.won ?? false);
                if (data.completed) {
                    setMessage(data.won
                        ? "You already won today's challenge!"
                        : "Today's challenge is completed.");
                }
            } catch {
                if (isMounted) setMessage("Unable to connect. Please try again.");
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        loadDailyChallenge();
        return () => { isMounted = false; };
    }, []);

    async function handleSubmitGuess() {
        if (!/^[0-9]{5}$/.test(guess)) {
            setMessage("Please enter a valid 5-digit number.");
            playWrong();
            return;
        }
        if (completed || attemptsUsed >= MAX_ATTEMPTS || submitting) {
            setMessage("Today's challenge is already completed.");
            return;
        }

        setSubmitting(true);
        setMessage("");
        try {
            const { data, error } = await supabase.rpc("submit_daily_challenge_guess", {
                p_guess: guess,
            });
            if (error) {
                setMessage(error.message);
                playWrong();
                return;
            }

            setAttemptsUsed(data.attemptsUsed);
            setGuessHistory(data.history);
            playTileFlip();
            setCompleted(data.completed);
            setWon(data.won);
            setGuess("");

            if (data.won) {
                setMessage("Congratulations! You won today's challenge!");
                playAchievement();
                playChallengeComplete();
            } else if (data.completed) {
                setMessage("Game over! Better luck tomorrow.");
                playHeartLoss();
                playWrong();
                playChallengeComplete();
            } else {
                playHeartLoss();
                setMessage("Guess submitted successfully!");
            }
        } catch {
            setMessage("Unable to submit guess. Please try again.");
            playWrong();
        } finally {
            setSubmitting(false);
        }
    }

    const remainingAttempts = Math.max(0, MAX_ATTEMPTS - attemptsUsed);
    const challengeFinished = completed || attemptsUsed >= MAX_ATTEMPTS;
    const statusType = won ? "won" : challengeFinished ? "completed" : "active";
    const statusLabel = won ? "Challenge won" : challengeFinished ? "Challenge completed" : "Live challenge";

    return (
        <section className="daily-challenge-page" aria-labelledby="daily-title">
            <div className="daily-challenge-shell">
                <header className="daily-hero">
                    <div className="daily-hero__copy">
                        <span className="daily-eyebrow"><span className="daily-live-dot" /> DAILY EVENT</span>
                        <h1 id="daily-title">Daily <span>Challenge</span></h1>
                        <p>One shared code. Five attempts. Can you crack today's number?</p>
                    </div>
                    <div className="daily-date-card" aria-label="Daily challenge">
                        <span className="daily-date-card__icon">✦</span>
                        <span>ONE CHALLENGE</span>
                        <strong>EVERY DAY</strong>
                    </div>
                </header>

                <div className="daily-layout">
                    <main className="daily-game-card">
                        <div className="daily-card-heading">
                            <div>
                                <span className="daily-section-kicker">TODAY'S MISSION</span>
                                <h2>Crack the 5-digit code</h2>
                            </div>
                            <span className={`daily-status-badge is-${statusType}`}>
                                <StatusIcon type={statusType} />{statusLabel}
                            </span>
                        </div>

                        <div className="daily-attempts-panel">
                            <div className="daily-attempts-label">
                                <span>Attempts remaining</span>
                                <strong>{remainingAttempts}<small> / {MAX_ATTEMPTS}</small></strong>
                            </div>
                            <div className="daily-attempt-bars" aria-label={`${remainingAttempts} attempts remaining`}>
                                {Array.from({ length: MAX_ATTEMPTS }, (_, index) => (
                                    <span key={index} className={index < remainingAttempts ? "is-available" : "is-used"} />
                                ))}
                            </div>
                        </div>

                        <div className="daily-input-panel">
                            <label htmlFor="daily-guess-input">ENTER YOUR GUESS</label>
                            <div className={`daily-digit-entry${guess.length === DIGIT_COUNT ? " is-complete" : ""}`}>
                                <input
                                    id="daily-guess-input"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    autoComplete="off"
                                    maxLength={DIGIT_COUNT}
                                    placeholder="· · · · ·"
                                    value={guess}
                                    onChange={(event) => setGuess(event.target.value.replace(/[^0-9]/g, "").slice(0, DIGIT_COUNT))}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter" && guess.length === DIGIT_COUNT && !loading && !submitting && !challengeFinished) {
                                            handleSubmitGuess();
                                        }
                                    }}
                                    disabled={loading || submitting || challengeFinished}
                                    aria-describedby="daily-digit-hint"
                                />
                                <span className="daily-digit-count">{guess.length}/{DIGIT_COUNT}</span>
                            </div>
                            <p id="daily-digit-hint">Use any five digits from 0–9. Leading zeroes are allowed.</p>
                            <button
                                className="daily-submit-button"
                                type="button"
                                onClick={handleSubmitGuess}
                                disabled={loading || submitting || challengeFinished || guess.length !== DIGIT_COUNT}
                            >
                                {submitting ? <><span className="daily-spinner" /> Checking guess…</> : "Submit guess"}
                                {!submitting && <span aria-hidden="true">→</span>}
                            </button>
                        </div>

                        {message && (
                            <div className={`daily-feedback${won ? " is-success" : completed ? " is-finished" : ""}`} role="status" aria-live="polite">
                                <span className="daily-feedback__icon">{won ? "✓" : completed ? "!" : "i"}</span>
                                <span>{message}</span>
                            </div>
                        )}
                    </main>

                    <aside className="daily-guide-card">
                        <span className="daily-section-kicker">HOW TO PLAY</span>
                        <h2>Read the clues</h2>
                        <p className="daily-guide-intro">Each digit gets a color after every guess.</p>
                        <div className="daily-legend-item">
                            <span className="daily-legend-tile is-green">✓</span>
                            <span><strong>Green</strong><small>Right digit, right place</small></span>
                        </div>
                        <div className="daily-legend-item">
                            <span className="daily-legend-tile is-yellow">↔</span>
                            <span><strong>Yellow</strong><small>Right digit, wrong place</small></span>
                        </div>
                        <div className="daily-legend-item">
                            <span className="daily-legend-tile is-grey">×</span>
                            <span><strong>Grey</strong><small>Digit isn't in the code</small></span>
                        </div>
                        <div className="daily-guide-note">Your daily result is shared across all players. Come back tomorrow for a new code.</div>
                    </aside>
                </div>

                <section className="daily-history-card" aria-labelledby="daily-history-title">
                    <div className="daily-history-heading">
                        <div>
                            <span className="daily-section-kicker">YOUR PROGRESS</span>
                            <h2 id="daily-history-title">Guess history</h2>
                        </div>
                        <span className="daily-history-count">{guessHistory.length} {guessHistory.length === 1 ? "GUESS" : "GUESSES"}</span>
                    </div>
                    {loading ? (
                        <div className="daily-history-loading"><span /><span /><span /><span /><span /></div>
                    ) : guessHistory.length > 0 ? (
                        <div className="daily-history-list">
                            {guessHistory.map((item, index) => (
                                <div className="daily-history-row" key={`${item.guess}-${index}`}>
                                    <span className="daily-history-number">{String(index + 1).padStart(2, "0")}</span>
                                    <div className="daily-guess-tiles">
                                        {item.guess.split("").map((digit, digitIndex) => (
                                            <span key={digitIndex} className={`daily-guess-tile ${item.feedback[digitIndex] || "grey"}`}>
                                                {digit}
                                            </span>
                                        ))}
                                    </div>
                                    <span className="daily-history-result">{item.feedback.every((color) => color === "green") ? "Solved" : "Submitted"}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="daily-history-empty">
                            <span className="daily-empty-icon">⌁</span>
                            <strong>No guesses yet</strong>
                            <p>Your attempts will appear here after your first submission.</p>
                        </div>
                    )}
                </section>
            </div>
        </section>
    );
}
