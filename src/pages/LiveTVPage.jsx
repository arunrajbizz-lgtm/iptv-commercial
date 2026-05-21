import { useEffect, useMemo, useState, useRef } from "react";
import { navigateTo } from "../utils/navigation";
import { KEYS } from "../utils/tizenRemote";
import { getLiveCategories, getLiveStreams } from "../services/xtreamApi";
import Sidebar from "../components/Sidebar";
import focusManager from "../core/FocusManager";
import navigationManager from "../core/NavigationManager";
import { getFavorites, toggleFavorite } from "../utils/favorites";

export default function LiveTVPage() {
  const [categories, setCategories] = useState([]);
  const [channels, setChannels] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [focusedCategory, setFocusedCategory] = useState(0);
  const [focusedChannel, setFocusedChannel] = useState(0);
  const [zone, setZone] = useState("categories");

  const channelListRef = useRef(null);

  useEffect(() => {
    focusManager.setZone("categories");
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const iptv = JSON.parse(localStorage.getItem("iptv"));
      if (!iptv) throw new Error("No login info found");

      const cats = await getLiveCategories(iptv.host, iptv.username, iptv.password);
      setCategories(cats || []);

      const streams = await getLiveStreams(iptv.host, iptv.username, iptv.password);
      setChannels(streams || []);
      localStorage.setItem("live_channels", JSON.stringify(streams || []));
      
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  const filteredChannels = useMemo(() => {
    const cat = categories[focusedCategory];
    let list = channels;
    if (cat && cat.category_id !== "all") {
       list = channels.filter(c => String(c.category_id) === String(cat.category_id));
    }
    if (query) {
      list = list.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));
    }
    return list;
  }, [channels, categories, focusedCategory, query]);

  useEffect(() => {
    function handleKeys(event) {
      const z = focusManager.getZone();

      if (z === "sidebar") {
         if (event.keyCode === KEYS.RIGHT) {
            focusManager.setZone("categories");
            setZone("categories");
         }
         return;
      }

      switch (event.keyCode) {
        case KEYS.UP:
          if (zone === "categories") {
            if (focusedCategory > 0) setFocusedCategory(prev => prev - 1);
          } else {
            if (focusedChannel > 0) setFocusedChannel(prev => prev - 1);
          }
          break;

        case KEYS.DOWN:
          if (zone === "categories") {
            if (focusedCategory < categories.length - 1) setFocusedCategory(prev => prev + 1);
          } else {
            if (focusedChannel < filteredChannels.length - 1) setFocusedChannel(prev => prev + 1);
          }
          break;

        case KEYS.LEFT:
          if (zone === "channels") {
            setZone("categories");
            focusManager.setZone("categories");
          } else {
            focusManager.setZone("sidebar");
          }
          break;

        case KEYS.RIGHT:
          if (zone === "categories") {
            setZone("channels");
            focusManager.setZone("content");
          }
          break;

        case KEYS.ENTER:
          if (zone === "channels") {
             openChannel(filteredChannels[focusedChannel]);
          }
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
  }, [zone, focusedCategory, focusedChannel, categories, filteredChannels]);

  useEffect(() => {
     if (zone === "channels" && channelListRef.current) {
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

      <main className="app-main" style={{ display: "flex" }}>
        {/* CATEGORIES */}
        <aside className="app-sidebar expanded" style={{ width: "400px", borderRight: "1px solid #222" }}>
           <div className="sidebar-logo" style={{ paddingLeft: "20px" }}>CATEGORIES</div>
           <div className="sidebar-nav" style={{ overflowY: "auto", flex: 1 }}>
              {categories.map((cat, index) => (
                <div 
                  key={cat.category_id}
                  className={`nav-item ${focusedCategory === index && focusManager.getZone() === "categories" ? "focused" : ""}`}
                  style={{ paddingLeft: "40px" }}
                >
                   {cat.category_name}
                </div>
              ))}
           </div>
        </aside>

        {/* CHANNELS GRID */}
        <section style={{ flex: 1, padding: "60px", overflowY: "auto" }}>
           <h1 className="hero-title" style={{ fontSize: "60px", marginBottom: "40px" }}>
              {categories[focusedCategory]?.category_name || "Live TV"}
           </h1>

           {loading ? <div className="netflix-loader" /> : (
             <div className="channel-list-v" ref={channelListRef} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {filteredChannels.map((channel, index) => (
                  <div 
                    key={`${channel.stream_id}-${index}`}
                    className={`nav-item ${focusedChannel === index && zone === "channels" ? "focused" : ""}`}
                    style={{ 
                      height: "100px", 
                      background: focusedChannel === index && zone === "channels" ? "var(--primary)" : "rgba(255,255,255,0.05)",
                      display: "flex",
                      alignItems: "center",
                      padding: "0 30px"
                    }}
                  >
                     <img src={channel.stream_icon} alt="" style={{ width: "80px", height: "60px", objectFit: "contain", marginRight: "30px", background: "#000", borderRadius: "8px" }} />
                     <div style={{ fontSize: "28px", fontWeight: "700" }}>{channel.name}</div>
                  </div>
                ))}
             </div>
           )}
        </section>
      </main>
    </div>
  );
}
