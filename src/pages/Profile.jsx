
// import { useEffect, useState } from "react";
// import { supabase } from "../lib/supabaseClient";
// import { getPlayerLevel, getXPProgress } from "../utils/xpSystem";
// import { useSound } from "../context/SoundContext";

// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer
// } from "recharts";

// export default function Profile() {
//   const [profile, setProfile] = useState(null);
//   const [userId, setUserId] = useState(null);
//   const [email, setEmail] = useState("");
//   const [playerXP, setPlayerXP] = useState(0);
//   const { playLevelUp } = useSound();
//   const currentLevel = getPlayerLevel(playerXP);
//   const xpProgress = getXPProgress(playerXP);
//   const [playerStats, setPlayerStats] = useState({
//     totalMatches: 0,
//     wins: 0,
//     losses: 0,
//     draws: 0,
//     winPercentage: 0,
//     currentStreak: 0,
//     bestStreak: 0
//   });
//   const [singlePlayerStats, setSinglePlayerStats] = useState({
//     gamesPlayed: 0,
//     wins: 0,
//     losses: 0,
//     bestScore: null
//   });

//   const performanceData = [
//     {
//       name: "Wins",
//       matches: playerStats.wins
//     },
//     {
//       name: "Losses",
//       matches: playerStats.losses
//     },
//     {
//       name: "Draws",
//       matches: playerStats.draws
//     }
//   ];
//   const singlePlayerAchievements = [
//     {
//       title: "First Game",
//       icon: "🎮",
//       unlocked: singlePlayerStats.gamesPlayed >= 1
//     },
//     {
//       title: "First Victory",
//       icon: "🥇",
//       unlocked: singlePlayerStats.wins >= 1
//     },
//     {
//       title: "10 Games",
//       icon: "🔥",
//       unlocked: singlePlayerStats.gamesPlayed >= 10
//     },
//     {
//       title: "10 Victories",
//       icon: "💎",
//       unlocked: singlePlayerStats.wins >= 10
//     },
//     {
//       title: "Perfect Player",
//       icon: "👑",
//       unlocked: singlePlayerStats.bestScore === 1
//     }
//   ];
//   const achievements = [
//     {
//       title: "First Match",
//       icon: "🎮",
//       unlocked: playerStats.totalMatches >= 1
//     },
//     {
//       title: "First Victory",
//       icon: "🥇",
//       unlocked: playerStats.wins >= 1
//     },
//     {
//       title: "10 Wins",
//       icon: "🔥",
//       unlocked: playerStats.wins >= 10
//     },
//     {
//       title: "Veteran",
//       icon: "💎",
//       unlocked: playerStats.totalMatches >= 50
//     },
//     {
//       title: "Pro Player",
//       icon: "👑",
//       unlocked: playerStats.totalMatches >= 10 &&
//         Number(playerStats.winPercentage) >= 70
//     }
//   ];
//   const [statsLoading, setStatsLoading] = useState(true);
//   const [recentMatches, setRecentMatches] = useState([]);
//   const [profileCompletion, setProfileCompletion] = useState(0);

//   const [editing, setEditing] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");

//   const [uploading, setUploading] = useState(false);
//   const [avatarError, setAvatarError] = useState("");

//   const [formData, setFormData] = useState({
//     full_name: "",
//     username: "",
//   });

//   // Upload Profile Picture
//   const handleAvatarUpload = async (e) => {
//     const file = e.target.files?.[0];

//     if (!file) return;

//     setAvatarError("");

//     const allowedTypes = [
//       "image/jpeg",
//       "image/png",
//       "image/webp",
//     ];

//     if (!allowedTypes.includes(file.type)) {
//       setAvatarError("Only JPG, PNG and WEBP images are allowed.");
//       e.target.value = "";
//       return;
//     }

//     if (file.size > 2 * 1024 * 1024) {
//       setAvatarError("Image size must be less than 2 MB.");
//       e.target.value = "";
//       return;
//     }

//     setUploading(true);

//     try {
//       const { data: userData, error: userError } =
//         await supabase.auth.getUser();

//       if (userError) throw userError;

//       const currentUserId = userData.user.id;

//       const extension = file.type.split("/")[1].replace("jpeg", "jpg");
//       const filePath = `${currentUserId}/${Date.now()}.${extension}`;

//       const { error: uploadError } = await supabase.storage
//         .from("avatars")
//         .upload(filePath, file, {
//           contentType: file.type,
//         });

//       if (uploadError) throw uploadError;

//       const { data } = supabase.storage
//         .from("avatars")
//         .getPublicUrl(filePath);

//       const avatarUrl = data.publicUrl;

//       const { error: updateError } = await supabase
//         .from("profiles")
//         .update({ avatar_url: avatarUrl })
//         .eq("id", currentUserId);

//       if (updateError) throw updateError;

//       setProfile((previous) => ({
//         ...previous,
//         avatar_url: avatarUrl,
//       }));

//     } catch (err) {
//       console.error("Avatar Upload Error:", err);
//       setAvatarError(err.message || "Image upload failed.");

