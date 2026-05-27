import { navigateTo } from "../utils/navigation";
import { useEffect, useState } from "react";
import { KEYS } from "../utils/tizenRemote";
import { getMovieInfo } from "../services/xtreamApi";
import focusManager from "../core/FocusManager";
import navigationManager from "../core/NavigationManager";
import FavoriteButton from "../components/FavoriteButton";

export default function MovieInfoPage() {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [focusedBtn, setFocusedBtn] = useState(0); // 0: Play, 1: Favorite

  useEffect(() => {
    focusManager.setZone("content");
    loadMovieData();
  }, []);

  async function loadMovieData() {
    try {
      setLoading(true);
      const itemStr = localStorage.getItem("selected_movie");
      if (!itemStr) {
        setLoading(false);
        return;
      }
      const item = JSON.parse(itemStr);

      const iptv = JSON.parse(localStorage.getItem("iptv"));
      if (!iptv) {
         setMovie(item);
         setLoading(false);
         return;
      }

      const data = await getMovieInfo(iptv.host, iptv.username, iptv.password, item.stream_id);
      
      if (data && data.info) {
        setMovie({ ...item, ...data.info });
      } else {
        setMovie(item);
      }
      setLoading(false);
    } catch (error) { 
      console.log("Load Movie Error", error);
      const item = JSON.parse(localStorage.getItem("selected_movie"));
      if (item) setMovie(item);
      setLoading(false);
    }
  }

  useEffect(() => {
    function handleKeys(event) {
      if (!movie) return;

      switch (event.keyCode) {
        case KEYS.LEFT:
          if (focusedBtn > 0) setFocusedBtn(prev => prev - 1);
          break;

        case KEYS.RIGHT:
          if (focusedBtn < 1) setFocusedBtn(prev => prev + 1);
          break;

        case KEYS.ENTER:
          if (focusedBtn === 0) playMovie();
          // FavoriteButton handles its own click but we might need to trigger it via D-pad
          break;

        case KEYS.BACK:
          navigateTo(navigationManager.back());
          break;
          
        default:
          break;
      }
    }
    document.addEventListener("keydown", handleKeys);
    return () => document.removeEventListener("keydown", handleKeys);
  }, [focusedBtn, movie]);

  function playMovie() {
    if (!movie) return;
    localStorage.setItem("stream_id", movie.stream_id);
    localStorage.setItem("stream_name", movie.name);
    localStorage.setItem("stream_type", "movie");
    localStorage.setItem("stream_icon", movie.stream_icon || movie.movie_image);
    localStorage.setItem("container_extension", movie.container_extension || "mp4");
    
    navigateTo("/player");
  }

  if (loading) return <div className="netflix-loader" />;
  if (!movie) return null;

  const info = movie;

  return (
    <div className="app-main fade-in" style={{ background: "var(--bg-black)", minHeight: "100vh" }}>
      {/* HERO SECTION */}
      <section className="hero-banner" style={{ height: "70vh", position: "relative" }}>
        <img src={info.movie_image || info.stream_icon || info.backdrop_path?.[0]} alt="" className="hero-image" style={{ opacity: 0.5 }} />
        <div className="hero-overlay" />
        <div className="hero-content" style={{ bottom: "10%", width: "50%" }}>
          <h1 className="hero-title" style={{ fontSize: "70px" }}>{info.name}</h1>
          <div className="hero-meta" style={{ margin: "20px 0" }}>
            <span className="match">{info.rating ? `${info.rating}/10` : "98% Match"}</span>
            <span style={{ margin: "0 15px" }}>{info.releasedate || info.releaseDate || info.year}</span>
            <span className="badge">{info.age || "18+"}</span>
            <span className="badge" style={{ marginLeft: "10px" }}>{info.container_extension?.toUpperCase() || "HD"}</span>
          </div>
          <p className="hero-desc" style={{ fontSize: "24px", lineHeight: "1.4", marginBottom: "40px", maxHeight: "200px", overflow: "hidden" }}>
            {info.plot || "No description available for this movie."}
          </p>

          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <button 
              className={`play-btn ${focusedBtn === 0 ? "focused" : ""}`}
              onClick={playMovie}
              style={{ 
                padding: "15px 50px", 
                fontSize: "24px", 
                fontWeight: "bold",
                background: focusedBtn === 0 ? "white" : "rgba(255,255,255,0.2)",
                color: focusedBtn === 0 ? "black" : "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              ▶ Play
            </button>
            <div className={focusedBtn === 1 ? "focused-frame" : ""} style={{ borderRadius: "50%", padding: "5px" }}>
               <FavoriteButton item={{ ...info, type: "movie" }} />
            </div>
          </div>
          
          <div style={{ marginTop: "40px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>
             <div>
                <h3 style={{ color: "var(--text-dim)", marginBottom: "10px" }}>Cast</h3>
                <p style={{ fontSize: "18px" }}>{info.cast || "N/A"}</p>
             </div>
             <div>
                <h3 style={{ color: "var(--text-dim)", marginBottom: "10px" }}>Director</h3>
                <p style={{ fontSize: "18px" }}>{info.director || "N/A"}</p>
             </div>
             <div>
                <h3 style={{ color: "var(--text-dim)", marginBottom: "10px" }}>Genre</h3>
                <p style={{ fontSize: "18px" }}>{info.genre || "N/A"}</p>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
