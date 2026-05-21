import { useEffect, useMemo, useState } from "react";
import { navigateTo } from "../utils/navigation";
import { KEYS } from "../utils/tizenRemote";
import { getLiveCategories, getLiveStreams } from "../services/xtreamApi";
import { getFavorites, toggleFavorite } from "../utils/FavoritesManager";
import { saveRecentChannel } from "../utils/HistoryManager";
import focusManager from "../core/FocusManager";
import navigationManager from "../core/NavigationManager";
import "./LiveTVPage.css";

const FAVORITES_CATEGORY = {
  category_id: "__favorites",
  category_name: "Favorites"
};

const RECENT_CATEGORY = {
  category_id: "__recent",
  category_name: "Recent"
};

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function isEnter(event) {
  return event.keyCode === KEYS.ENTER || event.keyCode === 65385;
}

function normalizeChannel(item, sourceType) {
  return {
    ...item,
    stream_id: item.stream_id || item.id || item.stream_url,
    name: item.name || item.title || "Untitled Channel",
    category_id: item.category_id || item.category_name || "General",
    category_name: item.category_name || item.group || "General",
    stream_icon: item.stream_icon || item.logo || "",
    stream_url: item.stream_url || item.url || "",
    source_type: sourceType
  };
}

export default function LiveTVPage() {
  const [categories, setCategories] = useState([]);
  const [allChannels, setAllChannels] = useState([]);
  const [channels, setChannels] = useState([]);
  const [focusedCategory, setFocusedCategory] = useState(0);
  const [focusedChannel, setFocusedChannel] = useState(0);
  const [zone, setZone] = useState("categories");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const filteredChannels = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return channels;

    return channels.filter((channel) => (
      channel.name?.toLowerCase().includes(text)
      ||
      channel.category_name?.toLowerCase().includes(text)
    ));
  }, [channels, query]);

  useEffect(() => {
    focusManager.setZone("content");
    loadInitialData();
  }, []);

  useEffect(() => {
    if (zone === "categories") {
      scrollFocused("category", focusedCategory);
    }
  }, [focusedCategory, zone]);

  useEffect(() => {
    if (zone === "channels") {
      scrollFocused("channel", focusedChannel);
    }
  }, [focusedChannel, zone, filteredChannels]);

  useEffect(() => {
    function handleKeys(event) {
      const active = document.activeElement;
      const editing = active && active.tagName === "INPUT";

      if (editing) {
        if (event.keyCode === KEYS.BACK) {
          active.blur();
          event.preventDefault();
        }
        return;
      }

      if (zone === "categories") {
        handleCategoryKeys(event);
        return;
      }

      handleChannelKeys(event);
    }

    document.addEventListener("keydown", handleKeys);
    return () => document.removeEventListener("keydown", handleKeys);
  }, [zone, focusedCategory, focusedChannel, categories, filteredChannels]);

  function scrollFocused(type, index) {
    const el = document.querySelector(`[data-${type}-index="${index}"]`);
    if (!el) return;
    el.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: "smooth"
    });
  }

  async function loadInitialData() {
    setLoading(true);
    setError("");

    try {
      const iptv = readJson("iptv", null);

      if (!iptv) {
        navigateTo("/login");
        return;
      }

      if (iptv.type === "m3u") {
        const list = readJson("m3u_channels", []).map((item) => normalizeChannel(item, "m3u"));
        const grouped = buildM3uCategories(list);
        const cats = [FAVORITES_CATEGORY, RECENT_CATEGORY, ...grouped];
        setCategories(cats);
        await selectCategory(cats[0], { skipFocus: true });
        return;
      }

      const providerCategories = await getLiveCategories(
        iptv.host,
        iptv.username,
        iptv.password
      );

      const cats = [FAVORITES_CATEGORY, RECENT_CATEGORY, ...(providerCategories || [])];
      setCategories(cats);
      await selectCategory(cats[0], { skipFocus: true });
    } catch (err) {
      setError(err?.message || "Unable to load live TV.");
      setLoading(false);
    }
  }

  function buildM3uCategories(list) {
    const map = new Map();

    list.forEach((channel) => {
      const id = channel.category_name || "General";
      if (!map.has(id)) {
        map.set(id, {
          category_id: id,
          category_name: id
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => (
      a.category_name.localeCompare(b.category_name)
    ));
  }

  async function selectCategory(category, options = {}) {
    if (!category) return;

    setLoading(true);
    setError("");

    try {
      const iptv = readJson("iptv", null);
      let nextChannels = [];

      if (category.category_id === "__favorites") {
        nextChannels = getFavorites().map((item) => normalizeChannel(item, item.source_type || iptv?.type));
      } else if (category.category_id === "__recent") {
        nextChannels = readJson("recent_channels", []).map((item) => normalizeChannel(item, item.source_type || iptv?.type));
      } else if (iptv?.type === "m3u") {
        const source = allChannels.length
          ? allChannels
          : readJson("m3u_channels", []).map((item) => normalizeChannel(item, "m3u"));
        nextChannels = source.filter((channel) => String(channel.category_id) === String(category.category_id));
      } else {
        const data = await getLiveStreams(
          iptv.host,
          iptv.username,
          iptv.password,
          category.category_id
        );

        nextChannels = (data || []).map((item) => normalizeChannel(item, "xtream"));
      }

      setChannels(nextChannels);
      setAllChannels((prev) => prev.length ? prev : nextChannels);
      setFocusedChannel(0);
      setQuery("");

      if (!options.skipFocus) {
        setZone("channels");
      }
    } catch (err) {
      setError(err?.message || "Unable to load channels.");
    } finally {
      setLoading(false);
    }
  }

  function handleCategoryKeys(event) {
    switch (event.keyCode) {
      case KEYS.UP:
        event.preventDefault();
        if (focusedCategory > 0) setFocusedCategory((prev) => prev - 1);
        break;

      case KEYS.DOWN:
        event.preventDefault();
        if (focusedCategory < categories.length - 1) setFocusedCategory((prev) => prev + 1);
        break;

      case KEYS.RIGHT:
        event.preventDefault();
        setZone("channels");
        break;

      case KEYS.BACK:
        event.preventDefault();
        navigateTo(navigationManager.back());
        break;

      default:
        if (isEnter(event)) {
          event.preventDefault();
          selectCategory(categories[focusedCategory]);
        }
        break;
    }
  }

  function handleChannelKeys(event) {
    switch (event.keyCode) {
      case KEYS.UP:
        event.preventDefault();
        if (focusedChannel > 0) setFocusedChannel((prev) => prev - 1);
        break;

      case KEYS.DOWN:
        event.preventDefault();
        if (focusedChannel < filteredChannels.length - 1) setFocusedChannel((prev) => prev + 1);
        break;

      case KEYS.LEFT:
        event.preventDefault();
        setZone("categories");
        break;

      case KEYS.YELLOW:
        event.preventDefault();
        toggleCurrentFavorite();
        break;

      case KEYS.BACK:
        event.preventDefault();
        setZone("categories");
        break;

      default:
        if (isEnter(event)) {
          event.preventDefault();
          openChannel();
        }
        break;
    }
  }

  function toggleCurrentFavorite() {
    const channel = filteredChannels[focusedChannel];
    if (!channel) return;

    toggleFavorite(channel);
    setChannels((prev) => [...prev]);
  }

  function openChannel(channel = filteredChannels[focusedChannel]) {
    if (!channel) return;

    localStorage.setItem("stream_id", channel.stream_id);
    localStorage.setItem("stream_name", channel.name);
    localStorage.setItem("stream_icon", channel.stream_icon || "");
    localStorage.setItem("stream_type", "live");
    localStorage.setItem("stream_url", channel.stream_url || "");
    localStorage.setItem("active_channel", JSON.stringify(channel));

    saveRecentChannel(channel);
    navigationManager.push("/live");
    navigateTo("/player");
  }

  return (
    <main className="live-tv-page scale-in" style={{ display: "flex", width: "100%", height: "100vh", background: "transparent" }}>
      <aside className="sidebar glass-panel" style={{ width: "400px" }}>
        <div className="sidebar-logo">
          LIVE<span>TV</span>
        </div>

        <div className="category-list" style={{ flex: 1, overflowY: "auto" }}>
          {categories.map((item, index) => (
            <button
              type="button"
              key={`${item.category_id}-${index}`}
              data-category-index={index}
              className={
                zone === "categories" && focusedCategory === index
                  ? "sidebar-item active"
                  : "sidebar-item"
              }
              style={{ width: "calc(100% - 40px)" }}
              onFocus={() => {
                setFocusedCategory(index);
                setZone("categories");
              }}
              onClick={() => {
                setFocusedCategory(index);
                selectCategory(item);
              }}
            >
              <span>{item.category_name}</span>
            </button>
          ))}
        </div>
      </aside>

      <section className="live-channel-panel" style={{ flex: 1, padding: "60px", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(10px)" }}>
        <header style={{ marginBottom: "50px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 className="section-title">{categories[focusedCategory]?.category_name || "Channels"}</h1>
            <p className="section-subtitle">{filteredChannels.length} channels available</p>
          </div>

          <div className="search-box" style={{ width: "450px" }}>
            <input
              className="search-input"
              style={{ fontSize: "24px", padding: "20px 30px" }}
              value={query}
              placeholder="Search channel..."
              onChange={(event) => {
                setQuery(event.target.value);
                setFocusedChannel(0);
              }}
            />
          </div>
        </header>

        {error ? <div className="live-state error">{error}</div> : null}
        {loading ? <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}><div className="loader" /></div> : null}

        {!loading && !error && (
          <div className="channel-list" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
            {filteredChannels.map((channel, index) => {
              const favorite = getFavorites().some((item) => (
                String(item.stream_id) === String(channel.stream_id)
              ));

              return (
                <div
                  role="button"
                  tabIndex={0}
                  key={`${channel.stream_id}-${index}`}
                  data-channel-index={index}
                  className={
                    zone === "channels" && focusedChannel === index
                      ? "channel-row active"
                      : "channel-row"
                  }
                  style={{
                     display: "flex",
                     alignItems: "center",
                     padding: "25px",
                     background: zone === "channels" && focusedChannel === index ? "var(--primary)" : "rgba(255,255,255,0.05)",
                     borderRadius: "20px",
                     border: zone === "channels" && focusedChannel === index ? "3px solid #fff" : "3px solid transparent",
                     transition: "all 0.3s ease",
                     transform: zone === "channels" && focusedChannel === index ? "scale(1.03)" : "scale(1)",
                     boxShadow: zone === "channels" && focusedChannel === index ? "0 10px 30px var(--primary-glow)" : "none"
                  }}
                  onFocus={() => {
                    setFocusedChannel(index);
                    setZone("channels");
                  }}
                  onClick={() => openChannel(channel)}
                >
                  <div className="channel-logo" style={{ width: "80px", height: "80px", background: "#000", borderRadius: "15px", marginRight: "25px", flexShrink: 0 }}>
                    {channel.stream_icon ? <img src={channel.stream_icon} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <span style={{ fontSize: "24px", fontWeight: "bold" }}>TV</span>}
                  </div>

                  <div className="channel-main" style={{ flex: 1 }}>
                    <strong style={{ fontSize: "28px", display: "block", marginBottom: "5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{channel.name}</strong>
                    <span style={{ fontSize: "18px", opacity: 0.6 }}>{channel.category_name}</span>
                  </div>

                  {favorite && (
                    <div style={{ color: "#fff", fontSize: "30px", marginLeft: "20px" }}>❤️</div>
                  )}
                </div>
              );
            })}

            {!filteredChannels.length && !loading ? <div className="live-state">No channels found for "{query}"</div> : null}
          </div>
        )}
      </section>
    </main>
  );
}
