import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useToast } from "../context/ToastContext";

function FriendAvatar({ friend }) {
    const label = (friend.full_name || friend.username || "P").trim();
    return (
        <div className="friends-hub__avatar" aria-hidden="true">
            {friend.avatar_url
                ? <img src={friend.avatar_url} alt="" loading="lazy" />
                : <span>{label.charAt(0).toUpperCase()}</span>}
            <i />
        </div>
    );
}

export default function Friends() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [query, setQuery] = useState("");
    const [removingId, setRemovingId] = useState(null);
    const [challengingId, setChallengingId] = useState(null);

    const fetchFriends = useCallback(async ({ silent = false } = {}) => {
        if (silent) setRefreshing(true);
        else setLoading(true);
        setError("");

        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            if (!user) throw new Error("Please log in to view your friends.");

            const { data: friendships, error: friendsError } = await supabase
                .from("friendships")
                .select("id, requester_id, receiver_id")
                .eq("status", "accepted")
                .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);
            if (friendsError) throw friendsError;

            if (!friendships?.length) {
                setFriends([]);
                return;
            }

            const friendIds = friendships.map((friendship) =>
                friendship.requester_id === user.id
                    ? friendship.receiver_id
                    : friendship.requester_id
            );

            const { data: profiles, error: profileError } = await supabase
                .from("profiles")
                .select("id, username, full_name, avatar_url")
                .in("id", friendIds);
            if (profileError) throw profileError;

            const profileById = new Map((profiles || []).map((profile) => [profile.id, profile]));
            const combined = friendships
                .map((friendship) => {
                    const friendId = friendship.requester_id === user.id
                        ? friendship.receiver_id
                        : friendship.requester_id;
                    const profile = profileById.get(friendId);
                    return profile ? { ...profile, friendshipId: friendship.id } : null;
                })
                .filter(Boolean);

            setFriends(combined);
        } catch (loadError) {
            console.error("Fetch friends error:", loadError);
            setError(loadError.message || "Could not load your friends. Please try again.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchFriends();
    }, [fetchFriends]);

    const filteredFriends = useMemo(() => {
        const term = query.trim().toLowerCase();
        if (!term) return friends;
        return friends.filter((friend) =>
            [friend.full_name, friend.username]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(term))
        );
    }, [friends, query]);

    const removeFriend = async (friend) => {
        const confirmed = window.confirm(
            `Remove ${friend.full_name || friend.username || "this player"} from your friends?`
        );
        if (!confirmed || removingId) return;

        setRemovingId(friend.friendshipId);
        try {
            const { error: removeError } = await supabase
                .from("friendships")
                .delete()
                .eq("id", friend.friendshipId)
                .eq("status", "accepted");
            if (removeError) throw removeError;

            setFriends((current) => current.filter((item) => item.friendshipId !== friend.friendshipId));
            toast("Friend removed successfully.", "success");
        } catch (removeError) {
            console.error("Remove friend error:", removeError);
            toast("Could not remove friend. Please try again.", "error");
        } finally {
            setRemovingId(null);
        }
    };

    const sendChallenge = async (friendId) => {
        if (challengingId) return;
        setChallengingId(friendId);
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            if (!user) throw new Error("Please log in before sending a challenge.");

            const { error: challengeError } = await supabase
                .from("challenges")
                .insert({
                    challenger_id: user.id,
                    challenged_id: friendId,
                    status: "pending",
                });
            if (challengeError) throw challengeError;
            toast("Challenge sent successfully!", "success");
        } catch (challengeError) {
            console.error("Send challenge error:", challengeError);
            toast(challengeError.message || "Challenge could not be sent.", "error");
        } finally {
            setChallengingId(null);
        }
    };

    return (
        <section className="friends-page friends-hub">
            <header className="friends-hub__hero">
                <div>
                    <span className="friends-hub__eyebrow">YOUR SOCIAL ARENA</span>
                    <h1>My Friends</h1>
                    <p>Your squad, one challenge away.</p>
                </div>
                <div className="friends-hub__hero-actions">
                    <span className="friends-hub__count">
                        <strong>{friends.length}</strong>
                        <span>{friends.length === 1 ? "FRIEND" : "FRIENDS"}</span>
                    </span>
                    <button
                        type="button"
                        className="friends-hub__refresh"
                        onClick={() => fetchFriends({ silent: true })}
                        disabled={loading || refreshing}
                        aria-label="Refresh friends"
                        title="Refresh friends"
                    >
                        <span className={refreshing ? "is-spinning" : ""}>↻</span>
                    </button>
                </div>
            </header>

            <div className="friends-hub__toolbar">
                <label className="friends-hub__search">
                    <span aria-hidden="true">⌕</span>
                    <input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search friends by name or username..."
                        aria-label="Search friends"
                    />
                    {query && (
                        <button type="button" onClick={() => setQuery("")} aria-label="Clear search">×</button>
                    )}
                </label>
                <Link className="friends-hub__discover" to="/search-players">
                    <span aria-hidden="true">＋</span> Find players
                </Link>
            </div>

            {error && (
                <div className="friends-hub__alert" role="alert">
                    <span>{error}</span>
                    <button type="button" onClick={() => fetchFriends()}>Try again</button>
                </div>
            )}

            {loading ? (
                <div className="friends-hub__grid" aria-label="Loading friends">
                    {Array.from({ length: 3 }, (_, index) => (
                        <div className="friends-hub__skeleton" key={index}>
                            <span /><i /><i /><i />
                        </div>
                    ))}
                </div>
            ) : !error && friends.length === 0 ? (
                <div className="friends-hub__empty">
                    <div className="friends-hub__empty-icon" aria-hidden="true">✦</div>
                    <h2>Your squad starts here</h2>
                    <p>You haven't added any friends yet. Find players and send a friend request to build your squad.</p>
                    <Link className="friends-hub__primary" to="/search-players">Discover players <span>→</span></Link>
                </div>
            ) : !error && filteredFriends.length === 0 ? (
                <div className="friends-hub__empty friends-hub__empty--compact">
                    <h2>No friends found</h2>
                    <p>Try another name or username.</p>
                    <button type="button" onClick={() => setQuery("")}>Clear search</button>
                </div>
            ) : !error ? (
                <>
                    <div className="friends-hub__section-heading">
                        <h2>Your squad <span>{filteredFriends.length}</span></h2>
                        <p>Ready when you are</p>
                    </div>
                    <div className="friends-hub__grid">
                        {filteredFriends.map((friend) => (
                            <article className="friends-hub__card" key={friend.id}>
                                <div className="friends-hub__card-top">
                                    <FriendAvatar friend={friend} />
                                    <span className="friends-hub__status"><i /> FRIEND</span>
                                </div>
                                <div className="friends-hub__identity">
                                    <h3>{friend.full_name || friend.username || "Player"}</h3>
                                    <p>@{friend.username || "player"}</p>
                                </div>
                                <div className="friends-hub__card-actions">
                                    <button
                                        type="button"
                                        className="friends-hub__challenge"
                                        onClick={() => sendChallenge(friend.id)}
                                        disabled={challengingId === friend.id || Boolean(challengingId)}
                                    >
                                        {challengingId === friend.id ? "Sending..." : "⚔ Challenge"}
                                    </button>
                                    <button
                                        type="button"
                                        className="friends-hub__icon-button"
                                        onClick={() => navigate(`/player/${friend.id}`)}
                                        aria-label={`View ${friend.username || "player"} profile`}
                                        title="View profile"
                                    >↗</button>
                                    <button
                                        type="button"
                                        className="friends-hub__icon-button"
                                        onClick={() => removeFriend(friend)}
                                        disabled={removingId === friend.friendshipId || Boolean(removingId)}
                                        aria-label={`Remove ${friend.username || "friend"}`}
                                        title="Remove friend"
                                    >{removingId === friend.friendshipId ? "…" : "−"}</button>
                                </div>
                            </article>
                        ))}
                    </div>
                </>
            ) : null}
        </section>
    );
}
