import {
  useEffect,
  useState
} from "react";

import {
  KEYS
} from "../utils/tizenRemote";

import focusManager
from "../core/FocusManager";

export default function PlayerControls({
  visible,
  channelName,
  onAction,
  paused,
  streamType,
  currentTime,
  duration,
  progress,
  isFavorite
}) {

  const [focused,
    setFocused] =
    useState(2); // Default to PLAY/PAUSE

  const controls = [
    { id: "PREV", label: "⏮", icon: "prev" },
    { id: "RW", label: "⏪", icon: "rw" },
    { id: "PLAY_PAUSE", label: paused ? "▶" : "⏸", icon: "play" },
    { id: "FF", label: "⏩", icon: "ff" },
    { id: "NEXT", label: "⏭", icon: "next" },
    { id: "FAVORITE", label: isFavorite ? "❤️" : "🤍", icon: "fav" },
    { id: "AUDIO_SUB", label: "💬", icon: "audio" },
    { id: "MULTIVIEW", label: "📺", icon: "multi" }
  ];

  // REMOTE
  useEffect(() => {
    if (!visible) return;

    function handleKeys(event) {
      const zone = focusManager.getZone();
      if (zone !== "player") return;

      switch (event.keyCode) {
        case KEYS.LEFT:
          if (focused > 0) {
            setFocused(prev => prev - 1);
          }
          break;

        case KEYS.RIGHT:
          if (focused < controls.length - 1) {
            setFocused(prev => prev + 1);
          }
          break;

        case KEYS.UP:
           // Allow jumping to progress bar if we implement seeking
           break;

        case KEYS.ENTER:
          onAction(controls[focused].id);
          break;

        default:
          break;
      }
    }

    document.addEventListener("keydown", handleKeys);
    return () => document.removeEventListener("keydown", handleKeys);
  }, [visible, focused, paused, isFavorite]);

  if (!visible) return null;

  return (
    <div className="player-ui scale-in">
      <div className="player-controls-bottom">
        
        {/* INFO */}
        <div style={{ marginBottom: "10px" }}>
           <div style={{ fontSize: "40px", fontWeight: "900", marginBottom: "5px" }}>{channelName}</div>
           <div style={{ fontSize: "20px", color: "var(--text-dim)", fontWeight: "600" }}>
              {streamType === "live" ? "LIVE TV" : "NOW PLAYING"} • 4K HDR • 5.1
           </div>
        </div>

        {/* PROGRESS */}
        <div className="player-progress-container">
           <div className="player-progress-bar">
              <div className="player-progress-fill" style={{ width: `${progress}%` }}>
                 <div className="player-progress-handle" />
              </div>
           </div>
           <div style={{ display: "flex", justifyContent: "space-between", marginTop: "15px" }}>
              <span className="player-time">{currentTime}</span>
              <span className="player-time">{duration}</span>
           </div>
        </div>

        {/* BUTTONS */}
        <div className="player-btns-row">
           <div className="player-btns-left">
              {controls.slice(0, 5).map((ctrl, index) => (
                <button
                  key={ctrl.id}
                  className={`player-btn ${focused === index ? "focused" : ""}`}
                  onClick={() => onAction(ctrl.id)}
                >
                  {ctrl.label}
                </button>
              ))}
           </div>

           <div className="player-btns-right">
              {controls.slice(5).map((ctrl, index) => {
                const globalIndex = index + 5;
                return (
                  <button
                    key={ctrl.id}
                    className={`player-btn ${focused === globalIndex ? "focused" : ""}`}
                    onClick={() => onAction(ctrl.id)}
                  >
                    {ctrl.label}
                  </button>
                );
              })}
           </div>
        </div>

      </div>
    </div>
  );
}
