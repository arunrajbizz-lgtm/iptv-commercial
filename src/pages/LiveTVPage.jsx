import { useEffect, useMemo, useState } from "react";
import { navigateTo } from "../utils/navigation";
import { KEYS } from "../utils/tizenRemote";
import { getLiveCategories, getLiveStreams } from "../services/xtreamApi";
import { getFavorites, toggleFavorite } from "../utils/FavoritesManager";
import { saveRecentChannel } from "../utils/HistoryManager";
import focusManager from "../core/FocusManager";
import navigationManager from "../core/NavigationManager";
import "./LiveTVPage.css";

const ALL_CATEGORY = {
  category_id: "__all",
  category_name: "All Channels"
};

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
    scrollFocused("category", focusedCategory);
  }, [focusedCategory]);

  useEffect(() => {
    scrollFocused("channel", focusedChannel);
  }, [focusedChannel, filteredChannels]);

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

        setAllChannels(list);
        setCategories([ALL_CATEGORY, FAVORITES_CATEGORY, RECENT_CATEGORY, ...grouped]);
        setChannels([]);
        setLoading(false);
        return;
      }

      const providerCategories = await getLiveCategories(
        iptv.host,
        iptv.username,
        iptv.password
      );

      const cats = [
        ALL_CATEGORY,
        FAVORITES_CATEGORY,
        RECENT_CATEGORY,
        ...(providerCategories || [])
      ];

      setCategories(cats);
      setChannels([]);
      setLoading(false);
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

        nextChannels = category.category_id === "__all"
          ? source
          : source.filter((channel) => String(channel.category_id) === String(category.category_id));
      } else if (category.category_id === "__all") {
        const data = await getLiveStreams(
          iptv.host,
          iptv.username,
          iptv.password
        );

        nextChannels = (data || []).map((item) => normalizeChannel(item, "xtream"));
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
    localStorage.setItem("live_channels", JSON.stringify(filteredChannels));

    saveRecentChannel(channel);
    navigationManager.push("/live");
    navigateTo("/player");
  }

  return (
    <main className="live-tv-page">
      <aside className="live-category-panel">
        <div className="live-panel-title">
          <span>Live TV</span>
          <strong>{categories.length}</strong>
        </div>

        <div className="category-list">
          {categories.map((item, index) => (
            <button
              type="button"
              key={`${item.category_id}-${index}`}
              data-category-index={index}
              className={
                zone === "categories" && focusedCategory === index
                  ? "category-row active"
                  : "category-row"
              }
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

      <section className="live-channel-panel">
        <header className="live-header">
          <div>
            <h1>{categories[focusedCategory]?.category_name || "Channels"}</h1>
            <p>{filteredChannels.length} channels</p>
          </div>

          <label className="channel-search">
            <span>Search</span>
            <input
              value={query}
              placeholder="Channel name"
              onChange={(event) => {
                setQuery(event.target.value);
                setFocusedChannel(0);
              }}
            />
          </label>
        </header>

        {error ? <div className="live-state error">{error}</div> : null}
        {loading ? <div className="live-state">Loading...</div> : null}

        {!loading && !error && (
          <div className="channel-list">
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
                  onFocus={() => {
                    setFocusedChannel(index);
                    setZone("channels");
                  }}
                  onClick={() => openChannel(channel)}
                >
                  <div className="channel-logo">
                    {channel.stream_icon ? <img src={channel.stream_icon} alt="" /> : <span>TV</span>}
                  </div>

                  <div className="channel-main">
                    <strong>{channel.name}</strong>
                    <span>{channel.category_name}</span>
                  </div>

                  <button
                    type="button"
                    className={favorite ? "fav-btn active" : "fav-btn"}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleFavorite(channel);
                      setChannels((prev) => [...prev]);
                    }}
                    aria-label="Toggle favorite"
                  >
                    {favorite ? "Saved" : "Save"}
                  </button>
                </div>
              );
            })}

            {!filteredChannels.length ? <div className="live-state">No channels</div> : null}
          </div>
        )}
      </section>
    </main>
  );
}
