import {
  useEffect,
  useState
} from "react";

import {
  KEYS
} from "../utils/tizenRemote";

import focusManager
from "../core/FocusManager";

export default function AudioSubtitleSelector({
  visible,
  videoRef,
  onClose
}) {

  const [tab,
    setTab] =
    useState(0);

  const [focused,
    setFocused] =
    useState(0);

  const [audioTracks,
    setAudioTracks] =
    useState([]);

  const [subtitleTracks,
    setSubtitleTracks] =
    useState([]);

  // LOAD TRACKS
  useEffect(() => {

    if (
      visible &&
      videoRef?.current
    ) {

      const video =
        videoRef.current;

      // AUDIO
      const audios =
        Array.from(
          video.audioTracks || []
        );

      // SUBS
      const subtitles =
        Array.from(
          video.textTracks || []
        );

      setAudioTracks(audios);

      setSubtitleTracks(subtitles);

      focusManager.setZone(
        "modal"
      );
    }

  }, [visible]);

  // REMOTE
  useEffect(() => {

    function handleKeys(event) {

      if (!visible) return;

      if (
        focusManager.getZone()
        !== "modal"
      ) return;

      const items =
        tab === 0
          ? audioTracks
          : subtitleTracks;

      switch (event.keyCode) {

        // LEFT
        case KEYS.LEFT:

          if (tab > 0) {

            setTab(0);

            setFocused(0);
          }

          break;

        // RIGHT
        case KEYS.RIGHT:

          if (tab < 1) {

            setTab(1);

            setFocused(0);
          }

          break;

        // UP
        case KEYS.UP:

          if (focused > 0) {

            setFocused(
              prev => prev - 1
            );
          }

          break;

        // DOWN
        case KEYS.DOWN:

          if (
            focused <
            items.length - 1
          ) {

            setFocused(
              prev => prev + 1
            );
          }

          break;

        // ENTER
        case KEYS.ENTER:

          handleSelect();

          break;

        // BACK
        case KEYS.BACK:

          closeModal();

          break;

        default:

          break;
      }
    }

    document.addEventListener(
      "keydown",
      handleKeys
    );

    return () => {

      document.removeEventListener(
        "keydown",
        handleKeys
      );
    };

  }, [
    visible,
    focused,
    tab,
    audioTracks,
    subtitleTracks
  ]);

  // SELECT
  function handleSelect() {

    const video =
      videoRef.current;

    if (!video) return;

    // AUDIO
    if (tab === 0) {

      audioTracks.forEach(
        track => {

          track.enabled = false;
        }
      );

      if (
        audioTracks[focused]
      ) {

        audioTracks[
          focused
        ].enabled = true;
      }
    }

    // SUBTITLE
    else {

      subtitleTracks.forEach(
        track => {

          track.mode =
            "disabled";
        }
      );

      if (
        subtitleTracks[focused]
      ) {

        subtitleTracks[
          focused
        ].mode =
          "showing";
      }
    }

    closeModal();
  }

  // CLOSE
  function closeModal() {

    focusManager.setZone(
      "player"
    );

    if (onClose) {

      onClose();
    }
  }

  // HIDE
  if (!visible) return null;

  const items =
    tab === 0
      ? audioTracks
      : subtitleTracks;

  return (

    <div className="modal-overlay scale-in" style={{ zIndex: 1000000 }}>

      {/* CARD */}

      <div className="glass-panel" style={{
        width: "1000px",
        borderRadius: "40px",
        padding: "60px",
        color: "white"
      }}>

        <h1 className="section-title" style={{ textAlign: "center", marginBottom: "60px" }}>STREAM SETTINGS</h1>

        {/* HEADER */}

        <div style={{
          display: "flex",
          gap: "30px",
          marginBottom: "50px",
          justifyContent: "center"
        }}>

          {/* AUDIO */}

          <div 
            className={`player-button ${tab === 0 ? "active" : ""}`}
            style={{ width: "auto", padding: "0 40px", height: "80px" }}
          >
            AUDIO
          </div>

          {/* SUBTITLE */}

          <div 
            className={`player-button ${tab === 1 ? "active" : ""}`}
            style={{ width: "auto", padding: "0 40px", height: "80px" }}
          >
            SUBTITLES
          </div>

        </div>

        {/* LIST */}

        <div style={{
          display: "flex",
          flexDirection:
            "column",
          gap: "20px",
          maxHeight: "500px",
          overflowY: "auto",
          padding: "10px"
        }}>

          {
            items.length === 0 && (

              <div style={{
                fontSize: "28px",
                opacity: 0.5,
                textAlign: "center",
                padding: "50px"
              }}>
                No tracks detected for this stream.
              </div>

            )
          }

          {
            items.map(
              (item, index) => (

              <div
                key={index}
                className={`sidebar-item ${focused === index ? "active" : ""}`}
                style={{
                   margin: 0,
                   textAlign: "center",
                   justifyContent: "center"
                }}
              >
                {
                  item.label
                  ||
                  item.language
                  ||
                  `Track ${index + 1}`
                }
              </div>

            ))
          }

        </div>

        <div style={{ marginTop: "60px", textAlign: "center", fontSize: "20px", color: "var(--text-dim)", fontWeight: "bold", letterSpacing: "2px" }}>
          PRESS BACK TO RETURN
        </div>

      </div>

    </div>
  );
}