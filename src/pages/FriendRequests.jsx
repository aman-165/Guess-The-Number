import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useToast } from "../context/ToastContext";

function formatRequestDate(value) {
    if (!value) return "Recently";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Recently";
    return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" }).format(date);
}

function RequestAvatar({ profile }) {
    const name = profile?.full_name || profile?.username || "Player";
    return (
        <span className="request-hub__avatar">
            {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={`${name}'s avatar`} />
            ) : (
                <span aria-hidden="true">{name.trim().charAt(0).toUpperCase()}</span>
            )}
        </span>
    );
}

function FriendRequests() {
    const { toast } = useToast();
    const [incoming, setIncoming] = useState([]);
    const [outgoing, setOutgoing] = useState([]);
    const [activeTab, setActiveTab] = useState("incoming");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [processingId, setProcessingId] = useState(null);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        setError("");

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            setError("Please log in to manage friend requests.");
            setIncoming([]);
            setOutgoing([]);
            setLoading(false);
            return;
        }

        const [incomingResult, outgoingResult] = await Promise.all([
            supabase.from("friendships")
                .select("id, requester_id, receiver_id, created_at")
                .eq("receiver_id", user.id).eq("status", "pending")
                .order("created_at", { ascending: false }),
            supabase.from("friendships")
                .select("id, requester_id, receiver_id, created_at")
                .eq("requester_id", user.id).eq("status", "pending")
                .order("created_at", { ascending: false }),
        ]);

        if (incomingResult.error || outgoingResult.error) {
            setError(incomingResult.error?.message || outgoingResult.error?.message || "Unable to load friend requests.");
            setLoading(false);
            return;
        }

        const incomingRows = incomingResult.data || [];
        const outgoingRows = outgoingResult.data || [];
        const profileIds = [...new Set([
            ...incomingRows.map((request) => request.requester_id),
            ...outgoingRows.map((request) => request.receiver_id),
        ])];

        let profiles = [];
        if (profileIds.length) {
            const { data, error: profileError } = await supabase
                .from("profiles")
                .select("id, username, full_name, avatar_url")
                .in("id", profileIds);
            if (profileError) {
                setError(profileError.message);
                setLoading(false);
                return;
            }
            profiles = data || [];
        }

        const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
        setIncoming(incomingRows.map((request) => ({ ...request, profile: profileById.get(request.requester_id) })));
        setOutgoing(outgoingRows.map((request) => ({ ...request, profile: profileById.get(request.receiver_id) })));
        setLoading(false);
    }, []);

    useEffect(() => { fetchRequests(); }, [fetchRequests]);

    const handleIncoming = async (requestId, status) => {
        setProcessingId(requestId);
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            toast("Please log in to manage friend requests.", "error");
            setProcessingId(null);
            return;
        }
        const { data, error: updateError } = await supabase
            .from("friendships")
            .update({ status })
            .eq("id", requestId)
            .eq("receiver_id", user.id)
            .eq("status", "pending")
            .select("id")
            .maybeSingle();

        if (updateError) {
            toast(updateError.message, "error");
        } else if (!data) {
            toast("This request has already changed. Refresh and try again.", "error");
        } else {
            toast(status === "accepted" ? "Friend request accepted." : "Friend request declined.", "success");
            await fetchRequests();
        }
        setProcessingId(null);
    };

    const withdrawRequest = async (requestId) => {
        setProcessingId(requestId);
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            toast("Please log in to manage friend requests.", "error");
            setProcessingId(null);
            return;
        }
        const { data, error: deleteError } = await supabase
            .from("friendships")
            .delete()
            .eq("id", requestId)
            .eq("requester_id", user.id)
            .eq("status", "pending")
            .select("id")
            .maybeSingle();

        if (deleteError) {
            toast(deleteError.message, "error");
        } else if (!data) {
            toast("Unable to withdraw this request. Refresh and try again.", "error");
        } else {
            toast("Friend request withdrawn.", "success");
            await fetchRequests();
        }
        setProcessingId(null);
    };

    const activeRequests = activeTab === "incoming" ? incoming : outgoing;
    const filteredRequests = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return activeRequests;
        return activeRequests.filter(({ profile }) =>
            `${profile?.full_name || ""} ${profile?.username || ""}`.toLowerCase().includes(term)
        );
    }, [activeRequests, search]);

    return (
        <main className="request-hub">
            <header className="request-hub__hero">
                <div>
                    <p className="request-hub__eyebrow">YOUR SOCIAL ARENA</p>
                    <h1>Friend Requests</h1>
                    <p className="request-hub__subtitle">Build your squad, one connection at a time.</p>
                </div>
                <div className="request-hub__summary" aria-label={`${incoming.length} incoming and ${outgoing.length} sent requests`}>
                    <span><strong>{incoming.length}</strong><small>INCOMING</small></span>
                    <span><strong>{outgoing.length}</strong><small>SENT</small></span>
                </div>
            </header>

            <nav className="request-hub__tabs" aria-label="Friend request type">
                <button type="button" className={activeTab === "incoming" ? "is-active" : ""} onClick={() => { setActiveTab("incoming"); setSearch(""); }}>
                    Incoming <span>{incoming.length}</span>
                </button>
                <button type="button" className={activeTab === "outgoing" ? "is-active" : ""} onClick={() => { setActiveTab("outgoing"); setSearch(""); }}>
                    Sent <span>{outgoing.length}</span>
                </button>
                <button type="button" className="request-hub__refresh" onClick={fetchRequests} disabled={loading} aria-label="Refresh requests" title="Refresh">↻</button>
            </nav>

            <label className="request-hub__search">
                <span aria-hidden="true">⌕</span>
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or username..." />
            </label>

            {error && <div className="request-hub__error" role="alert"><span>{error}</span><button type="button" onClick={fetchRequests}>Try again</button></div>}

            {loading ? (
                <div className="request-hub__list" aria-label="Loading friend requests">
                    {[1, 2, 3].map((item) => <div className="request-hub__skeleton" key={item}><i /><span /><span /></div>)}
                </div>
            ) : !error && filteredRequests.length === 0 ? (
                <section className="request-hub__empty">
                    <span className="request-hub__empty-icon" aria-hidden="true">{activeTab === "incoming" ? "⇩" : "⇧"}</span>
                    <h2>{search ? "No matching requests" : activeTab === "incoming" ? "You're all caught up" : "No sent requests yet"}</h2>
                    <p>{search ? "Try another name or username." : activeTab === "incoming" ? "New friend requests will show up here when players want to join your squad." : "Requests you send to other players will appear here until they respond."}</p>
                    {activeTab === "outgoing" && <Link to="/search-players" className="request-hub__discover">＋ Find players</Link>}
                </section>
            ) : !error ? (
                <section className="request-hub__list" aria-label={activeTab === "incoming" ? "Incoming requests" : "Sent requests"}>
                    {filteredRequests.map((request) => {
                        const name = request.profile?.full_name || "Unknown Player";
                        const username = request.profile?.username || "unknown";
                        const busy = processingId === request.id;
                        return (
                            <article className="request-hub__card" key={request.id}>
                                <RequestAvatar profile={request.profile} />
                                <div className="request-hub__identity">
                                    <h2>{name}</h2>
                                    <p>@{username}</p>
                                    <small>{activeTab === "incoming" ? "Wants to join your squad" : "Waiting for their response"} · {formatRequestDate(request.created_at)}</small>
                                </div>
                                <Link className="request-hub__profile" to={`/player/${activeTab === "incoming" ? request.requester_id : request.receiver_id}`} aria-label={`View ${name}'s profile`} title="View profile">↗</Link>
                                <div className="request-hub__actions">
                                    {activeTab === "incoming" ? (
                                        <>
                                            <button type="button" className="request-hub__accept" onClick={() => handleIncoming(request.id, "accepted")} disabled={busy}>{busy ? "Working…" : "✓ Accept"}</button>
                                            <button type="button" className="request-hub__decline" onClick={() => handleIncoming(request.id, "rejected")} disabled={busy}>Decline</button>
                                        </>
                                    ) : (
                                        <button type="button" className="request-hub__withdraw" onClick={() => withdrawRequest(request.id)} disabled={busy}>{busy ? "Working…" : "Withdraw request"}</button>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </section>
            ) : null}
        </main>
    );
}

export default FriendRequests;
