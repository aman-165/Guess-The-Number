/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import {
  getSoundSettings,
  subscribeSoundSettings,
  setSoundEnabled,
  setVolume,
  setEffectsVolume,
  setMusicEnabled,
  setMusicVolume,
  setMusicTrack,
  toggleSoundEnabled,
  playClick,
  playCorrect,
  playWrong,
  playWin,
  playLose,
  playLevelUp,
  playCountdown,
  playNotification,
  playMessage,
  playAchievement,
  playHeartLoss,
  playTileFlip,
  playChallengeStart,
  playChallengeComplete,
} from "../utils/soundManager";

const SoundContext = createContext(null);

export function SoundProvider({ children }) {
  const [settings, setSettings] = useState(getSoundSettings);

  useEffect(() => subscribeSoundSettings(() => setSettings({ ...getSoundSettings() })), []);

  // One delegated listener gives ordinary buttons and navigation links a consistent click sound.
  useEffect(() => {
    const handleClick = (event) => {
      const target = event.target instanceof Element ? event.target.closest("button, a, [role='button']") : null;
      if (!target || target.disabled || target.getAttribute("aria-disabled") === "true") return;
      if (target.closest("[data-sound-ignore='true']")) return;
      playClick();
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  const value = {
    settings,
    setSoundEnabled,
    setVolume,
    setEffectsVolume,
    setMusicEnabled,
    setMusicVolume,
    setMusicTrack,
    toggleSoundEnabled,
    playClick,
    playCorrect,
    playWrong,
    playWin,
    playLose,
    playLevelUp,
    playCountdown,
    playNotification,
    playMessage,
    playAchievement,
    playHeartLoss,
    playTileFlip,
    playChallengeStart,
    playChallengeComplete,
  };

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) throw new Error("useSound must be used within a SoundProvider");
  return context;
}
