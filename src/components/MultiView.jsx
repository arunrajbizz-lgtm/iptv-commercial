import {
  useEffect,
  useState
} from "react";

import {
  KEYS
} from "../utils/tizenRemote";

import {
  buildLiveUrl
} from "../services/xtreamApi";

export default function MultiView({

  visible,

  channels,

  onClose
}) {

  const [selected,
    setSelected] =
    useState([]);

  const [focused,
    setFocused] =
    useState(0);

  // INIT
  useEffect(() => {

    if (!visible) return;

    setSelected(
      channels.slice(0, 4)
    );

  }, [
    visible,
    channels
  ]);

  // REMOTE
  useEffect(() => {

    if (!visible) return;

    function handleKeys(event) {

      switch (event.keyCode) {

        // LEFT
        case KEYS.LEFT:

          if (
            focused > 0
          ) {

            setFocused(
              prev => prev - 1
            );
          }

          break;

        // RIGHT
        case KEYS.RIGHT:

          if (
            focused < 3
          ) {

            setFocused(
              prev => prev + 1
            );
          }

          break;

        // BACK
        case KEYS.BACK:

        case KEYS.YELLOW:

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
    focused
  ]);

  // HIDE
  if (!visible) {

    return null;
  }

  // IPTV
  const iptv =
    JSON.parse(

      localStorage.getItem(
        "iptv"
      )
    );

  return (

    <div style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background:
        "#000",
      zIndex: 999999,
      display: "grid",
      gridTemplateColumns:
        "1fr 1fr",
      gridTemplateRows:
        "1fr 1fr",
      gap: "6px",
      padding: "6px"
    }}>

      {
        selected.map(
          (channel, index) => {

          const url =
            buildLiveUrl(

              iptv.host,

              iptv.username,

              iptv.password,

              channel.stream_id
            );

          return (

            <div
              key={
                channel.stream_id
              }
              style={{

                position:
                  "relative",

                border:
                  focused === index
                    ? "4px solid #00aaff"
                    : "2px solid #222",

                overflow:
                  "hidden",

                borderRadius:
                  "12px",

                background:
                  "#000"
              }}
            >

              {/* VIDEO */}

              <video
                src={url}
                autoPlay
                muted
                playsInline
                controls={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit:
                    "cover",
                  background:
                    "#000"
                }}
              />

              {/* OVERLAY */}

              <div style={{
                position:
                  "absolute",
                left: 0,
                bottom: 0,
                width: "100%",
                padding: "14px",
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.9), transparent)"
              }}>

                <div style={{
                  fontSize: "22px",
                  fontWeight:
                    "bold",
                  color:
                    "white"
                }}>

                  {
                    channel.name
                  }

                </div>

              </div>

            </div>
          );
        })
      }

    </div>
  );
}