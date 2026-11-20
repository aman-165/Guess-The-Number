// import { useCallback, useMemo, useState } from "react";
// import { Link } from "react-router-dom";
// import { supabase } from "../lib/supabaseClient";
// import { useToast } from "../context/ToastContext";

// function PlayerAvatar({ player }) {
//     const name = player.full_name || player.username || "Player";
//     return (
//         <span className="player-hub__avatar">
//             {player.avatar_url ? <img src={player.avatar_url} alt={`${name}'s avatar`} /> : <span aria-hidden="true">{name.trim().charAt(0).toUpperCase()}</span>}
//         </span>
//     );
// }

// function SearchPlayers() {
//     const { toast } = useToast();
//     const [term, setTerm] = useState("");
//     const [players, setPlayers] = useState([]);
//     const [relationships, setRelationships] = useState({});
//     const [loading, setLoading] = useState(false);
//     const [searched, setSearched] = useState(false);
//     const [error, setError] = useState("");
//     const [sendingTo, setSendingTo] = useState(null);

//     const searchPlayers = useCallback(async (event) => {
//         event?.preventDefault();
//         const query = term.trim();
//         if (query.length < 2) {
//             setError("Enter at least 2 characters to find players.");
//             setPlayers([]);
//             setSearched(false);
//             return;
//         }

//         setLoading(true);
//         setError("");
//         const { data: { user }, error: userError } = await supabase.auth.getUser();
//         if (userError || !user) {
//             setError("Please log in to find players.");
//             setPlayers([]);
//             setLoading(false);
//             return;
//         }

//         // Search both public profile fields separately to avoid interpolating user text into a PostgREST OR expression.
//         const pattern = `%${query}%`;
//         const [usernameResult, nameResult, relationResult] = await Promise.all([
//             supabase.from("profiles").select("id, username, full_name, avatar_url").ilike("username", pattern).neq("id", user.id).limit(30),
//             supabase.from("profiles").select("id, username, full_name, avatar_url").ilike("full_name", pattern).neq("id", user.id).limit(30),
//             supabase.from("friendships").select("id, requester_id, receiver_id, status").or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`),
//         ]);

//         const queryError = usernameResult.error || nameResult.error || relationResult.error;
//         if (queryError) {
//             setError(queryError.message || "Unable to search players right now.");
//             setPlayers([]);
//             setRelationships({});
//         } else {
//             const merged = new Map();
//             [...(usernameResult.data || []), ...(nameResult.data || [])].forEach((profile) => merged.set(profile.id, profile));
//             const foundPlayers = [...merged.values()].sort((a, b) => (a.full_name || a.username || "").localeCompare(b.full_name || b.username || ""));
//             const relationMap = {};
//             (relationResult.data || []).forEach((relation) => {
//                 const otherId = relation.requester_id === user.id ? relation.receiver_id : relation.requester_id;
//                 relationMap[otherId] = {
//                     status: relation.status,
//                     direction: relation.requester_id === user.id ? "sent" : "received",
//                     id: relation.id,
//                 };
//             });
//             setPlayers(foundPlayers);
//             setRelationships(relationMap);
//             setSearched(true);
//         }
//         setLoading(false);
//     }, [term]);

//     const sendFriendRequest = async (receiverId) => {
//         setSendingTo(receiverId);
//         const { data: { user }, error: userError } = await supabase.auth.getUser();
//         if (userError || !user) {
//             toast("Please log in to send a friend request.", "error");
//             setSendingTo(null);
//             return;
//         }

//         const existing = relationships[receiverId];
//         if (existing) {
//             toast(existing.status === "accepted" ? "You are already friends." : "A friend request already exists.", "info");
//             setSendingTo(null);
//             return;
//         }

//         const { error: insertError } = await supabase.from("friendships").insert({
//             requester_id: user.id,
//             receiver_id: receiverId,
//             status: "pending",
//         });

