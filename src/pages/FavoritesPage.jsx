import { navigateTo } from "../utils/navigation";
import { useEffect, useState } from "react";
import { KEYS } from "../utils/tizenRemote";
import Sidebar from "../components/Sidebar";
import focusManager from "../core/FocusManager";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [focused, setFocused] = useState(0);

  useEffect(() => {
    focusManager.setZone("content");
    loadFavorites();
  }, []);

  function loadFavorites() {
    try {
      const data = JSON.parse(localStorage.getItem("favorites")) || [];
      setFavorites(data);
    } catch (error) { console.log(error); }
  }

  useEffect(() => {
    function handleKeys(event) {
      if (focusManager.getZone() === "sidebar") return;

      switch (event.keyCode) {
        case KEYS.UP:
          if (focused > 0) setFocused(prev => prev - 1);
          break;
        case KEYS.DOWN:
          if (focused < favorites.length - 1) setFocused(prev => prev + 1);
          break;
        case KEYS.LEFT:
          focusManager.setZone("sidebar");
          break;
        case KEYS.ENTER:
          openFavorite();
          break;
        case KEYS.RED:
          removeFavorite();
          break;
        case KEYS.BACK:
          navigateTo("/dashboard");
          break;
        default:
          break;
      }
    }

    document.addEventListener("keydown", handleKeys);
    return () => document.removeEventListener("keydown", handleKeys);
  }, [focused, favorites]);

  function openFavorite() {
    const item = favorites[focused];
    if (!item) return;

    if (item.type === "series") {
      localStorage.setItem("selected_series", JSON.stringify(item));
      navigateTo("/series-info");
      return;
    }

    localStorage.setItem("stream_id", item.stream_id);
    localStorage.setItem("stream_name", item.name);
    localStorage.setItem("stream_type", item.type);
    navigateTo("/player");
  }

  function removeFavorite() {
    const updated = favorites.filter((_, index) => index !== focused);
    localStorage.setItem("favorites", JSON.stringify(updated));
    setFavorites(updated);
    if (focused >= updated.length) setFocused(Math.max(0, updated.length - 1));
  }

  return (
    <div className="app-container">
      <Sidebar active="FAVORITES" />
      <main className="app-main browse-container">
        <h1 className="hero-title" style={{ fontSize: "60px", marginBottom: "20px" }}>My List</h1>
        <p style={{ fontSize: "22px", color: "var(--primary)", marginBottom: "40px", fontWeight: "bold" }}>
          RED BUTTON = REMOVE FROM LIST
        </p>

        {favorites.length === 0 ? (
          <div style={{ fontSize: "30px", opacity: 0.5, marginTop: "100px", textAlign: "center" }}>
             Your list is empty. Start adding some favorites!
          </div>
        ) : (
          <div className="channel-list-v">
            {favorites.map((item, index) => (
              <div
                key={index}
                className={`channel-item ${focused === index ? "focused" : ""}`}
                onClick={openFavorite}
                style={{ height: "130px" }}
              >
                <img src={item.stream_icon || item.cover} alt="" className="channel-icon" style={{ width: "100px", height: "100px" }} />
                <div style={{ flex: 1 }}>
                  <div className="channel-name">{item.name}</div>
                  <div style={{ fontSize: "20px", color: "var(--text-dim)", textTransform: "uppercase" }}>{item.type}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
