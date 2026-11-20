import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { useToast } from "../context/ToastContext";
// import "../styles/Chat.css

const Chat = () => {
    const { toast } = useToast();
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentUserId, setCurrentUserId] = useState(null);
    const [selectedFriend, setSelectedFriend] = useState(null);

    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState("");
    const [sending, setSending] = useState(false);

    const [onlineUsers, setOnlineUsers] = useState([]);

    const messagesContainerRef = useRef(null);

    // Fetch friends
    const fetchFriends = async () => {
        setLoading(true);
        setError("");

        const {
            data: { user },
            error: userError
        } = await supabase.auth.getUser();

        if (userError || !user) {
            setError("Please login first.");
            setLoading(false);
            return;
        }

        setCurrentUserId(user.id);

        const { data, error: friendsError } = await supabase
            .from("friendships")
            .select("id, requester_id, receiver_id")
            .eq("status", "accepted")
            .or(
                `requester_id.eq.${user.id},receiver_id.eq.${user.id}`
            );

        if (friendsError) {
            setError(friendsError.message);
            setLoading(false);
            return;
        }

        if (!data || data.length === 0) {
            setFriends([]);
            setLoading(false);
            return;
        }

        const friendIds = data.map((friendship) =>
            friendship.requester_id === user.id
                ? friendship.receiver_id
                : friendship.requester_id
        );

        const { data: profiles, error: profileError } = await supabase
            .from("profiles")
            .select("id, username, full_name, avatar_url")
            .in("id", friendIds);

        if (profileError) {
            setError(profileError.message);
            setLoading(false);
            return;
        }

        setFriends(profiles || []);
        setLoading(false);
    };

    // Fetch messages
    const fetchMessages = async (friendId) => {
        if (!currentUserId || !friendId) return;

        const { data, error } = await supabase
            .from("chat_messages")
            .select("*")
            .or(
                `and(sender_id.eq.${currentUserId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${currentUserId})`
            )
            .order("created_at", { ascending: true });

        if (error) {
            setError(error.message);
            return;
        }

        setMessages(data || []);
    };

    // Load friends
    useEffect(() => {
        fetchFriends();
    }, []);

    // Online presence and last seen
    useEffect(() => {
        if (!currentUserId) return;

        let lastSeenInterval;

        const presenceChannel = supabase.channel("online-users", {
            config: {
                presence: {
                    key: currentUserId
                }
            }
        });

        presenceChannel
            .on("presence", { event: "sync" }, () => {
                const state = presenceChannel.presenceState();

                const userIds = Object.keys(state);

                setOnlineUsers(userIds);
            })
            .subscribe(async (status) => {
                if (status === "SUBSCRIBED") {
                    await presenceChannel.track({
                        user_id: currentUserId,
                        online_at: new Date().toISOString()
                    });

                    await supabase
                        .from("profiles")
                        .update({
                            last_seen_at: new Date().toISOString()
                        })
                        .eq("id", currentUserId);

                    lastSeenInterval = setInterval(async () => {
                        await supabase
                            .from("profiles")
                            .update({
                                last_seen_at: new Date().toISOString()
                            })
                            .eq("id", currentUserId);
                    }, 60000);
                }
            });

        return () => {
            clearInterval(lastSeenInterval);
            supabase.removeChannel(presenceChannel);
        };
    }, [currentUserId]);

    // Real-time incoming messages
    useEffect(() => {
        if (!selectedFriend || !currentUserId) return;

        fetchMessages(selectedFriend.id);

        const channel = supabase
            .channel(`chat-${currentUserId}-${selectedFriend.id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "chat_messages",
                    filter: `receiver_id=eq.${currentUserId}`
                },
                (payload) => {
                    const newMessage = payload.new;

                    if (newMessage.sender_id === selectedFriend.id) {
                        setMessages((previousMessages) => [
                            ...previousMessages,
                            newMessage
                        ]);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedFriend, currentUserId]);

    // Keep auto-scroll inside the message viewport; never scroll the whole page.
    useEffect(() => {
        const messageViewport = messagesContainerRef.current;
        if (!messageViewport) return;

        messageViewport.scrollTo({
            top: messageViewport.scrollHeight,
            behavior: "smooth"
        });
    }, [messages]);

    // Send message
    const sendMessage = async () => {
        const trimmedMessage = messageText.trim();

        if (!trimmedMessage || !selectedFriend || !currentUserId) {
            return;
        }

        setSending(true);
        setError("");

        const { error } = await supabase
            .from("chat_messages")
            .insert({
                sender_id: currentUserId,
                receiver_id: selectedFriend.id,
                message: trimmedMessage
            });

        if (error) {
            setError(error.message);
            toast("Message could not be sent.", "error");
        } else {
            setMessageText("");
            toast("Message sent.", "success", 1800);
            await fetchMessages(selectedFriend.id);
        }

        setSending(false);
    };

    const getInitials = (name = "Player") =>
        name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "P";

    return (
        <main className={`chat-page chat-hub ${selectedFriend ? "has-active-chat" : ""}`}>
            <header className="chat-hub__hero">
                <div>
                    <span className="chat-hub__eyebrow">YOUR SOCIAL ARENA</span>
                    <h1>Messages</h1>
                    <p>Catch up with your squad and plan your next challenge.</p>
                </div>
                <div className="chat-hub__count">
                    <strong>{friends.length}</strong>
                    <span>FRIENDS</span>
                </div>
            </header>

            {error && <div className="chat-hub__alert" role="alert">{error}</div>}

            <section className="chat-hub__layout" aria-label="Messages">
                <aside className="chat-hub__sidebar">
                    <div className="chat-hub__sidebar-head">
                        <div>
                            <h2>Your conversations</h2>
                            <span>{friends.length} friends</span>
                        </div>
                        <button type="button" className="chat-hub__refresh" onClick={fetchFriends} aria-label="Refresh friends" title="Refresh">↻</button>
                    </div>

                    {loading ? (
                        <div className="chat-hub__skeletons" aria-label="Loading friends">
                            {[1, 2, 3].map((item) => <div className="chat-hub__skeleton" key={item} />)}
                        </div>
                    ) : friends.length === 0 ? (
                        <div className="chat-hub__empty-list">
                            <span className="chat-hub__empty-icon">✦</span>
                            <strong>No conversations yet</strong>
                            <p>Add friends to start chatting with your squad.</p>
                        </div>
                    ) : (
                        <div className="chat-hub__friend-list">
                            {friends.map((friend) => {
                                const isOnline = onlineUsers.includes(friend.id);
                                const isActive = selectedFriend?.id === friend.id;
                                return (
                                    <button
                                        type="button"
                                        className={`chat-hub__friend ${isActive ? "is-active" : ""}`}
                                        key={friend.id}
                                        onClick={() => { setSelectedFriend(friend); setError(""); }}
                                        aria-pressed={isActive}
                                    >
                                        <span className="chat-hub__avatar">
                                            {friend.avatar_url ? <img src={friend.avatar_url} alt="" /> : getInitials(friend.full_name || friend.username)}
                                            <i className={isOnline ? "is-online" : ""} />
                                        </span>
                                        <span className="chat-hub__friend-copy">
                                            <strong>{friend.full_name || friend.username || "Player"}</strong>
                                            <small>@{friend.username || "player"}</small>
                                        </span>
                                        <span className="chat-hub__friend-status">{isOnline ? "Online" : ""}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </aside>

                <section className="chat-hub__conversation" aria-label="Chat conversation">
                    {selectedFriend ? (
                        <>
                            <header className="chat-hub__conversation-head">
                                <button type="button" className="chat-hub__back" onClick={() => setSelectedFriend(null)} aria-label="Back to conversations">←</button>
                                <span className="chat-hub__avatar chat-hub__avatar--large">
                                    {selectedFriend.avatar_url ? <img src={selectedFriend.avatar_url} alt="" /> : getInitials(selectedFriend.full_name || selectedFriend.username)}
                                    <i className={onlineUsers.includes(selectedFriend.id) ? "is-online" : ""} />
                                </span>
                                <div className="chat-hub__conversation-person">
                                    <strong>{selectedFriend.full_name || selectedFriend.username || "Player"}</strong>
                                    <small>@{selectedFriend.username || "player"}</small>
                                </div>
                                <span className={`chat-hub__presence ${onlineUsers.includes(selectedFriend.id) ? "is-online" : ""}`}>
                                    <i />{onlineUsers.includes(selectedFriend.id) ? "Online" : "Offline"}
                                </span>
                            </header>

                            <div className="chat-hub__messages" ref={messagesContainerRef}>
                                {messages.length === 0 ? (
                                    <div className="chat-hub__message-empty">
                                        <span>✦</span>
                                        <strong>Say hello to {selectedFriend.full_name?.split(" ")[0] || "your friend"}</strong>
                                        <p>Your conversation starts here. Send the first message!</p>
                                    </div>
                                ) : messages.map((message) => (
                                    <div key={message.id} className={`chat-hub__message ${message.sender_id === currentUserId ? "is-sent" : "is-received"}`}>
                                        <p>{message.message}</p>
                                        <time dateTime={message.created_at}>{new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>
                                    </div>
                                ))}
                            </div>

                            <form className="chat-hub__composer" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}>
                                <input
                                    type="text"
                                    value={messageText}
                                    onChange={(event) => setMessageText(event.target.value)}
                                    placeholder="Write a message..."
                                    aria-label="Write a message"
                                    maxLength={1000}
                                />
                                <span className="chat-hub__char-count">{messageText.length}/1000</span>
                                <button type="submit" disabled={sending || !messageText.trim()} aria-label="Send message">
                                    {sending ? "Sending…" : "Send ↗"}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="chat-hub__welcome">
                            <span className="chat-hub__welcome-icon">✉</span>
                            <span className="chat-hub__eyebrow">SQUAD CONNECTION</span>
                            <h2>Your next great match starts with a message.</h2>
                            <p>Choose a friend from your conversations to start chatting.</p>
                            <span className="chat-hub__welcome-hint">Select a conversation <b>←</b></span>
                        </div>
                    )}
                </section>
            </section>
        </main>
    );
};

export default Chat;