//     } finally {
//       setUploading(false);
//       e.target.value = "";
//     }
//   };

//   // Remove Profile Picture
//   const handleRemoveAvatar = async () => {
//     if (!profile?.avatar_url) return;

//     const confirmed = window.confirm(
//       "Are you sure you want to remove your profile picture?"
//     );

//     if (!confirmed) return;

//     setAvatarError("");
//     setUploading(true);

//     try {
//       const url = new URL(profile.avatar_url);
//       const marker = "/storage/v1/object/public/avatars/";
//       const index = url.pathname.indexOf(marker);

//       if (index === -1) {
//         throw new Error("Profile picture path not found.");
//       }

//       const filePath = decodeURIComponent(
//         url.pathname.slice(index + marker.length)
//       );

//       const { error: storageError } = await supabase.storage
//         .from("avatars")
//         .remove([filePath]);

//       if (storageError) throw storageError;

//       const { error: updateError } = await supabase
//         .from("profiles")
//         .update({ avatar_url: null })
//         .eq("id", userId);

//       if (updateError) throw updateError;

//       setProfile((previous) => ({
//         ...previous,
//         avatar_url: null,
//       }));

//       setMessage("Profile picture removed successfully!");

//     } catch (err) {
//       console.error("Remove Avatar Error:", err);
//       setAvatarError(err.message || "Unable to remove picture.");

//     } finally {
//       setUploading(false);
//     }
//   };

//   // Fetch Player Statistics
//   const fetchPlayerStats = async (currentUserId) => {
//     setStatsLoading(true);

//     try {
//       const { data, error } = await supabase
//         .from("matches")
//         .select("player_one_id, player_two_id, winner_id, status, created_at")
//         .or(
//           `player_one_id.eq.${currentUserId},player_two_id.eq.${currentUserId}`
//         )
//         .order("created_at", { ascending: false });

//       if (error) throw error;

//       const completedMatches = (data || []).filter(
//         match => match.status === "completed"
//       );

//       const totalMatches = completedMatches.length;

//       const wins = completedMatches.filter(
//         match => match.winner_id === currentUserId
//       ).length;

//       const draws = completedMatches.filter(
//         match => match.winner_id === null
//       ).length;

//       const losses = totalMatches - wins - draws;

//       const winPercentage = totalMatches > 0
//         ? ((wins / totalMatches) * 100).toFixed(1)
//         : 0;


//       // Calculate current and best winning streak
//       let currentStreak = 0;
//       let bestStreak = 0;
//       let streak = 0;

//       for (const match of completedMatches) {
//         if (match.winner_id === currentUserId) {
//           streak++;

//           bestStreak = Math.max(bestStreak, streak);
//         } else {
//           streak = 0;
//         }
//       }

//       currentStreak = 0;

//       for (const match of completedMatches) {
//         if (match.winner_id === currentUserId) {
//           currentStreak++;
//         } else {
//           break;
//         }
//       }

//       // Get the 5 most recent completed matches
//       const recent = completedMatches.slice(0, 5).map((match) => ({
//         ...match,
//         result:
//           match.winner_id === currentUserId
//             ? "Won"
//             : match.winner_id === null
//               ? "Draw"
//               : "Lost"
//       }));

//       setRecentMatches(recent);

//       setPlayerStats({
//         totalMatches,
//         wins,
//         losses,
//         draws,
//         winPercentage,
//         currentStreak,
//         bestStreak
//       });

//     } catch (err) {
//       console.error("Player Statistics Error:", err);

//     } finally {
//       setStatsLoading(false);
//     }
//   };

//   // Fetch Single Player Statistics
//   const fetchSinglePlayerStats = async (currentUserId) => {
//     try {
//       const { data, error } = await supabase
//         .from("single_player_stats")
//         .select("games_played, wins, losses, best_score")
//         .eq("user_id", currentUserId)
//         .maybeSingle();

//       if (error) throw error;

//       if (data) {
//         setSinglePlayerStats({
//           gamesPlayed: data.games_played,
//           wins: data.wins,
//           losses: data.losses,
//           bestScore: data.best_score
//         });
//       }

//     } catch (err) {
//       console.error("Single Player Statistics Error:", err);
//     }
//   };
//   const fetchPlayerXP = async (currentUserId) => {
//     try {
//       const { data, error } = await supabase
//         .from("player_progress")
//         .select("total_xp")
//         .eq("user_id", currentUserId)
//         .maybeSingle();

//       if (error) throw error;

//       const totalXP = data?.total_xp ?? 0;
//       const nextLevel = getPlayerLevel(totalXP).level;

//       try {
//         const levelStorageKey = `number-guesser-last-seen-level-${currentUserId}`;
//         const previousLevel = Number(localStorage.getItem(levelStorageKey));
//         if (previousLevel > 0 && nextLevel > previousLevel) playLevelUp();
//         localStorage.setItem(levelStorageKey, String(nextLevel));
//       } catch {
//         // Level audio is optional; profile data should still load if storage is unavailable.
//       }

//       setPlayerXP(totalXP);
//     } catch (err) {
//       console.error("Player XP Error:", err);
//     }
//   };


