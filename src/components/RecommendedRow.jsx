import { navigateTo } from "../utils/navigation";
import { useEffect, useState, useRef } from "react";
import { KEYS } from "../utils/tizenRemote";
import focusManager from "../core/FocusManager";

export default function RecommendedRow({ isFocused }) {
  const [items, setItems] = useState([]);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    generateRecommendations();
  }, []);

  useEffect(() => {
    if (!isFocused) return;

    function handleKeys(event) {
      switch (event.keyCode) {
        case KEYS.LEFT:
          if (focusedIndex > 0) {
            setFocusedIndex(prev => prev - 1);
          } else {
            // Edge case: if we are at start, pass to sidebar
            focusManager.setZone("sidebar");
          }
          break;

        case KEYS.RIGHT:
          if (focusedIndex < items.length - 1) {
            setFocusedIndex(prev => prev + 1);
          }
          break;

        case KEYS.ENTER:
          openItem(items[focusedIndex]);
          break;

        default:
          break;
      }
    }

    document.addEventListener("keydown", handleKeys);
    return () => document.removeEventListener("keydown", handleKeys);
  }, [isFocused, focusedIndex, items]);

  useEffect(() => {
    if (isFocused && scrollRef.current) {
      const card = scrollRef.current.children[focusedIndex];
      if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [focusedIndex, isFocused]);

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
          className={`content-card ${isFocused && focusedIndex === index ? "focused" : ""}`}
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
