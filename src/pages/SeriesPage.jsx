import { navigateTo } from "../utils/navigation";
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { getSeriesCategories, getSeries } from "../services/xtreamApi";
import Sidebar from "../components/Sidebar";
import focusManager from "../core/FocusManager";
import navigationManager from "../core/NavigationManager";
import { useFocus } from "../hooks/useFocus";

export default function SeriesPage() {
  const [categories, setCategories] = useState([]);
  const [series, setSeries] = useState([]);
  const [zone, setZone] = useState(focusManager.getZone());
  const [localZone, setLocalZone] = useState("content"); // 'drawer' or 'content'
  const [showDrawer, setShowDrawer] = useState(false);
  const [catSearch, setCatSearch] = useState("");
  const [focusedCategory, setFocusedCategory] = useState(0);

  const PAGE_SIZE = 30;
  const [visibleLimit, setVisibleLimit] = useState(PAGE_SIZE);

  const gridRef = useRef(null);
  const catListRef = useRef(null);
  const COLS = 6;

  useEffect(() => {
    return focusManager.subscribe(newZone => {
      setZone(newZone);
    });
  }, []);

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
      
      const savedCatId = localStorage.getItem("series_focused_category_id");
      let startIdx = 0;
      if (savedCatId && data) {
        const idx = data.findIndex(c => String(c.category_id) === String(savedCatId));
        if (idx > -1) startIdx = idx;
      }
      
      setFocusedCategory(startIdx);
      if (data?.length) loadSeries(data[startIdx].category_id);
    } catch (error) { console.log(error); }
  }

  const loadSeries = useCallback(async (categoryId) => {
    try {
      setVisibleLimit(PAGE_SIZE);
      const iptv = JSON.parse(localStorage.getItem("iptv"));
      const data = await getSeries(iptv.host, iptv.username, iptv.password, categoryId);
      setSeries(data || []);
    } catch (error) { console.log(error); }
  }, []);


  const filteredCategories = useMemo(() => {
    if (!catSearch) return categories;
    return categories.filter(c => 
      c.category_name.toLowerCase().includes(catSearch.toLowerCase())
    );
  }, [categories, catSearch]);

  const { focusIndex: catIdx, setFocusIndex: setCatIdx } = useFocus({
    containerRef: catListRef,
    columnCount: 1,
    itemCount: filteredCategories.length,
    isActive: zone === "content" && localZone === "drawer",
    onEnter: (index) => {
      const selectedCat = filteredCategories[index];
      if (selectedCat) {
        const realIndex = categories.findIndex(c => c.category_id === selectedCat.category_id);
        setFocusedCategory(realIndex);
        loadSeries(selectedCat.category_id);
      }
      setShowDrawer(false);
      setLocalZone("content");
    },
    onRightEdge: () => {
      setShowDrawer(false);
      setLocalZone("content");
    },
    onLeftEdge: () => {
      setShowDrawer(false);
      focusManager.setZone("sidebar");
    },
    onBack: () => {
      setShowDrawer(false);
      setLocalZone("content");
    },
    initialIndex: focusedCategory
  });

  const { focusIndex: seriesIdx } = useFocus({
    containerRef: gridRef,
    columnCount: COLS,
    itemCount: Math.min(series.length, visibleLimit),
    isActive: zone === "content" && localZone === "content",
    onEnter: (index) => openSeries(series[index]),
    onLeftEdge: () => {
      setShowDrawer(true);
      setLocalZone("drawer");
    },
    onBack: () => navigateTo(navigationManager.back()),
    onFocusChange: (index) => {
      if (index >= visibleLimit - COLS) {
        setVisibleLimit(prev => prev + PAGE_SIZE);
      }
    }
  });

  function openSeries(item) {
    if (!item) return;
    localStorage.setItem("series_focused_category_id", categories[focusedCategory]?.category_id);
    localStorage.setItem("selected_series", JSON.stringify(item));
    
    navigationManager.push("/series");
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
                setCatIdx(0);
              }}
              style={{ width: "100%", background: "rgba(255,255,255,0.1)", color: "#fff", padding: "10px", border: "none", borderRadius: "4px" }}
            />
         </div>

         <div className="drawer-list" ref={catListRef}>
            {filteredCategories.map((cat, index) => (
              <div 
                key={cat.category_id}
                data-focusable="true"
                className={`drawer-item ${catIdx === index && localZone === "drawer" ? "focused" : ""} ${categories[focusedCategory]?.category_id === cat.category_id ? "active" : ""}`}
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
            {series.slice(0, visibleLimit).map((item, index) => (
              <div 
                key={`${item.series_id}-${index}`}
                data-focusable="true"
                className={`content-card portrait-card ${seriesIdx === index && localZone === "content" ? "focused" : ""}`}
                onClick={() => openSeries(item)}
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