//   // Fetch Profile
//   useEffect(() => {
//     async function fetchProfile() {
//       try {
//         const { data: userData, error: userError } =
//           await supabase.auth.getUser();

//         if (userError) throw userError;

//         const user = userData.user;

//         if (!user) {
//           setError("Please login to view your profile.");
//           return;
//         }

//         setUserId(user.id);
//         setEmail(user.email);

//         await fetchPlayerStats(user.id);
//         await fetchSinglePlayerStats(user.id);
//         await fetchPlayerXP(user.id);

//         const { data, error: profileError } = await supabase
//           .from("profiles")
//           .select("username, full_name, avatar_url, created_at")
//           .eq("id", user.id)
//           .single();

//         if (profileError) throw profileError;

//         setProfile(data);

//         // Calculate Profile Completion
//         const completedFields = [
//           data.avatar_url,
//           data.full_name,
//           data.username
//         ].filter(Boolean).length;

//         const completionPercentage = Math.round(
//           (completedFields / 3) * 100
//         );

//         setProfileCompletion(completionPercentage);

//         setFormData({
//           full_name: data.full_name || "",
//           username: data.username || "",
//         });

//       } catch (err) {
//         console.error("Profile Error:", err);
//         setError(err.message || "Unable to load profile.");
//       }
//     }

//     fetchProfile();
//   }, []);

//   // Handle Input Changes
//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   // Save Profile
//   const handleSave = async (e) => {
//     e.preventDefault();

//     setMessage("");
//     setError("");

//     const fullName = formData.full_name.trim();
//     const username = formData.username.trim().toLowerCase();

//     if (!fullName || !username) {
//       setError("Full name and username are required.");
//       return;
//     }

//     setSaving(true);

//     try {
//       const { data, error: updateError } = await supabase
//         .from("profiles")
//         .update({
//           full_name: fullName,
//           username: username,
//         })
//         .eq("id", userId)
//         .select()
//         .single();

//       if (updateError) throw updateError;

//       setProfile((previous) => ({
//         ...previous,
//         ...data,
//       }));

//       setFormData({
//         full_name: data.full_name,
//         username: data.username,
//       });

//       setEditing(false);
//       setMessage("Profile updated successfully!");

//     } catch (err) {
//       console.error("Update Error:", err);

//       if (err.code === "23505") {
//         setError("This username is already taken.");
//       } else {
//         setError(err.message || "Unable to update profile.");
//       }

//     } finally {
//       setSaving(false);
//     }
//   };

//   // Cancel Editing
//   const handleCancel = () => {
//     setFormData({
//       full_name: profile.full_name,
//       username: profile.username,
//     });

//     setEditing(false);
//     setMessage("");
//     setError("");
//   };

//   if (error && !profile) {
//     return <h2>{handleRemoveAvatar}</h2>;
//   }

//   if (!profile) {
//     return <h2>Loading Profile...</h2>;
//   }

//   return (
//     <div className="profile-container">
//       <div className="profile-card">

//         <h1>My Profile</h1>

//         {/* Profile Completion */}
//         <div className="profile-completion">

//           <div className="completion-header">
//             <h3>Profile Completion</h3>
//             <span>{profileCompletion}%</span>
//           </div>

//           <div className="completion-bar">
//             <div
//               className="completion-fill"
//               style={{ width: `${profileCompletion}%` }}
//             ></div>
//           </div>

//           <p>
//             {profileCompletion === 100
//               ? "Your profile is complete!"
//               : "Complete your profile to reach 100%."}
//           </p>

//         </div>

//         <div className="profile-avatar">
//           {profile.avatar_url ? (
//             <img
//               src={profile.avatar_url}
//               alt="Profile"
//               className="profile-avatar-image"
//             />
//           ) : (
//             profile.full_name?.charAt(0).toUpperCase()
//           )}
//         </div>

//         <label className="upload-avatar-button">
//           {uploading ? "Uploading..." : "Upload Profile Picture"}

//           <input
//             type="file"
//             accept="image/jpeg,image/png,image/webp"
//             onChange={handleAvatarUpload}
//             disabled={uploading}
//             hidden
//           />
//         </label>



//         <button
//           type="button"
//           onClick={handleRemoveAvatar}
//           disabled={!profile.avatar_url || uploading}
//         >
//           {uploading ? "Please wait..." : "Remove Profile Picture"}
//         </button>

//         {avatarError && <p>{avatarError}</p>}

//         <h2>{profile.full_name}</h2>
//         <p>@{profile.username}</p>

//         <hr />

//         <div className="player-level-card">
//           <h2>🏆 Player Level</h2>

//           <h3>
//             Level {currentLevel.level} - {currentLevel.title}
//           </h3>

//           <p>{playerXP} XP</p>

//           <div className="xp-progress-bar">
//             <div
//               className="xp-progress-fill"
//               style={{ width: `${xpProgress}%` }}
//             ></div>
//           </div>

//           <p>{xpProgress}% Progress</p>
//         </div>

//         {/* Player Statistics */}
//         <div className="player-statistics">

//           <h2>My Gaming Statistics</h2>

