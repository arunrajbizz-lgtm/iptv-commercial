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

  const channelListRef = useRef(null);

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
      
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  }

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

  useEffect(() => {
    function handleKeys(event) {
      const currentZone = focusManager.getZone();
      if (currentZone === "sidebar") return;

      switch (event.keyCode) {
        case KEYS.UP:
          if (zone === "drawer") {
            if (focusedCategory > 0) setFocusedCategory(prev => prev - 1);
          } else {
            if (focusedChannel > 0) setFocusedChannel(prev => prev - 1);
          }
          break;

        case KEYS.DOWN:
          if (zone === "drawer") {
            if (focusedCategory < filteredCategories.length - 1) setFocusedCategory(prev => prev + 1);
          } else {
            if (focusedChannel < filteredChannels.length - 1) setFocusedChannel(prev => prev + 1);
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
            navigateTo("/dashboard");
          }
          break;

        default:
          break;
      }
    }

    document.addEventListener("keydown", handleKeys);
    return () => document.removeEventListener("keydown", handleKeys);
  }, [zone, focusedCategory, focusedChannel, categories, filteredCategories, filteredChannels, showDrawer]);

  useEffect(() => {
     if (zone === "content" && channelListRef.current) {
        const item = channelListRef.current.children[focusedChannel];
        if (item) item.scrollIntoView({ behavior: "smooth", block: "center" });
     }
  }, [focusedChannel, zone]);

  function openChannel(channel) {
    if (!channel) return;
    localStorage.setItem("stream_id", channel.stream_id);
    localStorage.setItem("stream_name", channel.name);
    localStorage.setItem("stream_type", "live");
    localStorage.setItem("stream_icon", channel.stream_icon);
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
           {categories[focusedCategory]?.category_name || "Live TV"}
        </h1>

        {loading ? <div className="netflix-loader" /> : (
             <div className="channel-list-v" ref={channelListRef}>
                {filteredChannels.map((channel, index) => (
                  <div 
                    key={`${channel.stream_id}-${index}`}
                    className={`channel-item ${focusedChannel === index && zone === "content" ? "focused" : ""}`}
                    onClick={() => openChannel(channel)}
                  >
                     <img src={channel.stream_icon} alt="" className="channel-icon" />
                     <div className="channel-name">{channel.name}</div>
                  </div>
                ))}
             </div>
        )}
      </main>
    </div>
  );
}
