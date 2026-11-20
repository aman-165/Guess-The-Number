import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function MatchHistory() {
    const navigate = useNavigate();
    const [sortOrder, setSortOrder] = useState("newest");
    const [filterStatus, setFilterStatus] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const matchesPerPage = 5;
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [stats, setStats] = useState({ total: 0, won: 0, lost: 0, drawn: 0, winPercentage: 0 });

    const filteredMatches = useMemo(() => {
        const sorted = [...matches].sort((a, b) => sortOrder === "newest"
            ? new Date(b.created_at) - new Date(a.created_at)
            : new Date(a.created_at) - new Date(b.created_at));
        return sorted.filter((match) => filterStatus === "all" || match.result === filterStatus);
    }, [matches, sortOrder, filterStatus]);

    const totalPages = Math.ceil(filteredMatches.length / matchesPerPage);
    const paginatedMatches = filteredMatches.slice((currentPage - 1) * matchesPerPage, currentPage * matchesPerPage);

    useEffect(() => {
        if (totalPages > 0 && currentPage > totalPages) setCurrentPage(totalPages);
        if (totalPages === 0 && currentPage !== 1) setCurrentPage(1);
    }, [currentPage, totalPages]);

    const fetchMatchHistory = async () => {
        setLoading(true);
        setError("");
        setCurrentPage(1);

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            setError("Please login first.");
            setLoading(false);
            return;
        }

        const { data, error: matchError } = await supabase
            .from("matches")
            .select("id, player_one_id, player_two_id, winner_id, status, created_at, completed_at")
            .or(`player_one_id.eq.${user.id},player_two_id.eq.${user.id}`)
            .order("created_at", { ascending: false });

        if (matchError) {
            setError(matchError.message);
            setLoading(false);
            return;
        }

        if (!data || data.length === 0) {
            setMatches([]);
            setStats({ total: 0, won: 0, lost: 0, drawn: 0, winPercentage: 0 });
            setLoading(false);
            return;
        }

        const playerIds = [...new Set(data.flatMap((match) => [match.player_one_id, match.player_two_id]))];
        const { data: profiles, error: profileError } = await supabase
            .from("profiles")
            .select("id, username, full_name")
            .in("id", playerIds);

        if (profileError) {
            setError(profileError.message);
            setLoading(false);
            return;
        }

        const combinedMatches = data.map((match) => {
            const opponentId = match.player_one_id === user.id ? match.player_two_id : match.player_one_id;
            const opponent = profiles.find((profile) => profile.id === opponentId);
            let result = "In Progress";
            if (match.status === "completed") {
                if (!match.winner_id) result = "Draw";
                else if (match.winner_id === user.id) result = "Won";
                else result = "Lost";
            }
            return { ...match, opponent, result };
        });

        setMatches(combinedMatches);
        const total = combinedMatches.filter((match) => match.status === "completed").length;
        const won = combinedMatches.filter((match) => match.result === "Won").length;
        const lost = combinedMatches.filter((match) => match.result === "Lost").length;
        const drawn = combinedMatches.filter((match) => match.result === "Draw").length;
        setStats({ total, won, lost, drawn, winPercentage: total > 0 ? ((won / total) * 100).toFixed(1) : 0 });
        setLoading(false);
    };

    useEffect(() => { fetchMatchHistory(); }, []);

    const formatDate = (date) => new Date(date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

    return (
        <main className="match-history match-history-premium">
            <section className="mh-hero">
                <div>
                    <span className="mh-eyebrow">YOUR BATTLE RECORD</span>
                    <h1>Match History</h1>
                    <p>Every match tells a story. Track your wins, losses, and progress.</p>
                </div>
                <button className="mh-refresh" onClick={fetchMatchHistory} disabled={loading} aria-label="Refresh match history">
                    <span aria-hidden="true">↻</span> {loading ? "Refreshing" : "Refresh"}
                </button>
            </section>

            {!loading && !error && (
                <>
                    <section className="match-stats mh-stats" aria-label="Match statistics">
                        <div className="stat-card mh-stat"><span>COMPLETED</span><strong>{stats.total}</strong><small>Total matches</small></div>
                        <div className="stat-card mh-stat mh-stat-win"><span>VICTORIES</span><strong>{stats.won}</strong><small>Matches won</small></div>
                        <div className="stat-card mh-stat mh-stat-loss"><span>DEFEATS</span><strong>{stats.lost}</strong><small>Matches lost</small></div>
                        <div className="stat-card mh-stat"><span>DRAWS</span><strong>{stats.drawn}</strong><small>Even matches</small></div>
                        <div className="stat-card mh-stat mh-winrate"><span>WIN RATE</span><strong>{stats.winPercentage}%</strong><div className="win-rate-bar"><div className="win-rate-fill" style={{ width: `${stats.winPercentage}%` }} /></div></div>
                    </section>

                    <section className="mh-toolbar">
                        <div><h2>Battle log</h2><p>Showing {filteredMatches.length} of {matches.length} matches</p></div>
                        <div className="match-history-controls mh-controls">
                            <label>Sort <select value={sortOrder} onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label>
                            <label>Result <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}><option value="all">All matches</option><option value="Won">Won</option><option value="Lost">Lost</option><option value="Draw">Draw</option><option value="In Progress">In progress</option></select></label>
                        </div>
                    </section>
                </>
            )}

            {loading && <section className="mh-state"><div className="mh-loader" /><h3>Loading your battle record</h3><p>Gathering your match results...</p></section>}
            {error && <section className="mh-state mh-error"><h3>Couldn't load match history</h3><p>{error}</p><button className="mh-primary-btn" onClick={fetchMatchHistory}>Try again</button></section>}
            {!loading && !error && matches.length === 0 && <section className="mh-state"><div className="mh-empty-icon">⚔</div><h3>Your story starts here</h3><p>You haven't played any multiplayer matches yet. Find a player and start your first challenge.</p><button className="mh-primary-btn" onClick={() => navigate("/find-players")}>Find players</button></section>}
            {!loading && !error && matches.length > 0 && filteredMatches.length === 0 && <section className="mh-state"><div className="mh-empty-icon">⌕</div><h3>No matches in this category</h3><p>Try another result filter to see more of your battle history.</p><button className="mh-secondary-btn" onClick={() => setFilterStatus("all")}>Clear filter</button></section>}

            {!loading && !error && filteredMatches.length > 0 && (
                <>
                    <div className="match-history-list mh-list">
                        {paginatedMatches.map((match) => (
                            <article className="match-history-card mh-card" key={match.id}>
                                <div className="mh-opponent-mark" aria-hidden="true">{(match.opponent?.full_name || match.opponent?.username || "?").charAt(0).toUpperCase()}</div>
                                <div className="mh-match-main">
                                    <span className="mh-match-label">{match.status === "completed" ? "COMPLETED MATCH" : "ACTIVE MATCH"}</span>
                                    <h3>vs {match.opponent?.full_name || `@${match.opponent?.username || "Unknown player"}`}</h3>
                                    <p>@{match.opponent?.username || "unknown"} <span>·</span> {formatDate(match.completed_at || match.created_at)}</p>
                                </div>
                                <div className="mh-match-result">
                                    <span className={`result-${match.result.toLowerCase().replace(" ", "-")}`}>{match.result}</span>
                                    <small>{match.status === "completed" ? "Final result" : "Match status"}</small>
                                </div>
                                <button className="mh-view-btn" onClick={() => navigate(`/multiplayer-match/${match.id}`)} aria-label={`View match against ${match.opponent?.username || "opponent"}`}>View <span aria-hidden="true">↗</span></button>
                            </article>
                        ))}
                    </div>
                    {totalPages > 1 && <nav className="pagination-controls mh-pagination" aria-label="Match history pages"><button onClick={() => setCurrentPage((page) => page - 1)} disabled={currentPage === 1}>Previous</button><span>Page <strong>{currentPage}</strong> of {totalPages}</span><button onClick={() => setCurrentPage((page) => page + 1)} disabled={currentPage === totalPages}>Next</button></nav>}
                </>
            )}
        </main>
    );
}

export default MatchHistory;
