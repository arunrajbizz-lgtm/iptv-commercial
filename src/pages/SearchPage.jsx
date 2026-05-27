import { navigateTo } from "../utils/navigation";
import { useEffect, useState, useRef, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import focusManager from "../core/FocusManager";
import navigationManager from "../core/NavigationManager";
import { useFocus } from "../hooks/useFocus";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [zone, setZone] = useState(focusManager.getZone());
  const [localZone, setLocalZone] = useState("content"); // 'input' or 'content'
  const resultsRef = useRef(null);

  useEffect(() => {
    return focusManager.subscribe(newZone => {
      setZone(newZone);
    });
  }, []);

  useEffect(() => {
    focusManager.setZone("content");
    const voice = localStorage.getItem("voice_search");
    if (voice) {
      setQuery(voice);
      localStorage.removeItem("voice_search");
    }
  }, []);

  const results = useMemo(() => {
    if (!query) return [];
    const movies = JSON.parse(localStorage.getItem("movies")) || [];
    const series = JSON.parse(localStorage.getItem("series")) || [];
    const live = JSON.parse(localStorage.getItem("live_channels")) || [];

    const all = [
      ...movies.map(item => ({ ...item, type: "movie" })),
      ...series.map(item => ({ ...item, type: "series" })),
      ...live.map(item => ({ ...item, type: "live" }))
    ];

    return all.filter(item => (item.name || "").toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  const { focusIndex: resultIdx } = useFocus({
    containerRef: resultsRef,
    columnCount: 1,
    itemCount: results.length,
    isActive: zone === "content" && localZone === "content",
    onEnter: (index) => openItem(results[index]),
    onTopEdge: () => setLocalZone("input"),
    onLeftEdge: () => focusManager.setZone("sidebar"),
    onBack: () => navigateTo("/dashboard")
  });

  function openItem(item) {
    if (!item) return;

    if (item.type === "series") {
      localStorage.setItem("selected_series", JSON.stringify(item));
      navigationManager.push("/search");
      navigateTo("/series-info");
      return;
    }

    localStorage.setItem("stream_id", item.stream_id);
    localStorage.setItem("stream_name", item.name);
    localStorage.setItem("stream_type", item.type);
    navigationManager.push("/search");
    navigateTo("/player");
  }

  return (
    <div className="app-container">
      <Sidebar active="SEARCH" />
      <main className="app-main browse-container search-page">
        <h1 className="hero-title">Search</h1>
        
        <div 
          className={`search-input-container ${localZone === "input" && zone === "content" ? "focused" : ""}`}
          onClick={() => setLocalZone("input")}
        >
          <input 
            type="text" 
            placeholder="Type to search movies, series or channels..." 
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus={localZone === "input"}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") setLocalZone("content");
              if (e.key === "ArrowLeft") focusManager.setZone("sidebar");
            }}
          />
          <div className="search-hint">Press Blue for Voice Search</div>
        </div>

        <div className="channel-list-v" ref={resultsRef}>
          {results.map((item, index) => (
            <div
              key={`${item.stream_id}-${index}`}
              data-focusable="true"
              className={`channel-item search-result-item ${resultIdx === index && localZone === "content" ? "focused" : ""}`}
              onClick={() => openItem(item)}
            >
              <div className="channel-logo">
                <img src={item.stream_icon || item.cover || "assets/hero.png"} alt="" />
              </div>
              <div className="channel-main">
                <div className="channel-name">{item.name}</div>
                <div className="result-type">{item.type?.toUpperCase()}</div>
              </div>
            </div>
          ))}
          {query && results.length === 0 && (
            <div className="no-results">No results found for "{query}"</div>
          )}
        </div>
      </main>
    </div>
  );
}
