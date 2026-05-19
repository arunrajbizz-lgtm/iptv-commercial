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
  videoRef,
  channelName
}) {

  const controls = [

    "REWIND",

    "PLAY",

    "PAUSE",

    "FORWARD"
  ];

  const [focused,
    setFocused] =
    useState(1);

  const [progress,
    setProgress] =
    useState(0);

  const [currentTime,
    setCurrentTime] =
    useState("00:00");

  const [duration,
    setDuration] =
    useState("00:00");

  // VIDEO TIMER
  useEffect(() => {

    const interval =
      setInterval(() => {

        const video =
          videoRef?.current;

        if (!video) return;

        // PROGRESS
        if (video.duration) {

          setProgress(

            (
              video.currentTime
              /
              video.duration
            ) * 100
          );
        }

        // CURRENT TIME
        setCurrentTime(
          formatTime(
            video.currentTime || 0
          )
        );

        // DURATION
        setDuration(
          formatTime(
            video.duration || 0
          )
        );

      }, 1000);

    return () => {

      clearInterval(
        interval
      );
    };

  }, [videoRef]);

  // REMOTE
  useEffect(() => {

    function handleKeys(event) {

      // ONLY PLAYER/OVERLAY
      const zone =
        focusManager.getZone();

      if (
        zone !== "player"
        &&
        zone !== "overlay"
      ) return;

      switch (event.keyCode) {

        // LEFT
        case KEYS.LEFT:

          if (focused > 0) {

            setFocused(
              prev => prev - 1
            );
          }

          break;

        // RIGHT
        case KEYS.RIGHT:

          if (
            focused <
            controls.length - 1
          ) {

            setFocused(
              prev => prev + 1
            );
          }

          break;

        // ENTER
        case KEYS.ENTER:

          handleControl();

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

  }, [focused]);

  // ACTIONS
  function handleControl() {

    const video =
      videoRef.current;

    if (!video) return;

    const action =
      controls[focused];

    // REWIND
    if (
      action === "REWIND"
    ) {

      video.currentTime -= 10;
    }

    // PLAY
    else if (
      action === "PLAY"
    ) {

      video.play();
    }

    // PAUSE
    else if (
      action === "PAUSE"
    ) {

      video.pause();
    }

    // FORWARD
    else if (
      action === "FORWARD"
    ) {

      video.currentTime += 10;
    }
  }

  // FORMAT
  function formatTime(seconds) {

    if (!seconds) {

      return "00:00";
    }

    const mins =
      Math.floor(
        seconds / 60
      );

    const secs =
      Math.floor(
        seconds % 60
      );

    return `${String(mins)
      .padStart(2, "0")}:${String(secs)
      .padStart(2, "0")}`;
  }

  // HIDE
  if (!visible) return null;

  return (

    <div style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "100%",
      padding: "30px",
      boxSizing: "border-box",
      background:
        "linear-gradient(to top, rgba(0,0,0,0.95), transparent)",
      color: "white",
      zIndex: 999
    }}>

      {/* CHANNEL */}

      <div style={{
        fontSize: "34px",
        fontWeight: "bold",
        marginBottom: "20px"
      }}>

        {channelName}

      </div>

      {/* PROGRESS */}

      <div style={{
        width: "100%",
        height: "10px",
        background:
          "rgba(255,255,255,0.2)",
        borderRadius: "20px",
        overflow: "hidden",
        marginBottom: "15px"
      }}>

        <div style={{
          width: `${progress}%`,
          height: "100%",
          background: "#00aaff"
        }} />

      </div>

      {/* TIME */}

      <div style={{
        display: "flex",
        justifyContent:
          "space-between",
        marginBottom: "30px",
        fontSize: "18px",
        opacity: 0.8
      }}>

        <div>
          {currentTime}
        </div>

        <div>
          {duration}
        </div>

      </div>

      {/* CONTROLS */}

      <div style={{
        display: "flex",
        gap: "20px",
        justifyContent:
          "center"
      }}>

        {
          controls.map(
            (control, index) => (

            <div
              key={control}
              style={{

                padding:
                  "18px 30px",

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
                    ? "0 0 20px rgba(0,170,255,0.8)"
                    : "none"
              }}
            >

              {control}

            </div>

          ))
        }

      </div>

    </div>
  );
}