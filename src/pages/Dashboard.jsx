import React, { useEffect, useState } from "react";
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
  const [contentRowIndex, setContentRowIndex] = useState(0);
  const [sidebarFocused, setSidebarFocused] = useState(true);
  const [showVoice, setShowVoice] = useState(false);

  useEffect(() => {
    focusManager.setZone("sidebar");
  }, []);

  useEffect(() => {
    const el = document.querySelector(`.row-wrapper-${contentRowIndex}`);
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }, [contentRowIndex]);

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

          case KEYS.UP:
            if (contentRowIndex > 0) {
              setContentRowIndex(prev => prev - 1);
            }
            break;

          case KEYS.DOWN:
            if (contentRowIndex < 2) {
              setContentRowIndex(prev => prev + 1);
            }
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
  }, [menuIndex, sidebarFocused, contentRowIndex]);

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
    <div className="dashboard-page scale-in">
      <aside className="dashboard-sidebar">
        <div className="dashboard-logo">
          Stream<span>Deck</span>
        </div>

        <nav className="dashboard-menu">
          {MENU.map((item, index) => (
            <button
              type="button"
              key={item.name}
              className={
                sidebarFocused && menuIndex === index
                  ? "dashboard-menu-item active"
                  : "dashboard-menu-item"
              }
              onMouseEnter={() => {
                setMenuIndex(index);
                setSidebarFocused(true);
              }}
              onClick={() => openMenu()}
            >
              {item.name}
            </button>
          ))}
        </nav>
      </aside>

      <main className="dashboard-content">
        <section className="dashboard-hero">
          <div className="hero-content">
            <p className="dashboard-eyebrow">PREMIUM IPTV EXPERIENCE</p>
            <h1>Discover your favorite content</h1>
            <p>
              Access thousands of live channels, latest movies, and trending series.
              Your all-in-one entertainment hub for the best streaming quality.
            </p>
            
            <div style={{ display: "flex", gap: "20px", marginTop: "30px" }}>
               <button className="player-button active" onClick={() => navigateTo("/live")}>WATCH LIVE</button>
               <button className="player-button" style={{ background: "rgba(255,255,255,0.1)" }} onClick={() => navigateTo("/search")}>SEARCH</button>
            </div>
          </div>

          <div className="dashboard-stats">
            <div className="stat-card"><strong>2k+</strong><span>Live</span></div>
            <div className="stat-card"><strong>10k+</strong><span>Movies</span></div>
            <div className="stat-card"><strong>5k+</strong><span>Series</span></div>
          </div>
        </section>

        <div className="dashboard-sections">
          <div className={`row-wrapper-0 ${!sidebarFocused && contentRowIndex === 0 ? "row-focused" : ""}`}>
             <h2 className="section-title" style={{ paddingLeft: "40px" }}>Recommended for You</h2>
             <RecommendedRow isFocused={!sidebarFocused && contentRowIndex === 0} />
          </div>
          <div className={`row-wrapper-1 ${!sidebarFocused && contentRowIndex === 1 ? "row-focused" : ""}`}>
             <h2 className="section-title" style={{ paddingLeft: "40px" }}>Continue Watching</h2>
             <ContinueWatching isFocused={!sidebarFocused && contentRowIndex === 1} />
          </div>
          <div className={`row-wrapper-2 ${!sidebarFocused && contentRowIndex === 2 ? "row-focused" : ""}`}>
             <h2 className="section-title" style={{ paddingLeft: "40px" }}>Recent Channels</h2>
             <RecentChannels isFocused={!sidebarFocused && contentRowIndex === 2} />
          </div>
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
