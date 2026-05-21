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
  const [zone, setZone] = useState("categories");
  const gridRef = useRef(null);
  const COLS = 5;

  useEffect(() => {
    focusManager.setZone("categories");
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
      if (focusManager.getZone() === "sidebar") return;

      switch (event.keyCode) {
        case KEYS.UP:
          if (zone === "categories") {
             if (focusedCategory > 0) {
                const next = focusedCategory - 1;
                setFocusedCategory(next);
                loadMovies(categories[next]?.category_id);
             }
          } else {
             if (focusedMovie >= COLS) setFocusedMovie(prev => prev - COLS);
          }
          break;

        case KEYS.DOWN:
          if (zone === "categories") {
             if (focusedCategory < categories.length - 1) {
                const next = focusedCategory + 1;
                setFocusedCategory(next);
                loadMovies(categories[next]?.category_id);
             }
          } else {
             if (focusedMovie + COLS < movies.length) setFocusedMovie(prev => prev + COLS);
          }
          break;

        case KEYS.LEFT:
          if (zone === "movies" && focusedMovie % COLS === 0) {
             setZone("categories");
             focusManager.setZone("categories");
          } else if (zone === "categories") {
             focusManager.setZone("sidebar");
          } else if (zone === "movies") {
             setFocusedMovie(prev => prev - 1);
          }
          break;

        case KEYS.RIGHT:
          if (zone === "categories") {
             setZone("movies");
             focusManager.setZone("content");
          } else {
             if (focusedMovie % COLS < COLS - 1 && focusedMovie < movies.length - 1) {
                setFocusedMovie(prev => prev + 1);
             }
          }
          break;

        case KEYS.ENTER:
          if (zone === "movies") openMovie(movies[focusedMovie]);
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
  }, [zone, focusedCategory, focusedMovie, categories, movies]);

  useEffect(() => {
     if (zone === "movies" && gridRef.current) {
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
      <main className="app-main" style={{ display: "flex" }}>
         <aside className="app-sidebar expanded" style={{ width: "400px", borderRight: "1px solid #222" }}>
            <div className="sidebar-logo" style={{ paddingLeft: "20px" }}>MOVIES</div>
            <div className="sidebar-nav" style={{ overflowY: "auto", flex: 1 }}>
               {categories.map((cat, index) => (
                 <div 
                   key={cat.category_id}
                   className={`nav-item ${focusedCategory === index && zone === "categories" ? "focused" : ""}`}
                   style={{ paddingLeft: "40px" }}
                 >
                    {cat.category_name}
                 </div>
               ))}
            </div>
         </aside>

         <section style={{ flex: 1, padding: "60px", overflowY: "auto" }}>
            <h1 className="hero-title" style={{ fontSize: "60px", marginBottom: "40px" }}>
               {categories[focusedCategory]?.category_name || "All Movies"}
            </h1>
            <div className="content-grid" ref={gridRef} style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: "30px" }}>
               {movies.map((movie, index) => (
                 <div 
                   key={`${movie.stream_id}-${index}`}
                   className={`content-card ${focusedMovie === index && zone === "movies" ? "focused" : ""}`}
                   style={{ height: "450px" }}
                 >
                    <img src={movie.stream_icon} alt="" className="card-img" />
                    <div className="card-info">
                       <div style={{ fontWeight: "700", fontSize: "22px" }}>{movie.name}</div>
                    </div>
                 </div>
               ))}
            </div>
         </section>
      </main>
    </div>
  );
}
