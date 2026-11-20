import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import "./styles/design-system.css";
import "./styles/gameplay.css";
import "./styles/social-experience.css";
import "./styles/multiplayer-match.css";
import "./styles/friends.css";
import "./styles/friend-requests.css"
import "./styles/find-players.css";
import "./styles/mobile-optimization.css"
import { SoundProvider } from "./context/SoundContext";
import { ToastProvider } from "./context/ToastContext";
import MicroInteractions from "./components/MicroInteractions";
import "./styles/micro-interactions.css";
import "./styles/performance.css";
import "./styles/navbar.css";
import "./styles/notification-center.css";
import "./styles/sound-settings.css";
import "./styles/auth.css";
import "./styles/profile-premium.css";
import "./styles/public-profile.css";
import "./styles/daily-challenge.css";
import "./styles/home.css";
import "./styles/rules.css"
import "./styles/chat.css"
import "./styles/incoming-challenges.css"
import "./styles/outgoing-challenges.css";
import "./styles/challenge-history.css";
import "./styles/match-history.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <SoundProvider>
      <ToastProvider>
        <MicroInteractions />
        <App />
      </ToastProvider>
    </SoundProvider>
  </BrowserRouter>
);

