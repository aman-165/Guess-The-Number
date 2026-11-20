// const STORAGE_KEY = "number-guesser-sound-settings";

// const DEFAULT_SETTINGS = Object.freeze({
//   soundEnabled: true,
//   musicEnabled: false,
//   masterVolume: 0.7,
//   effectsVolume: 0.65,
//   musicVolume: 0.25,
// });

// // All paths are relative to the Vite public/ directory.
// const SOUND_SOURCES = {
//   click: "/sounds/effects/click.mp3",
//   correct: "/sounds/effects/correct.mp3",
//   wrong: "/sounds/effects/wrong.mp3",
//   win: "/sounds/effects/win.mp3",
//   lose: "/sounds/effects/lose.mp3",
//   levelUp: "/sounds/effects/level-up.mp3",
//   countdown: "/sounds/effects/countdown.mp3",
//   notification: "/sounds/effects/notification.mp3",
//   message: "/sounds/effects/message.mp3",
//   achievement: "/sounds/effects/achievement.mp3",
//   heartLoss: "/sounds/effects/heart-loss.mp3",
//   tileFlip: "/sounds/effects/tile-flip.mp3",
//   challengeStart: "/sounds/effects/challenge-start.mp3",
//   challengeComplete: "/sounds/effects/challenge-complete.mp3",
// };

// export const MUSIC_SOURCES = {
//   menu: "/sounds/music/menu-theme.mp3",
//   gameplay: "/sounds/music/gameplay-theme.mp3",
//   dailyChallenge: "/sounds/music/daily-challenge.mp3",
//   multiplayer: "/sounds/music/multiplayer-theme.mp3",
//   victory: "/sounds/music/victory-theme.mp3",
// };

// let settings = loadSettings();
// let currentMusicTrack = "menu";
// const listeners = new Set();
// const players = new Map();
// let musicPlayer = null;

// function clampVolume(value) {
//   const number = Number(value);
//   return Number.isFinite(number) ? Math.min(1, Math.max(0, number)) : 0;
// }

// function loadSettings() {
//   if (typeof window === "undefined") return { ...DEFAULT_SETTINGS };
//   try {
//     const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
//     return {
//       soundEnabled: typeof saved.soundEnabled === "boolean" ? saved.soundEnabled : DEFAULT_SETTINGS.soundEnabled,
//       musicEnabled: typeof saved.musicEnabled === "boolean" ? saved.musicEnabled : DEFAULT_SETTINGS.musicEnabled,
//       masterVolume: clampVolume(saved.masterVolume ?? DEFAULT_SETTINGS.masterVolume),
//       effectsVolume: clampVolume(saved.effectsVolume ?? DEFAULT_SETTINGS.effectsVolume),
//       musicVolume: clampVolume(saved.musicVolume ?? DEFAULT_SETTINGS.musicVolume),
//     };
//   } catch {
//     return { ...DEFAULT_SETTINGS };
//   }
// }

// function persistAndNotify() {
//   try {
//     window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
//   } catch {
//     // Settings remain usable for the current session if storage is unavailable.
//   }
//   listeners.forEach((listener) => listener());
//   syncMusic();
// }

// export function getSoundSettings() { return settings; }
// export function subscribeSoundSettings(listener) {
//   listeners.add(listener);
//   return () => listeners.delete(listener);
// }

// function updateSettings(patch) {
//   settings = { ...settings, ...patch };
//   persistAndNotify();
// }

// export function setSoundEnabled(enabled) {
//   updateSettings({ soundEnabled: Boolean(enabled) });
//   if (!enabled) stopEffects();
// }
// export function setVolume(value) { updateSettings({ masterVolume: clampVolume(value) }); }
// export function setEffectsVolume(value) { updateSettings({ effectsVolume: clampVolume(value) }); }
// export function setMusicEnabled(enabled) { updateSettings({ musicEnabled: Boolean(enabled) }); }
// export function setMusicVolume(value) { updateSettings({ musicVolume: clampVolume(value) }); }
// export function toggleSoundEnabled() { setSoundEnabled(!settings.soundEnabled); }

// function stopEffects() {
//   players.forEach((audio) => {
//     audio.pause();
//     try { audio.currentTime = 0; } catch { /* Ignore media seek errors. */ }
//   });
// }

// function getEffectPlayer(name) {
//   if (typeof Audio === "undefined") return null;
//   const source = SOUND_SOURCES[name];
//   if (!source) return null;
//   if (!players.has(name)) {
//     const audio = new Audio(source);
//     audio.preload = "none";
//     audio.addEventListener("error", () => audio.pause());
//     players.set(name, audio);
//   }
//   return players.get(name);
// }