//         if (insertError) {
//             toast(insertError.code === "23505" ? "A friend request already exists." : insertError.message, "error");
//         } else {
//             setRelationships((current) => ({ ...current, [receiverId]: { status: "pending", direction: "sent" } }));
//             toast("Friend request sent.", "success");
//         }
//         setSendingTo(null);
//     };

//     const resultLabel = useMemo(() => {
//         if (!searched) return "Search by name or username";
//         return `${players.length} ${players.length === 1 ? "player" : "players"} found`;
//     }, [players.length, searched]);

//     return (
//         <main className="player-hub">
//             <header className="player-hub__hero">
//                 <div>
//                     <p className="player-hub__eyebrow">EXPAND YOUR SQUAD</p>
//                     <h1>Find Players</h1>
//                     <p className="player-hub__subtitle">Discover players, check their profiles, and send a friend request.</p>
//                 </div>
//                 <Link className="player-hub__requests" to="/friend-requests">Friend requests <span>↗</span></Link>
//             </header>

//             <form className="player-hub__search" onSubmit={searchPlayers}>
//                 <span className="player-hub__search-icon" aria-hidden="true">⌕</span>
//                 <input
//                     type="search"
//                     value={term}
//                     onChange={(event) => setTerm(event.target.value)}
//                     placeholder="Search by player name or username..."
//                     aria-label="Search players by name or username"
//                     maxLength={40}
//                 />
//                 {term && <button className="player-hub__clear" type="button" onClick={() => { setTerm(""); setPlayers([]); setError(""); setSearched(false); }} aria-label="Clear search">×</button>}
//                 <button className="player-hub__submit" type="submit" disabled={loading}>{loading ? "Searching…" : "⌕ Search"}</button>
//             </form>

//             <div className="player-hub__result-heading">
//                 <h2>{searched ? "Search results" : "Discover your next rival"}</h2>
//                 <span>{resultLabel}</span>
//             </div>

//             {error && <div className="player-hub__error" role="alert">{error}</div>}
//             {loading ? (
//                 <div className="player-hub__grid" aria-label="Searching players">
//                     {[1, 2, 3].map((item) => <div className="player-hub__skeleton" key={item}><i /><span /><span /></div>)}
//                 </div>
//             ) : searched && !error && players.length === 0 ? (
//                 <section className="player-hub__empty">
//                     <span aria-hidden="true">⌕</span>
//                     <h2>No players found</h2>
//                     <p>Try a different name or username. Check the spelling and search again.</p>
//                 </section>
//             ) : searched && !error ? (
//                 <section className="player-hub__grid" aria-label="Player search results">
//                     {players.map((player) => {
//                         const relation = relationships[player.id];
//                         const isFriend = relation?.status === "accepted";
//                         const isPending = relation?.status === "pending";
//                         const isClosed = relation?.status === "rejected";
//                         const incoming = isPending && relation.direction === "received";
//                         return (
//                             <article className="player-hub__card" key={player.id}>
//                                 <div className="player-hub__card-top">
//                                     <PlayerAvatar player={player} />
//                                     <span className="player-hub__status"><i /> PLAYER</span>
//                                 </div>
//                                 <div className="player-hub__identity">
//                                     <h3>{player.full_name || "Player"}</h3>
//                                     <p>@{player.username || "unknown"}</p>
//                                 </div>
//                                 <div className="player-hub__actions">
//                                     <Link className="player-hub__profile" to={`/player/${player.id}`}>View profile <span>↗</span></Link>
//                                     {isFriend ? (
//                                         <Link className="player-hub__connected" to="/friends">✓ Friends</Link>
//                                     ) : isPending ? (
//                                         <Link className="player-hub__pending" to="/friend-requests">{incoming ? "Respond" : "Request sent"} ↗</Link>
//                                     ) : isClosed ? (
//                                         <span className="player-hub__closed">Request closed</span>
//                                     ) : (
//                                         <button className="player-hub__add" type="button" onClick={() => sendFriendRequest(player.id)} disabled={sendingTo === player.id}>
//                                             {sendingTo === player.id ? "Sending…" : "+ Add friend"}
//                                         </button>
//                                     )}
//                                 </div>
//                             </article>
//                         );
//                     })}
//                 </section>
//             ) : (
//                 <section className="player-hub__empty player-hub__empty--welcome">
//                     <span aria-hidden="true">◎</span>
//                     <h2>Find your next opponent</h2>
//                     <p>Search using at least two characters from a player's name or username to discover their profile and connect.</p>
//                 </section>
//             )}
//         </main>
//     );
// }

