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

  useEffect(() => {
    function handleKeys(event) {
      if (focusManager.getZone() === "sidebar") return;

      switch (event.keyCode) {
        case KEYS.UP:
          if (zone === "categories") {
             if (focusedCategory > 0) {
                const next = focusedCategory - 1;
                setFocusedCategory(next);
                loadSeries(categories[next]?.category_id);
             }
          } else {
             if (focusedSeries >= COLS) setFocusedSeries(prev => prev - COLS);
          }
          break;

        case KEYS.DOWN:
          if (zone === "categories") {
             if (focusedCategory < categories.length - 1) {
                const next = focusedCategory + 1;
                setFocusedCategory(next);
                loadSeries(categories[next]?.category_id);
             }
          } else {
             if (focusedSeries + COLS < series.length) setFocusedSeries(prev => prev + COLS);
          }
          break;

        case KEYS.LEFT:
          if (zone === "series" && focusedSeries % COLS === 0) {
             setZone("categories");
             focusManager.setZone("categories");
          } else if (zone === "categories") {
             focusManager.setZone("sidebar");
          } else if (zone === "series") {
             setFocusedSeries(prev => prev - 1);
          }
          break;

        case KEYS.RIGHT:
          if (zone === "categories") {
             setZone("series");
             focusManager.setZone("content");
          } else {
             if (focusedSeries % COLS < COLS - 1 && focusedSeries < series.length - 1) {
                setFocusedSeries(prev => prev + 1);
             }
          }
          break;

        case KEYS.ENTER:
          if (zone === "series") openSeries(series[focusedSeries]);
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
  }, [zone, focusedCategory, focusedSeries, categories, series]);

  useEffect(() => {
     if (zone === "series" && gridRef.current) {
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
      <main className="app-main" style={{ display: "flex" }}>
         <aside className="app-sidebar expanded" style={{ width: "400px", borderRight: "1px solid #222" }}>
            <div className="sidebar-logo" style={{ paddingLeft: "20px" }}>SERIES</div>
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
               {categories[focusedCategory]?.category_name || "All Series"}
            </h1>
            <div className="content-grid" ref={gridRef} style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: "30px" }}>
               {series.map((item, index) => (
                 <div 
                   key={`${item.series_id}-${index}`}
                   className={`content-card ${focusedSeries === index && zone === "series" ? "focused" : ""}`}
                   style={{ height: "450px" }}
                 >
                    <img src={item.cover} alt="" className="card-img" />
                    <div className="card-info">
                       <div style={{ fontWeight: "700", fontSize: "22px" }}>{item.name}</div>
                    </div>
                 </div>
               ))}
            </div>
         </section>
      </main>
    </div>
  );
}
