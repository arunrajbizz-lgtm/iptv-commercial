import { navigateTo } from "../utils/navigation";
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { KEYS } from "../utils/tizenRemote";
import { getMovieCategories, getMovies } from "../services/xtreamApi";
import Sidebar from "../components/Sidebar";
import focusManager from "../core/FocusManager";
import navigationManager from "../core/NavigationManager";

export default function MoviesPage() {
  const [categories, setCategories] = useState([]);
  const [movies, setMovies] = useState([]);
  const [focusedCategory, setFocusedCategory] = useState(0);
  const [focusedMovie, setFocusedMovie] = useState(0);
  const [zone, setZone] = useState("content");
  const [showDrawer, setShowDrawer] = useState(false);
  const [catSearch, setCatSearch] = useState("");

  const PAGE_SIZE = 30;
  const [visibleLimit, setVisibleLimit] = useState(PAGE_SIZE);

  const gridRef = useRef(null);
  const catListRef = useRef(null);
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
      
      // Restore last category
      const savedCatId = localStorage.getItem("movie_focused_category_id");
      let startIdx = 0;
      if (savedCatId && data) {
        const idx = data.findIndex(c => String(c.category_id) === String(savedCatId));
        if (idx > -1) startIdx = idx;
      }
      
      setFocusedCategory(startIdx);
      if (data?.length) loadMovies(data[startIdx].category_id);
    } catch (error) { console.log(error); }
  }

  const loadMovies = useCallback(async (categoryId) => {
    try {
      const iptv = JSON.parse(localStorage.getItem("iptv"));
      const data = await getMovies(iptv.host, iptv.username, iptv.password, categoryId);
      setMovies(data || []);
      
      // Restore focus to last played movie if in this category
      const currentStreamId = localStorage.getItem("stream_id");
      if (currentStreamId && data) {
        const movieIdx = data.findIndex(m => String(m.stream_id) === String(currentStreamId));
        if (movieIdx > -1) {
          setFocusedMovie(movieIdx);
          // Ensure the restored item is actually rendered
          if (movieIdx >= visibleLimit) {
            setVisibleLimit(movieIdx + PAGE_SIZE);
          }
        }
        else setFocusedMovie(0);
      } else {
        setFocusedMovie(0);
      }
    } catch (error) { console.log(error); }
  }, [visibleLimit]);

  const filteredCategories = useMemo(() => {
    if (!catSearch) return categories;
    return categories.filter(c => 
      c.category_name.toLowerCase().includes(catSearch.toLowerCase())
    );
  }, [categories, catSearch]);

  useEffect(() => {
    function handleKeys(event) {
      const currentZone = focusManager.getZone();
      if (currentZone === "sidebar") return;

      switch (event.keyCode) {
        case KEYS.UP:
          if (zone === "drawer") {
             setFocusedCategory(prev => (prev > 0 ? prev - 1 : filteredCategories.length - 1));
          } else {
             if (focusedMovie >= COLS) setFocusedMovie(prev => prev - COLS);
          }
          break;

        case KEYS.DOWN:
          if (zone === "drawer") {
             setFocusedCategory(prev => (prev < filteredCategories.length - 1 ? prev + 1 : 0));
          } else {
             if (focusedMovie + COLS < movies.length) {
                const nextIdx = focusedMovie + COLS;
                setFocusedMovie(nextIdx);
                if (nextIdx >= visibleLimit - COLS) {
                   setVisibleLimit(prev => prev + PAGE_SIZE);
                }
             }
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
             const selectedCat = filteredCategories[focusedCategory];
             if (selectedCat) {
                const realIndex = categories.findIndex(c => c.category_id === selectedCat.category_id);
                setFocusedCategory(realIndex);
                loadMovies(selectedCat.category_id);
             }
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
             const selectedCat = filteredCategories[focusedCategory];
             if (selectedCat) {
                const realIndex = categories.findIndex(c => c.category_id === selectedCat.category_id);
                setFocusedCategory(realIndex);
                loadMovies(selectedCat.category_id);
             }
          } else {
             openMovie(movies[focusedMovie]);
          }
          break;

        case KEYS.BACK:
          if (showDrawer) {
             setShowDrawer(false);
             setZone("content");
          } else {
             navigateTo(navigationManager.back());
          }
          break;

        default:
          break;
      }
    }

    document.addEventListener("keydown", handleKeys);
    return () => document.removeEventListener("keydown", handleKeys);
  }, [zone, focusedCategory, focusedMovie, categories, filteredCategories, movies, showDrawer, visibleLimit, loadMovies]);

  useEffect(() => {
     if (zone === "content" && gridRef.current) {
        const item = gridRef.current.children[focusedMovie];
        if (item) item.scrollIntoView({ behavior: "smooth", block: "center" });
     }
  }, [focusedMovie, zone]);

  useEffect(() => {
    if (zone === "drawer" && catListRef.current) {
       const item = catListRef.current.children[focusedCategory];
       if (item) item.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [focusedCategory, zone]);

  function openMovie(movie) {
    if (!movie) return;
    localStorage.setItem("stream_id", movie.stream_id);
    localStorage.setItem("stream_name", movie.name);
    localStorage.setItem("stream_type", "movie");
    localStorage.setItem("stream_icon", movie.stream_icon);
    
    localStorage.setItem("movie_focused_category_id", categories[focusedCategory]?.category_id);
    
    navigationManager.push("/movies");
    navigateTo("/player");
  }

  return (
    <div className="app-container">
      <Sidebar active="MOVIES" />
      
      <div className={`category-drawer ${showDrawer ? "visible" : ""}`}>
         <h2 className="drawer-title">Movie Categories</h2>

         <div className="channel-search" style={{ marginBottom: "20px", width: "100%" }}>
            <span>FILTER CATEGORIES</span>
            <input 
              type="text" 
              placeholder="Search category..." 
              value={catSearch}
              onChange={e => {
                setCatSearch(e.target.value);
                setFocusedCategory(0);
              }}
              style={{ width: "100%", background: "rgba(255,255,255,0.1)", color: "#fff", padding: "10px", border: "none", borderRadius: "4px" }}
            />
         </div>

         <div className="drawer-list" ref={catListRef}>
            {filteredCategories.map((cat, index) => (
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
            {movies.slice(0, visibleLimit).map((movie, index) => (
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
