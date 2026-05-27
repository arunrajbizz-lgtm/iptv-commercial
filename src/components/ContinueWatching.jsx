import { navigateTo } from "../utils/navigation";
import { useEffect, useState, useRef } from "react";
import { useFocus } from "../hooks/useFocus";
import focusManager from "../core/FocusManager";

export default function ContinueWatching({ isFocused, onTopEdge, onBottomEdge }) {
  const [items, setItems] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    loadItems();
  }, []);

  const { focusIndex } = useFocus({
    containerRef: scrollRef,
    columnCount: items.length,
    itemCount: items.length,
    isActive: isFocused,
    onEnter: (index) => openItem(items[index]),
    onLeftEdge: () => focusManager.setZone("sidebar"),
    onTopEdge,
    onBottomEdge
  });

  function loadItems() {
    try {
      const data = JSON.parse(localStorage.getItem("continue_watching")) || [];
      setItems(data);
    } catch (error) {
      console.log(error);
    }
  }

  function openItem(item) {
    if (!item) return;

    localStorage.setItem("stream_id", item.stream_id);
    localStorage.setItem("stream_name", item.name);
    localStorage.setItem("stream_type", item.type);
    localStorage.setItem("stream_icon", item.stream_icon || item.cover);
    navigateTo("/player");
  }

  if (!items.length) return null;

  return (
    <div className="row-scroll" ref={scrollRef}>
      {items.map((item, index) => (
        <div
          key={`${item.stream_id}-${index}`}
          data-focusable="true"
          className={`content-card ${isFocused && focusIndex === index ? "focused" : ""}`}
          onClick={() => openItem(item)}
        >
          <img
            src={item.stream_icon || item.cover || "assets/hero.png"}
            alt=""
            className="card-img"
          />
          <div className="card-info">
             <div style={{ fontWeight: "700", fontSize: "18px" }}>{item.name}</div>
             <div style={{ fontSize: "14px", opacity: 0.6 }}>RESUME</div>
          </div>
        </div>
      ))}
    </div>
  );
}
