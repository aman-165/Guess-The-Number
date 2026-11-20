import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useSound } from "../context/SoundContext";
import { SoundSettings } from "./SoundSettings";

/* Small inline SVG icon set: avoids adding another runtime dependency. */
function NavIcon({ name, size = 20 }) {
  const common = {
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9" /><path d="M9 20v-6h6v6" /></>,
    play: <><path d="m8 5 12 7-12 7z" /></>,
    rules: <><path d="M5 3h11l3 3v15H5z" /><path d="M16 3v4h4M8 11h8M8 15h8" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5M8 10h6M11 7v6" /></>,
    chat: <><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" /></>,
    more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
    sound: <><path d="M11 5 6 9H3v6h3l5 4z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /></>,
    mute: <><path d="M11 5 6 9H3v6h3l5 4z" /><path d="m16 9 5 6m0-6-5 6" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.5.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.5-.9l-1.7.7-1.4-2.4 1.4-1.1a8 8 0 0 1 0-1.8l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.5-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.5.9l1.7-.7 1.4 2.4-1.4 1.1a8 8 0 0 1 0 1.8z" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" /></>,
    inbox: <><path d="M4 4h16v16H4z" /><path d="M4 13h4l2 3h4l2-3h4" /></>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5M12 7v5l3 2" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true" focusable="false">
      {common[name] || common.more}
    </svg>
  );
}

const mainLinks = [
  { to: "/", label: "Home", icon: "home", end: true },
  { to: "/game", label: "Play", icon: "play" },
  { to: "/rules", label: "Rules", icon: "rules" },
];

const socialLinks = [
  { to: "/friends", label: "Friends", icon: "users" },
  { to: "/search-players", label: "Find players", icon: "search" },
  { to: "/chat", label: "Chat", icon: "chat" },
];

