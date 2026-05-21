import { navigateTo } from "../utils/navigation";
import { useEffect, useState, useRef } from "react";
import { KEYS } from "../utils/tizenRemote";
import focusManager from "../core/FocusManager";

export default function ContinueWatching({ isFocused }) {
  const [items, setItems] = useState([]);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    loadItems();
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
             <div style={{ fontSize: "14px", opacity: 0.6 }}>RESUME</div>
          </div>
        </div>
      ))}
    </div>
  );
}
