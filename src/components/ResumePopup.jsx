import {
  useEffect,
  useState
} from "react";

import {
  KEYS
} from "../utils/tizenRemote";

import focusManager
from "../core/FocusManager";

export default function ResumePopup({
  visible,
  resumeTime,
  onResume,
  onRestart
}) {

  const buttons = [

    "RESUME",

    "RESTART"
  ];

  const [focused,
    setFocused] =
    useState(0);

  // OPEN
  useEffect(() => {

    if (visible) {

      focusManager.setZone(
        "modal"
      );

      setFocused(0);
    }

  }, [visible]);

  // REMOTE
  useEffect(() => {

    function handleKeys(event) {

      if (
        !visible
      ) return;

      // ONLY MODAL
      if (
        focusManager.getZone()
        !== "modal"
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
            buttons.length - 1
          ) {

            setFocused(
              prev => prev + 1
            );
          }

          break;

        // ENTER
        case KEYS.ENTER:

          if (focused === 0) {

            focusManager.setZone(
              "player"
            );

            onResume();

          } else {

            focusManager.setZone(
              "player"
            );

            onRestart();
          }

          break;

        // BACK
        case KEYS.BACK:

          focusManager.setZone(
            "player"
          );

          onRestart();

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
    focused,
    visible
  ]);

  // FORMAT
  function formatTime(seconds) {

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
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background:
        "rgba(0,0,0,0.88)",
      zIndex: 99999,
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
        width: "700px",
        background:
          "linear-gradient(to bottom, #1e1e1e, #101010)",
        borderRadius: "24px",
        padding: "40px",
        border:
          "2px solid rgba(255,255,255,0.08)",
        boxShadow:
          "0 0 40px rgba(0,0,0,0.6)",
        color: "white"
      }}>

        {/* TITLE */}

        <div style={{
          fontSize: "42px",
          fontWeight: "bold",
          marginBottom: "20px"
        }}>

          Continue Watching?

        </div>

        {/* TEXT */}

        <div style={{
          fontSize: "24px",
          opacity: 0.8,
          lineHeight: 1.6,
          marginBottom: "40px"
        }}>

          Resume playback from

          {" "}

          <span style={{
            color: "#00aaff",
            fontWeight: "bold"
          }}>

            {
              formatTime(
                resumeTime
              )
            }

          </span>

          ?

        </div>

        {/* BUTTONS */}

        <div style={{
          display: "flex",
          gap: "25px",
          justifyContent:
            "center"
        }}>

          {
            buttons.map(
              (button, index) => (

              <div
                key={button}
                style={{

                  padding:
                    "20px 40px",

                  borderRadius:
                    "16px",

                  background:
                    focused === index
                      ? "#00aaff"
                      : "#222",

                  border:
                    focused === index
                      ? "3px solid white"
                      : "3px solid transparent",

                  fontSize: "24px",

                  fontWeight:
                    "bold",

                  transition:
                    "all 0.2s ease",

                  transform:
                    focused === index
                      ? "scale(1.05)"
                      : "scale(1)",

                  boxShadow:
                    focused === index
                      ? "0 0 24px rgba(0,170,255,0.8)"
                      : "none"
                }}
              >

                {button}

              </div>

            ))
          }

        </div>

      </div>

    </div>
  );
}