import React, { useEffect, useState, useRef } from "react";
import { navigateTo } from "../utils/navigation";
import { KEYS } from "../utils/tizenRemote";
import focusManager from "../core/FocusManager";
import navigationManager from "../core/NavigationManager";
import Sidebar from "../components/Sidebar";
import RecommendedRow from "../components/RecommendedRow";
import ContinueWatching from "../components/ContinueWatching";
import RecentChannels from "../components/RecentChannels";
import VoiceSearchOverlay from "../components/VoiceSearchOverlay";
import heroImage from "../assets/hero.png";
import { useFocus } from "../hooks/useFocus";

export default function Dashboard() {
  const [zone, setZone] = useState(focusManager.getZone());
  const [rowIndex, setRowIndex] = useState(-1); // -1 for Hero, 0, 1, 2 for rows
  const [showVoice, setShowVoice] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    return focusManager.subscribe(newZone => {
      setZone(newZone);
    });
  }, []);

  useEffect(() => {
    focusManager.setZone("content");
    setRowIndex(-1);
  }, []);

  const { focusIndex: heroBtnIndex } = useFocus({
    containerRef: heroRef,
    columnCount: 2,
    itemCount: 2,
    isActive: zone === "content" && rowIndex === -1,
    onEnter: (index) => {
      if (index === 0) {
        navigationManager.push("/dashboard");
        navigateTo("/live");
      } else {
        navigateTo("/search");
      }
    },
    onLeftEdge: () => focusManager.setZone("sidebar"),
    onBottomEdge: () => setRowIndex(0)
  });

  const handleVoiceResult = (text) => {
    localStorage.setItem("voice_search", text);
    navigateTo("/search");
  };

  useEffect(() => {
    function handleSpecialKeys(e) {
      if (e.keyCode === KEYS.BLUE) {
        setShowVoice(true);
        focusManager.setZone("modal");
      }
    }
    document.addEventListener("keydown", handleSpecialKeys);
    return () => document.removeEventListener("keydown", handleSpecialKeys);
  }, []);

  return (
    <div className="app-container">
      <Sidebar active="HOME" />

      <main className="app-main">
        {/* HERO SECTION */}
        <section className="hero-banner" ref={heroRef}>
          <img src={heroImage} alt="Hero" className="hero-image" />
          <div className="hero-overlay" />
          
          <div className="hero-content fade-in">
            <p className="hero-tag">StreamVault Original</p>
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
                data-focusable="true"
                className={`btn-primary ${zone === "content" && rowIndex === -1 && heroBtnIndex === 0 ? "focused" : ""}`}
                onClick={() => navigateTo("/live")}
              >
                <span>▶</span> Play
              </button>
              <button 
                data-focusable="true"
                className={`btn-secondary ${zone === "content" && rowIndex === -1 && heroBtnIndex === 1 ? "focused" : ""}`}
                onClick={() => navigateTo("/search")}
              >
                <span>ⓘ</span> More Info
              </button>
            </div>
          </div>
        </section>

        {/* CONTENT ROWS */}
        <div className="content-rows">
          <div className={`row-container ${rowIndex === 0 ? "focused" : ""}`}>
            <h2 className="row-title">Recommended for You</h2>
            <RecommendedRow 
              isFocused={zone === "content" && rowIndex === 0} 
              onTopEdge={() => setRowIndex(-1)}
              onBottomEdge={() => setRowIndex(1)}
            />
          </div>

          <div className={`row-container ${rowIndex === 1 ? "focused" : ""}`}>
            <h2 className="row-title">Continue Watching</h2>
            <ContinueWatching 
              isFocused={zone === "content" && rowIndex === 1} 
              onTopEdge={() => setRowIndex(0)}
              onBottomEdge={() => setRowIndex(2)}
            />
          </div>

          <div className={`row-container ${rowIndex === 2 ? "focused" : ""}`}>
            <h2 className="row-title">Recently Played Channels</h2>
            <RecentChannels 
              isFocused={zone === "content" && rowIndex === 2} 
              onTopEdge={() => setRowIndex(1)}
            />
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
