import { navigateTo } from "../utils/navigation";
import { useEffect, useState } from "react";
import { KEYS } from "../utils/tizenRemote";
import { getSeriesInfo } from "../services/xtreamApi";
import focusManager from "../core/FocusManager";

export default function SeriesInfoPage() {
  const [series, setSeries] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [focusedEpisode, setFocusedEpisode] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    focusManager.setZone("content");
    loadSeriesData();
  }, []);

  useEffect(() => {
    const el = document.querySelector(`[data-episode-index="${focusedEpisode}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focusedEpisode]);

  async function loadSeriesData() {
    try {
      setLoading(true);
      const item = JSON.parse(localStorage.getItem("selected_series"));
      if (!item) return;

      const iptv = JSON.parse(localStorage.getItem("iptv"));
      const data = await getSeriesInfo(iptv.host, iptv.username, iptv.password, item.series_id);
      
      console.log("Series Info API Response:", data); // Debugging line: Check this output for episode structure!
      setSeries(data.info || item);

      const allEpisodes = [];
      if (data.episodes) {
        // Episodes are usually grouped by season number
        Object.keys(data.episodes).forEach(seasonKey => {
          const seasonEpisodes = data.episodes[seasonKey];
          if (Array.isArray(seasonEpisodes)) {
            seasonEpisodes.forEach(ep => {
              allEpisodes.push({
                ...ep,
                season: seasonKey
              });
            });
          }
        });
      }
      setEpisodes(allEpisodes);
      setLoading(false);
    } catch (error) { 
      console.log(error);
      setLoading(false);
    }
  }

  useEffect(() => {
    function handleKeys(event) {
      if (!episodes || episodes.length === 0) {
        if (event.keyCode === KEYS.BACK) navigateTo("/series");
        return;
      }

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
  }, [focusedEpisode, episodes, series]);

  function openEpisode() {
    const episode = episodes[focusedEpisode];
    if (!episode || !series) return;
    
    // In Xtream, the episode object might have 'id' or 'episode_id'
    const epId = episode.id || episode.episode_id;
    if (!epId) {
      console.error("Episode ID not found", episode);
      return;
    }

    localStorage.setItem("stream_id", epId);
    localStorage.setItem("stream_name", `${series.name} - S${episode.season} E${episode.episode_num || epId}: ${episode.title || "Episode"}`);
    localStorage.setItem("stream_type", "series");
    localStorage.setItem("stream_icon", episode.info?.movie_image || series.cover || "");
    localStorage.setItem("container_extension", episode.container_extension || "mp4");
    navigateTo("/player");
  }

  if (loading) return <div className="netflix-loader" />;
  if (!series) return null;

  return (
    <div className="app-main fade-in" style={{ background: "var(--bg-black)" }}>
      {/* HERO SECTION */}
      <section className="hero-banner" style={{ height: "65vh" }}>
        <img src={series.cover || series.backdrop_path?.[0]} alt="" className="hero-image" style={{ opacity: 0.4 }} />
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title">{series.name}</h1>
          <div className="hero-meta">
            <span className="match">{series.rating ? `${series.rating}/10` : "98% Match"}</span>
            <span>{series.releaseDate || series.last_modified}</span>
            <span className="badge">{series.age || "18+"}</span>
            <span className="badge">HD</span>
          </div>
          <p className="hero-desc">{series.plot || "No description available for this series."}</p>
          <div className="hero-btns">
            <button className="btn-primary focused" onClick={openEpisode}>
               ▶ {episodes.length > 0 ? `Play S${episodes[focusedEpisode]?.season}:E${episodes[focusedEpisode]?.episode_num || focusedEpisode + 1}` : "Play"}
            </button>
          </div>
        </div>
      </section>

      {/* EPISODES LIST */}
      <div className="browse-container" style={{ paddingTop: "40px" }}>
        <h2 className="row-title">Episodes ({episodes.length})</h2>
        <div className="channel-list-v">
          {episodes.map((ep, index) => (
            <div
              key={`${ep.id}-${index}`}
              data-episode-index={index}
              className={`channel-item ${focusedEpisode === index ? "focused" : ""}`}
              onClick={openEpisode}
              style={{ height: "140px" }}
            >
              <div style={{ fontSize: "50px", fontWeight: "900", opacity: 0.2, minWidth: "100px", textAlign: "center" }}>
                {ep.episode_num || index + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "28px", fontWeight: "700", marginBottom: "5px" }}>
                  S{ep.season} E{ep.episode_num || ""}: {ep.title}
                </div>
                <div style={{ fontSize: "20px", color: "var(--text-dim)", maxWidth: "800px" }}>
                  {ep.info?.plot || ep.plot || "No description available."}
                </div>
              </div>
              {focusedEpisode === index && <div style={{ fontSize: "40px" }}>▶</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}