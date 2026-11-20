import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useSound } from "../context/SoundContext";

const getInitials = (name = "Player") => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "P";
const formatChallengeDate = (value) => {
    if (!value) return "Recently sent";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Recently sent" : new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(date);
};
const statusLabel = (status) => ({ pending: "Awaiting response", accepted: "Accepted", rejected: "Declined" })[status] || status || "Unknown";

function OutgoingChallenges() {
    const { playChallengeStart } = useSound();
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [cancellingId, setCancellingId] = useState(null);
    const [startingId, setStartingId] = useState(null);
    const navigate = useNavigate();

    const fetchChallenges = useCallback(async () => {
        setLoading(true); setError("");
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) { setError("Please login first."); setLoading(false); return; }
        const { data, error: challengeError } = await supabase.from("challenges").select("id, challenged_id, status, created_at").eq("challenger_id", user.id).order("created_at", { ascending: false });
        if (challengeError) { setError(challengeError.message); setLoading(false); return; }
        if (!data?.length) { setChallenges([]); setLoading(false); return; }
        const receiverIds = [...new Set(data.map((item) => item.challenged_id))];
        const { data: profiles, error: profileError } = await supabase.from("profiles").select("id, username, full_name, avatar_url").in("id", receiverIds);
        if (profileError) { setError(profileError.message); setLoading(false); return; }
        setChallenges(data.map((challenge) => ({ ...challenge, profile: profiles?.find((profile) => profile.id === challenge.challenged_id) })));
        setLoading(false);
    }, []);

    const cancelChallenge = async (challengeId) => {
        if (!window.confirm("Are you sure you want to cancel this challenge?")) return;
        setCancellingId(challengeId); setError(""); setNotice("");
        const { error: deleteError } = await supabase.from("challenges").delete().eq("id", challengeId).eq("status", "pending");
        if (deleteError) setError(deleteError.message);
        else { setNotice("Challenge cancelled."); await fetchChallenges(); }
        setCancellingId(null);
    };

    const startMatch = async (challengeId) => {
        setStartingId(challengeId); setError("");
        const { data: matchId, error: rpcError } = await supabase.rpc("create_match_from_challenge", { p_challenge_id: challengeId });
        if (rpcError) { setError(rpcError.message); setStartingId(null); return; }
        if (!matchId) { setError("Unable to create or find the match."); setStartingId(null); return; }
        playChallengeStart();
        navigate(`/multiplayer-match/${matchId}`);
    };

    useEffect(() => { fetchChallenges(); }, [fetchChallenges]);
    const counts = useMemo(() => ({ total: challenges.length, pending: challenges.filter((item) => item.status === "pending").length, accepted: challenges.filter((item) => item.status === "accepted").length }), [challenges]);

    return <main className="outgoing-challenge-hub">
        <header className="outgoing-challenge-hero"><div><span className="outgoing-challenge-eyebrow">YOUR CHALLENGE TRACKER</span><h1>Outgoing Challenges</h1><p>Keep track of the rivals you have challenged. Your next match could be one response away.</p></div>
            <div className="outgoing-challenge-counts" aria-label="Challenge summary">
                <div className="outgoing-challenge-count outgoing-count-total"><strong>{counts.total}</strong><span>Sent</span></div><div className="outgoing-challenge-count"><strong>{counts.pending}</strong><span>Pending</span></div><div className="outgoing-challenge-count"><strong>{counts.accepted}</strong><span>Accepted</span></div>
                <button className="outgoing-challenge-refresh" onClick={fetchChallenges} disabled={loading} aria-label="Refresh challenges" title="Refresh">↻</button>
            </div>
        </header>
        {notice && <div className="outgoing-challenge-notice outgoing-notice-success" role="status">{notice}<button onClick={() => setNotice("")} aria-label="Dismiss">×</button></div>}
        {error && <div className="outgoing-challenge-notice outgoing-notice-error" role="alert">{error}<button onClick={() => setError("")} aria-label="Dismiss">×</button></div>}
        <section><div className="outgoing-challenge-section-heading"><div><h2>Your sent challenges</h2><span>{counts.total} total</span></div><small>Newest challenges appear first</small></div>
            {loading ? <div className="outgoing-challenge-list" aria-label="Loading challenges">{[1, 2].map((item) => <div className="outgoing-challenge-skeleton" key={item}><span /><div><i /><i /><i /></div></div>)}</div>
                : challenges.length === 0 && !error ? <div className="outgoing-challenge-empty"><div className="outgoing-challenge-empty-icon">⚔</div><h2>No outgoing challenges yet</h2><p>Find a player, send your first challenge, and they’ll appear here while you wait for their response.</p><button onClick={() => navigate("/find-players")}>＋ Find players</button></div>
                    : <div className="outgoing-challenge-list">{challenges.map((challenge) => {
                        const profile = challenge.profile; const status = challenge.status || "unknown"; const canCancel = status === "pending"; const canStart = status === "accepted";
                        return <article className={`outgoing-challenge-card is-${status}`} key={challenge.id}>
                            <div className="outgoing-challenge-player"><div className="outgoing-challenge-avatar">{profile?.avatar_url ? <img src={profile.avatar_url} alt={`${profile.full_name || profile.username || "Player"}'s avatar`} /> : <span>{getInitials(profile?.full_name || profile?.username)}</span>}</div>
                                <div className="outgoing-challenge-player-info"><h3>{profile?.full_name || "Unknown Player"}</h3><p>@{profile?.username || "unknown"}</p><small>Sent {formatChallengeDate(challenge.created_at)}</small></div>
                                <span className={`outgoing-challenge-status status-${status}`}>{statusLabel(status)}</span>
                            </div>
                            <div className="outgoing-challenge-card-bottom"><p>{status === "pending" ? "Waiting for this player to respond" : status === "accepted" ? "Your challenge is accepted. Ready to play?" : status === "rejected" ? "This player declined the challenge" : "Challenge status updated"}</p>
                                <div className="outgoing-challenge-actions">{canStart && <button className="outgoing-challenge-start" onClick={() => startMatch(challenge.id)} disabled={startingId === challenge.id}>{startingId === challenge.id ? "Starting match…" : "⚔ Start match"}</button>}
                                    {canCancel && <button className="outgoing-challenge-cancel" onClick={() => cancelChallenge(challenge.id)} disabled={cancellingId === challenge.id}>{cancellingId === challenge.id ? "Cancelling…" : "Cancel challenge"}</button>}
                                    {!canStart && !canCancel && <span className="outgoing-challenge-final-state">{statusLabel(status)}</span>}
                                </div>
                            </div>
                        </article>;
                    })}</div>}
        </section>
    </main>;
}
export default OutgoingChallenges;
