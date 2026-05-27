import { navigateTo } from "../utils/navigation";
import { useEffect, useState, useRef } from "react";
import { getSeriesInfo } from "../services/xtreamApi";
import focusManager from "../core/FocusManager";
import { getResumePosition } from "../utils/ResumeManager";
import Sidebar from "../components/Sidebar";
import { useFocus } from "../hooks/useFocus";
import FavoriteButton from "../components/FavoriteButton";

export default function SeriesInfoPage() {
  const [series, setSeries] = useState(null);
  const [seasons, setSeasons] = useState({});
  const [seasonNumbers, setSeasonNumbers] = useState([]);
  const [activeSeason, setActiveSeason] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zone, setZone] = useState(focusManager.getZone());
  const [localZone, setLocalZone] = useState("content"); // 'seasons' or 'content'
  
  const seasonRef = useRef(null);
  const episodeRef = useRef(null);

  useEffect(() => {
    return focusManager.subscribe(newZone => {
      setZone(newZone);
    });
  }, []);

  useEffect(() => {
    focusManager.setZone("content");
    loadSeriesData();
  }, []);

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

  const episodesArray = activeSeason ? (seasons[activeSeason] || []) : [];
  const currentEpisodes = Array.isArray(episodesArray) ? episodesArray : Object.values(episodesArray);

  function getEpisodeProgress(episode) {
    const epId = episode.id || episode.episode_id;
    if (!epId) return 0;
    const resume = getResumePosition(epId);
    if (resume && resume.duration > 0) {
      return (resume.currentTime / resume.duration) * 100;
    }
    return 0;
  }

  const { focusIndex: seasonIdx } = useFocus({
    containerRef: seasonRef,
    columnCount: seasonNumbers.length,
    itemCount: seasonNumbers.length,
    isActive: zone === "content" && localZone === "seasons",
    onEnter: (index) => {
      setActiveSeason(seasonNumbers[index]);
      setLocalZone("content");
    },
    onBottomEdge: () => setLocalZone("content"),
    onLeftEdge: () => focusManager.setZone("sidebar"),
    onBack: () => navigateTo("/series")
  });

  const { focusIndex: episodeIdx } = useFocus({
    containerRef: episodeRef,
    columnCount: 1,
    itemCount: currentEpisodes.length,
    isActive: zone === "content" && localZone === "content",
    onEnter: (index) => openEpisode(currentEpisodes[index]),
    onTopEdge: () => setLocalZone("seasons"),
    onLeftEdge: () => focusManager.setZone("sidebar"),
    onBack: () => setLocalZone("seasons")
  });

  function openEpisode(episode) {
    if (!episode || !series) return;
    const epId = episode.id || episode.episode_id;
    if (!epId) return;

    localStorage.setItem("stream_id", epId);
    localStorage.setItem("stream_name", `${series.name} - S${activeSeason} E${episode.episode_num || episodeIdx + 1}: ${episode.title || "Episode"}`);
    localStorage.setItem("stream_type", "series");
    localStorage.setItem("stream_icon", episode.info?.movie_image || series.cover || "");
    localStorage.setItem("container_extension", episode.container_extension || "mp4");
    navigateTo("/player");
  }

  if (loading) return <div className="netflix-loader" />;
  if (!series) return null;

  return (
    <div className="app-container">
      <Sidebar active="SERIES" />
      <main className="app-main fade-in info-page">
        {/* HERO SECTION */}
        <section className="hero-banner info-hero small">
          <img src={series.cover || series.backdrop_path?.[0]} alt="" className="hero-image" />
          <div className="hero-overlay" />
          <div className="hero-content">
            <h1 className="hero-title">{series.name}</h1>
            <div className="hero-meta">
              <span className="match">{series.rating ? `${series.rating}/10` : "98% Match"}</span>
              <span>{series.releaseDate || series.last_modified}</span>
              <span className="badge">{series.age || "18+"}</span>
              <span className="badge">TV SERIES</span>
              <div style={{ marginLeft: "20px" }}>
                 <FavoriteButton item={{ ...series, type: "series" }} />
              </div>
            </div>
            <p className="hero-desc">{series.plot || "No description available for this series."}</p>
          </div>
        </section>

        <div className="browse-container" style={{ paddingTop: "0" }}>
          {/* SEASON SELECTOR */}
          <div className="seasons-row" ref={seasonRef}>
            {seasonNumbers.map((num, index) => (
              <div
                key={num}
                data-focusable="true"
                className={`season-tab ${activeSeason === num ? "active" : ""} ${zone === "content" && localZone === "seasons" && seasonIdx === index ? "focused" : ""}`}
              >
                Season {num}
              </div>
            ))}
          </div>

          {/* EPISODES LIST */}
          <h2 className="row-title">Season {activeSeason} Episodes</h2>
          <div className="channel-list-v" ref={episodeRef}>
            {currentEpisodes.map((ep, index) => {
              const progress = getEpisodeProgress(ep);
              return (
                <div
                  key={`${ep.id}-${index}`}
                  data-focusable="true"
                  className={`channel-item episode-item ${zone === "content" && localZone === "content" && episodeIdx === index ? "focused" : ""}`}
                  onClick={() => openEpisode(ep)}
                >
                  <div className="episode-num">
                    {ep.episode_num || index + 1}
                  </div>
                  <div className="channel-main">
                    <div className="episode-title">
                      {ep.title}
                    </div>
                    <div className="episode-desc">
                      {ep.info?.plot || ep.plot || "No description available."}
                    </div>
                    {progress > 0 && (
                      <div className="episode-progress-container">
                        <div className="episode-progress-fill" style={{ width: `${progress}%` }} />
                      </div>
                    )}
                  </div>
                  {zone === "content" && localZone === "content" && episodeIdx === index && <div className="play-icon">▶</div>}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
