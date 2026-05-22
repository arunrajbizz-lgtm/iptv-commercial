import { navigateTo } from "../utils/navigation";
import { useEffect, useState } from "react";
import { KEYS } from "../utils/tizenRemote";
import Sidebar from "../components/Sidebar";
import focusManager from "../core/FocusManager";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [focused, setFocused] = useState(0);

  useEffect(() => {
    focusManager.setZone("content");
    const voice = localStorage.getItem("voice_search");
    if (voice) {
      setQuery(voice);
      searchContent(voice);
    }
  }, []);

  function searchContent(text) {
    const movies = JSON.parse(localStorage.getItem("movies")) || [];
    const series = JSON.parse(localStorage.getItem("series")) || [];
    const live = JSON.parse(localStorage.getItem("live_channels")) || [];

    const all = [
      ...movies.map(item => ({ ...item, type: "movie" })),
      ...series.map(item => ({ ...item, type: "series" })),
      ...live.map(item => ({ ...item, type: "live" }))
    ];

    const filtered = all.filter(item => (item.name || "").toLowerCase().includes(text.toLowerCase()));
    setResults(filtered);
    setFocused(0);
  }

  useEffect(() => {
    function handleKeys(event) {
      if (focusManager.getZone() === "sidebar") return;

      switch (event.keyCode) {
        case KEYS.UP:
          if (focused > 0) setFocused(prev => prev - 1);
          break;
        case KEYS.DOWN:
          if (focused < results.length - 1) setFocused(prev => prev + 1);
          break;
        case KEYS.LEFT:
          focusManager.setZone("sidebar");
          break;
        case KEYS.ENTER:
          openItem();
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
  }, [focused, results]);

  function openItem() {
    const item = results[focused];
    if (!item) return;

    if (item.type === "series") {
      localStorage.setItem("selected_series", JSON.stringify(item));
      navigationManager.push("/search"); // Add current page to history
      navigateTo("/series-info");
      return;
    }

    localStorage.setItem("stream_id", item.stream_id);
    localStorage.setItem("stream_name", item.name);
    localStorage.setItem("stream_type", item.type);
    navigationManager.push("/search"); // Add current page to history
    navigateTo("/player");
  }

  return (
    <div className="app-container">
      <Sidebar active="SEARCH" />
      <main className="app-main browse-container">
        <h1 className="hero-title" style={{ fontSize: "60px", marginBottom: "40px" }}>Search</h1>
        
        <div style={{ padding: "25px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", fontSize: "30px", marginBottom: "50px", border: "1px solid rgba(255,255,255,0.1)" }}>
          {query || "Press Blue for Voice Search..."}
        </div>

        <div className="channel-list-v">
          {results.map((item, index) => (
            <div
              key={index}
              className={`channel-item ${focused === index ? "focused" : ""}`}
              onClick={openItem}
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
      </main>
    </div>
  );
}
