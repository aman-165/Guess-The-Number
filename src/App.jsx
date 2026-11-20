import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
const Signup = lazy(() => import("./pages/Signup"));
const Login = lazy(() => import("./pages/Login"));
const Profile = lazy(() => import("./pages/Profile"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
import ProtectedRoute from "./components/ProtectedRoute"; // FOR ProtectedRoute.jsx
import GuestRoute from "./components/GuestRoute"; // FOR GuestRoute.jsx
const SearchPlayers = lazy(() => import("./pages/SearchPlayers"));
const FriendRequests = lazy(() => import("./pages/FriendRequests"));
const Friends = lazy(() => import("./pages/Friends"));
const IncomingChallenges = lazy(() => import("./pages/IncomingChallenges"));
const OutgoingChallenges = lazy(() => import("./pages/OutgoingChallenges"));
const ChallengeHistory = lazy(() => import("./pages/ChallengeHistory"));
const MultiplayerMatch = lazy(() => import("./pages/MultiplayerMatch"));
const MatchHistory = lazy(() => import("./pages/MatchHistory"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
const Chat = lazy(() => import("./pages/Chat"));
const Home = lazy(() => import("./pages/Home"));
const Game = lazy(() => import("./pages/Game"));
const DailyChallenge = lazy(() => import("./pages/DailyChallenge"));
const Rules = lazy(() => import("./pages/Rules"));
import Navbar from "./components/Navbar";

import { supabase } from "./lib/supabaseClient";
import { useSound } from "./context/SoundContext";

export default function App() {
  const location = useLocation();
  const { setMusicTrack } = useSound();

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith("/daily-challenge")) setMusicTrack("dailyChallenge");
    else if (path.startsWith("/multiplayer-match")) setMusicTrack("multiplayer");
    else if (path === "/game") setMusicTrack("gameplay");
    else setMusicTrack("menu");
  }, [location.pathname, setMusicTrack]);

  useEffect(() => {
    async function checkConnection() {
      try {
        const { error } = await supabase.auth.getSession();

        if (error) {
          console.error("Supabase Error:", error.message);
          return;
        }

        console.log("Supabase client initialized successfully!");
      } catch (error) {
        console.error("Connection Error:", error.message);
      }
    }

    checkConnection();
  }, []);

  return (
    <div className="app-shell">
      <Navbar />

      <main className="page-wrap">
        <Suspense fallback={<div className="route-loading" role="status" aria-live="polite"><span className="route-loading__spinner" />Loading page...</div>}>
          <Routes>

            <Route
              path="/login"
              element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              }
            />

            <Route
              path="/signup"
              element={
                <GuestRoute>
                  <Signup />
                </GuestRoute>
              }
            />


            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/forgot-password"
              element={<ForgotPassword />}
            />
            <Route
              path="/reset-password"
              element={<ResetPassword />}
            />
            <Route
              path="/search-players"
              element={
                <ProtectedRoute>
                  <SearchPlayers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/friend-requests"
              element={
                <ProtectedRoute>
                  <FriendRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/friends"
              element={
                <ProtectedRoute>
                  <Friends />
                </ProtectedRoute>
              }
            />
            <Route
              path="/incoming-challenges"
              element={
                <ProtectedRoute>
                  <IncomingChallenges />
                </ProtectedRoute>
              }
            />
            <Route
              path="/outgoing-challenges"
              element={
                <ProtectedRoute>
                  <OutgoingChallenges />
                </ProtectedRoute>
              }
            />
            <Route
              path="/challenge-history"
              element={
                <ProtectedRoute>
                  <ChallengeHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/multiplayer-match/:matchId"
              element={
                <ProtectedRoute>
                  <MultiplayerMatch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/match-history"
              element={
                <ProtectedRoute>
                  <MatchHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/player/:userId"
              element={
                <ProtectedRoute>
                  <PublicProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />



            <Route path="/" element={<Home />} />

            <Route path="/game" element={<Game />} />

            <Route
              path="/daily-challenge"
              element={
                <ProtectedRoute>
                  <DailyChallenge />
                </ProtectedRoute>
              }
            />

            <Route path="/rules" element={<Rules />} />
          </Routes>
        </Suspense>
      </main>

      <footer className="footer">
        <span>Made By ⚡ NONE</span>
      </footer>
    </div>
  );
}
