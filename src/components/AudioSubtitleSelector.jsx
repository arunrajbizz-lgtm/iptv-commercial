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

    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background:
        "rgba(0,0,0,0.82)",
      zIndex: 999999,
      display: "flex",
      justifyContent:
        "center",
      alignItems:
        "center",
      backdropFilter:
        "blur(12px)"
    }}>

      {/* CARD */}

      <div style={{
        width: "800px",
        background:
          "linear-gradient(to bottom, #1e1e1e, #101010)",
        borderRadius: "24px",
        padding: "40px",
        color: "white",
        border:
          "2px solid rgba(255,255,255,0.08)"
      }}>

        {/* HEADER */}

        <div style={{
          display: "flex",
          gap: "20px",
          marginBottom: "35px"
        }}>

          {/* AUDIO */}

          <div style={{

            padding:
              "16px 30px",

            borderRadius:
              "14px",

            background:
              tab === 0
                ? "#00aaff"
                : "#222",

            border:
              tab === 0
                ? "3px solid white"
                : "3px solid transparent",

            fontSize: "24px",

            fontWeight:
              "bold"
          }}>

            AUDIO

          </div>

          {/* SUBTITLE */}

          <div style={{

            padding:
              "16px 30px",

            borderRadius:
              "14px",

            background:
              tab === 1
                ? "#00aaff"
                : "#222",

            border:
              tab === 1
                ? "3px solid white"
                : "3px solid transparent",

            fontSize: "24px",

            fontWeight:
              "bold"
          }}>

            SUBTITLES

          </div>

        </div>

        {/* LIST */}

        <div style={{
          display: "flex",
          flexDirection:
            "column",
          gap: "16px",
          maxHeight: "500px",
          overflowY: "auto"
        }}>

          {
            items.length === 0 && (

              <div style={{
                fontSize: "24px",
                opacity: 0.7
              }}>

                No Tracks Available

              </div>

            )
          }

          {
            items.map(
              (item, index) => (

              <div
                key={index}
                style={{

                  padding:
                    "20px",

                  borderRadius:
                    "14px",

                  background:
                    focused === index
                      ? "#00aaff"
                      : "#222",

                  border:
                    focused === index
                      ? "3px solid white"
                      : "3px solid transparent",

                  fontSize: "22px",

                  fontWeight:
                    "bold",

                  transition:
                    "all 0.2s ease",

                  boxShadow:
                    focused === index
                      ? "0 0 24px rgba(0,170,255,0.8)"
                      : "none"
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

      </div>

    </div>
  );
}