import { navigateTo } from "../utils/navigation";
import { useEffect, useState, useRef } from "react";
import { useFocus } from "../hooks/useFocus";
import focusManager from "../core/FocusManager";

export default function RecentChannels({ isFocused, onTopEdge, onBottomEdge }) {
  const [channels, setChannels] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    loadRecent();
  }, []);

  const { focusIndex } = useFocus({
    containerRef: scrollRef,
    columnCount: channels.length,
    itemCount: channels.length,
    isActive: isFocused,
    onEnter: (index) => openChannel(channels[index]),
    onLeftEdge: () => focusManager.setZone("sidebar"),
    onTopEdge,
    onBottomEdge
  });

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
          data-focusable="true"
          className={`content-card ${isFocused && focusIndex === index ? "focused" : ""}`}
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