// export default SearchPlayers;

import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useToast } from "../context/ToastContext";

function PlayerAvatar({ player }) {
    const name = player.full_name || player.username || "Player";
    return (
        <span className="player-hub__avatar">
            {player.avatar_url ? <img src={player.avatar_url} alt={`${name}'s avatar`} /> : <span aria-hidden="true">{name.trim().charAt(0).toUpperCase()}</span>}
        </span>
    );
}

function SearchPlayers() {
    const { toast } = useToast();
    const [term, setTerm] = useState("");
    const [players, setPlayers] = useState([]);
    const [relationships, setRelationships] = useState({});
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState("");
    const [sendingTo, setSendingTo] = useState(null);

    const searchPlayers = useCallback(async (event) => {
        event?.preventDefault();
        const query = term.trim();
        if (query.length < 2) {
            setError("Enter at least 2 characters to find players.");
            setPlayers([]);
            setSearched(false);
            return;
        }

        setLoading(true);
        setError("");
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            setError("Please log in to find players.");
            setPlayers([]);
            setLoading(false);
            return;
        }

        // Search both public profile fields separately to avoid interpolating user text into a PostgREST OR expression.
        const pattern = `%${query}%`;
        const [usernameResult, nameResult, relationResult] = await Promise.all([
            supabase.from("profiles").select("id, username, full_name, avatar_url").ilike("username", pattern).neq("id", user.id).limit(30),
            supabase.from("profiles").select("id, username, full_name, avatar_url").ilike("full_name", pattern).neq("id", user.id).limit(30),
            supabase.from("friendships").select("id, requester_id, receiver_id, status").or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`),
        ]);

        const queryError = usernameResult.error || nameResult.error || relationResult.error;
        if (queryError) {
            setError(queryError.message || "Unable to search players right now.");
            setPlayers([]);
            setRelationships({});
        } else {
            const merged = new Map();
            [...(usernameResult.data || []), ...(nameResult.data || [])].forEach((profile) => merged.set(profile.id, profile));
            const foundPlayers = [...merged.values()].sort((a, b) => (a.full_name || a.username || "").localeCompare(b.full_name || b.username || ""));
            const relationMap = {};
            (relationResult.data || []).forEach((relation) => {
                const otherId = relation.requester_id === user.id ? relation.receiver_id : relation.requester_id;
                relationMap[otherId] = {
                    status: relation.status,
                    direction: relation.requester_id === user.id ? "sent" : "received",
                    id: relation.id,
                };
            });
            setPlayers(foundPlayers);
            setRelationships(relationMap);
            setSearched(true);
        }
        setLoading(false);
    }, [term]);

    const sendFriendRequest = async (receiverId) => {
        setSendingTo(receiverId);
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            toast("Please log in to send a friend request.", "error");
            setSendingTo(null);
            return;
        }

        const existing = relationships[receiverId];
        if (existing) {
            toast(existing.status === "accepted" ? "You are already friends." : "A friend request already exists.", "info");
            setSendingTo(null);
            return;
        }

        const { error: insertError } = await supabase.from("friendships").insert({
            requester_id: user.id,
            receiver_id: receiverId,
            status: "pending",
        });

        if (insertError) {
            toast(insertError.code === "23505" ? "A friend request already exists." : insertError.message, "error");
        } else {
            setRelationships((current) => ({ ...current, [receiverId]: { status: "pending", direction: "sent" } }));
            toast("Friend request sent.", "success");
        }
        setSendingTo(null);
    };

    const resultLabel = useMemo(() => {
        if (!searched) return "Search by name or username";
        return `${players.length} ${players.length === 1 ? "player" : "players"} found`;
    }, [players.length, searched]);

    return (
        <main className="player-hub">
            <header className="player-hub__hero">
                <div>
                    <p className="player-hub__eyebrow">EXPAND YOUR SQUAD</p>
                    <h1>Find Players</h1>
                    <p className="player-hub__subtitle">Discover players, check their profiles, and send a friend request.</p>
                </div>
                <Link className="player-hub__requests" to="/friend-requests">Friend requests <span>↗</span></Link>
            </header>

            <form className="player-hub__search" onSubmit={searchPlayers}>
                <span className="player-hub__search-icon" aria-hidden="true">⌕</span>
                <input
                    type="search"
                    value={term}
                    onChange={(event) => setTerm(event.target.value)}
                    placeholder="Search by player name or username..."
                    aria-label="Search players by name or username"
                    maxLength={40}
                />
                {term && <button className="player-hub__clear" type="button" onClick={() => { setTerm(""); setPlayers([]); setError(""); setSearched(false); }} aria-label="Clear search">×</button>}
                <button className="player-hub__submit" type="submit" disabled={loading}>{loading ? "Searching…" : "⌕ Search"}</button>
            </form>

            <div className="player-hub__result-heading">
                <h2>{searched ? "Search results" : "Discover your next rival"}</h2>
                <span>{resultLabel}</span>
            </div>

            {error && <div className="player-hub__error" role="alert">{error}</div>}
            {loading ? (
                <div className="player-hub__grid" aria-label="Searching players">
                    {[1, 2, 3].map((item) => <div className="player-hub__skeleton" key={item}><i /><span /><span /></div>)}
                </div>
            ) : searched && !error && players.length === 0 ? (
                <section className="player-hub__empty">
                    <span aria-hidden="true">⌕</span>
                    <h2>No players found</h2>
                    <p>Try a different name or username. Check the spelling and search again.</p>
                </section>
            ) : searched && !error ? (
                <section className="player-hub__grid" aria-label="Player search results">
                    {players.map((player) => {
                        const relation = relationships[player.id];
                        const isFriend = relation?.status === "accepted";
                        const isPending = relation?.status === "pending";
                        const isClosed = relation?.status === "rejected";
                        const incoming = isPending && relation.direction === "received";
                        return (
                            <article className="player-hub__card" key={player.id}>
                                <div className="player-hub__card-top">
                                    <PlayerAvatar player={player} />
                                    <span className="player-hub__status"><i /> PLAYER</span>
                                </div>
                                <div className="player-hub__identity">
                                    <h3>{player.full_name || "Player"}</h3>
                                    <p>@{player.username || "unknown"}</p>
                                </div>
                                <div className="player-hub__actions">
                                    <Link className="player-hub__profile" to={`/player/${player.id}`}>View profile <span>↗</span></Link>
                                    {isFriend ? (
                                        <Link className="player-hub__connected" to="/friends">✓ Friends</Link>
                                    ) : isPending ? (
                                        <Link className="player-hub__pending" to="/friend-requests">{incoming ? "Respond" : "Request sent"} ↗</Link>
                                    ) : isClosed ? (
                                        <span className="player-hub__closed">Request closed</span>
                                    ) : (
                                        <button className="player-hub__add" type="button" onClick={() => sendFriendRequest(player.id)} disabled={sendingTo === player.id}>
                                            {sendingTo === player.id ? "Sending…" : "+ Add friend"}
                                        </button>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </section>
            ) : (
                <section className="player-hub__empty player-hub__empty--welcome">
                    <span aria-hidden="true">◎</span>
                    <h2>Find your next opponent</h2>
                    <p>Search using at least two characters from a player's name or username to discover their profile and connect.</p>
                </section>
            )}
        </main>
    );
}

export default SearchPlayers;
