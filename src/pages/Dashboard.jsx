import React, { useEffect, useState } from "react";
import { navigateTo } from "../utils/navigation";
import { KEYS } from "../utils/tizenRemote";
import focusManager from "../core/FocusManager";
import Sidebar from "../components/Sidebar";
import RecommendedRow from "../components/RecommendedRow";
import ContinueWatching from "../components/ContinueWatching";
import RecentChannels from "../components/RecentChannels";
import VoiceSearchOverlay from "../components/VoiceSearchOverlay";

export default function Dashboard() {
  const [contentRowIndex, setContentRowIndex] = useState(-1); // -1 for Hero
  const [heroBtnIndex, setHeroBtnIndex] = useState(0);
  const [showVoice, setShowVoice] = useState(false);

  useEffect(() => {
    focusManager.setZone("content");
    setContentRowIndex(-1);
  }, []);

  useEffect(() => {
    function handleKeys(event) {
      const zone = focusManager.getZone();
      if (zone !== "content") return;

      switch (event.keyCode) {
        case KEYS.LEFT:
          focusManager.setZone("sidebar");
          break;

        case KEYS.UP:
          if (contentRowIndex > -1) {
            setContentRowIndex(prev => prev - 1);
          }
          break;

        case KEYS.DOWN:
          if (contentRowIndex < 2) {
            setContentRowIndex(prev => prev + 1);
          }
          break;

        case KEYS.RIGHT:
          if (contentRowIndex === -1) {
             setHeroBtnIndex(1);
          }
          break;

        case KEYS.ENTER:
          if (contentRowIndex === -1) {
            if (heroBtnIndex === 0) navigateTo("/live");
            else navigateTo("/search");
          }
          break;

        case KEYS.BLUE:
          setShowVoice(true);
          focusManager.setZone("modal");
          break;

        case KEYS.BACK:
          // In a real TV app, back on home might show an exit dialog
          break;

        default:
          break;
      }
    }

    document.addEventListener("keydown", handleKeys);
    return () => document.removeEventListener("keydown", handleKeys);
  }, [contentRowIndex, heroBtnIndex]);

  const handleVoiceResult = (text) => {
    localStorage.setItem("voice_search", text);
    navigateTo("/search");
  };

  return (
    <div className="app-container">
      <Sidebar active="HOME" />

      <main className="app-main">
        {/* HERO SECTION */}
        <section className="hero-banner">
          <img src="src/assets/hero.png" alt="Hero" className="hero-image" />
          <div className="hero-overlay" />
          
          <div className="hero-content fade-in">
            <p className="hero-tag">Streamdeck Original</p>
            <h1 className="hero-title">Discover Your<br/>Next Favorite</h1>
            
            <div className="hero-meta">
              <span className="match">98% Match</span>
              <span>2026</span>
              <span className="badge">18+</span>
              <span className="badge">4K ULTRA HD</span>
            </div>
            
            <p className="hero-desc">
              Experience entertainment like never before. Access thousands of live channels, 
              global movies, and exclusive series in stunning quality. Designed for the 
              ultimate TV experience with lightning fast navigation.
            </p>
            
            <div className="hero-btns">
              <button 
                className={`btn-primary ${contentRowIndex === -1 && heroBtnIndex === 0 ? "focused" : ""}`}
                onClick={() => navigateTo("/live")}
              >
                <span>▶</span> Play
              </button>
              <button 
                className={`btn-secondary ${contentRowIndex === -1 && heroBtnIndex === 1 ? "focused" : ""}`}
                onClick={() => navigateTo("/search")}
              >
                <span>ⓘ</span> More Info
              </button>
            </div>
          </div>
        </section>

        {/* CONTENT ROWS */}
        <div className="content-rows">
          <div className={`row-container ${contentRowIndex === 0 ? "focused" : ""}`}>
            <h2 className="row-title">Recommended for You</h2>
            <RecommendedRow isFocused={contentRowIndex === 0} />
          </div>

          <div className={`row-container ${contentRowIndex === 1 ? "focused" : ""}`}>
            <h2 className="row-title">Continue Watching</h2>
            <ContinueWatching isFocused={contentRowIndex === 1} />
          </div>

          <div className={`row-container ${contentRowIndex === 2 ? "focused" : ""}`}>
            <h2 className="row-title">Recently Played Channels</h2>
            <RecentChannels isFocused={contentRowIndex === 2} />
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
