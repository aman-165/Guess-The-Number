import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const formatDate = (value) => {
    if (!value) return "Date unavailable";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date unavailable";
    return new Intl.DateTimeFormat(undefined, {
        day: "numeric", month: "short", year: "numeric",
        hour: "numeric", minute: "2-digit"
    }).format(date);
};

const getInitials = (name) =>
    (name || "?").trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("") || "?";

function ChallengeHistory() {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all");

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        setError("");

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            setError("Please log in to view your challenge history.");
            setChallenges([]);
            setLoading(false);
            return;
        }

        // Keep the existing history scope: accepted and rejected challenges involving this user.
        const { data, error: historyError } = await supabase
            .from("challenges")
            .select("id, challenger_id, challenged_id, status, created_at")
            .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`)
            .in("status", ["accepted", "rejected"])
            .order("created_at", { ascending: false });

        if (historyError) {
            setError(historyError.message);
            setChallenges([]);
            setLoading(false);
            return;
        }

        if (!data?.length) {
            setChallenges([]);
            setLoading(false);
            return;
        }

        const opponentIds = [...new Set(data.map((challenge) =>
            challenge.challenger_id === user.id ? challenge.challenged_id : challenge.challenger_id
        ))];

        const { data: profiles, error: profileError } = await supabase
            .from("profiles")
            .select("id, username, full_name")
            .in("id", opponentIds);

        if (profileError) {
            setError(profileError.message);
            setChallenges([]);
            setLoading(false);
            return;
        }

        const profileById = new Map((profiles || []).map((profile) => [profile.id, profile]));
        setChallenges(data.map((challenge) => {
            const opponentId = challenge.challenger_id === user.id
                ? challenge.challenged_id : challenge.challenger_id;
            return {
                ...challenge,
                opponent: profileById.get(opponentId),
                role: challenge.challenger_id === user.id ? "Sent" : "Received"
            };
        }));
        setLoading(false);
    }, []);

    useEffect(() => { fetchHistory(); }, [fetchHistory]);

    const counts = useMemo(() => ({
        all: challenges.length,
        accepted: challenges.filter((item) => item.status === "accepted").length,
        rejected: challenges.filter((item) => item.status === "rejected").length
    }), [challenges]);

    const visibleChallenges = useMemo(() => filter === "all"
        ? challenges
        : challenges.filter((item) => item.status === filter), [challenges, filter]);

    return (
        <main className="challenge-history-hub">
            <header className="challenge-history-hero">
                <div>
                    <span className="challenge-history-eyebrow">YOUR COMPETITIVE JOURNEY</span>
                    <h1>Challenge History</h1>
                    <p>Every challenge tells a story. Look back at your rivalries and results.</p>
                </div>
                <div className="challenge-history-total" aria-label={`${counts.all} recorded challenges`}>
                    <strong>{counts.all}</strong><span>RECORDED</span>
                </div>
            </header>

            <section className="challenge-history-stats" aria-label="Challenge history summary">
                <article className="challenge-history-stat is-total"><span>Total history</span><strong>{counts.all}</strong></article>
                <article className="challenge-history-stat is-accepted"><span>Accepted</span><strong>{counts.accepted}</strong></article>
                <article className="challenge-history-stat is-rejected"><span>Declined</span><strong>{counts.rejected}</strong></article>
            </section>

            <div className="challenge-history-toolbar">
                <div>
                    <h2>Past challenges</h2>
                    <p>Showing completed decisions, newest first</p>
                </div>
                <button className="challenge-history-refresh" type="button" onClick={fetchHistory} disabled={loading} aria-label="Refresh challenge history" title="Refresh">
                    ↻
                </button>
            </div>

            <div className="challenge-history-filters" role="group" aria-label="Filter challenge history">
                {[
                    { id: "all", label: "All", count: counts.all },
                    { id: "accepted", label: "Accepted", count: counts.accepted },
                    { id: "rejected", label: "Declined", count: counts.rejected }
                ].map((item) => (
                    <button key={item.id} type="button" className={filter === item.id ? "is-active" : ""} onClick={() => setFilter(item.id)} aria-pressed={filter === item.id}>
                        {item.label}<span>{item.count}</span>
                    </button>
                ))}
            </div>

            {error && (
                <div className="challenge-history-message is-error" role="alert">
                    <span>{error}</span><button type="button" onClick={fetchHistory}>Try again</button>
                </div>
            )}

            {loading && (
                <div className="challenge-history-list" aria-label="Loading challenge history">
                    {[1, 2, 3].map((item) => <div className="challenge-history-skeleton" key={item}><span /><div><i /><i /><i /></div></div>)}
                </div>
            )}

            {!loading && !error && challenges.length === 0 && (
                <div className="challenge-history-empty">
                    <div className="challenge-history-empty-icon">◷</div>
                    <h2>Your story starts here</h2>
                    <p>Accepted and declined challenges will appear here once you start connecting with other players.</p>
                    <Link to="/find-players">Find players</Link>
                </div>
            )}

            {!loading && !error && challenges.length > 0 && visibleChallenges.length === 0 && (
                <div className="challenge-history-empty is-compact">
                    <h2>No {filter === "accepted" ? "accepted" : "declined"} challenges yet</h2>
                    <p>Try another filter to see your challenge activity.</p>
                </div>
            )}

            {!loading && !error && visibleChallenges.length > 0 && (
                <div className="challenge-history-list">
                    {visibleChallenges.map((challenge) => {
                        const opponentName = challenge.opponent?.full_name || "Unknown Player";
                        const accepted = challenge.status === "accepted";
                        return (
                            <article className="challenge-history-card" key={challenge.id}>
                                <div className="challenge-history-player">
                                    <div className="challenge-history-avatar" aria-hidden="true">{getInitials(opponentName)}</div>
                                    <div className="challenge-history-player-info">
                                        <h3>{opponentName}</h3>
                                        <p>@{challenge.opponent?.username || "unknown"}</p>
                                    </div>
                                    <span className={`challenge-history-status ${accepted ? "is-accepted" : "is-rejected"}`}>
                                        <i />{accepted ? "Accepted" : "Declined"}
                                    </span>
                                </div>
                                <div className="challenge-history-card-footer">
                                    <span className="challenge-history-direction">{challenge.role === "Sent" ? "↗ You sent a challenge" : "↙ Challenge received"}</span>
                                    <time dateTime={challenge.created_at}>{formatDate(challenge.created_at)}</time>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </main>
    );
}

export default ChallengeHistory;
