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
    <div className="dashboard-page scale-in" style={{ display: "flex", width: "100%", height: "100vh" }}>
      <aside className="sidebar glass-panel">
        <div className="sidebar-logo">
          STREAM<span>DECK</span>
        </div>

        <nav className="dashboard-menu" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {MENU.map((item, index) => (
            <button
              type="button"
              key={item.name}
              className={
                sidebarFocused && menuIndex === index
                  ? "sidebar-item active"
                  : "sidebar-item"
              }
              onFocus={() => {
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

      <main className="dashboard-content" style={{ flex: 1, overflowY: "auto", padding: "80px", background: "rgba(0,0,0,0.2)" }}>
        <section className="dashboard-hero" style={{ 
          marginBottom: "80px", 
          padding: "100px 80px", 
          borderRadius: "40px",
          background: "linear-gradient(135deg, rgba(0, 170, 255, 0.3), rgba(0, 0, 0, 0.9)), url('assets/hero.png') center/cover",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
        }}>
          <div className="hero-content">
            <p className="dashboard-eyebrow" style={{ color: "var(--primary)", fontWeight: "900", letterSpacing: "4px", marginBottom: "20px" }}>PREMIUM IPTV EXPERIENCE</p>
            <h1 style={{ fontSize: "100px", fontWeight: "900", margin: "20px 0", lineHeight: "1", letterSpacing: "-3px" }}>Discover Your World</h1>
            <p style={{ fontSize: "32px", color: "var(--text-dim)", maxWidth: "1000px", lineHeight: "1.4", marginBottom: "40px" }}>
              Experience the next generation of IPTV. 4K HDR streaming, lightning-fast channel switching, and a premium interface designed for your Samsung QLED.
            </p>
            
            <div style={{ display: "flex", gap: "30px", marginTop: "50px" }}>
               <button className="player-button active" style={{ width: "auto", padding: "0 60px", height: "90px", fontSize: "28px" }} onClick={() => navigateTo("/live")}>WATCH LIVE</button>
               <button className="player-button" style={{ width: "auto", padding: "0 60px", height: "90px", fontSize: "28px", background: "rgba(255,255,255,0.1)" }} onClick={() => navigateTo("/search")}>EXPLORE VOD</button>
            </div>
          </div>
        </section>

        <div className="dashboard-sections" style={{ display: "flex", flexDirection: "column", gap: "80px" }}>
          <div className={`row-wrapper-0 ${!sidebarFocused && contentRowIndex === 0 ? "row-focused active" : ""}`}>
             <h2 className="section-title" style={{ paddingLeft: "40px", marginBottom: "30px" }}>Recommended for You</h2>
             <RecommendedRow isFocused={!sidebarFocused && contentRowIndex === 0} />
          </div>
          <div className={`row-wrapper-1 ${!sidebarFocused && contentRowIndex === 1 ? "row-focused active" : ""}`}>
             <h2 className="section-title" style={{ paddingLeft: "40px", marginBottom: "30px" }}>Continue Watching</h2>
             <ContinueWatching isFocused={!sidebarFocused && contentRowIndex === 1} />
          </div>
          <div className={`row-wrapper-2 ${!sidebarFocused && contentRowIndex === 2 ? "row-focused active" : ""}`}>
             <h2 className="section-title" style={{ paddingLeft: "40px", marginBottom: "30px" }}>Recently Played</h2>
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
