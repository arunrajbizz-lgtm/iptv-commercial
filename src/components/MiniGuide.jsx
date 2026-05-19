import {
  useEffect,
  useState
} from "react";

import {
  KEYS
} from "../utils/tizenRemote";

export default function MiniGuide({

  visible,

  channels,

  currentIndex,

  onSelect,

  onClose
}) {

  const [focused,
    setFocused] =
    useState(currentIndex);

  // UPDATE
  useEffect(() => {

    setFocused(
      currentIndex
    );

  }, [
    currentIndex
  ]);

  // REMOTE
  useEffect(() => {

    if (!visible) return;

    function handleKeys(event) {

      switch (event.keyCode) {

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
            focused
            <
            channels.length - 1
          ) {

            setFocused(
              prev => prev + 1
            );
          }

          break;

        // ENTER
        case KEYS.ENTER:

          onSelect(
            channels[focused]
          );

          break;

        // BACK
        case KEYS.BACK:

        case KEYS.GREEN:

          onClose();

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

    channels
  ]);

  // HIDE
  if (!visible) {

    return null;
  }

  return (

    <div style={{
      position: "absolute",
      right: 0,
      top: 0,
      width: "520px",
      height: "100%",
      background:
        "rgba(0,0,0,0.95)",
      backdropFilter:
        "blur(20px)",
      zIndex: 999999,
      padding: "30px",
      overflowY: "auto",
      color: "white"
    }}>

      {/* TITLE */}

      <div style={{
        fontSize: "42px",
        fontWeight: "bold",
        marginBottom: "30px",
        color: "#00aaff"
      }}>

        MINI GUIDE

      </div>

      {/* LIST */}

      <div style={{
        display: "flex",
        flexDirection:
          "column",
        gap: "18px"
      }}>

        {
          channels.map(
            (channel, index) => (

            <div
              key={
                channel.stream_id
              }
              style={{

                display: "flex",

                gap: "18px",

                alignItems:
                  "center",

                padding:
                  "16px",

                borderRadius:
                  "16px",

                background:
                  focused === index
                    ? "#00aaff"
                    : "#1d1d1d",

                border:
                  focused === index
                    ? "3px solid white"
                    : "2px solid rgba(255,255,255,0.08)"
              }}
            >

              {/* ICON */}

              <img
                src={
                  channel.stream_icon
                }
                alt=""
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius:
                    "14px",
                  objectFit:
                    "cover",
                  background:
                    "#000"
                }}
              />

              {/* NAME */}

              <div style={{
                flex: 1
              }}>

                <div style={{
                  fontSize: "24px",
                  fontWeight: "bold"
                }}>

                  {channel.name}

                </div>

              </div>

            </div>

          ))
        }

      </div>

    </div>
  );
}