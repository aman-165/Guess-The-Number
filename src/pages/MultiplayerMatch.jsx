
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useSound } from "../context/SoundContext";

function MultiplayerMatch() {
    const { matchId } = useParams();

    const [match, setMatch] = useState(null);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentUserId, setCurrentUserId] = useState(null);
    const [guess, setGuess] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [gameMessage, setGameMessage] = useState("");
    const [guessHistory, setGuessHistory] = useState([]);
    const { playCorrect, playWrong, playWin, playLose } = useSound();

    const fetchMatch = async () => {
        setLoading(true);
        setError("");

        const { data, error: matchError } = await supabase
            .from("matches")
            .select(`
                id,
                player_one_id,
                player_two_id,
                current_turn,
                status,
                winner_id,
                created_at
            `)
            .eq("id", matchId)
            .maybeSingle();

        if (matchError || !data) {
            setError(matchError?.message || "Match not found.");
            setLoading(false);
            return;
        }

        setMatch(data);

        const playerIds = [
            data.player_one_id,
            data.player_two_id
        ];

        const { data: profiles, error: profileError } =
            await supabase
                .from("profiles")
                .select("id, username, full_name")
                .in("id", playerIds);

        if (profileError) {
            setError(profileError.message);
            setLoading(false);
            return;
        }

        setPlayers(profiles || []);
        setLoading(false);
    };

    const fetchGuessHistory = async () => {
        const { data, error } = await supabase
            .from("match_guesses")
            .select("id, player_id, guess, feedback, attempt_number, created_at")
            .eq("match_id", matchId)
            .order("attempt_number", { ascending: true });

        if (error) {
            setError(error.message);
            return;
        }

        setGuessHistory(data || []);
    };

    useEffect(() => {
        fetchGuessHistory();
    }, [matchId]);

    useEffect(() => {
        fetchMatch();
    }, [matchId]);

    useEffect(() => {
        const channel = supabase
            .channel(`match-guesses-${matchId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "match_guesses",
                    filter: `match_id=eq.${matchId}`,
                },
                () => {
                    fetchGuessHistory();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [matchId]);

    useEffect(() => {
        const channel = supabase
            .channel(`match-${matchId}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "matches",
                    filter: `id=eq.${matchId}`,
                },
                (payload) => {
                    setMatch(payload.new);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [matchId]);

    useEffect(() => {
        const getCurrentUser = async () => {
            const { data: { user } } =
                await supabase.auth.getUser();

            setCurrentUserId(user?.id || null);
        };

        getCurrentUser();
    }, []);

    const submitGuess = async (e) => {
        e.preventDefault();

        if (!/^[0-9]{5}$/.test(guess)) {
            setGameMessage("Enter a valid 5-digit number.");
            playWrong();
            return;
        }

        setSubmitting(true);
        setGameMessage("");

        const { data, error } = await supabase.rpc(
            "submit_match_guess",
            {
                p_match_id: matchId,
                p_guess: guess,
            }
        );

        if (error) {
            setGameMessage(error.message);
        }
        else {
            await fetchGuessHistory();
            if (data.status === "completed" && data.winner_id) {
                if (data.winner_id === currentUserId) playWin();
                else playLose();
            } else if (Array.isArray(data.feedback) && data.feedback.some((status) => status === "green" || status === "yellow")) {
                playCorrect();
            } else {
                playWrong();
            }
            setGameMessage(
                data.status === "completed"
                    ? data.winner_id
                        ? "Congratulations! You won!"
                        : "Match completed. It's a draw!"
                    : "Guess submitted successfully!"
            );

            setGuess("");
        }

        setSubmitting(false);
    };
    if (loading) {
        return (
            <main className="match-room match-room--loading" aria-live="polite">
                <div className="match-room__skeleton match-room__skeleton--title" />
                <div className="match-room__skeleton match-room__skeleton--players" />
                <div className="match-room__skeleton match-room__skeleton--board" />
                <p>Preparing your match room…</p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="match-room match-room--message">
                <span className="match-room__eyebrow">MULTIPLAYER ARENA</span>
                <h1>Match unavailable</h1>
                <p>{error}</p>
                <button type="button" onClick={fetchMatch}>Try again</button>
            </main>
        );
    }

    if (!match) {
        return <main className="match-room match-room--message"><h1>Match not found</h1></main>;
    }

    const playerOne = players.find((player) => player.id === match.player_one_id);
    const playerTwo = players.find((player) => player.id === match.player_two_id);
    const currentPlayer = players.find((player) => player.id === match.current_turn);
    const playerOneAttempts = guessHistory.filter((item) => item.player_id === match.player_one_id).length;
    const playerTwoAttempts = guessHistory.filter((item) => item.player_id === match.player_two_id).length;
    const isMyTurn = match.status === "active" && match.current_turn === currentUserId;
    const opponent = currentUserId === match.player_one_id ? playerTwo : playerOne;
    const myAttempts = currentUserId === match.player_one_id ? playerOneAttempts : playerTwoAttempts;
    const opponentAttempts = currentUserId === match.player_one_id ? playerTwoAttempts : playerOneAttempts;
    const statusLabel = match.status === "completed" ? "COMPLETED" : "LIVE MATCH";

    const renderPlayer = (player, playerId, attempts, position) => (
        <section className={`match-player ${match.current_turn === playerId && match.status === "active" ? "is-active" : ""} ${playerId === currentUserId ? "is-self" : ""}`} key={playerId}>
            <div className="match-player__topline">
                <span>{position}</span>
                {playerId === currentUserId && <span className="match-player__you">YOU</span>}
            </div>
            <div className="match-player__identity">
                <div className="match-player__avatar">{(player?.full_name || player?.username || "P").slice(0, 1).toUpperCase()}</div>
                <div className="match-player__name-wrap">
                    <strong>{player?.full_name || player?.username || "Loading player"}</strong>
                    <span>@{player?.username || "player"}</span>
                </div>
            </div>
            <div className="match-player__stats">
                <span><b>{attempts}</b> / 5 used</span>
                <span><b>{Math.max(0, 5 - attempts)}</b> left</span>
            </div>
            {match.status === "active" && (
                <div className={`match-player__turn ${match.current_turn === playerId ? "is-current" : ""}`}>
                    <i />{match.current_turn === playerId ? "Playing now" : "Waiting"}
                </div>
            )}
        </section>
    );

    return (
        <main className="match-room">
            <header className="match-room__header">
                <div>
                    <span className="match-room__eyebrow">MULTIPLAYER ARENA</span>
                    <h1>Head-to-head <span>match</span></h1>
                    <p>Take turns, read the clues, and crack the five-digit code.</p>
                </div>
                <div className={`match-room__live ${match.status === "completed" ? "is-complete" : ""}`}><i />{statusLabel}</div>
            </header>

            <div className="match-room__meta"><span>ROOM ID</span><code>{match.id}</code></div>

            <section className="match-room__versus" aria-label="Match players">
                {renderPlayer(playerOne, match.player_one_id, playerOneAttempts, "PLAYER 01")}
                <div className="match-room__versus-mark">VS</div>
                {renderPlayer(playerTwo, match.player_two_id, playerTwoAttempts, "PLAYER 02")}
            </section>

            <section className={`match-turn-banner ${match.status === "completed" ? "is-complete" : isMyTurn ? "is-yours" : "is-waiting"}`} aria-live="polite">
                <div className="match-turn-banner__icon">{match.status === "completed" ? "✦" : isMyTurn ? "⚡" : "◷"}</div>
                <div>
                    <strong>{match.status === "completed" ? "Match finished" : isMyTurn ? "Your turn — make it count" : "Opponent's turn"}</strong>
                    <span>{match.status === "completed" ? "The final result is ready below." : isMyTurn ? "Enter your five-digit guess to continue." : `Waiting for ${currentPlayer?.username || "your opponent"} to submit a guess.`}</span>
                </div>
            </section>

            {match.status === "active" && isMyTurn && (
                <form className="match-guess-panel" onSubmit={submitGuess}>
                    <div className="match-guess-panel__heading">
                        <div><span className="match-room__eyebrow">YOUR MOVE</span><h2>Enter your guess</h2></div>
                        <span className="match-guess-panel__attempts">{Math.max(0, 5 - myAttempts)} attempts left</span>
                    </div>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]{5}"
                        maxLength="5"
                        autoComplete="one-time-code"
                        aria-label="Enter a five-digit guess"
                        placeholder="_  _  _  _  _"
                        value={guess}
                        onChange={(e) => setGuess(e.target.value.replace(/[^0-9]/g, ""))}
                    />
                    <p className="match-guess-panel__hint">Use any five digits from 0–9. No leading-zero restriction.</p>
                    <button type="submit" disabled={submitting || guess.length !== 5}>
                        {submitting ? "Submitting guess…" : "Submit guess  →"}
                    </button>
                </form>
            )}

            {match.status === "active" && !isMyTurn && (
                <div className="match-wait-panel"><span className="match-wait-panel__pulse" /><div><strong>You're up next</strong><p>Your input will be enabled as soon as the other player finishes their turn.</p></div></div>
            )}

            {gameMessage && <div className="match-feedback-message" role="status">{gameMessage}</div>}

            <section className="match-history">
                <div className="match-history__heading"><div><span className="match-room__eyebrow">THE PLAY-BY-PLAY</span><h2>Guess history</h2></div><span>{guessHistory.length} / 10 guesses</span></div>
                {guessHistory.length === 0 ? (
                    <div className="match-history__empty"><span>◎</span><strong>No moves yet</strong><p>The first guess will appear here once a player makes a move.</p></div>
                ) : (
                    <div className="match-history__list">
                        {guessHistory.map((item) => {
                            const player = players.find((p) => p.id === item.player_id);
                            return (
                                <article key={item.id} className={`match-guess-row ${item.player_id === currentUserId ? "is-mine" : ""}`}>
                                    <div className="match-guess-row__info"><strong>{player?.username || "Player"}</strong><span>Attempt {item.attempt_number}{item.player_id === currentUserId ? " · You" : ""}</span></div>
                                    <div className="match-guess-row__digits" aria-label={`Guess ${item.guess}`}>
                                        {item.feedback.map((color, index) => <span key={index} className={`feedback-${color}`} title={color}>{item.guess[index]}</span>)}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
                <div className="match-history__legend"><span><i className="feedback-green" />Correct spot</span><span><i className="feedback-yellow" />Wrong spot</span><span><i className="feedback-grey" />Not in code</span></div>
            </section>

            {match.status === "completed" && (
                <section className="match-result-panel" aria-live="polite">
                    <span className="match-room__eyebrow">FINAL RESULT</span>
                    <h2>{!match.winner_id ? "It's a draw!" : match.winner_id === currentUserId ? "Victory is yours!" : "Good game!"}</h2>
                    <p>{!match.winner_id ? "Both players finish level. Run it back?" : `${players.find((player) => player.id === match.winner_id)?.username || "A player"} won this match.`}</p>
                </section>
            )}
        </main>
    );
}


export default MultiplayerMatch;
