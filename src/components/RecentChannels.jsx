import { navigateTo } from "../utils/navigation";
import { useEffect, useState, useRef } from "react";
import { KEYS } from "../utils/tizenRemote";
import focusManager from "../core/FocusManager";

export default function RecentChannels({ isFocused }) {
  const [channels, setChannels] = useState([]);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    loadRecent();
  }, []);

  useEffect(() => {
    if (!isFocused) return;

    function handleKeys(event) {
      switch (event.keyCode) {
        case KEYS.LEFT:
          if (focusedIndex > 0) {
            setFocusedIndex(prev => prev - 1);
          } else {
            focusManager.setZone("sidebar");
          }
          break;

        case KEYS.RIGHT:
          if (focusedIndex < channels.length - 1) {
            setFocusedIndex(prev => prev + 1);
          }
          break;

        case KEYS.ENTER:
          openChannel(channels[focusedIndex]);
          break;

        default:
          break;
      }
    }

    document.addEventListener("keydown", handleKeys);
    return () => document.removeEventListener("keydown", handleKeys);
  }, [isFocused, focusedIndex, channels]);

  useEffect(() => {
    if (isFocused && scrollRef.current) {
      const card = scrollRef.current.children[focusedIndex];
      if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [focusedIndex, isFocused]);

  function loadRecent() {
    try {
      const data = JSON.parse(localStorage.getItem("recent_channels")) || [];
      setChannels(data);
    } catch (error) {
      console.log(error);
    }
  }

  function openChannel(channel) {
    if (!channel) return;

    localStorage.setItem("stream_id", channel.stream_id);
    localStorage.setItem("stream_name", channel.name);
    localStorage.setItem("stream_type", "live");
    localStorage.setItem("stream_icon", channel.stream_icon);
    navigateTo("/player");
  }

  if (!channels.length) return null;

  return (
    <div className="row-scroll" ref={scrollRef}>
      {channels.map((channel, index) => (
        <div
          key={`${channel.stream_id}-${index}`}
          className={`content-card ${isFocused && focusedIndex === index ? "focused" : ""}`}
          onClick={() => openChannel(channel)}
        >
          <img
            src={channel.stream_icon || "assets/hero.png"}
            alt=""
            className="card-img"
          />
          <div className="card-info">
             <div style={{ fontWeight: "700", fontSize: "18px" }}>{channel.name}</div>
             <div style={{ fontSize: "14px", opacity: 0.6 }}>LIVE</div>
          </div>
        </div>
      ))}
    </div>
  );
}
