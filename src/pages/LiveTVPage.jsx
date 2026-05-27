import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { navigateTo } from "../utils/navigation";
import { getLiveCategories, getLiveStreams, getEPG } from "../services/xtreamApi";
import Sidebar from "../components/Sidebar";
import focusManager from "../core/FocusManager";
import navigationManager from "../core/NavigationManager";
import { useFocus } from "../hooks/useFocus";
import { isFavorite } from "../utils/favorites";

export default function LiveTVPage() {
  const [categories, setCategories] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zone, setZone] = useState(focusManager.getZone());
  const [localZone, setLocalZone] = useState("content"); // 'categories' or 'content'
  const [focusedCategory, setFocusedCategory] = useState(0);
  const [catSearch, setCatSearch] = useState("");
  const [nowPlaying, setNowPlaying] = useState(null);
  const epgTimerRef = useRef(null);

  const PAGE_SIZE = 50;
  const [visibleLimit, setVisibleLimit] = useState(PAGE_SIZE);

  const channelListRef = useRef(null);
  const catListRef = useRef(null);

  useEffect(() => {
    return focusManager.subscribe(newZone => {
      setZone(newZone);
    });
  }, []);

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

  const filteredCategories = useMemo(() => {
    if (!catSearch) return categories;
    return categories.filter(c => 
      c.category_name.toLowerCase().includes(catSearch.toLowerCase())
    );
  }, [categories, catSearch]);

  const filteredChannels = useMemo(() => {
    const cat = filteredCategories[focusedCategory];
    if (!cat || cat.category_id === "all") return channels;
    return channels.filter(c => String(c.category_id) === String(cat.category_id));
  }, [channels, filteredCategories, focusedCategory]);

  const { focusIndex: catIdx, setFocusIndex: setCatIdx } = useFocus({
    containerRef: catListRef,
    columnCount: 1,
    itemCount: filteredCategories.length,
    isActive: zone === "content" && localZone === "categories",
    onEnter: (index) => {
      setFocusedCategory(index);
      setLocalZone("content");
    },
    onRightEdge: () => setLocalZone("content"),
    onLeftEdge: () => focusManager.setZone("sidebar"),
    onBack: () => navigateTo(navigationManager.back()),
    initialIndex: focusedCategory
  });

  const { focusIndex: channelIdx } = useFocus({
    containerRef: channelListRef,
    columnCount: 1,
    itemCount: Math.min(filteredChannels.length, visibleLimit),
    isActive: zone === "content" && localZone === "content",
    onEnter: (index) => openChannel(filteredChannels[index]),
    onLeftEdge: () => setLocalZone("categories"),
    onBack: () => setLocalZone("categories"),
    onFocusChange: (index) => {
      if (index >= visibleLimit - 10) {
        setVisibleLimit(prev => prev + PAGE_SIZE);
      }
      fetchEPG(filteredChannels[index]);
    }
  });

  const fetchEPG = useCallback(async (channel) => {
    if (epgTimerRef.current) clearTimeout(epgTimerRef.current);
    if (!channel) return;

    epgTimerRef.current = setTimeout(async () => {
      try {
        const iptv = JSON.parse(localStorage.getItem("iptv"));
        const data = await getEPG(iptv.host, iptv.username, iptv.password, channel.stream_id);
        const epg = data.epg_listings?.[0] || null;
        setNowPlaying(epg);
      } catch (e) {
        setNowPlaying(null);
      }
    }, 800);
  }, []);

  function openChannel(channel) {
    if (!channel) return;
    localStorage.setItem("stream_id", channel.stream_id);
    localStorage.setItem("stream_name", channel.name);
    localStorage.setItem("stream_type", "live");
    localStorage.setItem("stream_icon", channel.stream_icon);
    localStorage.setItem("live_focused_category_id", filteredCategories[focusedCategory]?.category_id);
    
    navigationManager.push("/live");
    navigateTo("/player");
  }

  return (
    <div className="app-container">
      <Sidebar active="LIVE" />

      <main className="app-main live-tv-page">
        {/* CATEGORY PANEL */}
        <aside className="live-category-panel">
          <div className="live-panel-title">
            <span>Live TV</span>
            <strong>{filteredCategories.length}</strong>
          </div>
          
          <div className="channel-search" style={{ marginBottom: "20px" }}>
            <span>SEARCH CATEGORY</span>
            <input 
              type="text" 
              placeholder="Search..." 
              value={catSearch}
              onChange={e => {
                setCatSearch(e.target.value);
                setCatIdx(0);
              }}
            />
          </div>

          <div className="category-list" ref={catListRef}>
            {filteredCategories.map((cat, index) => (
              <div 
                key={cat.category_id}
                data-focusable="true"
                className={`category-row ${catIdx === index && localZone === "categories" ? "active" : ""} ${focusedCategory === index ? "selected" : ""}`}
              >
                <span>{cat.category_name}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* CHANNEL PANEL */}
        <section className="live-channel-panel">
          <header className="live-header">
            <div className="channel-main">
              <h1>{filteredCategories[focusedCategory]?.category_name || "Channels"}</h1>
              {nowPlaying ? (
                <p className="now-playing-info">
                  <span className="live-indicator">● LIVE</span>
                  {nowPlaying.title}
                </p>
              ) : (
                <p>{filteredChannels.length} Channels Available</p>
              )}
            </div>
          </header>

          <div className="channel-list" ref={channelListRef}>
            {filteredChannels.slice(0, visibleLimit).map((channel, index) => (
              <div 
                key={`${channel.stream_id}-${index}`}
                data-focusable="true"
                className={`channel-row ${channelIdx === index && localZone === "content" ? "active" : ""}`}
                onClick={() => openChannel(channel)}
              >
                <div className="channel-logo">
                  {channel.stream_icon ? <img src={channel.stream_icon} alt="" /> : channel.name[0]}
                </div>
                <div className="channel-main">
                  <strong>{channel.name}</strong>
                  <span>Channel {channel.num || index + 1}</span>
                </div>
                {isFavorite(channel.stream_id) && <div className="fav-indicator">❤️</div>}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