// export function playSound(name) {
//   if (!settings.soundEnabled || settings.masterVolume <= 0 || settings.effectsVolume <= 0) return;
//   const player = getEffectPlayer(name);
//   if (!player) return;

//   // Prevent overlapping UI/game effects; a new effect replaces the previous one.
//   stopEffects();
//   player.volume = clampVolume(settings.masterVolume * settings.effectsVolume);
//   try { player.currentTime = 0; } catch { /* Ignore first-play seek errors. */ }
//   const playback = player.play();
//   if (playback?.catch) playback.catch(() => {});
// }

// function syncMusic() {
//   if (typeof Audio === "undefined") return;
//   const source = MUSIC_SOURCES[currentMusicTrack];
//   if (!source) return;

//   if (!musicPlayer || musicPlayer.src !== new URL(source, window.location.href).href) {
//     musicPlayer?.pause();
//     musicPlayer = new Audio(source);
//     musicPlayer.loop = true;
//     musicPlayer.preload = "none";
//     musicPlayer.addEventListener("error", () => musicPlayer?.pause());
//   }

//   musicPlayer.volume = clampVolume(settings.masterVolume * settings.musicVolume);
//   if (!settings.musicEnabled || settings.masterVolume <= 0 || settings.musicVolume <= 0) {
//     musicPlayer.pause();
//     return;
//   }

//   // Browsers may reject playback until a user gesture; the rejection is handled quietly.
//   const playback = musicPlayer.play();
//   if (playback?.catch) playback.catch(() => {});
// }

// export function setMusicTrack(trackName) {
//   if (!Object.prototype.hasOwnProperty.call(MUSIC_SOURCES, trackName)) return;
//   currentMusicTrack = trackName;
//   syncMusic();
// }
// export function getMusicTrack() { return currentMusicTrack; }

// export const playClick = () => playSound("click");
// export const playCorrect = () => playSound("correct");
// export const playWrong = () => playSound("wrong");
// export const playWin = () => playSound("win");
// export const playLose = () => playSound("lose");
// export const playLevelUp = () => playSound("levelUp");
// export const playCountdown = () => playSound("countdown");
// export const playNotification = () => playSound("notification");
// export const playMessage = () => playSound("message");
// export const playAchievement = () => playSound("achievement");
// export const playHeartLoss = () => playSound("heartLoss");
// export const playTileFlip = () => playSound("tileFlip");
// export const playChallengeStart = () => playSound("challengeStart");
// export const playChallengeComplete = () => playSound("challengeComplete");

// export function stopAllSounds() {
//   stopEffects();
//   musicPlayer?.pause();
// }

const STORAGE_KEY = "number-guesser-sound-settings";

const DEFAULT_SETTINGS = Object.freeze({
  soundEnabled: true,
  musicEnabled: false,
  masterVolume: 0.7,
  effectsVolume: 0.65,
  musicVolume: 0.25,
});

// All paths are relative to the Vite public/ directory.
const SOUND_SOURCES = {
  click: "/sounds/effects/click.mp3",
  correct: "/sounds/effects/correct.mp3",
  wrong: "/sounds/effects/wrong.mp3",
  win: "/sounds/effects/win.mp3",
  lose: "/sounds/effects/lose.mp3",
  levelUp: "/sounds/effects/level-up.mp3",
  countdown: "/sounds/effects/countdown.mp3",
  notification: "/sounds/effects/notification.mp3",
  message: "/sounds/effects/message.mp3",
  achievement: "/sounds/effects/achievement.mp3",
  heartLoss: "/sounds/effects/heart-loss.mp3",
  tileFlip: "/sounds/effects/tile-flip.mp3",
  challengeStart: "/sounds/effects/challenge-start.mp3",
  challengeComplete: "/sounds/effects/challenge-complete.mp3",
};

export const MUSIC_SOURCES = {
  menu: "/sounds/music/menu-theme.mp3",
  gameplay: "/sounds/music/gameplay-theme.mp3",
  dailyChallenge: "/sounds/music/daily-challenge.mp3",
  multiplayer: "/sounds/music/multiplayer-theme.mp3",
  victory: "/sounds/music/victory-theme.mp3",
};

let settings = loadSettings();
let currentMusicTrack = "menu";
const listeners = new Set();
const players = new Map();
let musicPlayer = null;

function clampVolume(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(1, Math.max(0, number)) : 0;
}

