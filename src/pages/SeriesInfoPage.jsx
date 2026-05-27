import { navigateTo } from "../utils/navigation";
import { useEffect, useState } from "react";
import { KEYS } from "../utils/tizenRemote";
import { getSeriesInfo } from "../services/xtreamApi";
import focusManager from "../core/FocusManager";
import { getResumePosition } from "../utils/ResumeManager";

export default function SeriesInfoPage() {
  const [series, setSeries] = useState(null);
  const [seasons, setSeasons] = useState({});
  const [seasonNumbers, setSeasonNumbers] = useState([]);
  const [activeSeason, setActiveSeason] = useState(null);
  const [focusedEpisode, setFocusedEpisode] = useState(0);
  const [focusedSeason, setFocusedSeason] = useState(0);
  const [loading, setLoading] = useState(true);
  const [zone, setZone] = useState("content"); // 'seasons' or 'content'

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
      
      setSeries(data.info || item);

      if (data.episodes) {
        setSeasons(data.episodes);
        const numbers = Object.keys(data.episodes).sort((a, b) => Number(a) - Number(b));
        setSeasonNumbers(numbers);
        if (numbers.length > 0) {
          setActiveSeason(numbers[0]);
        }
      }
      setLoading(false);
    } catch (error) { 
      console.log(error);
      setLoading(false);
    }
  }

  const currentEpisodes = activeSeason ? (seasons[activeSeason] || []) : [];

  function getEpisodeProgress(episode) {
    const epId = episode.id || episode.episode_id;
    if (!epId) return 0;
    const resume = getResumePosition(epId);
    if (resume && resume.duration > 0) {
      return (resume.currentTime / resume.duration) * 100;
    }
    return 0;
  }

  useEffect(() => {
    function handleKeys(event) {
      if (!series) return;

      switch (event.keyCode) {
        case KEYS.UP:
          if (zone === "content") {
            if (focusedEpisode > 0) {
              setFocusedEpisode(prev => prev - 1);
            } else {
              setZone("seasons");
            }
          }
          break;

        case KEYS.DOWN:
          if (zone === "seasons") {
            setZone("content");
          } else {
            if (focusedEpisode < currentEpisodes.length - 1) {
              setFocusedEpisode(prev => prev + 1);
            }
          }
          break;

        case KEYS.LEFT:
          if (zone === "seasons") {
            if (focusedSeason > 0) setFocusedSeason(prev => prev - 1);
          }
          break;

        case KEYS.RIGHT:
          if (zone === "seasons") {
            if (focusedSeason < seasonNumbers.length - 1) setFocusedSeason(prev => prev + 1);
          }
          break;

        case KEYS.ENTER:
          if (zone === "seasons") {
            setActiveSeason(seasonNumbers[focusedSeason]);
            setFocusedEpisode(0);
            setZone("content");
          } else {
            openEpisode();
          }
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
  }, [focusedEpisode, focusedSeason, zone, activeSeason, currentEpisodes, seasonNumbers, series]);

  function openEpisode() {
    const episode = currentEpisodes[focusedEpisode];
    if (!episode || !series) return;
    
    const epId = episode.id || episode.episode_id;
    if (!epId) return;

    localStorage.setItem("stream_id", epId);
    localStorage.setItem("stream_name", `${series.name} - S${activeSeason} E${episode.episode_num || focusedEpisode + 1}: ${episode.title || "Episode"}`);
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
      <section className="hero-banner" style={{ height: "60vh" }}>
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
        </div>
      </section>

      <div className="browse-container" style={{ paddingTop: "20px" }}>
        {/* SEASON SELECTOR */}
        <div className="seasons-row" style={{ display: "flex", gap: "20px", marginBottom: "30px", overflowX: "auto" }}>
          {seasonNumbers.map((num, index) => (
            <div
              key={num}
              className={`season-tab ${activeSeason === num ? "active" : ""} ${zone === "seasons" && focusedSeason === index ? "focused" : ""}`}
              style={{
                padding: "15px 30px",
                borderRadius: "10px",
                background: activeSeason === num ? "var(--primary)" : "rgba(255,255,255,0.1)",
                color: activeSeason === num ? "black" : "white",
                fontWeight: "bold",
                fontSize: "22px",
                border: zone === "seasons" && focusedSeason === index ? "4px solid white" : "4px solid transparent",
                transition: "all 0.2s ease"
              }}
            >
              Season {num}
            </div>
          ))}
        </div>

        {/* EPISODES LIST */}
        <h2 className="row-title">Season {activeSeason} - Episodes ({currentEpisodes.length})</h2>
        <div className="channel-list-v">
          {currentEpisodes.map((ep, index) => {
            const progress = getEpisodeProgress(ep);
            return (
              <div
                key={`${ep.id}-${index}`}
                data-episode-index={index}
                className={`channel-item ${zone === "content" && focusedEpisode === index ? "focused" : ""}`}
                onClick={openEpisode}
                style={{ height: "140px", position: "relative" }}
              >
                <div style={{ fontSize: "50px", fontWeight: "900", opacity: 0.2, minWidth: "100px", textAlign: "center" }}>
                  {ep.episode_num || index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "28px", fontWeight: "700", marginBottom: "5px" }}>
                    {ep.title}
                  </div>
                  <div style={{ fontSize: "20px", color: "var(--text-dim)", maxWidth: "800px" }}>
                    {ep.info?.plot || ep.plot || "No description available."}
                  </div>
                  {progress > 0 && (
                    <div style={{ width: "200px", height: "4px", background: "rgba(255,255,255,0.2)", marginTop: "10px", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ width: `${progress}%`, height: "100%", background: "var(--primary)" }} />
                    </div>
                  )}
                </div>
                {zone === "content" && focusedEpisode === index && <div style={{ fontSize: "40px" }}>▶</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
