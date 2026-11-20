import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useSound } from "../context/SoundContext";

const getInitials = (name = "Player") =>
    name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "P";

const formatChallengeDate = (value) => {
    if (!value) return "Recently";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Recently";
    return new Intl.DateTimeFormat(undefined, {
        day: "numeric", month: "short", hour: "numeric", minute: "2-digit"
    }).format(date);
};

function IncomingChallenges() {
    const { playChallengeStart } = useSound();
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [processingId, setProcessingId] = useState(null);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const [startingId, setStartingId] = useState(null);

    // Existing Supabase fetch flow retained.
    const fetchChallenges = async () => {
        setLoading(true);
        setError("");
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            setError("Please login first.");
            setLoading(false);
            return;
        }

        const { data, error: challengeError } = await supabase
            .from("challenges")
            .select("id, challenger_id, status, created_at")
            .eq("challenged_id", user.id)
            .order("created_at", { ascending: false });

        if (challengeError) {
            setError(challengeError.message);
            setLoading(false);
            return;
        }
        if (!data || data.length === 0) {
            setChallenges([]);
            setLoading(false);
            return;
        }

        const challengerIds = data.map((challenge) => challenge.challenger_id);
        const { data: profiles, error: profileError } = await supabase
            .from("profiles")
            .select("id, username, full_name, avatar_url")
            .in("id", challengerIds);

        if (profileError) {
            setError(profileError.message);
            setLoading(false);
            return;
        }

        const combinedChallenges = data.map((challenge) => ({
            ...challenge,
            profile: profiles.find((profile) => profile.id === challenge.challenger_id),
        }));
        setChallenges(combinedChallenges);
        setLoading(false);
    };

    // Existing accept/reject update flow retained.
    const handleChallenge = async (challengeId, newStatus) => {
        setProcessingId(challengeId);
        setMessage("");
        setError("");
        const { data, error } = await supabase
            .from("challenges")
            .update({ status: newStatus })
            .eq("id", challengeId)
            .eq("status", "pending")
            .select("id")
            .maybeSingle();

        if (error) {
            setError(error.message);
        } else if (!data) {
            setError("Unable to update challenge. Please refresh.");
        } else {
            setMessage(newStatus === "accepted" ? "Challenge accepted!" : "Challenge rejected.");
            await fetchChallenges();
        }
        setProcessingId(null);
    };

    // Existing match creation and navigation retained.
    const startMatch = async (challengeId) => {
        setStartingId(challengeId);
        setError("");
        const { data: matchId, error } = await supabase.rpc(
            "create_match_from_challenge", { p_challenge_id: challengeId }
        );
        if (error) {
            setError(error.message);
            setStartingId(null);
            return;
        }
        if (!matchId) {
            setError("Unable to create or find the match.");
            setStartingId(null);
            return;
        }
        playChallengeStart();
        navigate(`/multiplayer-match/${matchId}`);
    };

    useEffect(() => { fetchChallenges(); }, []);

    const pendingCount = challenges.filter((item) => item.status === "pending").length;
    const acceptedCount = challenges.filter((item) => item.status === "accepted").length;

    return (
        <main className="incoming-challenge-hub">
            <header className="incoming-challenge-hero">
                <div>
                    <span className="incoming-challenge-eyebrow">YOUR NEXT MATCH STARTS HERE</span>
                    <h1>Incoming Challenges</h1>
                    <p>Players are ready to face you. Accept a challenge and jump into the arena.</p>
                </div>
                <div className="incoming-challenge-counts" aria-label="Challenge summary">
                    <div className="incoming-challenge-count incoming-challenge-count--pending">
                        <strong>{pendingCount}</strong><span>Pending</span>
                    </div>
                    <div className="incoming-challenge-count">
                        <strong>{acceptedCount}</strong><span>Accepted</span>
                    </div>
                    <button className="incoming-challenge-refresh" type="button" onClick={fetchChallenges} disabled={loading} aria-label="Refresh challenges" title="Refresh challenges">
                        ↻
                    </button>
                </div>
            </header>

            <div className="incoming-challenge-section-heading">
                <div><h2>Your challenge inbox</h2><span>{challenges.length} {challenges.length === 1 ? "challenge" : "challenges"}</span></div>
                <span className="incoming-challenge-live"><i /> Updates when refreshed</span>
            </div>

            {message && <div className="incoming-challenge-notice incoming-challenge-notice--success" role="status">{message}</div>}
            {error && <div className="incoming-challenge-notice incoming-challenge-notice--error" role="alert"><span>{error}</span><button type="button" onClick={fetchChallenges}>Try again</button></div>}

            {loading ? (
                <div className="incoming-challenge-list" aria-label="Loading challenges">
                    {[1, 2].map((item) => <div className="incoming-challenge-skeleton" key={item}><span /><div><i /><i /><i /></div></div>)}
                </div>
            ) : !error && challenges.length === 0 ? (
                <section className="incoming-challenge-empty">
                    <div className="incoming-challenge-empty-icon">⚔</div>
                    <h2>No challenges yet</h2>
                    <p>When a player challenges you, their invitation will appear here. Ready to find your next rival?</p>
                    <button type="button" onClick={() => navigate("/search-players")}>Find players <span>↗</span></button>
                </section>
            ) : (
                <div className="incoming-challenge-list">
                    {challenges.map((challenge) => {
                        const playerName = challenge.profile?.full_name || "Unknown Player";
                        const isPending = challenge.status === "pending";
                        const isAccepted = challenge.status === "accepted";
                        const isRejected = challenge.status === "rejected";
                        return (
                            <article className={`incoming-challenge-card ${isPending ? "is-pending" : ""}`} key={challenge.id}>
                                <div className="incoming-challenge-player">
                                    <div className="incoming-challenge-avatar">
                                        {challenge.profile?.avatar_url ? <img src={challenge.profile.avatar_url} alt={`${playerName} avatar`} /> : <span>{getInitials(playerName)}</span>}
                                    </div>
                                    <div className="incoming-challenge-player-info">
                                        <h3>{playerName}</h3>
                                        <p>@{challenge.profile?.username || "unknown"}</p>
                                        <span className="incoming-challenge-time">Received {formatChallengeDate(challenge.created_at)}</span>
                                    </div>
                                    <span className={`incoming-challenge-status ${isPending ? "status-pending" : isAccepted ? "status-accepted" : "status-rejected"}`}>
                                        {isPending ? "Pending" : isAccepted ? "Accepted" : isRejected ? "Declined" : challenge.status}
                                    </span>
                                </div>
                                <div className="incoming-challenge-card-bottom">
                                    <p><span>⚔</span> Challenged you to a number duel</p>
                                    <div className="incoming-challenge-actions">
                                        {isPending && <>
                                            <button className="incoming-challenge-accept" type="button" onClick={() => handleChallenge(challenge.id, "accepted")} disabled={processingId === challenge.id || startingId === challenge.id}>
                                                {processingId === challenge.id ? "Processing…" : "Accept challenge"}
                                            </button>
                                            <button className="incoming-challenge-decline" type="button" onClick={() => handleChallenge(challenge.id, "rejected")} disabled={processingId === challenge.id || startingId === challenge.id}>Decline</button>
                                        </>}
                                        {isAccepted && <button className="incoming-challenge-accept" type="button" onClick={() => startMatch(challenge.id)} disabled={startingId === challenge.id}>
                                            {startingId === challenge.id ? "Starting match…" : "Start match →"}
                                        </button>}
                                        {isRejected && <span className="incoming-challenge-final-state">You declined this challenge</span>}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </main>
    );
}

export default IncomingChallenges;