//           {statsLoading ? (
//             <p>Loading statistics...</p>
//           ) : (
//             <div className="player-stats-grid">

//               <div className="player-stat-card">
//                 <h3>Total Matches</h3>
//                 <p>{playerStats.totalMatches}</p>
//               </div>

//               <div className="player-stat-card">
//                 <h3>Wins</h3>
//                 <p>{playerStats.wins}</p>
//               </div>

//               <div className="player-stat-card">
//                 <h3>Losses</h3>
//                 <p>{playerStats.losses}</p>
//               </div>

//               <div className="player-stat-card">
//                 <h3>Draws</h3>
//                 <p>{playerStats.draws}</p>
//               </div>

//               <div className="player-stat-card">
//                 <h3>Current Winning Streak</h3>
//                 <p>🔥 {playerStats.currentStreak}</p>
//               </div>

//               <div className="player-stat-card">
//                 <h3>Best Winning Streak</h3>
//                 <p>🏆 {playerStats.bestStreak}</p>
//               </div>

//               <div className="player-stat-card">
//                 <h3>Win Percentage</h3>
//                 <p>{playerStats.winPercentage}%</p>
//               </div>

//             </div>

//           )}




//           {/* Player Performance Chart */}
//           <div className="performance-chart">

//             <h2>Match Performance</h2>

//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart data={performanceData}>
//                 <CartesianGrid strokeDasharray="3 3" />

//                 <XAxis dataKey="name" />

//                 <YAxis allowDecimals={false} />

//                 <Tooltip />

//                 <Bar
//                   dataKey="matches"
//                   fill="#2563eb"
//                   radius={[8, 8, 0, 0]}
//                 />
//               </BarChart>
//             </ResponsiveContainer>

//           </div>

//           {/* Single Player Achievements */}
//           <div className="public-achievements">
//             {/* Multiplayer Achievements */}
//             <div className="public-achievements">
//               <h2>🏆 My Multiplayer Achievements</h2>

//               <div className="achievements-grid">
//                 {achievements.map((achievement, index) => (
//                   <div
//                     key={index}
//                     className={`achievement-card ${achievement.unlocked ? "unlocked" : "locked"
//                       }`}
//                   >
//                     <span className="achievement-icon">
//                       {achievement.icon}
//                     </span>

//                     <h3>{achievement.title}</h3>

//                     <p>
//                       {achievement.unlocked ? "Unlocked" : "Locked"}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//             <h2>🏆 My Single Player Achievements</h2>

//             <div className="achievements-grid">
//               {singlePlayerAchievements.map((achievement, index) => (
//                 <div
//                   key={index}
//                   className={`achievement-card ${achievement.unlocked ? "unlocked" : "locked"
//                     }`}
//                 >
//                   <span className="achievement-icon">
//                     {achievement.icon}
//                   </span>

//                   <h3>{achievement.title}</h3>

//                   <p>
//                     {achievement.unlocked ? "Unlocked" : "Locked"}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Recent Match Performance */}
//           <div className="recent-matches">

//             <h3>Recent Match Performance</h3>

//             {recentMatches.length === 0 ? (
//               <p>No completed matches yet.</p>
//             ) : (
//               <div className="recent-matches-list">

//                 {recentMatches.map((match, index) => (
//                   <span
//                     key={`${match.created_at}-${index}`}
//                     className={`recent-match-result recent-${match.result.toLowerCase()}`}
//                     title={match.result}
//                   >
//                     {match.result === "Won"
//                       ? "W"
//                       : match.result === "Lost"
//                         ? "L"
//                         : "D"}
//                   </span>
//                 ))}

//               </div>
//             )}

//           </div>

//         </div>


//         {editing ? (
//           <form onSubmit={handleSave}>

//             <label>Full Name</label>
//             <input
//               type="text"
//               name="full_name"
//               value={formData.full_name}
//               onChange={handleChange}
//               required
//             />

//             <label>Username</label>
//             <input
//               type="text"
//               name="username"
//               value={formData.username}
//               onChange={handleChange}
//               required
//             />

//             <button type="submit" disabled={saving}>
//               {saving ? "Saving..." : "Save Changes"}
//             </button>

//             <button
//               type="button"
//               onClick={handleCancel}
//               disabled={saving}
//             >
//               Cancel
//             </button>

//           </form>
//         ) : (
//           <div className="profile-details">

//             <p>
//               <strong>Full Name:</strong> {profile.full_name}
//             </p>

//             <p>
//               <strong>Username:</strong> {profile.username}
//             </p>

//             <p>
//               <strong>Email:</strong> {email}
//             </p>

//             <p>
//               <strong>Joined:</strong>{" "}
//               {new Date(profile.created_at).toLocaleDateString()}
//             </p>

//             <button onClick={() => {
//               setMessage("");
//               setError("");
//               setEditing(true);
//             }}>
//               Edit Profile
//             </button>

//           </div>
//         )}

//         {message && <p>{message}</p>}
//         {error && <p>{error}</p>}

