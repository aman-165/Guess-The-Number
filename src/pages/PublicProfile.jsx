import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState("");
  const [playerStats, setPlayerStats] = useState({
    totalMatches: 0, wins: 0, losses: 0, draws: 0, winPercentage: 0,
  });
  const [singlePlayerStats, setSinglePlayerStats] = useState({
    gamesPlayed: 0, wins: 0, losses: 0, bestScore: null,
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [friendship, setFriendship] = useState(null);
  const [socialLoading, setSocialLoading] = useState(true);
  const [socialBusy, setSocialBusy] = useState(false);
  const [socialMessage, setSocialMessage] = useState("");

  const achievements = useMemo(() => [
    { title: "First Match", icon: "🎮", unlocked: playerStats.totalMatches >= 1 },
    { title: "First Victory", icon: "🥇", unlocked: playerStats.wins >= 1 },
    { title: "10 Wins", icon: "🔥", unlocked: playerStats.wins >= 10 },
    { title: "Veteran", icon: "💎", unlocked: playerStats.totalMatches >= 50 },
    { title: "Pro Player", icon: "👑", unlocked: playerStats.totalMatches >= 10 && Number(playerStats.winPercentage) >= 70 },
  ], [playerStats]);

  const singlePlayerAchievements = useMemo(() => [
    { title: "First Game", icon: "🎮", unlocked: singlePlayerStats.gamesPlayed >= 1 },
    { title: "First Victory", icon: "🥇", unlocked: singlePlayerStats.wins >= 1 },
    { title: "10 Games", icon: "🔥", unlocked: singlePlayerStats.gamesPlayed >= 10 },
    { title: "10 Victories", icon: "💎", unlocked: singlePlayerStats.wins >= 10 },
    { title: "Perfect Player", icon: "👑", unlocked: singlePlayerStats.bestScore === 1 },
  ], [singlePlayerStats]);

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      setLoading(true);
      setError("");
      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("username, full_name, avatar_url, created_at")
        .eq("id", userId)
        .maybeSingle();
      if (!active) return;
      if (profileError) setError(profileError.message);
      else if (!data) setError("Player profile not found.");
      else setProfile(data);
      setLoading(false);
    };

    const loadStats = async () => {
      setStatsLoading(true);
      const [multiResult, soloResult] = await Promise.all([
        supabase.rpc("get_public_player_stats", { p_player_id: userId }),
        supabase.from("single_player_stats")
          .select("games_played, wins, losses, best_score")
          .eq("user_id", userId).maybeSingle(),
      ]);
      if (!active) return;
      if (multiResult.error) {
        console.error("Public Player Statistics Error:", multiResult.error);
      } else {
        const data = multiResult.data || {};
        setPlayerStats({
          totalMatches: Number(data.totalMatches ?? data.totalmatches ?? 0),
          wins: Number(data.wins ?? 0),
          losses: Number(data.losses ?? 0),
          draws: Number(data.draws ?? 0),
          winPercentage: Number(data.winPercentage ?? data.winpercentage ?? 0),
        });
      }
      if (soloResult.error) {
        console.error("Single Player Statistics Error:", soloResult.error);
      } else if (soloResult.data) {
        setSinglePlayerStats({
          gamesPlayed: Number(soloResult.data.games_played ?? 0),
          wins: Number(soloResult.data.wins ?? 0),
          losses: Number(soloResult.data.losses ?? 0),
          bestScore: soloResult.data.best_score,
        });
      }
      setStatsLoading(false);
    };

    const loadSocialState = async () => {
      setSocialLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !user) {
        setCurrentUser(null);
        setFriendship(null);
        setSocialLoading(false);
        return;
      }
      setCurrentUser(user);
      if (user.id === userId) {
        setFriendship({ self: true });
        setSocialLoading(false);
        return;
      }
      const { data: relationshipRows, error: friendshipError } = await supabase
        .from("friendships")
        .select("id, requester_id, receiver_id, status, created_at")
        .or(`and(requester_id.eq.${user.id},receiver_id.eq.${userId}),and(requester_id.eq.${userId},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: false });
      if (!active) return;
      if (friendshipError) {
        console.error("Public profile friendship lookup error:", friendshipError);
        setSocialMessage("Friend status is temporarily unavailable.");
        setFriendship(null);
      } else {
        // Historical rejected rows must never override a current accepted or
        // pending relationship. Multiple old rows are handled safely here.
        const priority = { accepted: 3, pending: 2, rejected: 1 };
        const selected = (relationshipRows || []).reduce((best, row) => {
          if (!best || (priority[row.status] || 0) > (priority[best.status] || 0)) return row;
          return best;
        }, null);
        setFriendship(selected || null);
      }
      setSocialLoading(false);
    };

    loadProfile();
    loadStats();
    loadSocialState();
    return () => { active = false; };
  }, [userId]);


  const sendFriendRequest = async () => {
    if (!currentUser || !userId || socialBusy) return;

    setSocialBusy(true);
    setSocialMessage("");

    try {
      const { data, error } = await supabase.rpc(
        "send_friend_request",
        {
          p_receiver_id: userId
        }
      );

      if (error) throw error;

      setFriendship(data);

      if (data.status === "accepted") {
        setSocialMessage("You are already friends.");
      } else if (data.status === "pending") {
        if (data.requester_id === currentUser.id) {
          setSocialMessage("Friend request sent.");
        } else {
          setSocialMessage(
            "This player has already sent you a request. Open Friend Requests to respond."
          );
        }
      }

    } catch (error) {
      console.error("Public profile friend request error:", error);

      setSocialMessage(
        error.message || "Could not send friend request."
      );
    } finally {
      setSocialBusy(false);
    }
  };


  const respondToRequest = async (status) => {
    if (!friendship?.id || socialBusy) return;
    setSocialBusy(true);
    setSocialMessage("");
    const { data, error: updateError } = await supabase
      .from("friendships")
      .update({ status })
      .eq("id", friendship.id)
      .eq("status", "pending")
      .select("id, requester_id, receiver_id, status")
      .maybeSingle();
    if (updateError || !data) {
      setSocialMessage("Could not update this request. Please try again.");
    } else {
      setFriendship(data);
      setSocialMessage(status === "accepted" ? "Friend request accepted." : "Friend request declined.");
    }
    setSocialBusy(false);
  };

  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : "Player";

  const friendStatus = () => {
    if (!currentUser) return "login";
    if (currentUser.id === userId) return "self";
    if (!friendship) return "none";
    if (friendship.status === "accepted") return "friends";
    if (friendship.status === "pending" && friendship.requester_id === currentUser.id) return "sent";
    if (friendship.status === "pending" && friendship.receiver_id === currentUser.id) return "received";
    return "none";
  };

  const status = friendStatus();

  if (loading) {
    return (
      <main className="public-gamer-page">
        <div className="public-gamer-skeleton">
          <span /><span /><span />
          <p>Loading player profile...</p>
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="public-gamer-page">
        <section className="public-gamer-state">
          <span className="public-gamer-state__icon">!</span>
          <h1>Player unavailable</h1>
          <p>{error || "This player profile could not be found."}</p>
          <button type="button" onClick={() => navigate(-1)}>Go back</button>
        </section>
      </main>
    );
  }

  return (
    <main className="public-gamer-page">
      <div className="public-gamer-heading">
        <div><span className="public-gamer-eyebrow">PLAYER NETWORK</span><h1>Player Profile</h1></div>
        <span className="public-gamer-view-label">PUBLIC PLAYER CARD</span>
      </div>

      <section className="public-gamer-hero">
        <div className="public-gamer-hero__glow" aria-hidden="true" />
        <div className="public-gamer-hero__content">
          <div className="public-gamer-avatar">
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt={`${profile.full_name || profile.username || "Player"} avatar`} />
              : <span>{(profile.full_name || profile.username || "P").charAt(0).toUpperCase()}</span>}
          </div>
          <div className="public-gamer-identity">
            <span className="public-gamer-kicker">NUMBER GUESSER PLAYER</span>
            <h2>{profile.full_name || "Player"}</h2>
            <p>@{profile.username || "player"}</p>
            <span className="public-gamer-joined">◷ Joined {joinedDate}</span>
          </div>
          {status !== "self" && (
            <div className="public-gamer-social-actions">
              {socialLoading ? <span className="public-gamer-action-loading">Checking friend status...</span> : (
                <>
                  {status === "none" && <button type="button" className="public-gamer-button public-gamer-button--primary" onClick={sendFriendRequest} disabled={socialBusy}>{socialBusy ? "Sending..." : "＋ Add Friend"}</button>}
                  {status === "sent" && <button type="button" className="public-gamer-button" disabled>◷ Request Sent</button>}
                  {status === "received" && <>
                    <button type="button" className="public-gamer-button public-gamer-button--primary" onClick={() => respondToRequest("accepted")} disabled={socialBusy}>{socialBusy ? "Please wait..." : "✓ Accept Request"}</button>
                    <button type="button" className="public-gamer-button public-gamer-button--quiet" onClick={() => respondToRequest("rejected")} disabled={socialBusy}>Decline</button>
                  </>}
                  {status === "friends" && <>
                    <span className="public-gamer-friend-badge">✓ Friends</span>
                    <button type="button" className="public-gamer-button public-gamer-button--primary" onClick={() => navigate("/chat")}>✉ Message</button>
                  </>}
                  {status === "login" && <button type="button" className="public-gamer-button public-gamer-button--primary" onClick={() => navigate("/login")}>Log in to connect</button>}
                </>
              )}
            </div>
          )}
        </div>
        {socialMessage && <p className="public-gamer-social-message" role="status">{socialMessage}</p>}
        <div className="public-gamer-hero__footer"><span>✦ PLAYER PROFILE</span><span>GAMING • COMMUNITY • COMPETITION</span></div>
      </section>

      <section className="public-gamer-section">
        <div className="public-gamer-section-heading"><div><span>COMPETITIVE RECORD</span><h2>Multiplayer statistics</h2></div><span className="public-gamer-section-icon">◈</span></div>
        {statsLoading ? <div className="public-gamer-stat-grid">{Array.from({ length: 5 }).map((_, i) => <div className="public-gamer-stat public-gamer-stat--skeleton" key={i} />)}</div> : (
          <div className="public-gamer-stat-grid">
            {[
              ["Total matches", playerStats.totalMatches, "◈"],
              ["Wins", playerStats.wins, "✓"],
              ["Losses", playerStats.losses, "×"],
              ["Draws", playerStats.draws, "＝"],
              ["Win rate", `${playerStats.winPercentage}%`, "％"],
            ].map(([label, value, icon]) => <article className="public-gamer-stat" key={label}><span>{icon}</span><strong>{value}</strong><small>{label}</small></article>)}
          </div>
        )}
      </section>

      <section className="public-gamer-section">
        <div className="public-gamer-section-heading"><div><span>SOLO PERFORMANCE</span><h2>Single-player statistics</h2></div><span className="public-gamer-section-icon">⌁</span></div>
        {statsLoading ? <div className="public-gamer-stat-grid">{Array.from({ length: 4 }).map((_, i) => <div className="public-gamer-stat public-gamer-stat--skeleton" key={i} />)}</div> : (
          <div className="public-gamer-stat-grid public-gamer-stat-grid--four">
            {[
              ["Games played", singlePlayerStats.gamesPlayed, "▤"],
              ["Wins", singlePlayerStats.wins, "✓"],
              ["Losses", singlePlayerStats.losses, "×"],
              ["Best score", singlePlayerStats.bestScore ?? "—", "★"],
            ].map(([label, value, icon]) => <article className="public-gamer-stat" key={label}><span>{icon}</span><strong>{value}</strong><small>{label}</small></article>)}
          </div>
        )}
      </section>

      <section className="public-gamer-section">
        <div className="public-gamer-section-heading"><div><span>COLLECTION</span><h2>Multiplayer achievements</h2></div><span className="public-gamer-section-icon">🏆</span></div>
        <div className="public-gamer-achievements">{achievements.map((item) => <article key={item.title} className={`public-gamer-achievement${item.unlocked ? " is-unlocked" : ""}`}><span>{item.icon}</span><strong>{item.title}</strong><small>{item.unlocked ? "UNLOCKED" : "LOCKED"}</small></article>)}</div>
      </section>

      <section className="public-gamer-section public-gamer-section--last">
        <div className="public-gamer-section-heading"><div><span>SOLO COLLECTION</span><h2>Single-player achievements</h2></div><span className="public-gamer-section-icon">✧</span></div>
        <div className="public-gamer-achievements">{singlePlayerAchievements.map((item) => <article key={item.title} className={`public-gamer-achievement${item.unlocked ? " is-unlocked" : ""}`}><span>{item.icon}</span><strong>{item.title}</strong><small>{item.unlocked ? "UNLOCKED" : "LOCKED"}</small></article>)}</div>
      </section>
    </main>
  );
}

export default PublicProfile;
