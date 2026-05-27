import { navigateTo } from "../utils/navigation";
import { useEffect, useState, useRef } from "react";
import { useFocus } from "../hooks/useFocus";
import focusManager from "../core/FocusManager";

export default function RecommendedRow({ isFocused, onTopEdge, onBottomEdge }) {
  const [items, setItems] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    generateRecommendations();
  }, []);

  const { focusIndex } = useFocus({
    containerRef: scrollRef,
    columnCount: items.length, // Single row grid
    itemCount: items.length,
    isActive: isFocused,
    onEnter: (index) => openItem(items[index]),
    onLeftEdge: () => focusManager.setZone("sidebar"),
    onTopEdge,
    onBottomEdge
  });

  function generateRecommendations() {
    try {
      const movies = JSON.parse(localStorage.getItem("movies")) || [];
      const series = JSON.parse(localStorage.getItem("series")) || [];
      const live = JSON.parse(localStorage.getItem("live_channels")) || [];

      const mixed = [
        ...movies.slice(0, 8).map(item => ({ ...item, type: "movie" })),
        ...series.slice(0, 8).map(item => ({ ...item, type: "series" })),
        ...live.slice(0, 8).map(item => ({ ...item, type: "live" }))
      ];

      const shuffled = mixed.sort(() => 0.5 - Math.random());
      setItems(shuffled.slice(0, 20));
    } catch (error) {
      console.log(error);
    }
  }

  function openItem(item) {
    if (!item) return;

    if (item.type === "series") {
      localStorage.setItem("selected_series", JSON.stringify(item));
      navigateTo("/series-info");
      return;
    }

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
             <div style={{ fontSize: "14px", opacity: 0.6 }}>{item.type?.toUpperCase()}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
