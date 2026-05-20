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

import {
  playWithTizenAVPlay,
  stopTizenAVPlay
} from "../utils/tizenPlayer.js";

export default function MultiView({
  visible,
  channels,
  onClose
}) {
  const [selected, setSelected] = useState([]);
  const [focused, setFocused] = useState(0);

  useEffect(() => {
    if (!visible) return;
    setSelected(channels.slice(0, 4));
    setFocused(0);
  }, [visible, channels]);

  useEffect(() => {
    if (!visible) return;

    function handleKeys(event) {
      switch (event.keyCode) {
        case KEYS.LEFT:
          if (focused > 0) setFocused(prev => prev - 1);
          break;

        case KEYS.RIGHT:
          if (focused < selected.length - 1) setFocused(prev => prev + 1);
          break;

        case KEYS.BACK:
        case KEYS.YELLOW:
          stopTizenAVPlay();
          onClose();
          break;

        default:
          break;
      }
    }

    document.addEventListener("keydown", handleKeys);

    return () => {
      document.removeEventListener("keydown", handleKeys);
    };
  }, [visible, focused, selected.length, onClose]);

  useEffect(() => {
    if (!visible) {
      stopTizenAVPlay();
      return;
    }

    const iptv = JSON.parse(localStorage.getItem("iptv") || "{}");
    const channel = selected[focused];

    if (!channel || !iptv.host) return;

    const url = buildLiveUrl(
      iptv.host,
      iptv.username,
      iptv.password,
      channel.stream_id,
      "m3u8"
    );

    const timer = setTimeout(() => {
      playWithTizenAVPlay(url, "avplay-container");
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [visible, selected, focused]);

  if (!visible) return null;

  const iptv = JSON.parse(localStorage.getItem("iptv") || "{}");

  return (
    <div style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "#000",
      zIndex: 999999,
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gridTemplateRows: "1fr 1fr",
      gap: "6px",
      padding: "6px"
    }}>
      <div
        id="avplay-container"
        style={{
          position: "absolute",
          top: "6px",
          left: "6px",
          width: "calc(50% - 9px)",
          height: "calc(50% - 9px)",
          background: "#000",
          zIndex: 10
        }}
      />

      {selected.map((channel, index) => {
        const url = buildLiveUrl(
          iptv.host,
          iptv.username,
          iptv.password,
          channel.stream_id,
          "m3u8"
        );

        return (
          <div
            key={channel.stream_id}
            style={{
              position: "relative",
              border:
                focused === index
                  ? "4px solid #00aaff"
                  : "2px solid #222",
              overflow: "hidden",
              borderRadius: "12px",
              background: "#000",
              zIndex: focused === index ? 20 : 2
            }}
          >
            {focused !== index && (
              <video
                src={url}
                autoPlay
                muted
                playsInline
                controls={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  background: "#000"
                }}
              />
            )}

            <div style={{
              position: "absolute",
              left: 0,
              bottom: 0,
              width: "100%",
              padding: "14px",
              background:
                "linear-gradient(to top, rgba(0,0,0,0.9), transparent)",
              zIndex: 30
            }}>
              <div style={{
                fontSize: "22px",
                fontWeight: "bold",
                color: "white"
              }}>
                {channel.name}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
