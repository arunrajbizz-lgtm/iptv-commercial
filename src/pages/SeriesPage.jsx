import { navigateTo } from "../utils/navigation";
import { useEffect, useState, useRef } from "react";
import { KEYS } from "../utils/tizenRemote";
import { getSeriesCategories, getSeries } from "../services/xtreamApi";
import Sidebar from "../components/Sidebar";
import focusManager from "../core/FocusManager";

export default function SeriesPage() {
  const [categories, setCategories] = useState([]);
  const [series, setSeries] = useState([]);
  const [focusedCategory, setFocusedCategory] = useState(0);
  const [focusedSeries, setFocusedSeries] = useState(0);
  const [zone, setZone] = useState("content");
  const [showDrawer, setShowDrawer] = useState(false);
  const [catSearch, setCatSearch] = useState("");
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
      const data = await getSeriesCategories(iptv.host, iptv.username, iptv.password);
      setCategories(data || []);
      if (data?.length) loadSeries(data[0].category_id);
    } catch (error) { console.log(error); }
  }

  async function loadSeries(categoryId) {
    try {
      const iptv = JSON.parse(localStorage.getItem("iptv"));
      const data = await getSeries(iptv.host, iptv.username, iptv.password, categoryId);
      setSeries(data || []);
      setFocusedSeries(0);
    } catch (error) { console.log(error); }
  }

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
             if (focusedCategory > 0) setFocusedCategory(prev => prev - 1);
          } else {
             if (focusedSeries >= COLS) setFocusedSeries(prev => prev - COLS);
          }
          break;

        case KEYS.DOWN:
          if (zone === "drawer") {
             if (focusedCategory < filteredCategories.length - 1) setFocusedCategory(prev => prev + 1);
          } else {
             if (focusedSeries + COLS < series.length) setFocusedSeries(prev => prev + COLS);
          }
          break;

        case KEYS.LEFT:
          if (zone === "content") {
             if (focusedSeries % COLS === 0) {
                setShowDrawer(true);
                setZone("drawer");
             } else {
                setFocusedSeries(prev => prev - 1);
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
                loadSeries(selectedCat.category_id);
             }
          } else {
             if (focusedSeries % COLS < COLS - 1 && focusedSeries < series.length - 1) {
                setFocusedSeries(prev => prev + 1);
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
                loadSeries(selectedCat.category_id);
             }
          } else {
             openSeries(series[focusedSeries]);
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
  }, [zone, focusedCategory, focusedSeries, categories, filteredCategories, series, showDrawer]);

  useEffect(() => {
     if (zone === "content" && gridRef.current) {
        const item = gridRef.current.children[focusedSeries];
        if (item) item.scrollIntoView({ behavior: "smooth", block: "center" });
     }
  }, [focusedSeries, zone]);

  function openSeries(item) {
    if (!item) return;
    localStorage.setItem("selected_series", JSON.stringify(item));
    navigateTo("/series-info");
  }

  return (
    <div className="app-container">
      <Sidebar active="SERIES" />
      
      <div className={`category-drawer ${showDrawer ? "visible" : ""}`}>
         <h2 className="drawer-title">Series Categories</h2>

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

         <div className="drawer-list">
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
            {categories[focusedCategory]?.category_name || "Series"}
         </h1>

         <div className="content-grid" ref={gridRef}>
            {series.map((item, index) => (
              <div 
                key={`${item.series_id}-${index}`}
                className={`content-card portrait-card ${focusedSeries === index && zone === "content" ? "focused" : ""}`}
              >
                 <img src={item.cover} alt="" className="card-img" />
                 <div className="card-info">
                    <div style={{ fontWeight: "700", fontSize: "22px" }}>{item.name}</div>
                 </div>
              </div>
            ))}
         </div>
      </main>
    </div>
  );
}