const moreLinks = [
  { to: "/friend-requests", label: "Friend requests", icon: "users" },
  { to: "/incoming-challenges", label: "Incoming challenges", icon: "inbox" },
  { to: "/outgoing-challenges", label: "Outgoing challenges", icon: "inbox" },
  { to: "/challenge-history", label: "Challenge history", icon: "history" },
  { to: "/match-history", label: "Match history", icon: "history" },
];

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");
  const [notificationFilter, setNotificationFilter] = useState("all");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const notificationRef = useRef(null);
  const desktopMoreRef = useRef(null);
  const mobileMoreRef = useRef(null);
  const { settings, toggleSoundEnabled, playNotification, playMessage } = useSound();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    async function fetchUsername() {
      if (!user) {
        setUsername("");
        setAvatarUrl("");
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", user.id)
        .single();
      if (!active) return;
      if (error) {
        console.error("Username Error:", error.message);
        setUsername("");
        return;
      }
      setUsername(data.username || "");
      setAvatarUrl(data.avatar_url || "");
    }
    fetchUsername();
    return () => { active = false; };
  }, [user]);

  const fetchNotifications = async (userId) => {
    if (!userId) return;
    setNotificationsLoading(true);
    setNotificationsError("");
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, message, is_read, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = data || [];
      setNotifications(rows);
      setUnreadCount(rows.filter((item) => !item.is_read).length);
    } catch (err) {
      console.error("Notification Fetch Error:", err);
      setNotificationsError("We couldn't load your notifications. Please try again.");
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setUser(data.session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    fetchNotifications(user.id);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "notifications",
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        if (payload.eventType === "INSERT") playNotification();
        fetchNotifications(user.id);
      })
      .subscribe();
    const chatChannel = supabase
      .channel(`incoming-chat-sounds-${user.id}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "chat_messages",
        filter: `receiver_id=eq.${user.id}`,
      }, () => playMessage())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(chatChannel);
    };
  }, [user, playMessage, playNotification]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      const insideDesktopMore = desktopMoreRef.current?.contains(event.target);
      const insideMobileMore = mobileMoreRef.current?.contains(event.target);
      if (!insideDesktopMore && !insideMobileMore) setShowMore(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowNotifications(false);
        setShowMore(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    const { error } = await supabase.from("notifications")
      .update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    if (error) {
      console.error("Mark All Notifications Error:", error.message);
      setNotificationsError("Couldn't update notifications. Please try again.");
      return;
    }
    fetchNotifications(user.id);
  };

  const handleMarkAsRead = async (notificationId) => {
    if (!user) return;
    const { error } = await supabase.from("notifications")
      .update({ is_read: true }).eq("id", notificationId).eq("user_id", user.id);
    if (error) {
      console.error("Mark Notification Error:", error.message);
      setNotificationsError("Couldn't update this notification. Please try again.");
      return;
    }
    fetchNotifications(user.id);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout Error:", error.message);
      return;
    }
    setShowMore(false);
    navigate("/login");
  };

  const navClass = ({ isActive }) => `premium-nav__link${isActive ? " is-active" : ""}`;
  const renderLink = (item, compact = false) => (
    <NavLink key={item.to} to={item.to} end={item.end}
      className={navClass} title={item.label} aria-label={item.label}
      onClick={() => setShowMore(false)}>
      <NavIcon name={item.icon} size={19} />
      {!compact && <span>{item.label}</span>}
    </NavLink>
  );

  return (
    <>
      <header className="nav premium-nav">
        <NavLink to="/" className="premium-nav__brand" aria-label="Number Guesser home">
          <img
            src="/src/assets/number-guesser-icon-v4-dark.svg"
            alt=""
            className="premium-nav__brand-logo"
            width="38"
            height="38"
            fetchPriority="high"
          />
          <span>Number Guesser</span>
        </NavLink>

        <nav className="premium-nav__desktop" aria-label="Main navigation">
          <div className="premium-nav__group">
            {mainLinks.map((item) => renderLink(item))}
          </div>
          {user && (
            <>
              <div className="premium-nav__divider" />
              <div className="premium-nav__group">
                {socialLinks.map((item) => renderLink(item))}
              </div>
              <div className="premium-nav__menu-wrap" ref={desktopMoreRef}>
                <button type="button" className={`premium-nav__icon-button${showMore ? " is-open" : ""}`}
                  onClick={() => setShowMore((value) => !value)} aria-expanded={showMore}
                  aria-haspopup="menu" aria-label="More navigation options" title="More">
                  <NavIcon name="more" />
                </button>
                {showMore && (
                  <div className="premium-nav__more-menu" role="menu">
                    <div className="premium-nav__menu-heading">More</div>
                    {moreLinks.map((item) => (
                      <NavLink key={item.to} to={item.to} className={navClass} role="menuitem"
                        onClick={() => setShowMore(false)}>
                        <NavIcon name={item.icon} size={17} /><span>{item.label}</span>
                      </NavLink>
                    ))}
                    <NavLink to="/profile" className={navClass} role="menuitem" onClick={() => setShowMore(false)}>
                      <NavIcon name="user" size={17} /><span>My profile</span>
                    </NavLink>
                    <button type="button" className="premium-nav__menu-logout" role="menuitem" onClick={handleLogout}>
                      <NavIcon name="logout" size={17} /><span>Log out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </nav>

        <div className="premium-nav__actions">
          <button type="button" className="premium-nav__icon-button"
            onClick={toggleSoundEnabled}
            aria-label={settings.soundEnabled ? "Mute sound effects" : "Unmute sound effects"}
            title={settings.soundEnabled ? "Mute sound effects" : "Unmute sound effects"}>
            <NavIcon name={settings.soundEnabled ? "sound" : "mute"} />
          </button>
          <button type="button" className="premium-nav__icon-button"
            onClick={() => setShowSoundSettings(true)} aria-label="Open sound settings" title="Sound settings">
            <NavIcon name="settings" />
          </button>
          {user ? (
            <NavLink to="/profile" className="premium-nav__profile" title={username ? `@${username}` : "Profile"} aria-label="Open profile">
              {avatarUrl ? <img src={avatarUrl} alt="" className="navbar-avatar" /> :
                <span className="navbar-avatar-placeholder">{username?.charAt(0).toUpperCase() || "P"}</span>}
              <span className="premium-nav__username">{username ? `@${username}` : "Profile"}</span>
            </NavLink>
          ) : (
            <div className="premium-nav__auth">
              <NavLink to="/login" className={navClass}>Login</NavLink>
              <NavLink to="/signup" className="premium-nav__signup">Sign up</NavLink>
            </div>
          )}
        </div>
      </header>

      {user && (
        <nav className="premium-mobile-nav" aria-label="Mobile navigation">
          {[
            { to: "/", label: "Home", icon: "home", end: true },
            { to: "/game", label: "Play", icon: "play" },
            { to: "/friends", label: "Friends", icon: "users" },
            { to: "/chat", label: "Chat", icon: "chat" },
          ].map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
              <NavIcon name={item.icon} size={21} /><span>{item.label}</span>
            </NavLink>
          ))}
          <div className="premium-nav__mobile-more" ref={mobileMoreRef}>
            <button type="button" className={`premium-nav__link${showMore ? " is-active" : ""}`}
              onClick={() => setShowMore((value) => !value)} aria-expanded={showMore} aria-label="More options">
              <NavIcon name="more" size={21} /><span>More</span>
            </button>
            {showMore && (
              <div className="premium-nav__more-menu premium-nav__more-menu--mobile" role="menu">
                <NavLink to="/search-players" className={navClass} role="menuitem"
                  onClick={() => setShowMore(false)}>
                  <NavIcon name="search" size={17} /><span>Find players</span>
                </NavLink>
                {moreLinks.map((item) => (
                  <NavLink key={item.to} to={item.to} className={navClass} role="menuitem"
                    onClick={() => setShowMore(false)}>
                    <NavIcon name={item.icon} size={17} /><span>{item.label}</span>
                  </NavLink>
                ))}
                <NavLink to="/rules" className={navClass} role="menuitem" onClick={() => setShowMore(false)}>
                  <NavIcon name="rules" size={17} /><span>Rules</span>
                </NavLink>
                <NavLink to="/profile" className={navClass} role="menuitem" onClick={() => setShowMore(false)}>
                  <NavIcon name="user" size={17} /><span>My profile</span>
                </NavLink>
                <button type="button" className="premium-nav__menu-logout" role="menuitem" onClick={handleLogout}>
                  <NavIcon name="logout" size={17} /><span>Log out</span>
                </button>
              </div>
            )}
          </div>
        </nav>
      )}

      {user && (
        <div className="premium-notification-anchor" ref={notificationRef}>
          {showNotifications && (
            <section className="premium-notification-panel" aria-label="Notifications" aria-live="polite">
              <div className="premium-notification-panel__header">
                <div className="premium-notification-panel__title">
                  <span className="premium-notification-panel__eyebrow">YOUR ACTIVITY</span>
                  <strong>Notifications</strong>
                  <span>{unreadCount ? `${unreadCount} unread` : "You're all caught up"}</span>
                </div>
                <div className="premium-notification-panel__header-actions">
                  <button type="button" className="premium-nav__icon-button" onClick={() => fetchNotifications(user?.id)} aria-label="Refresh notifications" title="Refresh">
                    <NavIcon name="history" size={17} />
                  </button>
                  <button type="button" className="premium-nav__icon-button" onClick={() => setShowNotifications(false)} aria-label="Close notifications">
                    <NavIcon name="close" size={17} />
                  </button>
                </div>
              </div>
              <div className="premium-notification-toolbar">
                <div className="premium-notification-tabs" role="tablist" aria-label="Filter notifications">
                  <button type="button" role="tab" aria-selected={notificationFilter === "all"} className={notificationFilter === "all" ? "is-active" : ""} onClick={() => setNotificationFilter("all")}>All <span>{notifications.length}</span></button>
                  <button type="button" role="tab" aria-selected={notificationFilter === "unread"} className={notificationFilter === "unread" ? "is-active" : ""} onClick={() => setNotificationFilter("unread")}>Unread <span>{unreadCount}</span></button>
                </div>
                {unreadCount > 0 && <button type="button" className="premium-notification-panel__mark" onClick={handleMarkAllAsRead}><NavIcon name="check" size={14} /> Mark all read</button>}
              </div>
              {notificationsError && <div className="premium-notification-error" role="alert">{notificationsError}</div>}
              <div className="premium-notification-panel__list">
                {notificationsLoading ? (
                  <div className="premium-notification-loading" role="status"><span /><span /><span />Loading notifications…</div>
                ) : notificationsError ? (
                  <div className="premium-notification-panel__empty"><p>Something went wrong.</p><button type="button" onClick={() => fetchNotifications(user?.id)}>Try again</button></div>
                ) : (notificationFilter === "unread" ? notifications.filter((item) => !item.is_read) : notifications).length === 0 ? (
                  <div className="premium-notification-panel__empty"><span className="premium-notification-empty-icon"><NavIcon name="bell" size={23} /></span><strong>{notificationFilter === "unread" ? "No unread notifications" : "You're all caught up"}</strong><p>{notificationFilter === "unread" ? "New updates will appear here." : "We'll let you know when something happens."}</p></div>
                ) : (notificationFilter === "unread" ? notifications.filter((item) => !item.is_read) : notifications).map((notification) => (
                  <article key={notification.id} className={`premium-notification-item${!notification.is_read ? " is-unread" : ""}`}>
                    <div className="premium-notification-item__icon"><NavIcon name="bell" size={16} /></div>
                    <div className="premium-notification-item__content">
                      <div className="premium-notification-item__topline"><h4>{notification.title || "Notification"}</h4>{!notification.is_read && <span className="premium-notification-new">NEW</span>}</div>
                      <p>{notification.message}</p>
                      <div className="premium-notification-item__footer"><time dateTime={notification.created_at}>{new Date(notification.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</time>{!notification.is_read && <button type="button" onClick={() => handleMarkAsRead(notification.id)}>Mark as read</button>}</div>
                    </div>
                  </article>
                ))}
              </div>
              <div className="premium-notification-panel__footer"><span>Showing your latest activity</span><span>{notifications.length} total</span></div>
            </section>
          )}
          <button type="button" className={`premium-floating-bell${unreadCount ? " has-unread" : ""}`}
            onClick={() => setShowNotifications((value) => !value)}
            aria-expanded={showNotifications} aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
            title="Notifications">
            <NavIcon name="bell" size={23} />
            {unreadCount > 0 && <span className="premium-floating-bell__badge">{unreadCount > 99 ? "99+" : unreadCount}</span>}
          </button>
        </div>
      )}

      {showSoundSettings && <SoundSettings onClose={() => setShowSoundSettings(false)} />}
    </>
  );
}
