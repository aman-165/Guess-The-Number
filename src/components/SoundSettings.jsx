import { useEffect, useState } from "react";
import { getMusicTrack } from "../utils/soundManager";
import { useSound } from "../context/SoundContext";

function VolumeControl({ label, value, onChange, disabled = false, description }) {
  return (
    <label className={`sound-setting-row sound-volume-row${disabled ? " is-disabled" : ""}`}>
      <span className="sound-control-copy">
        <strong>{label}</strong>
        {description && <small>{description}</small>}
      </span>
      <span className="sound-slider-wrap">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={value}
          disabled={disabled}
          aria-label={label}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <output>{Math.round(value * 100)}%</output>
      </span>
    </label>
  );
}

export function SoundSettings({ onClose }) {
  const [selectedTrack, setSelectedTrack] = useState(getMusicTrack);
  const {
    settings,
    setSoundEnabled,
    setVolume,
    setEffectsVolume,
    setMusicEnabled,
    setMusicVolume,
    setMusicTrack,
    playNotification,
    playClick,
  } = useSound();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="sound-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="sound-modal sound-settings-premium" role="dialog" aria-modal="true" aria-labelledby="sound-settings-title">
        <div className="sound-modal-heading">
          <div>
            <p className="sound-modal-eyebrow">PLAYER PREFERENCES</p>
            <h2 id="sound-settings-title">Sound settings</h2>
            <p className="sound-modal-subtitle">Tune every sound to match your game.</p>
          </div>
          <button type="button" className="sound-modal-close" onClick={onClose} aria-label="Close sound settings">×</button>
        </div>

        <div className="sound-settings-section">
          <div className="sound-section-heading">
            <span className="sound-section-icon" aria-hidden="true">♫</span>
            <span><strong>Sound effects</strong><small>Clicks, game feedback and alerts</small></span>
            <label className="sound-switch" aria-label="Enable sound effects">
              <input type="checkbox" checked={settings.soundEnabled} onChange={(event) => setSoundEnabled(event.target.checked)} />
              <span />
            </label>
          </div>
          <div className="sound-section-controls">
            <VolumeControl label="Master volume" description="Overall sound level" value={settings.masterVolume} onChange={setVolume} disabled={!settings.soundEnabled} />
            <VolumeControl label="Effects volume" value={settings.effectsVolume} onChange={setEffectsVolume} disabled={!settings.soundEnabled} />
            <div className="sound-preview-row">
              <span>Preview sound effects</span>
              <button type="button" className="sound-preview-button" disabled={!settings.soundEnabled || settings.masterVolume === 0 || settings.effectsVolume === 0} onClick={playNotification}>▶ Play preview</button>
            </div>
          </div>
        </div>

        <div className="sound-settings-section">
          <div className="sound-section-heading">
            <span className="sound-section-icon" aria-hidden="true">♪</span>
            <span><strong>Background music</strong><small>Ambient music while you play</small></span>
            <label className="sound-switch" aria-label="Enable background music">
              <input type="checkbox" checked={settings.musicEnabled} onChange={(event) => setMusicEnabled(event.target.checked)} />
              <span />
            </label>
          </div>
          <div className="sound-section-controls">
            <VolumeControl label="Music volume" value={settings.musicVolume} onChange={setMusicVolume} disabled={!settings.musicEnabled} />
            <label className={`sound-setting-row sound-track-row${!settings.musicEnabled ? " is-disabled" : ""}`}>
              <span className="sound-control-copy"><strong>Music track</strong><small>Choose your game atmosphere</small></span>
              <select value={selectedTrack} disabled={!settings.musicEnabled} onChange={(event) => { setSelectedTrack(event.target.value); setMusicTrack(event.target.value); }}>
                <option value="menu">Menu theme</option>
                <option value="gameplay">Gameplay theme</option>
                <option value="dailyChallenge">Daily challenge</option>
                <option value="multiplayer">Multiplayer theme</option>
                <option value="victory">Victory theme</option>
              </select>
            </label>
            <div className="sound-preview-row">
              <span>Interface sound</span>
              <button type="button" className="sound-preview-button" disabled={!settings.soundEnabled || settings.masterVolume === 0 || settings.effectsVolume === 0} onClick={playClick}>▶ Play click</button>
            </div>
          </div>
        </div>

        <p className="sound-settings-note"><span aria-hidden="true">ⓘ</span> Your preferences are saved on this device. Music playback may require a tap or click in your browser.</p>
      </section>
    </div>
  );
}