//       </div>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { getPlayerLevel, getXPProgress } from "../utils/xpSystem";
import { useSound } from "../context/SoundContext";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [userId, setUserId] = useState(null);
  const [email, setEmail] = useState("");
  const [playerXP, setPlayerXP] = useState(0);
  const { playLevelUp } = useSound();
  const currentLevel = getPlayerLevel(playerXP);
  const xpProgress = getXPProgress(playerXP);
  const [playerStats, setPlayerStats] = useState({
    totalMatches: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    winPercentage: 0,
    currentStreak: 0,
    bestStreak: 0
  });
  const [singlePlayerStats, setSinglePlayerStats] = useState({
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    bestScore: null
  });

  const performanceData = [
    {
      name: "Wins",
      matches: playerStats.wins
    },
    {
      name: "Losses",
      matches: playerStats.losses
    },
    {
      name: "Draws",
      matches: playerStats.draws
    }
  ];
  const singlePlayerAchievements = [
    {
      title: "First Game",
      icon: "🎮",
      unlocked: singlePlayerStats.gamesPlayed >= 1
    },
    {
      title: "First Victory",
      icon: "🥇",
      unlocked: singlePlayerStats.wins >= 1
    },
    {
      title: "10 Games",
      icon: "🔥",
      unlocked: singlePlayerStats.gamesPlayed >= 10
    },
    {
      title: "10 Victories",
      icon: "💎",
      unlocked: singlePlayerStats.wins >= 10
    },
    {
      title: "Perfect Player",
      icon: "👑",
      unlocked: singlePlayerStats.bestScore === 1
    }
  ];
  const achievements = [
    {
      title: "First Match",
      icon: "🎮",
      unlocked: playerStats.totalMatches >= 1
    },
    {
      title: "First Victory",
      icon: "🥇",
      unlocked: playerStats.wins >= 1
    },
    {
      title: "10 Wins",
      icon: "🔥",
      unlocked: playerStats.wins >= 10
    },
    {
      title: "Veteran",
      icon: "💎",
      unlocked: playerStats.totalMatches >= 50
    },
    {
      title: "Pro Player",
      icon: "👑",
      unlocked: playerStats.totalMatches >= 10 &&
        Number(playerStats.winPercentage) >= 70
    }
  ];
  const [statsLoading, setStatsLoading] = useState(true);
  const [recentMatches, setRecentMatches] = useState([]);
  const [profileCompletion, setProfileCompletion] = useState(0);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [uploading, setUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
  });

  // Upload Profile Picture
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setAvatarError("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setAvatarError("Only JPG, PNG and WEBP images are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Image size must be less than 2 MB.");
      e.target.value = "";
      return;
    }

    setUploading(true);

    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError) throw userError;

      const currentUserId = userData.user.id;

      const extension = file.type.split("/")[1].replace("jpeg", "jpg");
      const filePath = `${currentUserId}/${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const avatarUrl = data.publicUrl;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", currentUserId);

      if (updateError) throw updateError;

      setProfile((previous) => ({
        ...previous,
        avatar_url: avatarUrl,
      }));
      setProfileCompletion(Math.round(
        ([avatarUrl, profile?.full_name, profile?.username].filter(Boolean).length / 3) * 100
      ));

    } catch (err) {
      console.error("Avatar Upload Error:", err);
      setAvatarError(err.message || "Image upload failed.");

    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Remove Profile Picture
  const handleRemoveAvatar = async () => {
    if (!profile?.avatar_url) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove your profile picture?"
    );

    if (!confirmed) return;

    setAvatarError("");
    setUploading(true);

    try {
      const url = new URL(profile.avatar_url);
      const marker = "/storage/v1/object/public/avatars/";
      const index = url.pathname.indexOf(marker);

      if (index === -1) {
        throw new Error("Profile picture path not found.");
      }

      const filePath = decodeURIComponent(
        url.pathname.slice(index + marker.length)
      );

      const { error: storageError } = await supabase.storage
        .from("avatars")
        .remove([filePath]);

      if (storageError) throw storageError;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", userId);

      if (updateError) throw updateError;

      setProfile((previous) => ({
        ...previous,
        avatar_url: null,
      }));
      setProfileCompletion(Math.round(
        ([profile?.full_name, profile?.username].filter(Boolean).length / 3) * 100
      ));

      setMessage("Profile picture removed successfully!");

    } catch (err) {
      console.error("Remove Avatar Error:", err);
      setAvatarError(err.message || "Unable to remove picture.");

    } finally {
      setUploading(false);
    }
  };

  // Fetch Player Statistics
  const fetchPlayerStats = async (currentUserId) => {
    setStatsLoading(true);

    try {
      const { data, error } = await supabase
        .from("matches")
        .select("player_one_id, player_two_id, winner_id, status, created_at")
        .or(
          `player_one_id.eq.${currentUserId},player_two_id.eq.${currentUserId}`
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const completedMatches = (data || []).filter(
        match => match.status === "completed"
      );

      const totalMatches = completedMatches.length;

      const wins = completedMatches.filter(
        match => match.winner_id === currentUserId
      ).length;

      const draws = completedMatches.filter(
        match => match.winner_id === null
      ).length;

      const losses = totalMatches - wins - draws;

      const winPercentage = totalMatches > 0
        ? ((wins / totalMatches) * 100).toFixed(1)
        : 0;


      // Calculate current and best winning streak
      let currentStreak = 0;
      let bestStreak = 0;
      let streak = 0;

      for (const match of completedMatches) {
        if (match.winner_id === currentUserId) {
          streak++;

          bestStreak = Math.max(bestStreak, streak);
        } else {
          streak = 0;
        }
      }

      currentStreak = 0;

      for (const match of completedMatches) {
        if (match.winner_id === currentUserId) {
          currentStreak++;
        } else {
          break;
        }
      }

      // Get the 5 most recent completed matches
      const recent = completedMatches.slice(0, 5).map((match) => ({
        ...match,
        result:
          match.winner_id === currentUserId
            ? "Won"
            : match.winner_id === null
              ? "Draw"
              : "Lost"
      }));

      setRecentMatches(recent);

      setPlayerStats({
        totalMatches,
        wins,
        losses,
        draws,
        winPercentage,
        currentStreak,
        bestStreak
      });

    } catch (err) {
      console.error("Player Statistics Error:", err);

    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch Single Player Statistics
  const fetchSinglePlayerStats = async (currentUserId) => {
    try {
      const { data, error } = await supabase
        .from("single_player_stats")
        .select("games_played, wins, losses, best_score")
        .eq("user_id", currentUserId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSinglePlayerStats({
          gamesPlayed: data.games_played,
          wins: data.wins,
          losses: data.losses,
          bestScore: data.best_score
        });
      }

    } catch (err) {
      console.error("Single Player Statistics Error:", err);
    }
  };
  const fetchPlayerXP = async (currentUserId) => {
    try {
      const { data, error } = await supabase
        .from("player_progress")
        .select("total_xp")
        .eq("user_id", currentUserId)
        .maybeSingle();

      if (error) throw error;

      const totalXP = data?.total_xp ?? 0;
      const nextLevel = getPlayerLevel(totalXP).level;

      try {
        const levelStorageKey = `number-guesser-last-seen-level-${currentUserId}`;
        const previousLevel = Number(localStorage.getItem(levelStorageKey));
        if (previousLevel > 0 && nextLevel > previousLevel) playLevelUp();
        localStorage.setItem(levelStorageKey, String(nextLevel));
      } catch {
        // Level audio is optional; profile data should still load if storage is unavailable.
      }

      setPlayerXP(totalXP);
    } catch (err) {
      console.error("Player XP Error:", err);
    }
  };


  // Fetch Profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data: userData, error: userError } =
          await supabase.auth.getUser();

        if (userError) throw userError;

        const user = userData.user;

        if (!user) {
          setError("Please login to view your profile.");
          return;
        }

        setUserId(user.id);
        setEmail(user.email);

        await fetchPlayerStats(user.id);
        await fetchSinglePlayerStats(user.id);
        await fetchPlayerXP(user.id);

        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("username, full_name, avatar_url, created_at")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        setProfile(data);

        // Calculate Profile Completion
        const completedFields = [
          data.avatar_url,
          data.full_name,
          data.username
        ].filter(Boolean).length;

        const completionPercentage = Math.round(
          (completedFields / 3) * 100
        );

        setProfileCompletion(completionPercentage);

        setFormData({
          full_name: data.full_name || "",
          username: data.username || "",
        });

      } catch (err) {
        console.error("Profile Error:", err);
        setError(err.message || "Unable to load profile.");
      }
    }

    fetchProfile();
  }, []);

  // Handle Input Changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Save Profile
  const handleSave = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const fullName = formData.full_name.trim();
    const username = formData.username.trim().toLowerCase();

    if (!fullName || !username) {
      setError("Full name and username are required.");
      return;
    }

    setSaving(true);

    try {
      const { data, error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          username: username,
        })
        .eq("id", userId)
        .select()
        .single();

      if (updateError) throw updateError;

      setProfile((previous) => ({
        ...previous,
        ...data,
      }));
      setProfileCompletion(Math.round(
        ([data.avatar_url, data.full_name, data.username].filter(Boolean).length / 3) * 100
      ));

      setFormData({
        full_name: data.full_name,
        username: data.username,
      });

      setEditing(false);
      setMessage("Profile updated successfully!");

    } catch (err) {
      console.error("Update Error:", err);

      if (err.code === "23505") {
        setError("This username is already taken.");
      } else {
        setError(err.message || "Unable to update profile.");
      }

    } finally {
      setSaving(false);
    }
  };

  // Cancel Editing
  const handleCancel = () => {
    setFormData({
      full_name: profile.full_name,
      username: profile.username,
    });

    setEditing(false);
    setMessage("");
    setError("");
  };

  if (error && !profile) {
    return <section className="player-profile-page"><div className="profile-state-card" role="alert"><span className="profile-state-icon">!</span><h1>Unable to load your profile</h1><p>{error}</p></div></section>;
  }

  if (!profile) {
    return <section className="player-profile-page"><div className="profile-state-card" role="status"><span className="profile-loader" /><h1>Loading your player profile</h1><p>Getting your stats, level and achievements ready...</p></div></section>;
  }

  const joinedDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, { month: "short", year: "numeric" })
    : "Player";

  return (
    <div className="player-profile-page">
      <div className="player-profile-heading">
        <div><span className="profile-eyebrow">PLAYER HUB</span><h1>My Profile</h1><p>Your progress, performance and achievements in one place.</p></div>
        <span className="profile-member-since">MEMBER SINCE {joinedDate.toUpperCase()}</span>
      </div>

      <section className="profile-hero-card">
        <div className="profile-hero-glow" aria-hidden="true" />
        <div className="profile-hero-main">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">
              {profile.avatar_url ? <img src={profile.avatar_url} alt={`${profile.full_name || profile.username}'s profile`} className="profile-avatar-image" /> : <span>{(profile.full_name || profile.username || "P").charAt(0).toUpperCase()}</span>}
            </div>
            <span className="profile-avatar-status" title="Player account" />
          </div>
          <div className="profile-identity">
            <span className="profile-identity-kicker">YOUR PLAYER ID</span>
            <h2>{profile.full_name || "Number Guesser Player"}</h2>
            <p>@{profile.username || "player"}</p>
            <div className="profile-identity-tags"><span>✦ Level {currentLevel.level}</span><span>◈ {currentLevel.title}</span></div>
          </div>
          <div className="profile-hero-actions">
            <label className="profile-action-button profile-action-primary">{uploading ? "Uploading..." : "↥ Change photo"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarUpload} disabled={uploading} hidden /></label>
            <button type="button" className="profile-action-button profile-action-quiet" onClick={handleRemoveAvatar} disabled={!profile.avatar_url || uploading}>Remove photo</button>
          </div>
        </div>
        {avatarError && <p className="profile-inline-message profile-inline-error" role="alert">{avatarError}</p>}
        <div className="profile-hero-divider" />
        <div className="profile-completion profile-completion-premium">
          <div className="completion-header"><div><span className="profile-section-kicker">ACCOUNT SETUP</span><h3>Profile completion</h3></div><strong>{profileCompletion}%</strong></div>
          <div className="completion-bar" role="progressbar" aria-label="Profile completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={profileCompletion}><div className="completion-fill" style={{ width: `${profileCompletion}%` }} /></div>
          <p>{profileCompletion === 100 ? "All set! Your player profile is complete." : "Add your photo, name and username to complete your player identity."}</p>
        </div>
      </section>

      <section className="profile-level-card profile-level-card-premium">
        <div className="profile-level-top"><div className="profile-level-emblem" aria-hidden="true">♛</div><div className="profile-level-copy"><span className="profile-section-kicker">PLAYER PROGRESSION</span><h2>Level {currentLevel.level} <span>·</span> {currentLevel.title}</h2><p>Keep playing to earn XP and reach the next rank.</p></div><div className="profile-xp-total"><strong>{playerXP.toLocaleString()}</strong><span>TOTAL XP</span></div></div>
        <div className="profile-xp-track"><div className="profile-xp-fill" style={{ width: `${xpProgress}%` }} /></div>
        <div className="profile-xp-foot"><span>{xpProgress}% progress in current level</span><span>{currentLevel.level === 6 ? "MAX LEVEL REACHED" : "NEXT LEVEL AWAITS"}</span></div>
      </section>

      <section className="profile-section">
        <div className="profile-section-heading"><div><span className="profile-section-kicker">YOUR PERFORMANCE</span><h2>Gaming statistics</h2></div><span className="profile-section-note">MULTIPLAYER</span></div>
        {statsLoading ? <div className="profile-loading-grid" aria-label="Loading gaming statistics">{Array.from({ length: 6 }).map((_, i) => <span key={i} />)}</div> :
          <div className="profile-stats-grid">
            <article className="profile-stat-card"><span className="profile-stat-icon">◈</span><span className="profile-stat-label">Total matches</span><strong>{playerStats.totalMatches}</strong></article>
            <article className="profile-stat-card profile-stat-win"><span className="profile-stat-icon">✓</span><span className="profile-stat-label">Wins</span><strong>{playerStats.wins}</strong></article>
            <article className="profile-stat-card profile-stat-loss"><span className="profile-stat-icon">×</span><span className="profile-stat-label">Losses</span><strong>{playerStats.losses}</strong></article>
            <article className="profile-stat-card"><span className="profile-stat-icon">＝</span><span className="profile-stat-label">Draws</span><strong>{playerStats.draws}</strong></article>
            <article className="profile-stat-card profile-stat-highlight"><span className="profile-stat-icon">％</span><span className="profile-stat-label">Win rate</span><strong>{playerStats.winPercentage}%</strong></article>
            <article className="profile-stat-card profile-stat-streak"><span className="profile-stat-icon">🔥</span><span className="profile-stat-label">Current streak</span><strong>{playerStats.currentStreak}</strong></article>
            <article className="profile-stat-card profile-stat-streak"><span className="profile-stat-icon">♛</span><span className="profile-stat-label">Best streak</span><strong>{playerStats.bestStreak}</strong></article>
          </div>}
      </section>

      <section className="profile-section">
        <div className="profile-section-heading"><div><span className="profile-section-kicker">MATCH BREAKDOWN</span><h2>Performance overview</h2></div></div>
        <div className="performance-chart profile-chart">
          {statsLoading ? <p className="profile-muted">Loading performance data...</p> : playerStats.totalMatches === 0 ? <div className="profile-empty-state"><span>▤</span><strong>Your match chart will appear here</strong><p>Play your first multiplayer match to start tracking performance.</p></div> :
            <ResponsiveContainer width="100%" height={260}><BarChart data={performanceData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}><CartesianGrid stroke="rgba(185,205,226,.10)" strokeDasharray="4 4" vertical={false} /><XAxis dataKey="name" tick={{ fill: "#9ba9ba", fontSize: 12 }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fill: "#8292a5", fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: "#121c28", border: "1px solid rgba(190,211,232,.16)", borderRadius: 12, color: "#f4f7fb" }} cursor={{ fill: "rgba(163,255,79,.05)" }} /><Bar dataKey="matches" fill="#a3ff4f" radius={[7, 7, 0, 0]} maxBarSize={54} /></BarChart></ResponsiveContainer>}
        </div>
      </section>

      <section className="profile-section">
        <div className="profile-section-heading"><div><span className="profile-section-kicker">COLLECT YOUR GLORY</span><h2>Achievements</h2></div><span className="profile-section-note">MULTIPLAYER + SOLO</span></div>
        <div className="profile-achievement-group"><h3>Multiplayer achievements</h3><div className="achievements-grid profile-achievements-grid">{achievements.map((a) => <article key={a.title} className={`achievement-card profile-achievement-card ${a.unlocked ? "unlocked" : "locked"}`}><span className="achievement-icon">{a.icon}</span><h3>{a.title}</h3><p>{a.unlocked ? "✓ Unlocked" : "◌ Locked"}</p></article>)}</div></div>
        <div className="profile-achievement-group"><h3>Single-player achievements</h3><div className="achievements-grid profile-achievements-grid">{singlePlayerAchievements.map((a) => <article key={a.title} className={`achievement-card profile-achievement-card ${a.unlocked ? "unlocked" : "locked"}`}><span className="achievement-icon">{a.icon}</span><h3>{a.title}</h3><p>{a.unlocked ? "✓ Unlocked" : "◌ Locked"}</p></article>)}</div></div>
      </section>

      <section className="profile-section profile-recent-section">
        <div className="profile-section-heading"><div><span className="profile-section-kicker">LATEST ACTIVITY</span><h2>Recent matches</h2></div><span className="profile-section-note">LAST 5 COMPLETED</span></div>
        {recentMatches.length === 0 ? <div className="profile-empty-state profile-empty-card"><span>◷</span><strong>No completed matches yet</strong><p>Your recent multiplayer results will show here after your first match.</p></div> :
          <div className="profile-recent-list">{recentMatches.map((match, index) => <div className="profile-recent-item" key={`${match.created_at}-${index}`}><span className={`profile-result-mark profile-result-${match.result.toLowerCase()}`}>{match.result === "Won" ? "W" : match.result === "Lost" ? "L" : "D"}</span><span className="profile-recent-label">Match {recentMatches.length - index}</span><strong className={`profile-recent-result profile-recent-result-${match.result.toLowerCase()}`}>{match.result}</strong><time dateTime={match.created_at}>{new Date(match.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</time></div>)}</div>}
      </section>

      <section className="profile-section profile-account-section">
        <div className="profile-section-heading"><div><span className="profile-section-kicker">ACCOUNT DETAILS</span><h2>Personal information</h2></div>{!editing && <button className="profile-edit-trigger" type="button" onClick={() => { setMessage(""); setError(""); setEditing(true); }}>✎ Edit profile</button>}</div>
        {editing ? <form className="profile-edit-form" onSubmit={handleSave}>
          <label><span>Full name</span><input type="text" name="full_name" value={formData.full_name} onChange={handleChange} autoComplete="name" required /></label>
          <label><span>Username</span><input type="text" name="username" value={formData.username} onChange={handleChange} autoComplete="username" required /></label>
          <div className="profile-edit-actions"><button className="profile-save-button" type="submit" disabled={saving}>{saving ? "Saving changes..." : "Save changes"}</button><button className="profile-cancel-button" type="button" onClick={handleCancel} disabled={saving}>Cancel</button></div>
        </form> : <div className="profile-details-grid"><div><span>Full name</span><strong>{profile.full_name || "Not added"}</strong></div><div><span>Username</span><strong>@{profile.username || "Not added"}</strong></div><div><span>Email address</span><strong>{email}</strong></div><div><span>Member since</span><strong>{joinedDate}</strong></div></div>}
        {message && <p className="profile-inline-message profile-inline-success" role="status">{message}</p>}{error && <p className="profile-inline-message profile-inline-error" role="alert">{error}</p>}
      </section>
    </div>
  );
}
