import { useEffect, useMemo, useState, useRef } from "react";
import { navigateTo } from "../utils/navigation";
import { KEYS } from "../utils/tizenRemote";
import { getLiveCategories, getLiveStreams } from "../services/xtreamApi";
import Sidebar from "../components/Sidebar";
import focusManager from "../core/FocusManager";
import navigationManager from "../core/NavigationManager";

export default function LiveTVPage() {
  const [categories, setCategories] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [focusedCategory, setFocusedCategory] = useState(0);
  const [focusedChannel, setFocusedChannel] = useState(0);
  const [zone, setZone] = useState("content");
  const [showDrawer, setShowDrawer] = useState(false);
  const [catSearch, setCatSearch] = useState("");
  
  const PAGE_SIZE = 30;
  const [visibleLimit, setVisibleLimit] = useState(PAGE_SIZE);

  const channelListRef = useRef(null);
  const catListRef = useRef(null);

  useEffect(() => {
    focusManager.setZone("content");
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const iptv = JSON.parse(localStorage.getItem("iptv"));
      if (!iptv) return;

      const cats = await getLiveCategories(iptv.host, iptv.username, iptv.password);
      setCategories(cats || []);

      const streams = await getLiveStreams(iptv.host, iptv.username, iptv.password);
      setChannels(streams || []);
      localStorage.setItem("live_channels", JSON.stringify(streams || []));
      
      // Restore last selected category
      const savedCatId = localStorage.getItem("live_focused_category_id");
      if (savedCatId && cats) {
        const catIndex = cats.findIndex(c => String(c.category_id) === String(savedCatId));
        if (catIndex > -1) setFocusedCategory(catIndex);
      }
      
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  }

  // Reset visible limit when category changes to start from "page 1"
  useEffect(() => {
    setVisibleLimit(PAGE_SIZE);
  }, [focusedCategory]);

  const filteredCategories = useMemo(() => {
    if (!catSearch) return categories;
    return categories.filter(c => 
      c.category_name.toLowerCase().includes(catSearch.toLowerCase())
    );
  }, [categories, catSearch]);

  const filteredChannels = useMemo(() => {
    const cat = categories[focusedCategory];
    if (!cat || cat.category_id === "all") return channels;
    return channels.filter(c => String(c.category_id) === String(cat.category_id));
  }, [channels, categories, focusedCategory]);

  // Restore channel focus when returning from player or switching categories
  useEffect(() => {
    const currentStreamId = localStorage.getItem("stream_id");
    if (currentStreamId && filteredChannels.length > 0) {
      const chanIndex = filteredChannels.findIndex(c => String(c.stream_id) === String(currentStreamId));
      if (chanIndex > -1) {
        setFocusedChannel(chanIndex);
      }
    }
  }, [filteredChannels]);

  const [viewMode, setViewMode] = useState("icon"); // 'icon' or 'text'

  useEffect(() => {
    function handleKeys(event) {
      const currentZone = focusManager.getZone();
      if (currentZone === "sidebar") return;

      switch (event.keyCode) {
        case KEYS.BLUE:
          setViewMode(prev => (prev === "icon" ? "text" : "icon"));
          break;
        
        case KEYS.UP:
          if (zone === "drawer") {
            setFocusedCategory(prev => (prev > 0 ? prev - 1 : filteredCategories.length - 1));
          } else {
            if (focusedChannel > 0) {
              const nextIdx = focusedChannel - 1;
              setFocusedChannel(nextIdx);
              // Optional: You could reduce visibleLimit here too if memory is tight, 
              // but usually keeping it expanded is fine.
            }
          }
          break;

        case KEYS.DOWN:
          if (zone === "drawer") {
            setFocusedCategory(prev => (prev < filteredCategories.length - 1 ? prev + 1 : 0));
          } else {
            if (focusedChannel < filteredChannels.length - 1) {
              const nextIdx = focusedChannel + 1;
              setFocusedChannel(nextIdx);
              if (nextIdx >= visibleLimit - 5) {
                setVisibleLimit(prev => prev + PAGE_SIZE);
              }
            }
          }
          break;

        case KEYS.LEFT:
          if (zone === "content") {
            setShowDrawer(true);
            setZone("drawer");
          } else {
            setShowDrawer(false);
            focusManager.setZone("sidebar");
          }
          break;

        case KEYS.RIGHT:
          if (zone === "drawer") {
            setShowDrawer(false);
            setZone("content");
          }
          break;

        case KEYS.ENTER:
          if (zone === "drawer") {
             const selectedCat = filteredCategories[focusedCategory];
             if (selectedCat) {
                const realIndex = categories.findIndex(c => c.category_id === selectedCat.category_id);
                setFocusedCategory(realIndex);
             }
             setShowDrawer(false);
             setZone("content");
             setFocusedChannel(0);
          } else {
             openChannel(filteredChannels[focusedChannel]);
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
  }, [zone, focusedCategory, focusedChannel, categories, filteredCategories, filteredChannels, showDrawer, visibleLimit]);

  useEffect(() => {
     if (zone === "content" && channelListRef.current) {
        const item = channelListRef.current.children[focusedChannel];
        if (item) item.scrollIntoView({ behavior: "smooth", block: "center" });
     }
  }, [focusedChannel, zone]);

  useEffect(() => {
    if (zone === "drawer" && catListRef.current) {
       const item = catListRef.current.children[focusedCategory];
       if (item) item.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [focusedCategory, zone]);

  function openChannel(channel) {
    if (!channel) return;
    localStorage.setItem("stream_id", channel.stream_id);
    localStorage.setItem("stream_name", channel.name);
    localStorage.setItem("stream_type", "live");
    localStorage.setItem("stream_icon", channel.stream_icon);
    
    // Persist current category so it can be restored on back
    localStorage.setItem("live_focused_category_id", categories[focusedCategory]?.category_id);
    
    navigationManager.push("/live");
    navigateTo("/player");
  }

  return (
    <div className="app-container">
      <Sidebar active="LIVE" />

      <div className={`category-drawer ${showDrawer ? "visible" : ""}`}>
         <h2 className="drawer-title">Live Categories</h2>
         
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
           <h1 className="hero-title" style={{ fontSize: "60px", margin: 0 }}>
              {categories[focusedCategory]?.category_name || "Live TV"}
           </h1>
           <div style={{ background: "var(--blue)", padding: "10px 20px", borderRadius: "4px", fontWeight: "bold", fontSize: "18px" }}>
              BLUE: {viewMode === "icon" ? "TEXT MODE" : "ICON MODE"}
           </div>
        </div>

        {loading ? <div className="netflix-loader" /> : (
             <div className="channel-list-v" ref={channelListRef}>
                {filteredChannels.slice(0, visibleLimit).map((channel, index) => (
                  <div 
                    key={`${channel.stream_id}-${index}`}
                    className={`channel-item ${focusedChannel === index && zone === "content" ? "focused" : ""}`}
                    onClick={() => openChannel(channel)}
                    style={{ height: viewMode === "text" ? "70px" : "110px" }}
                  >
                     {viewMode === "icon" && <img src={channel.stream_icon} alt="" className="channel-icon" />}
                     <div className="channel-name" style={{ fontSize: viewMode === "text" ? "32px" : "26px" }}>
                        {channel.name}
                     </div>
                  </div>
                ))}
             </div>
        )}
      </main>
    </div>
  );
}
