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
    { id: "PREV", label: "⏮" },
    { id: "RW", label: "⏪" },
    { id: "PLAY_PAUSE", label: paused ? "▶" : "⏸" },
    { id: "FF", label: "⏩" },
    { id: "NEXT", label: "⏭" },
    { id: "FAVORITE", label: isFavorite ? "❤️" : "🤍" },
    { id: "EPG", label: "📅" },
    { id: "MULTIVIEW", label: "📺" }
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
    <div className="player-overlay scale-in">
      {/* HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: "20px"
      }}>
        <div>
          <div style={{ fontSize: "18px", opacity: 0.6, marginBottom: "4px", textTransform: "uppercase" }}>
            {streamType === "live" ? "Live TV" : "VOD"}
          </div>
          <div style={{ fontSize: "42px", fontWeight: "bold", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
            {channelName}
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: "20px", opacity: 0.8 }}>
          {streamType === "live" ? "Press GREEN for Mini Guide" : ""}
        </div>
      </div>

      {/* PROGRESS */}
      {streamType !== "live" && (
        <div style={{ marginBottom: "30px" }}>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%`, position: "relative" }}>
               <div style={{
                 position: "absolute",
                 right: "-8px",
                 top: "-5px",
                 width: "20px",
                 height: "20px",
                 borderRadius: "50%",
                 background: "white",
                 boxShadow: "0 0 10px rgba(0,170,255,0.8)"
               }} />
            </div>
          </div>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "12px",
            fontSize: "18px",
            fontWeight: "500",
            fontVariantNumeric: "tabular-nums"
          }}>
            <span>{currentTime}</span>
            <span>{duration}</span>
          </div>
        </div>
      )}

      {/* BUTTONS */}
      <div style={{
        display: "flex",
        gap: "12px",
        justifyContent: "center",
        alignItems: "center"
      }}>
        {controls.map((ctrl, index) => {
          // Hide seek/next/prev for live if desired, but often RW/FF works for timeshift
          return (
            <div
              key={ctrl.id}
              className={`player-button ${focused === index ? "active" : ""}`}
              style={{
                width: "70px",
                height: "70px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "30px",
                borderRadius: "50%", // Circular buttons for premium look
                padding: 0
              }}
            >
              {ctrl.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
