import { navigateTo } from "../utils/navigation";
import { useEffect, useState, useRef } from "react";
import { getMovieInfo } from "../services/xtreamApi";
import focusManager from "../core/FocusManager";
import navigationManager from "../core/NavigationManager";
import FavoriteButton from "../components/FavoriteButton";
import Sidebar from "../components/Sidebar";
import { useFocus } from "../hooks/useFocus";

export default function MovieInfoPage() {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zone, setZone] = useState(focusManager.getZone());
  const btnsRef = useRef(null);

  useEffect(() => {
    return focusManager.subscribe(newZone => {
      setZone(newZone);
    });
  }, []);

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

  const { focusIndex: focusedBtn } = useFocus({
    containerRef: btnsRef,
    columnCount: 2,
    itemCount: 2,
    isActive: zone === "content",
    onEnter: (index) => {
      if (index === 0) playMovie();
      // index 1 is FavoriteButton which has its own onClick
    },
    onLeftEdge: () => focusManager.setZone("sidebar"),
    onBack: () => navigateTo(navigationManager.back())
  });

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

  return (
    <div className="app-container">
      <Sidebar active="MOVIES" />
      <main className="app-main fade-in info-page">
        {/* HERO SECTION */}
        <section className="hero-banner info-hero">
          <img src={movie.movie_image || movie.stream_icon || movie.backdrop_path?.[0]} alt="" className="hero-image" />
          <div className="hero-overlay" />
          <div className="hero-content">
            <h1 className="hero-title">{movie.name}</h1>
            <div className="hero-meta">
              <span className="match">{movie.rating ? `${movie.rating}/10` : "98% Match"}</span>
              <span>{movie.releasedate || movie.year}</span>
              <span className="badge">{movie.age || "18+"}</span>
              <span className="badge">{movie.container_extension?.toUpperCase() || "HD"}</span>
            </div>
            <p className="hero-desc">{movie.plot || "No description available for this movie."}</p>

            <div className="info-actions" ref={btnsRef}>
              <button 
                data-focusable="true"
                className={`btn-primary ${zone === "content" && focusedBtn === 0 ? "focused" : ""}`}
                onClick={playMovie}
              >
                <span>▶</span> Play
              </button>
              <div 
                data-focusable="true"
                className={`fav-btn-wrapper ${zone === "content" && focusedBtn === 1 ? "focused" : ""}`}
              >
                 <FavoriteButton item={{ ...movie, type: "movie" }} />
              </div>
            </div>
            
            <div className="info-details-grid">
               <div className="info-detail-item">
                  <h3>Cast</h3>
                  <p>{movie.cast || "N/A"}</p>
               </div>
               <div className="info-detail-item">
                  <h3>Director</h3>
                  <p>{movie.director || "N/A"}</p>
               </div>
               <div className="info-detail-item">
                  <h3>Genre</h3>
                  <p>{movie.genre || "N/A"}</p>
               </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