function loadSettings() {
  if (typeof window === "undefined") return { ...DEFAULT_SETTINGS };
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      soundEnabled: typeof saved.soundEnabled === "boolean" ? saved.soundEnabled : DEFAULT_SETTINGS.soundEnabled,
      musicEnabled: typeof saved.musicEnabled === "boolean" ? saved.musicEnabled : DEFAULT_SETTINGS.musicEnabled,
      masterVolume: clampVolume(saved.masterVolume ?? DEFAULT_SETTINGS.masterVolume),
      effectsVolume: clampVolume(saved.effectsVolume ?? DEFAULT_SETTINGS.effectsVolume),
      musicVolume: clampVolume(saved.musicVolume ?? DEFAULT_SETTINGS.musicVolume),
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function persistAndNotify() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Settings remain usable for the current session if storage is unavailable.
  }
  listeners.forEach((listener) => listener());
  syncMusic();
}

export function getSoundSettings() { return settings; }
export function subscribeSoundSettings(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function updateSettings(patch) {
  settings = { ...settings, ...patch };
  persistAndNotify();
}

export function setSoundEnabled(enabled) {
  updateSettings({ soundEnabled: Boolean(enabled) });
  if (!enabled) stopEffects();
}
export function setVolume(value) { updateSettings({ masterVolume: clampVolume(value) }); }
export function setEffectsVolume(value) { updateSettings({ effectsVolume: clampVolume(value) }); }
export function setMusicEnabled(enabled) { updateSettings({ musicEnabled: Boolean(enabled) }); }
export function setMusicVolume(value) { updateSettings({ musicVolume: clampVolume(value) }); }
export function toggleSoundEnabled() { setSoundEnabled(!settings.soundEnabled); }

function stopEffects() {
  players.forEach((audio) => {
    audio.pause();
    try { audio.currentTime = 0; } catch { /* Ignore media seek errors. */ }
  });
}

function getEffectPlayer(name) {
  if (typeof Audio === "undefined") return null;
  const source = SOUND_SOURCES[name];
  if (!source) return null;
  if (!players.has(name)) {
    const audio = new Audio(source);
    audio.preload = "auto";
    audio.addEventListener("error", () => audio.pause());
    players.set(name, audio);
  }
  return players.get(name);
}

export function playSound(name) {
  if (!settings.soundEnabled || settings.masterVolume <= 0 || settings.effectsVolume <= 0) return;
  const player = getEffectPlayer(name);
  if (!player) return;

  // Keep different effects independent so a tile flip or click cannot cancel
  // a result/achievement sound that has just started.
  player.volume = clampVolume(settings.masterVolume * settings.effectsVolume);
  try { player.currentTime = 0; } catch { /* Ignore first-play seek errors. */ }
  const playback = player.play();
  if (playback?.catch) playback.catch(() => {});
}

function syncMusic() {
  if (typeof Audio === "undefined") return;
  const source = MUSIC_SOURCES[currentMusicTrack];
  if (!source) return;

  if (!musicPlayer || musicPlayer.src !== new URL(source, window.location.href).href) {
    musicPlayer?.pause();
    musicPlayer = new Audio(source);
    musicPlayer.loop = true;
    musicPlayer.preload = "none";
    musicPlayer.addEventListener("error", () => musicPlayer?.pause());
  }

  musicPlayer.volume = clampVolume(settings.masterVolume * settings.musicVolume);
  if (!settings.musicEnabled || settings.masterVolume <= 0 || settings.musicVolume <= 0) {
    musicPlayer.pause();
    return;
  }

  // Browsers may reject playback until a user gesture; the rejection is handled quietly.
  const playback = musicPlayer.play();
  if (playback?.catch) playback.catch(() => {});
}

export function setMusicTrack(trackName) {
  if (!Object.prototype.hasOwnProperty.call(MUSIC_SOURCES, trackName)) return;
  currentMusicTrack = trackName;
  syncMusic();
}
export function getMusicTrack() { return currentMusicTrack; }

export const playClick = () => playSound("click");
export const playCorrect = () => playSound("correct");
export const playWrong = () => playSound("wrong");
export const playWin = () => playSound("win");
export const playLose = () => playSound("lose");
export const playLevelUp = () => playSound("levelUp");
export const playCountdown = () => playSound("countdown");
export const playNotification = () => playSound("notification");
export const playMessage = () => playSound("message");
export const playAchievement = () => playSound("achievement");
export const playHeartLoss = () => playSound("heartLoss");
export const playTileFlip = () => playSound("tileFlip");
export const playChallengeStart = () => playSound("challengeStart");
export const playChallengeComplete = () => playSound("challengeComplete");

export function stopAllSounds() {
  stopEffects();
  musicPlayer?.pause();
}
