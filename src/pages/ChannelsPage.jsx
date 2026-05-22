import { navigateTo } from "../utils/navigation";
import { useEffect, useState, useRef } from "react";
import { getLiveStreams } from "../services/xtreamApi";
import { KEYS } from "../utils/tizenRemote";
import SearchModal from "../components/SearchModal";
import { addFavorite, removeFavorite, isFavorite } from "../utils/favorites";
import Sidebar from "../components/Sidebar";
import focusManager from "../core/FocusManager";
import navigationManager from "../core/NavigationManager";

export default function ChannelsPage() {
  const [channels, setChannels] = useState([]);
  const [focusedChannel, setFocusedChannel] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const PAGE_SIZE = 40;
  const [visibleLimit, setVisibleLimit] = useState(PAGE_SIZE);
  const listRef = useRef(null);

  useEffect(() => {
    const saved = focusManager.getChannel() || 0;
    setFocusedChannel(saved);
    focusManager.setZone("content");
  }, []);

  useEffect(() => {
    async function loadChannels() {
      try {
        const saved = JSON.parse(localStorage.getItem("iptv"));
        const categoryId = localStorage.getItem("category_id");
        const data = await getLiveStreams(saved.host, saved.username, saved.password, categoryId);
        setChannels(Array.isArray(data) ? data : []);
      } catch (error) {
        console.log(error);
        setChannels([]);
      }
      setLoading(false);
    }
    loadChannels();
  }, []);

  useEffect(() => {
    if (listRef.current) {
      const item = listRef.current.children[focusedChannel];
      if (item) item.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [focusedChannel]);

  useEffect(() => {
    function handleKeys(event) {
      if (event.keyCode === KEYS.GREEN) {
        focusManager.setZone("modal");
        setSearchOpen(true);
        return;
      }

      if (searchOpen) return;

      switch (event.keyCode) {
        case KEYS.LEFT:
          if (focusManager.getZone() === "content") {
            focusManager.setZone("categories");
            return;
          }
          if (focusManager.getZone() === "categories") {
            focusManager.setZone("sidebar");
            return;
          }
          if (focusedChannel > 0) {
            const newIndex = focusedChannel - 1;
            setFocusedChannel(newIndex);
            focusManager.setChannel(newIndex);
          }
          break;

        case KEYS.RIGHT:
          if (focusManager.getZone() === "sidebar") {
            focusManager.setZone("categories");
            return;
          }
          if (focusManager.getZone() === "categories") {
            focusManager.setZone("content");
            return;
          }
          if (focusedChannel < channels.length - 1) {
            const newIndex = focusedChannel + 1;
            setFocusedChannel(newIndex);
            if (newIndex >= visibleLimit - 4) {
              setVisibleLimit(prev => prev + PAGE_SIZE);
            }
            focusManager.setChannel(newIndex);
          }
          break;

        case KEYS.UP:
          if (focusedChannel - 4 >= 0) {
            const newIndex = focusedChannel - 4;
            setFocusedChannel(newIndex);
            focusManager.setChannel(newIndex);
          }
          break;

        case KEYS.DOWN:
          if (focusedChannel + 4 < channels.length) {
            const newIndex = focusedChannel + 4;
            setFocusedChannel(newIndex);
            if (newIndex >= visibleLimit - 4) {
              setVisibleLimit(prev => prev + PAGE_SIZE);
            }
            focusManager.setChannel(newIndex);
          }
          break;

        case KEYS.RED:
          if (!channels[focusedChannel]) return;
          const current = channels[focusedChannel];
          if (isFavorite(current.stream_id)) removeFavorite(current.stream_id);
          else addFavorite(current);
          break;

        case KEYS.ENTER:
          if (!channels[focusedChannel]) return;
          localStorage.setItem("stream_id", channels[focusedChannel].stream_id);
          localStorage.setItem("stream_name", channels[focusedChannel].name);
          localStorage.setItem("stream_type", "live");
          navigationManager.push("/channels");
          navigateTo("/player");
          break;

        case KEYS.BACK:
          navigateTo("/dashboard");
          break;
      }
    }
    document.addEventListener("keydown", handleKeys);
    return () => document.removeEventListener("keydown", handleKeys);
  }, [focusedChannel, channels, searchOpen, visibleLimit]);

  if (loading) {
    return (
      <div style={{ width: "100%", height: "100vh", background: "#111", color: "white", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "35px" }}>
        Loading Channels...</div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar active="LIVE" />
      <main className="app-main browse-container" style={{ background: "#111" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <h1 className="hero-title" style={{ fontSize: "40px", margin: 0 }}>LIVE CHANNELS</h1>
          <div style={{ display: "flex", gap: "30px", fontSize: "20px", color: "var(--primary)", fontWeight: "bold" }}>
             <span>GREEN: SEARCH</span>
             <span>RED: FAVORITE</span>
          </div>
        </div>

        <div 
          ref={listRef}
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}
        >
          {channels.slice(0, visibleLimit).map((channel, index) => (
            <div 
              key={`${channel.stream_id}-${index}`} 
              className={`channel-item ${focusedChannel === index ? "focused" : ""}`}
              style={{ padding: "20px", flexDirection: "column", height: "auto" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: "15px" }}>
                <div style={{ fontSize: "20px", fontWeight: "bold" }}>{channel.name}</div>
                {isFavorite(channel.stream_id) && <div style={{ color: "yellow" }}>★</div>}
              </div>
              {channel.stream_icon && (
                <img src={channel.stream_icon} alt="" style={{ width: "100%", height: "180px", objectFit: "contain", background: "#000", borderRadius: "10px" }} />
              )}
            </div>
          ))}
        </div>

        <SearchModal
          visible={searchOpen}
          items={channels}
          onClose={() => {
            setSearchOpen(false);
            focusManager.setZone("content");
          }}
          onSelect={(item) => {
            localStorage.setItem("stream_id", item.stream_id);
            localStorage.setItem("stream_name", item.name);
            localStorage.setItem("stream_type", "live");
            navigationManager.push("/channels");
            navigateTo("/player");
          }}
        />
      </main>
    </div>
  );
}