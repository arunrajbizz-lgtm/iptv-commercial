import { navigateTo } from "../utils/navigation";
import { useEffect, useState } from "react";
import { KEYS } from "../utils/tizenRemote";
import focusManager from "../core/FocusManager";

export default function SeriesInfoPage() {
  const [series, setSeries] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [focusedEpisode, setFocusedEpisode] = useState(0);

  useEffect(() => {
    focusManager.setZone("content");
    loadSeries();
  }, []);

  useEffect(() => {
    const el = document.querySelector(`[data-episode-index="${focusedEpisode}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focusedEpisode]);

  function loadSeries() {
    try {
      const item = JSON.parse(localStorage.getItem("selected_series"));
      if (!item) return;
      setSeries(item);

      const demoEpisodes = [];
      for (let i = 1; i <= 20; i++) {
        demoEpisodes.push({
          id: i,
          title: `Episode ${i}`,
          plot: "Experience the next chapter of this epic series with stunning visuals and deep storytelling.",
          stream_id: item.series_id
        });
      }
      setEpisodes(demoEpisodes);
    } catch (error) { console.log(error); }
  }

  useEffect(() => {
    function handleKeys(event) {
      switch (event.keyCode) {
        case KEYS.UP:
          if (focusedEpisode > 0) setFocusedEpisode(prev => prev - 1);
          break;
        case KEYS.DOWN:
          if (focusedEpisode < episodes.length - 1) setFocusedEpisode(prev => prev + 1);
          break;
        case KEYS.ENTER:
          openEpisode();
          break;
        case KEYS.BACK:
          navigateTo("/series");
          break;
        default:
          break;
      }
    }
    document.addEventListener("keydown", handleKeys);
    return () => document.removeEventListener("keydown", handleKeys);
  }, [focusedEpisode, episodes]);

  function openEpisode() {
    const episode = episodes[focusedEpisode];
    if (!episode) return;
    localStorage.setItem("stream_id", episode.stream_id);
    localStorage.setItem("stream_name", `${series.name} - ${episode.title}`);
    localStorage.setItem("stream_type", "series");
    navigateTo("/player");
  }

  if (!series) return null;

  return (
    <div className="app-main fade-in" style={{ background: "var(--bg-black)" }}>
      {/* HERO SECTION */}
      <section className="hero-banner" style={{ height: "65vh" }}>
        <img src={series.cover} alt="" className="hero-image" style={{ opacity: 0.4 }} />
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title">{series.name}</h1>
          <div className="hero-meta">
            <span className="match">98% Match</span>
            <span>2026</span>
            <span className="badge">18+</span>
            <span className="badge">HD</span>
          </div>
          <p className="hero-desc">{series.plot || "No description available for this series."}</p>
          <div className="hero-btns">
            <button className="btn-primary focused" onClick={openEpisode}>
               ▶ Play S1:E{focusedEpisode + 1}
            </button>
          </div>
        </div>
      </section>

      {/* EPISODES LIST */}
      <div className="browse-container" style={{ paddingTop: "40px" }}>
        <h2 className="row-title">Episodes</h2>
        <div className="channel-list-v">
          {episodes.map((ep, index) => (
            <div
              key={ep.id}
              data-episode-index={index}
              className={`channel-item ${focusedEpisode === index ? "focused" : ""}`}
              onClick={openEpisode}
              style={{ height: "140px" }}
            >
              <div style={{ fontSize: "50px", fontWeight: "900", opacity: 0.2, minWidth: "100px", textAlign: "center" }}>
                {index + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "28px", fontWeight: "700", marginBottom: "5px" }}>{ep.title}</div>
                <div style={{ fontSize: "20px", color: "var(--text-dim)", maxWidth: "800px" }}>{ep.plot}</div>
              </div>
              {focusedEpisode === index && <div style={{ fontSize: "40px" }}>▶</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}