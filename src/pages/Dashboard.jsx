import { useEffect, useState } from "react";
import { navigateTo } from "../utils/navigation";
import { KEYS } from "../utils/tizenRemote";
import focusManager from "../core/FocusManager";
import ContinueWatching from "../components/ContinueWatching";
import RecentChannels from "../components/RecentChannels";
import RecommendedRow from "../components/RecommendedRow";
import VoiceSearchOverlay from "../components/VoiceSearchOverlay";
import "./Dashboard.css";

const MENU = [
  { name: "HOME", path: "/dashboard" },
  { name: "LIVE TV", path: "/live" },
  { name: "MOVIES", path: "/movies" },
  { name: "SERIES", path: "/series" },
  { name: "SEARCH", path: "/search" },
  { name: "FAVORITES", path: "/favorites" },
  { name: "SETTINGS", path: "/settings" }
];

export default function Dashboard() {
  const [menuIndex, setMenuIndex] = useState(0);
  const [sidebarFocused, setSidebarFocused] = useState(true);
  const [showVoice, setShowVoice] = useState(false);

  useEffect(() => {
    focusManager.setZone("sidebar");
  }, []);

  useEffect(() => {
    function handleKeys(event) {
      const zone = focusManager.getZone();

      if (zone === "sidebar") {
        switch (event.keyCode) {
          case KEYS.UP:
            if (menuIndex > 0) setMenuIndex((prev) => prev - 1);
            break;

          case KEYS.DOWN:
            if (menuIndex < MENU.length - 1) setMenuIndex((prev) => prev + 1);
            break;

          case KEYS.RIGHT:
            focusManager.setZone("content");
            setSidebarFocused(false);
            break;

          case KEYS.ENTER:
            openMenu();
            break;

          case KEYS.BLUE:
            openVoiceSearch();
            break;

          default:
            break;
        }
      } else {
        switch (event.keyCode) {
          case KEYS.LEFT:
            focusManager.setZone("sidebar");
            setSidebarFocused(true);
            break;

          case KEYS.BLUE:
            openVoiceSearch();
            break;

          default:
            break;
        }
      }
    }

    document.addEventListener("keydown", handleKeys);
    return () => document.removeEventListener("keydown", handleKeys);
  }, [menuIndex, sidebarFocused]);

  function openMenu() {
    const item = MENU[menuIndex];
    if (item) navigateTo(item.path);
  }

  function openVoiceSearch() {
    setShowVoice(true);
    focusManager.setZone("modal");
  }

  function handleVoiceResult(text) {
    localStorage.setItem("voice_search", text);
    navigateTo("/search");
  }

  return (
    <div className="dashboard-page">
      <aside className="dashboard-sidebar">
        <div className="dashboard-logo">
          <span />
          StreamDeck
        </div>

        <nav className="dashboard-menu" aria-label="Main navigation">
          {MENU.map((item, index) => (
            <button
              type="button"
              key={item.name}
              className={
                sidebarFocused && menuIndex === index
                  ? "dashboard-menu-item active"
                  : "dashboard-menu-item"
              }
              onClick={() => {
                setMenuIndex(index);
                navigateTo(item.path);
              }}
            >
              {item.name}
            </button>
          ))}
        </nav>
      </aside>

      <main className="dashboard-content">
        <section className="dashboard-hero">
          <div>
            <p className="dashboard-eyebrow">IPTV command center</p>
            <h1>Welcome back</h1>
            <p>
              Pick up live channels, resume watching, and browse your provider
              library from a screen built for TV, desktop, and mobile.
            </p>
          </div>

          <div className="dashboard-stats" aria-label="Platform highlights">
            <div><strong>Live</strong><span>Channels</span></div>
            <div><strong>VOD</strong><span>Movies</span></div>
            <div><strong>EPG</strong><span>Guide</span></div>
          </div>
        </section>

        <div className="dashboard-sections">
          <RecommendedRow />
          <ContinueWatching />
          <RecentChannels />
        </div>
      </main>

      <VoiceSearchOverlay
        visible={showVoice}
        onResult={handleVoiceResult}
        onClose={() => {
          setShowVoice(false);
          focusManager.setZone("content");
        }}
      />
    </div>
  );
}
