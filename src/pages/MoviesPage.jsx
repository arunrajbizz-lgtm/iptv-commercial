import { navigateTo } from "../utils/navigation";
import { useEffect, useState, useRef } from "react";
import { KEYS } from "../utils/tizenRemote";
import { getMovieCategories, getMovies } from "../services/xtreamApi";
import Sidebar from "../components/Sidebar";
import focusManager from "../core/FocusManager";

export default function MoviesPage() {
  const [categories, setCategories] = useState([]);
  const [movies, setMovies] = useState([]);
  const [focusedCategory, setFocusedCategory] = useState(0);
  const [focusedMovie, setFocusedMovie] = useState(0);
  const [zone, setZone] = useState("content");
  const [showDrawer, setShowDrawer] = useState(false);
  const gridRef = useRef(null);
  const COLS = 6;

  useEffect(() => {
    focusManager.setZone("content");
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const iptv = JSON.parse(localStorage.getItem("iptv"));
      if (!iptv) return;
      const data = await getMovieCategories(iptv.host, iptv.username, iptv.password);
      setCategories(data || []);
      if (data?.length) loadMovies(data[0].category_id);
    } catch (error) { console.log(error); }
  }

  async function loadMovies(categoryId) {
    try {
      const iptv = JSON.parse(localStorage.getItem("iptv"));
      const data = await getMovies(iptv.host, iptv.username, iptv.password, categoryId);
      setMovies(data || []);
      setFocusedMovie(0);
    } catch (error) { console.log(error); }
  }

  useEffect(() => {
    function handleKeys(event) {
      const currentZone = focusManager.getZone();
      if (currentZone === "sidebar") return;

      switch (event.keyCode) {
        case KEYS.UP:
          if (zone === "drawer") {
             if (focusedCategory > 0) setFocusedCategory(prev => prev - 1);
          } else {
             if (focusedMovie >= COLS) setFocusedMovie(prev => prev - COLS);
          }
          break;

        case KEYS.DOWN:
          if (zone === "drawer") {
             if (focusedCategory < categories.length - 1) setFocusedCategory(prev => prev + 1);
          } else {
             if (focusedMovie + COLS < movies.length) setFocusedMovie(prev => prev + COLS);
          }
          break;

        case KEYS.LEFT:
          if (zone === "content") {
             if (focusedMovie % COLS === 0) {
                setShowDrawer(true);
                setZone("drawer");
             } else {
                setFocusedMovie(prev => prev - 1);
             }
          } else if (zone === "drawer") {
             setShowDrawer(false);
             focusManager.setZone("sidebar");
          }
          break;

        case KEYS.RIGHT:
          if (zone === "drawer") {
             setShowDrawer(false);
             setZone("content");
             loadMovies(categories[focusedCategory]?.category_id);
          } else {
             if (focusedMovie % COLS < COLS - 1 && focusedMovie < movies.length - 1) {
                setFocusedMovie(prev => prev + 1);
             }
          }
          break;

        case KEYS.ENTER:
          if (zone === "drawer") {
             setShowDrawer(false);
             setZone("content");
             loadMovies(categories[focusedCategory]?.category_id);
          } else {
             openMovie(movies[focusedMovie]);
          }
          break;

        case KEYS.BACK:
          if (showDrawer) {
             setShowDrawer(false);
             setZone("content");
          } else {
             navigateTo("/dashboard");
          }
          break;

        default:
          break;
      }
    }

    document.addEventListener("keydown", handleKeys);
    return () => document.removeEventListener("keydown", handleKeys);
  }, [zone, focusedCategory, focusedMovie, categories, movies, showDrawer]);

  useEffect(() => {
     if (zone === "content" && gridRef.current) {
        const item = gridRef.current.children[focusedMovie];
        if (item) item.scrollIntoView({ behavior: "smooth", block: "center" });
     }
  }, [focusedMovie, zone]);

  function openMovie(movie) {
    if (!movie) return;
    localStorage.setItem("stream_id", movie.stream_id);
    localStorage.setItem("stream_name", movie.name);
    localStorage.setItem("stream_type", "movie");
    localStorage.setItem("stream_icon", movie.stream_icon);
    navigateTo("/player");
  }

  return (
    <div className="app-container">
      <Sidebar active="MOVIES" />
      
      <div className={`category-drawer ${showDrawer ? "visible" : ""}`}>
         <h2 className="drawer-title">Movie Categories</h2>
         <div className="drawer-list">
            {categories.map((cat, index) => (
              <div 
                key={cat.category_id}
                className={`drawer-item ${focusedCategory === index && zone === "drawer" ? "focused" : ""} ${categories[focusedCategory]?.category_id === cat.category_id ? "active" : ""}`}
              >
                 {cat.category_name}
              </div>
            ))}
         </div>
      </div>

      <main className="app-main browse-container">
         <h1 className="hero-title" style={{ fontSize: "60px", marginBottom: "50px" }}>
            {categories[focusedCategory]?.category_name || "Movies"}
         </h1>

         <div className="content-grid" ref={gridRef}>
            {movies.map((movie, index) => (
              <div 
                key={`${movie.stream_id}-${index}`}
                className={`content-card portrait-card ${focusedMovie === index && zone === "content" ? "focused" : ""}`}
              >
                 <img src={movie.stream_icon} alt="" className="card-img" />
                 <div className="card-info">
                    <div style={{ fontWeight: "700", fontSize: "22px" }}>{movie.name}</div>
                 </div>
              </div>
            ))}
         </div>
      </main>
    </div>
  );
}
